import { randomUUID } from "node:crypto";

import { PlanType, SubscriptionStatus } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "~/lib/prisma.js";

import { AvailabilityRepository } from "../availability.repository.js";

const repository = new AvailabilityRepository();

function uniqueSuffix(): string {
  return `${Date.now().toString()}-${randomUUID()}`;
}

describe("AvailabilityRepository", () => {
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
    await prisma.establishment.deleteMany({ where: { userId } });
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  describe("replaceBusinessHours", () => {
    it("should replace rows for the establishment", async () => {
      await repository.replaceBusinessHours(establishmentId, [
        {
          weekday: "MON",
          opensAt: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)),
          closesAt: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
          breakStartsAt: null,
          breakEndsAt: null,
        },
      ]);

      const rows = await repository.findBusinessHours(establishmentId);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.weekday).toBe("MON");
    });
  });

  describe("isEstablishmentOwned", () => {
    it("should return false when establishment belongs to another user", async () => {
      const other = await prisma.user.create({
        data: {
          email: `other-avail-${uniqueSuffix()}@example.com`,
          emailVerified: true,
        },
      });
      try {
        const ok = await repository.isEstablishmentOwned(other.id, establishmentId);
        expect(ok).toBe(false);
      } finally {
        await prisma.user.deleteMany({ where: { id: other.id } });
      }
    });

    it("should return true for owned active establishment", async () => {
      const ok = await repository.isEstablishmentOwned(userId, establishmentId);
      expect(ok).toBe(true);
    });
  });
});
