import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { prisma } from "~/lib/prisma.js";
import * as subscriptionRepository from "~/modules/plans/subscription.repository.js";

describe("PlansRepository (Integration)", () => {
  let userId: string;
  let establishmentId: string;
  let professionalId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: { email: `test-${String(Date.now())}@example.com` },
    });
    userId = user.id;

    // Create subscription for test user
    await prisma.subscription.create({
      data: {
        userId,
        planType: "STARTER",
        status: "ACTIVE",
      },
    });

    // Create establishment
    const establishment = await prisma.establishment.create({
      data: {
        userId,
        name: "Test Establishment",
        slug: `test-${String(Date.now())}`,
        email: `est-${String(Date.now())}@example.com`,
        timezone: "America/Sao_Paulo",
      },
    });
    establishmentId = establishment.id;

    // Create professional
    const professional = await prisma.professional.create({
      data: {
        establishmentId,
        name: "Test Professional",
      },
    });
    professionalId = professional.id;
  });

  afterEach(async () => {
    // Cleanup in correct order (FK dependencies)
    await prisma.professionalAvailability.deleteMany({ where: { professionalId } });
    await prisma.professional.deleteMany({ where: { establishmentId } });
    await prisma.establishment.deleteMany({ where: { userId } });
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  describe("countActiveEstablishmentsByUserId", () => {
    it("should return 0 when user has no establishments", async () => {
      const user = await prisma.user.create({
        data: { email: `test-no-est-${String(Date.now())}@example.com` },
      });

      const count = await subscriptionRepository.countActiveEstablishmentsByUserId(user.id);

      expect(count).toBe(0);

      await prisma.user.delete({ where: { id: user.id } });
    });

    it("should count only active (non-deleted, non-archived) establishments", async () => {
      // Create additional establishment
      await prisma.establishment.create({
        data: {
          userId,
          name: "Another Establishment",
          slug: `another-${String(Date.now())}`,
          email: `another-${String(Date.now())}@example.com`,
          timezone: "America/Sao_Paulo",
        },
      });

      // Delete one establishment
      await prisma.establishment.update({
        where: { id: establishmentId },
        data: { deletedAt: new Date() },
      });

      const count = await subscriptionRepository.countActiveEstablishmentsByUserId(userId);

      expect(count).toBe(1);
    });

    it("should not count archived establishments", async () => {
      await prisma.establishment.update({
        where: { id: establishmentId },
        data: { archivedAt: new Date() },
      });

      const count = await subscriptionRepository.countActiveEstablishmentsByUserId(userId);

      expect(count).toBe(0);
    });
  });

  describe("countActiveProfessionalsByEstablishmentId", () => {
    it("should return 0 when establishment has no professionals", async () => {
      const est = await prisma.establishment.create({
        data: {
          userId,
          name: "Empty Establishment",
          slug: `empty-${String(Date.now())}`,
          email: `empty-${String(Date.now())}@example.com`,
          timezone: "America/Sao_Paulo",
        },
      });

      const count = await subscriptionRepository.countActiveProfessionalsByEstablishmentId(est.id);

      expect(count).toBe(0);

      await prisma.establishment.delete({ where: { id: est.id } });
    });

    it("should not count soft-deleted professionals", async () => {
      // Create another professional
      const prof2 = await prisma.professional.create({
        data: {
          establishmentId,
          name: "Another Professional",
        },
      });

      // Soft-delete first professional
      await prisma.professional.update({
        where: { id: professionalId },
        data: { deletedAt: new Date() },
      });

      const count = await subscriptionRepository.countActiveProfessionalsByEstablishmentId(establishmentId);

      expect(count).toBe(1);

      await prisma.professional.delete({ where: { id: prof2.id } });
    });
  });

  describe("findAllSubscriptionsWithTrialExpired", () => {
    it("should return subscriptions with trialEndsAt in the past", async () => {
      const user1 = await prisma.user.create({
        data: { email: `user1-${String(Date.now())}@example.com` },
      });

      const now = new Date();
      const pastDate = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago

      await prisma.subscription.create({
        data: {
          userId: user1.id,
          planType: "PRO",
          status: "TRIALING",
          trialEndsAt: pastDate,
        },
      });

      const expired = await subscriptionRepository.findAllSubscriptionsWithTrialExpired(now);

      expect(expired.length).toBeGreaterThan(0);
      expect(expired).toContainEqual(expect.objectContaining({ userId: user1.id }));

      await prisma.subscription.deleteMany({ where: { userId: user1.id } });
      await prisma.user.delete({ where: { id: user1.id } });
    });

    it("should filter by TRIALING status only", async () => {
      const user1 = await prisma.user.create({
        data: { email: `user1-trial-${String(Date.now())}@example.com` },
      });

      const now = new Date();
      const pastDate = new Date(now.getTime() - 1000 * 60 * 60);

      // Create ACTIVE subscription with past trialEndsAt (should not be returned)
      await prisma.subscription.create({
        data: {
          userId: user1.id,
          planType: "STARTER",
          status: "ACTIVE",
          trialEndsAt: pastDate,
        },
      });

      const expired = await subscriptionRepository.findAllSubscriptionsWithTrialExpired(now);

      const user1Expired = expired.find((s) => s.userId === user1.id);
      expect(user1Expired).toBeUndefined();

      await prisma.subscription.deleteMany({ where: { userId: user1.id } });
      await prisma.user.delete({ where: { id: user1.id } });
    });
  });

  describe("updateSubscriptionAfterConversion", () => {
    it("should update status to ACTIVE and set currentPeriodStart/End", async () => {
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // First, set subscription to TRIALING
      await prisma.subscription.update({
        where: { userId },
        data: { status: "TRIALING", planType: "PRO" },
      });

      await subscriptionRepository.updateSubscriptionAfterConversion(userId, "PRO", now, periodEnd);

      const updated = await prisma.subscription.findUnique({ where: { userId } });

      expect(updated?.status).toBe("ACTIVE");
      expect(updated?.planType).toBe("PRO");
      expect(updated?.currentPeriodStart).toEqual(now);
    });
  });

  describe("updateSubscriptionAfterDowngrade", () => {
    it("should update planType and reset Starter counter", async () => {
      // First, set to PRO
      await prisma.subscription.update({
        where: { userId },
        data: { planType: "PRO", status: "ACTIVE" },
      });

      await subscriptionRepository.updateSubscriptionAfterDowngrade(userId, "STARTER");

      const updated = await prisma.subscription.findUnique({ where: { userId } });

      expect(updated?.planType).toBe("STARTER");
      expect(updated?.status).toBe("ACTIVE");
      expect(updated?.starterMonthlyAppointmentsCount).toBe(0);
    });
  });

  describe("resetMonthlyQuotaForStarterAccounts", () => {
    it("should zero counter only for STARTER + ACTIVE subscriptions", async () => {
      // Set current to STARTER with count
      await prisma.subscription.update({
        where: { userId },
        data: { starterMonthlyAppointmentsCount: 50 },
      });

      // Create another STARTER + ACTIVE
      const user2 = await prisma.user.create({
        data: { email: `user2-starter-${String(Date.now())}@example.com` },
      });
      await prisma.subscription.create({
        data: {
          userId: user2.id,
          planType: "STARTER",
          status: "ACTIVE",
          starterMonthlyAppointmentsCount: 75,
        },
      });

      // Create a PRO subscription (should not be affected)
      const user3 = await prisma.user.create({
        data: { email: `user3-pro-${String(Date.now())}@example.com` },
      });
      await prisma.subscription.create({
        data: {
          userId: user3.id,
          planType: "PRO",
          status: "ACTIVE",
          starterMonthlyAppointmentsCount: 200,
        },
      });

      const count = await subscriptionRepository.resetMonthlyQuotaForStarterAccounts();

      expect(count).toBe(2); // user1 (current) and user2

      const user1Sub = await prisma.subscription.findUnique({ where: { userId } });
      const user2Sub = await prisma.subscription.findUnique({ where: { userId: user2.id } });
      const user3Sub = await prisma.subscription.findUnique({ where: { userId: user3.id } });

      expect(user1Sub?.starterMonthlyAppointmentsCount).toBe(0);
      expect(user2Sub?.starterMonthlyAppointmentsCount).toBe(0);
      expect(user3Sub?.starterMonthlyAppointmentsCount).toBe(200); // unchanged

      await prisma.subscription.deleteMany({ where: { userId: user2.id } });
      await prisma.user.delete({ where: { id: user2.id } });
      await prisma.subscription.deleteMany({ where: { userId: user3.id } });
      await prisma.user.delete({ where: { id: user3.id } });
    });
  });
});
