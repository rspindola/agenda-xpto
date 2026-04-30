import type { BlockScope, Prisma, Weekday } from "@prisma/client";

import { prisma } from "~/lib/prisma.js";

import type { CreateHolidayBody } from "./availability.schema.js";

export type BusinessHourRowDto = {
  id: string;
  weekday: Weekday;
  opensAt: Date;
  closesAt: Date;
  breakStartsAt: Date | null;
  breakEndsAt: Date | null;
};

export type HolidayRowDto = {
  id: string;
  date: Date;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BlockRowDto = {
  id: string;
  scope: BlockScope;
  professionalId: string | null;
  startsAt: Date;
  endsAt: Date;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfessionalAvailabilityRowDto = {
  id: string;
  weekday: Weekday;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type OpenBusinessHourRow = {
  weekday: Weekday;
  opensAt: Date;
  closesAt: Date;
  breakStartsAt: Date | null;
  breakEndsAt: Date | null;
};

export type ProfessionalAvailabilityWindow = {
  weekday: Weekday;
  startsAt: Date;
  endsAt: Date;
};

export type CreateBlockInput = {
  scope: BlockScope;
  professionalId: string | null;
  startsAt: Date;
  endsAt: Date;
  reason: string;
};

export class AvailabilityRepository {
  async isEstablishmentOwned(userId: string, establishmentId: string): Promise<boolean> {
    const row = await prisma.establishment.findFirst({
      where: {
        id: establishmentId,
        userId,
        deletedAt: null,
        archivedAt: null,
      },
      select: { id: true },
    });
    return row !== null;
  }

  async findBusinessHours(establishmentId: string): Promise<BusinessHourRowDto[]> {
    const rows = await prisma.establishmentBusinessHour.findMany({
      where: { establishmentId },
      orderBy: { weekday: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      weekday: r.weekday,
      opensAt: r.opensAt,
      closesAt: r.closesAt,
      breakStartsAt: r.breakStartsAt,
      breakEndsAt: r.breakEndsAt,
    }));
  }

  async replaceBusinessHours(establishmentId: string, openDays: OpenBusinessHourRow[]): Promise<void> {
    const createData: Prisma.EstablishmentBusinessHourCreateManyInput[] = openDays.map((d) => ({
      establishmentId,
      weekday: d.weekday,
      opensAt: d.opensAt,
      closesAt: d.closesAt,
      breakStartsAt: d.breakStartsAt,
      breakEndsAt: d.breakEndsAt,
    }));

    await prisma.$transaction([
      prisma.establishmentBusinessHour.deleteMany({ where: { establishmentId } }),
      prisma.establishmentBusinessHour.createMany({ data: createData }),
    ]);
  }

  async findHolidays(establishmentId: string): Promise<HolidayRowDto[]> {
    const rows = await prisma.establishmentHoliday.findMany({
      where: { establishmentId },
      orderBy: { date: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      date: r.date,
      reason: r.reason,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async createHoliday(establishmentId: string, body: CreateHolidayBody): Promise<HolidayRowDto> {
    const date = new Date(`${body.date}T12:00:00.000Z`);
    const row = await prisma.establishmentHoliday.create({
      data: {
        establishmentId,
        date,
        reason: body.reason,
      },
    });
    return {
      id: row.id,
      date: row.date,
      reason: row.reason,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async deleteHoliday(establishmentId: string, holidayId: string): Promise<boolean> {
    const result = await prisma.establishmentHoliday.deleteMany({
      where: { id: holidayId, establishmentId },
    });
    return result.count > 0;
  }

  async findBlocks(establishmentId: string): Promise<BlockRowDto[]> {
    const rows = await prisma.block.findMany({
      where: { establishmentId },
      orderBy: { startsAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      scope: r.scope,
      professionalId: r.professionalId,
      startsAt: r.startsAt,
      endsAt: r.endsAt,
      reason: r.reason,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async createBlock(establishmentId: string, body: CreateBlockInput): Promise<BlockRowDto> {
    const row = await prisma.block.create({
      data: {
        establishmentId,
        scope: body.scope,
        professionalId: body.professionalId,
        startsAt: body.startsAt,
        endsAt: body.endsAt,
        reason: body.reason,
      },
    });
    return {
      id: row.id,
      scope: row.scope,
      professionalId: row.professionalId,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      reason: row.reason,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async deleteBlock(establishmentId: string, blockId: string): Promise<boolean> {
    const result = await prisma.block.deleteMany({
      where: { id: blockId, establishmentId },
    });
    return result.count > 0;
  }

  async findProfessionalInEstablishment(
    establishmentId: string,
    professionalId: string,
  ): Promise<{ id: string } | null> {
    return prisma.professional.findFirst({
      where: {
        id: professionalId,
        establishmentId,
        deletedAt: null,
      },
      select: { id: true },
    });
  }

  async findProfessionalAvailabilities(professionalId: string): Promise<ProfessionalAvailabilityRowDto[]> {
    const rows = await prisma.professionalAvailability.findMany({
      where: { professionalId },
      orderBy: [{ weekday: "asc" }, { startsAt: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      weekday: r.weekday,
      startsAt: r.startsAt,
      endsAt: r.endsAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async replaceProfessionalAvailabilities(
    professionalId: string,
    windows: ProfessionalAvailabilityWindow[],
  ): Promise<ProfessionalAvailabilityRowDto[]> {
    const createData: Prisma.ProfessionalAvailabilityCreateManyInput[] = windows.map((w) => ({
      professionalId,
      weekday: w.weekday,
      startsAt: w.startsAt,
      endsAt: w.endsAt,
    }));

    await prisma.$transaction([
      prisma.professionalAvailability.deleteMany({ where: { professionalId } }),
      prisma.professionalAvailability.createMany({ data: createData }),
    ]);

    return this.findProfessionalAvailabilities(professionalId);
  }
}
