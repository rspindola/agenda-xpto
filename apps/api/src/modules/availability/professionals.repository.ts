import type { Prisma } from "@prisma/client";
import { AppointmentStatus } from "@prisma/client";

import { prisma } from "~/lib/prisma.js";

import type { CreateProfessionalBody, PatchProfessionalBody } from "~/modules/availability/professionals.schema.js";

export type ProfessionalRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapProfessional(row: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ProfessionalRow {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class ProfessionalsRepository {
  async countActiveByEstablishmentId(establishmentId: string): Promise<number> {
    return prisma.professional.count({
      where: { establishmentId, deletedAt: null },
    });
  }

  async create(establishmentId: string, data: CreateProfessionalBody): Promise<ProfessionalRow> {
    const row = await prisma.professional.create({
      data: {
        establishmentId,
        name: data.name,
        email: data.email ?? null,
        phone: data.phone ?? null,
      },
    });
    return mapProfessional(row);
  }

  async findAllActiveByEstablishmentId(establishmentId: string): Promise<ProfessionalRow[]> {
    const rows = await prisma.professional.findMany({
      where: { establishmentId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapProfessional);
  }

  async findActiveByIdInEstablishment(
    establishmentId: string,
    professionalId: string,
  ): Promise<ProfessionalRow | null> {
    const row = await prisma.professional.findFirst({
      where: { id: professionalId, establishmentId, deletedAt: null },
    });
    return row ? mapProfessional(row) : null;
  }

  async update(
    establishmentId: string,
    professionalId: string,
    data: PatchProfessionalBody,
  ): Promise<ProfessionalRow | null> {
    const existing = await prisma.professional.findFirst({
      where: { id: professionalId, establishmentId, deletedAt: null },
    });
    if (!existing) {
      return null;
    }

    const updateData: Prisma.ProfessionalUpdateInput = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.email !== undefined) {
      updateData.email = data.email;
    }
    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }

    const row = await prisma.professional.update({
      where: { id: professionalId },
      data: updateData,
    });
    return mapProfessional(row);
  }

  async softDelete(establishmentId: string, professionalId: string): Promise<boolean> {
    const result = await prisma.professional.updateMany({
      where: {
        id: professionalId,
        establishmentId,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
    return result.count > 0;
  }

  async hasFutureConfirmedAppointments(professionalId: string): Promise<boolean> {
    const row = await prisma.appointment.findFirst({
      where: {
        professionalId,
        status: AppointmentStatus.CONFIRMED,
        startAt: { gte: new Date() },
      },
      select: { id: true },
    });
    return row !== null;
  }

  async countServicesInEstablishment(establishmentId: string, serviceIds: string[]): Promise<number> {
    if (serviceIds.length === 0) {
      return 0;
    }
    return prisma.service.count({
      where: {
        establishmentId,
        deletedAt: null,
        id: { in: serviceIds },
      },
    });
  }

  async replaceProfessionalServices(professionalId: string, serviceIds: string[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.professionalService.deleteMany({ where: { professionalId } });
      if (serviceIds.length > 0) {
        await tx.professionalService.createMany({
          data: serviceIds.map((serviceId) => ({ professionalId, serviceId })),
        });
      }
    });
  }
}
