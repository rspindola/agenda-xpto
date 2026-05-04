import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { prisma } from "~/lib/prisma.js";
import { ReportsRepository } from "~/modules/reports/reports.repository.js";

describe("ReportsRepository", () => {
  let repository: ReportsRepository;
  let establishmentId: string;
  let professionalId: string;
  let serviceId: string;

  beforeEach(async () => {
    repository = new ReportsRepository();

    // Create test establishment
    const establishment = await prisma.establishment.create({
      data: {
        name: "Test Salon",
        slug: `salon-${Date.now().toString()}`,
        email: "test@example.com",
        timezone: "UTC",
        user: {
          create: {
            email: `user-${Date.now().toString()}@example.com`,
          },
        },
      },
    });
    establishmentId = establishment.id;

    // Create test professional
    const professional = await prisma.professional.create({
      data: {
        name: "Test Professional",
        establishmentId,
      },
    });
    professionalId = professional.id;

    // Create test service
    const service = await prisma.service.create({
      data: {
        name: "Test Service",
        durationMinutes: 60,
        priceCents: 5000,
        establishmentId,
      },
    });
    serviceId = service.id;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.appointment.deleteMany({
      where: { establishmentId },
    });
    await prisma.professional.deleteMany({
      where: { establishmentId },
    });
    await prisma.service.deleteMany({
      where: { establishmentId },
    });
    await prisma.establishment.deleteMany({
      where: { id: establishmentId },
    });
    await prisma.user.deleteMany();
  });

  describe("findCompletedInRange", () => {
    it("should return only COMPLETED appointments with startAt in range", async () => {
      const startDate = new Date("2026-01-15T00:00:00Z");
      const endDate = new Date("2026-01-15T23:59:59Z");

      // Create appointments with different statuses
      await prisma.appointment.create({
        data: {
          establishmentId,
          professionalId,
          status: "COMPLETED",
          startAt: new Date("2026-01-15T10:00:00Z"),
          endAt: new Date("2026-01-15T11:00:00Z"),
          clientName: "Client 1",
          clientEmail: "client1@example.com",
          clientPhone: "1234567890",
          cancelToken: "token1",
          appointmentServices: {
            create: {
              serviceId,
              snapshotName: "Test Service",
              snapshotDurationMinutes: 60,
              snapshotPriceCents: 5000,
            },
          },
        },
      });

      await prisma.appointment.create({
        data: {
          establishmentId,
          professionalId,
          status: "CANCELLED",
          startAt: new Date("2026-01-15T12:00:00Z"),
          endAt: new Date("2026-01-15T13:00:00Z"),
          clientName: "Client 2",
          clientEmail: "client2@example.com",
          clientPhone: "1234567890",
          cancelToken: "token2",
        },
      });

      const results = await repository.findCompletedInRange(establishmentId, startDate, endDate);

      expect(results).toHaveLength(1);
      expect(results[0].clientEmail).toBe("client1@example.com");
    });

    it("should order results by startAt ascending", async () => {
      const startDate = new Date("2026-01-15T00:00:00Z");
      const endDate = new Date("2026-01-15T23:59:59Z");

      // Create multiple completed appointments
      await prisma.appointment.create({
        data: {
          establishmentId,
          professionalId,
          status: "COMPLETED",
          startAt: new Date("2026-01-15T14:00:00Z"),
          endAt: new Date("2026-01-15T15:00:00Z"),
          clientName: "Client A",
          clientEmail: "clienta@example.com",
          clientPhone: "1234567890",
          cancelToken: "tokena",
        },
      });

      await prisma.appointment.create({
        data: {
          establishmentId,
          professionalId,
          status: "COMPLETED",
          startAt: new Date("2026-01-15T10:00:00Z"),
          endAt: new Date("2026-01-15T11:00:00Z"),
          clientName: "Client B",
          clientEmail: "clientb@example.com",
          clientPhone: "1234567890",
          cancelToken: "tokenb",
        },
      });

      const results = await repository.findCompletedInRange(establishmentId, startDate, endDate);

      expect(results[0].clientEmail).toBe("clientb@example.com");
      expect(results[1].clientEmail).toBe("clienta@example.com");
    });
  });

  describe("findCancellationsInRange", () => {
    it("should return CANCELLED appointments with startAt in range", async () => {
      const startDate = new Date("2026-01-15T00:00:00Z");
      const endDate = new Date("2026-01-15T23:59:59Z");

      await prisma.appointment.create({
        data: {
          establishmentId,
          professionalId,
          status: "CANCELLED",
          startAt: new Date("2026-01-15T10:00:00Z"),
          endAt: new Date("2026-01-15T11:00:00Z"),
          clientName: "Client",
          clientEmail: "client@example.com",
          clientPhone: "1234567890",
          cancelToken: "token",
          cancelledBy: "CLIENT",
        },
      });

      const results = await repository.findCancellationsInRange(establishmentId, startDate, endDate);

      expect(results).toHaveLength(1);
      expect(results[0].cancelledBy).toBe("CLIENT");
    });
  });

  describe("findClientAppointments", () => {
    it("should group by clientEmail and count appointments correctly", async () => {
      const startDate = new Date("2026-01-15T00:00:00Z");
      const endDate = new Date("2026-01-15T23:59:59Z");

      // Create multiple appointments for same client
      for (let i = 0; i < 3; i++) {
        await prisma.appointment.create({
          data: {
            establishmentId,
            professionalId,
            status: "COMPLETED",
            startAt: new Date(`2026-01-15T${(10 + i).toString().padStart(2, '0')}:00:00Z`),
            endAt: new Date(`2026-01-15T${(11 + i).toString().padStart(2, '0')}:00:00Z`),
            clientName: "Return Client",
            clientEmail: "return@example.com",
            clientPhone: "1234567890",
            cancelToken: `token${i.toString()}`,
          },
        });
      }

      // Create appointment for different client
      await prisma.appointment.create({
        data: {
          establishmentId,
          professionalId,
          status: "COMPLETED",
          startAt: new Date("2026-01-15T13:00:00Z"),
          endAt: new Date("2026-01-15T14:00:00Z"),
          clientName: "Single Client",
          clientEmail: "single@example.com",
          clientPhone: "1234567890",
          cancelToken: "token4",
        },
      });

      const results = await repository.findClientAppointments(establishmentId, startDate, endDate);

      const returnClient = results.find((r) => r.clientEmail === "return@example.com");
      const singleClient = results.find((r) => r.clientEmail === "single@example.com");

      expect(returnClient?.appointmentCount).toBe(3);
      expect(singleClient?.appointmentCount).toBe(1);
    });
  });

  describe("findAppointmentsByService", () => {
    it("should group by serviceName and calculate total revenue", async () => {
      const startDate = new Date("2026-01-15T00:00:00Z");
      const endDate = new Date("2026-01-15T23:59:59Z");

      // Create appointments with the test service
      for (let i = 0; i < 2; i++) {
        await prisma.appointment.create({
          data: {
            establishmentId,
            professionalId,
            status: "COMPLETED",
            startAt: new Date(`2026-01-15T${(10 + i).toString().padStart(2, '0')}:00:00Z`),
            endAt: new Date(`2026-01-15T${(11 + i).toString().padStart(2, '0')}:00:00Z`),
            clientName: `Client ${i.toString()}`,
            clientEmail: `client${i.toString()}@example.com`,
            clientPhone: "1234567890",
            cancelToken: `token${i.toString()}`,
            appointmentServices: {
              create: {
                serviceId,
                snapshotName: "Test Service",
                snapshotDurationMinutes: 60,
                snapshotPriceCents: 5000,
              },
            },
          },
        });
      }

      const results = await repository.findAppointmentsByService(establishmentId, startDate, endDate);

      const serviceResult = results.find((r) => r.serviceName === "Test Service");
      expect(serviceResult?.count).toBe(2);
      expect(serviceResult?.totalRevenue).toBe(10000);
    });
  });
});
