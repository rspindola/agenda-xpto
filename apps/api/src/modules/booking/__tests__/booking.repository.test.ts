import { randomUUID } from "node:crypto";

import { AppointmentStatus, PlanType, SubscriptionStatus } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "~/lib/prisma.js";

import { BookingRepository } from "../booking.repository.js";

const repository = new BookingRepository();

function uniqueSuffix(): string {
  return `${Date.now().toString()}-${randomUUID()}`;
}

describe("BookingRepository", () => {
  let userId: string;
  let establishmentId: string;
  let professionalId: string;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        email: `repo-booking-${uniqueSuffix()}@example.com`,
        emailVerified: true,
        name: "Booking Repo User",
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
        name: "Booking Test Shop",
        slug: `booking-shop-${uniqueSuffix()}`,
        email: "shop@example.com",
        timezone: "America/Sao_Paulo",
        isActive: true,
      },
    });
    establishmentId = est.id;

    const prof = await prisma.professional.create({
      data: { establishmentId, name: "Pro One" },
    });
    professionalId = prof.id;
  });

  afterEach(async () => {
    await prisma.appointmentService.deleteMany({
      where: { appointment: { establishmentId } },
    });
    await prisma.appointment.deleteMany({ where: { establishmentId } });
    await prisma.professional.deleteMany({ where: { establishmentId } });
    await prisma.establishment.deleteMany({ where: { userId } });
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  describe("findEstablishmentBySlug", () => {
    it("should return null for non-existent slug", async () => {
      const result = await repository.findEstablishmentBySlug(`no-such-${uniqueSuffix()}`);
      expect(result).toBeNull();
    });
  });

  describe("findConfirmedAppointmentsInRange", () => {
    it("should return only CONFIRMED appointments overlapping the range", async () => {
      const start = new Date("2026-08-01T10:00:00.000Z");
      const end = new Date("2026-08-01T11:00:00.000Z");
      const rangeStart = new Date("2026-08-01T09:00:00.000Z");
      const rangeEnd = new Date("2026-08-01T12:00:00.000Z");

      await prisma.appointment.create({
        data: {
          establishmentId,
          professionalId,
          status: AppointmentStatus.CONFIRMED,
          startAt: start,
          endAt: end,
          clientName: "A",
          clientPhone: "+5511999990000",
          clientEmail: "a@example.com",
          cancelToken: randomUUID(),
        },
      });

      await prisma.appointment.create({
        data: {
          establishmentId,
          professionalId,
          status: AppointmentStatus.CANCELLED,
          startAt: start,
          endAt: end,
          clientName: "B",
          clientPhone: "+5511999990001",
          clientEmail: "b@example.com",
          cancelToken: randomUUID(),
          cancelledAt: new Date(),
          cancelledBy: "CLIENT",
        },
      });

      const rows = await repository.findConfirmedAppointmentsInRange(establishmentId, rangeStart, rangeEnd);

      expect(rows).toHaveLength(1);
      expect(rows[0]?.professionalId).toBe(professionalId);
    });
  });
});
