import type { BlockScope, Prisma, Weekday } from "@prisma/client";

import { prisma } from "~/lib/prisma.js";

import type { CreateHolidayBody } from "~/modules/availability/availability.schema.js";

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

  async upsertBusinessHour(establishmentId: string, weekday: Weekday, row: OpenBusinessHourRow): Promise<void> {
    await prisma.establishmentBusinessHour.upsert({
      where: {
        establishmentId_weekday: {
          establishmentId,
          weekday,
        },
      },
      create: {
        establishmentId,
        weekday,
        opensAt: row.opensAt,
        closesAt: row.closesAt,
        breakStartsAt: row.breakStartsAt,
        breakEndsAt: row.breakEndsAt,
      },
      update: {
        opensAt: row.opensAt,
        closesAt: row.closesAt,
        breakStartsAt: row.breakStartsAt,
        breakEndsAt: row.breakEndsAt,
      },
    });
  }

  async deleteBusinessHourByWeekday(establishmentId: string, weekday: Weekday): Promise<void> {
    await prisma.establishmentBusinessHour.deleteMany({
      where: { establishmentId, weekday },
    });
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

  async findProfessionalAvailabilityById(
    establishmentId: string,
    professionalId: string,
    availabilityId: string,
  ): Promise<ProfessionalAvailabilityRowDto | null> {
    const row = await prisma.professionalAvailability.findFirst({
      where: {
        id: availabilityId,
        professionalId,
        professional: { establishmentId, deletedAt: null },
      },
    });
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      weekday: row.weekday,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async createProfessionalAvailability(
    professionalId: string,
    window: ProfessionalAvailabilityWindow,
  ): Promise<ProfessionalAvailabilityRowDto> {
    const row = await prisma.professionalAvailability.create({
      data: {
        professionalId,
        weekday: window.weekday,
        startsAt: window.startsAt,
        endsAt: window.endsAt,
      },
    });
    return {
      id: row.id,
      weekday: row.weekday,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async updateProfessionalAvailability(
    establishmentId: string,
    professionalId: string,
    availabilityId: string,
    window: ProfessionalAvailabilityWindow,
  ): Promise<ProfessionalAvailabilityRowDto | null> {
    const existing = await prisma.professionalAvailability.findFirst({
      where: {
        id: availabilityId,
        professionalId,
        professional: { establishmentId, deletedAt: null },
      },
    });
    if (!existing) {
      return null;
    }
    const row = await prisma.professionalAvailability.update({
      where: { id: availabilityId },
      data: {
        weekday: window.weekday,
        startsAt: window.startsAt,
        endsAt: window.endsAt,
      },
    });
    return {
      id: row.id,
      weekday: row.weekday,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async deleteProfessionalAvailability(
    establishmentId: string,
    professionalId: string,
    availabilityId: string,
  ): Promise<boolean> {
    const result = await prisma.professionalAvailability.deleteMany({
      where: {
        id: availabilityId,
        professionalId,
        professional: { establishmentId, deletedAt: null },
      },
    });
    return result.count > 0;
  }
}
