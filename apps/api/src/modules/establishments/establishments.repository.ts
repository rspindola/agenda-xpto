import type { Establishment, Prisma } from "@prisma/client";

import { prisma } from "~/lib/prisma.js";

import type { CreateEstablishmentBody, PatchEstablishmentBody } from "~/modules/establishments/establishments.schema.js";

export type EstablishmentRecord = Establishment;

function toPublic(row: Establishment): {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  timezone: string;
  minAdvanceMinutes: number;
  isActive: boolean;
  operationalEmail: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    email: row.email,
    phone: row.phone,
    address: row.address,
    timezone: row.timezone,
    minAdvanceMinutes: row.minAdvanceMinutes,
    isActive: row.isActive,
    operationalEmail: row.operationalEmail,
    archivedAt: row.archivedAt ? row.archivedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class EstablishmentsRepository {
  async findAllActiveByUserId(userId: string): Promise<ReturnType<typeof toPublic>[]> {
    const rows = await prisma.establishment.findMany({
      where: {
        userId,
        deletedAt: null,
        archivedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toPublic);
  }

  async findOwnedById(userId: string, id: string): Promise<ReturnType<typeof toPublic> | null> {
    const row = await prisma.establishment.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });
    return row ? toPublic(row) : null;
  }

  async findBySlug(slug: string): Promise<Pick<Establishment, "id"> | null> {
    const row = await prisma.establishment.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true },
    });
    return row;
  }

  async findBySlugExcludingId(slug: string, excludeId: string): Promise<Pick<Establishment, "id"> | null> {
    const row = await prisma.establishment.findFirst({
      where: { slug, deletedAt: null, NOT: { id: excludeId } },
      select: { id: true },
    });
    return row;
  }

  async countActiveByUserId(userId: string): Promise<number> {
    return prisma.establishment.count({
      where: {
        userId,
        deletedAt: null,
        archivedAt: null,
      },
    });
  }

  async create(userId: string, data: CreateEstablishmentBody & { slug: string }): Promise<ReturnType<typeof toPublic>> {
    const row = await prisma.establishment.create({
      data: {
        userId,
        name: data.name,
        slug: data.slug,
        email: data.email,
        phone: data.phone ?? null,
        address: data.address ?? null,
        timezone: data.timezone,
        minAdvanceMinutes: data.minAdvanceMinutes ?? 60,
        isActive: data.isActive ?? true,
        operationalEmail: data.operationalEmail ?? null,
      },
    });
    return toPublic(row);
  }

  async update(userId: string, id: string, data: PatchEstablishmentBody): Promise<ReturnType<typeof toPublic> | null> {
    const owned = await prisma.establishment.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!owned) {
      return null;
    }

    const updateData: Prisma.EstablishmentUpdateManyMutationInput = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    }
    if (data.email !== undefined) {
      updateData.email = data.email;
    }
    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }
    if (data.address !== undefined) {
      updateData.address = data.address;
    }
    if (data.timezone !== undefined) {
      updateData.timezone = data.timezone;
    }
    if (data.minAdvanceMinutes !== undefined) {
      updateData.minAdvanceMinutes = data.minAdvanceMinutes;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.operationalEmail !== undefined) {
      updateData.operationalEmail = data.operationalEmail;
    }

    const row = await prisma.establishment.update({
      where: { id },
      data: updateData,
    });
    return toPublic(row);
  }

  /**
   * Sets archivedAt when the row is owned and not soft-deleted.
   * If already archived, returns the current row without changing it (idempotent archive).
   */
  async setArchivedAt(userId: string, id: string, at: Date): Promise<ReturnType<typeof toPublic> | null> {
    const owned = await prisma.establishment.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!owned) {
      return null;
    }
    if (owned.archivedAt !== null) {
      return toPublic(owned);
    }
    const row = await prisma.establishment.update({
      where: { id },
      data: { archivedAt: at },
    });
    return toPublic(row);
  }
}
