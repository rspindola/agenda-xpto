import { randomUUID } from "node:crypto";

import { PlanType, SubscriptionStatus } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "~/lib/prisma.js";

import { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";

const repository = new EstablishmentsRepository();

function uniqueSuffix(): string {
  return `${Date.now().toString()}-${randomUUID()}`;
}

describe("EstablishmentsRepository", () => {
  let userId: string;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        email: `repo-est-${uniqueSuffix()}@example.com`,
        emailVerified: true,
        name: "Repo Test User",
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
  });

  afterEach(async () => {
    // Delete in correct order: establishments before subscription before user (FK dependencies)
    await prisma.establishment.deleteMany({ where: { userId } });
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  describe("findAllActiveByUserId", () => {
    it("should return only non-archived establishments for the user", async () => {
      await prisma.establishment.create({
        data: {
          userId,
          name: "Active Shop",
          slug: `active-${uniqueSuffix()}`,
          email: "active@example.com",
          timezone: "America/Sao_Paulo",
        },
      });
      await prisma.establishment.create({
        data: {
          userId,
          name: "Archived Shop",
          slug: `archived-${uniqueSuffix()}`,
          email: "archived@example.com",
          timezone: "America/Sao_Paulo",
          archivedAt: new Date(),
        },
      });

      const rows = await repository.findAllActiveByUserId(userId);

      expect(rows).toHaveLength(1);
      expect(rows[0]?.name).toBe("Active Shop");
    });
  });

  describe("findBySlug", () => {
    it("should return null when slug does not exist", async () => {
      const row = await repository.findBySlug(`missing-slug-${uniqueSuffix()}`);
      expect(row).toBeNull();
    });
  });

  describe("countActiveByUserId", () => {
    it("should count only establishments with archivedAt null and deletedAt null", async () => {
      await prisma.establishment.create({
        data: {
          userId,
          name: "One",
          slug: `one-${uniqueSuffix()}`,
          email: "one@example.com",
          timezone: "UTC",
        },
      });
      await prisma.establishment.create({
        data: {
          userId,
          name: "Two",
          slug: `two-${uniqueSuffix()}`,
          email: "two@example.com",
          timezone: "UTC",
        },
      });
      await prisma.establishment.create({
        data: {
          userId,
          name: "Archived",
          slug: `arch-${uniqueSuffix()}`,
          email: "arch@example.com",
          timezone: "UTC",
          archivedAt: new Date(),
        },
      });

      const count = await repository.countActiveByUserId(userId);

      expect(count).toBe(2);
    });
  });
});
