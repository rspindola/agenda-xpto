import { randomUUID } from "node:crypto";

import { PlanType, SubscriptionStatus } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "~/lib/prisma.js";

import { AvailabilityRepository } from "~/modules/availability/availability.repository.js";

const repository = new AvailabilityRepository();

function uniqueSuffix(): string {
  return `${Date.now().toString()}-${randomUUID()}`;
}

describe("AvailabilityRepository", () => {
  describe("upsertBusinessHour", () => {
    let userId: string;
    let establishmentId: string;

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: {
          email: `repo-avail-${uniqueSuffix()}@example.com`,
          emailVerified: true,
          name: "Availability Repo User",
        },
      });
      userId = user.id;

      await prisma.subscription.create({
        data: {
          userId,
          planType: PlanType.PRO,
          status: SubscriptionStatus.TRIALING,
          trialEndsAt: new Date(Date.UTC(2030, 0, 1)),
        },
      });

      const est = await prisma.establishment.create({
        data: {
          userId,
          name: "Availability Test Shop",
          slug: `avail-shop-${uniqueSuffix()}`,
          email: "shop@example.com",
          timezone: "America/Sao_Paulo",
        },
      });
      establishmentId = est.id;
    });

    afterEach(async () => {
      await prisma.professionalAvailability.deleteMany({
        where: { professional: { establishmentId } },
      });
      await prisma.professional.deleteMany({ where: { establishmentId } });
      await prisma.establishmentBusinessHour.deleteMany({ where: { establishmentId } });
      await prisma.establishment.deleteMany({ where: { userId } });
      await prisma.subscription.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    });

    it("should create or update a single weekday row", async () => {
      await repository.upsertBusinessHour(establishmentId, "MON", {
        weekday: "MON",
        opensAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
        closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
        breakStartsAt: null,
        breakEndsAt: null,
      });

      let rows = await repository.findBusinessHours(establishmentId);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.weekday).toBe("MON");

      await repository.upsertBusinessHour(establishmentId, "MON", {
        weekday: "MON",
        opensAt: new Date(Date.UTC(1970, 0, 1, 10, 0, 0, 0)),
        closesAt: new Date(Date.UTC(1970, 0, 1, 19, 0, 0, 0)),
        breakStartsAt: null,
        breakEndsAt: null,
      });

      rows = await repository.findBusinessHours(establishmentId);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.opensAt.getUTCHours()).toBe(10);
    });
  });

  describe("deleteBusinessHourByWeekday", () => {
    let userId: string;
    let establishmentId: string;

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: {
          email: `repo-avail-${uniqueSuffix()}@example.com`,
          emailVerified: true,
          name: "Availability Repo User",
        },
      });
      userId = user.id;

      await prisma.subscription.create({
        data: {
          userId,
          planType: PlanType.PRO,
          status: SubscriptionStatus.TRIALING,
          trialEndsAt: new Date(Date.UTC(2030, 0, 1)),
        },
      });

      const est = await prisma.establishment.create({
        data: {
          userId,
          name: "Availability Test Shop",
          slug: `avail-shop-${uniqueSuffix()}`,
          email: "shop@example.com",
          timezone: "America/Sao_Paulo",
        },
      });
      establishmentId = est.id;
    });

    afterEach(async () => {
      await prisma.professionalAvailability.deleteMany({
        where: { professional: { establishmentId } },
      });
      await prisma.professional.deleteMany({ where: { establishmentId } });
      await prisma.establishmentBusinessHour.deleteMany({ where: { establishmentId } });
      await prisma.establishment.deleteMany({ where: { userId } });
      await prisma.subscription.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    });

    it("should remove the row for that weekday", async () => {
      await repository.upsertBusinessHour(establishmentId, "TUE", {
        weekday: "TUE",
        opensAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
        closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
        breakStartsAt: null,
        breakEndsAt: null,
      });

      await repository.deleteBusinessHourByWeekday(establishmentId, "TUE");

      const rows = await repository.findBusinessHours(establishmentId);
      expect(rows).toHaveLength(0);
    });
  });

  describe("professional availability CRUD", () => {
    let userId: string;
    let establishmentId: string;

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: {
          email: `repo-avail-${uniqueSuffix()}@example.com`,
          emailVerified: true,
          name: "Availability Repo User",
        },
      });
      userId = user.id;

      await prisma.subscription.create({
        data: {
          userId,
          planType: PlanType.PRO,
          status: SubscriptionStatus.TRIALING,
          trialEndsAt: new Date(Date.UTC(2030, 0, 1)),
        },
      });

      const est = await prisma.establishment.create({
        data: {
          userId,
          name: "Availability Test Shop",
          slug: `avail-shop-${uniqueSuffix()}`,
          email: "shop@example.com",
          timezone: "America/Sao_Paulo",
        },
      });
      establishmentId = est.id;
    });

    afterEach(async () => {
      await prisma.professionalAvailability.deleteMany({
        where: { professional: { establishmentId } },
      });
      await prisma.professional.deleteMany({ where: { establishmentId } });
      await prisma.establishmentBusinessHour.deleteMany({ where: { establishmentId } });
      await prisma.establishment.deleteMany({ where: { userId } });
      await prisma.subscription.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    });

    it("should create, find by id, update, and delete a professional availability window", async () => {
      await repository.upsertBusinessHour(establishmentId, "MON", {
        weekday: "MON",
        opensAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
        closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
        breakStartsAt: null,
        breakEndsAt: null,
      });
      const prof = await prisma.professional.create({
        data: {
          establishmentId,
          name: "Stylist",
          email: `stylist-${uniqueSuffix()}@example.com`,
        },
      });

      const window = {
        weekday: "MON" as const,
        startsAt: new Date(Date.UTC(1970, 0, 1, 10, 0, 0, 0)),
        endsAt: new Date(Date.UTC(1970, 0, 1, 12, 0, 0, 0)),
      };
      const created = await repository.createProfessionalAvailability(prof.id, window);
      expect(created.weekday).toBe("MON");

      const byId = await repository.findProfessionalAvailabilityById(
        establishmentId,
        prof.id,
        created.id,
      );
      expect(byId).not.toBeNull();
      expect(byId?.startsAt.getUTCHours()).toBe(10);

      const updated = await repository.updateProfessionalAvailability(
        establishmentId,
        prof.id,
        created.id,
        {
          weekday: "MON",
          startsAt: new Date(Date.UTC(1970, 0, 1, 10, 0, 0, 0)),
          endsAt: new Date(Date.UTC(1970, 0, 1, 14, 0, 0, 0)),
        },
      );
      expect(updated?.endsAt.getUTCHours()).toBe(14);

      const deleted = await repository.deleteProfessionalAvailability(
        establishmentId,
        prof.id,
        created.id,
      );
      expect(deleted).toBe(true);
      const after = await repository.findProfessionalAvailabilities(prof.id);
      expect(after).toHaveLength(0);
    });

    it("should return null from findProfessionalAvailabilityById when professional belongs to another establishment", async () => {
      // Setup a professional for the main establishment for the lookup test
      const mainProf = await prisma.professional.create({
        data: {
          establishmentId,
          name: "Main Stylist",
          email: `ms-${uniqueSuffix()}@example.com`,
        },
      });

      // Create another establishment with another professional
      const otherUser = await prisma.user.create({
        data: {
          email: `other-${uniqueSuffix()}@example.com`,
          emailVerified: true,
          name: "Other",
        },
      });
      await prisma.subscription.create({
        data: {
          userId: otherUser.id,
          planType: PlanType.PRO,
          status: SubscriptionStatus.TRIALING,
          trialEndsAt: new Date(Date.UTC(2030, 0, 1)),
        },
      });
      const otherEst = await prisma.establishment.create({
        data: {
          userId: otherUser.id,
          name: "Other Shop",
          slug: `other-shop-${uniqueSuffix()}`,
          email: "o@example.com",
          timezone: "UTC",
        },
      });
      const otherProf = await prisma.professional.create({
        data: {
          establishmentId: otherEst.id,
          name: "Other Stylist",
          email: `os-${uniqueSuffix()}@example.com`,
        },
      });

      // Create availability for the other professional
      const created = await repository.createProfessionalAvailability(otherProf.id, {
        weekday: "MON",
        startsAt: new Date(Date.UTC(1970, 0, 1, 10, 0, 0, 0)),
        endsAt: new Date(Date.UTC(1970, 0, 1, 12, 0, 0, 0)),
      });

      // Try to lookup that availability using main establishment's ID and main professional's ID
      // Should return null because the availability belongs to a different establishment
      const wrongLookup = await repository.findProfessionalAvailabilityById(
        establishmentId,
        mainProf.id,
        created.id,
      );
      expect(wrongLookup).toBeNull();

      // Clean up in correct order (availability → professional → establishment → subscription → user)
      await prisma.professionalAvailability.deleteMany({ where: { professionalId: otherProf.id } });
      await prisma.professional.deleteMany({ where: { id: otherProf.id } });
      await prisma.professional.deleteMany({ where: { id: mainProf.id } });
      await prisma.establishment.deleteMany({ where: { userId: otherUser.id } });
      await prisma.subscription.deleteMany({ where: { userId: otherUser.id } });
      await prisma.user.deleteMany({ where: { id: otherUser.id } });
    });
  });
});
