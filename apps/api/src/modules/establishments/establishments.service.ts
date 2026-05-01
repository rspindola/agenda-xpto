import { PlanType, SubscriptionStatus } from "@prisma/client";

import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import type { CreateEstablishmentBody, PatchEstablishmentBody } from "~/modules/establishments/establishments.schema.js";
import type { SubscriptionRow } from "~/modules/plans/subscription.repository.js";
import { AppError } from "~/shared/errors/AppError.js";

export type EstablishmentPublicDto = {
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
};

const PLAN_MAX_ACTIVE_ESTABLISHMENTS: Record<PlanType, number> = {
  [PlanType.STARTER]: 1,
  [PlanType.PRO]: 3,
  [PlanType.BUSINESS]: 10,
};

function requireSubscriptionForCreate(subscription: SubscriptionRow | null): SubscriptionRow {
  if (subscription === null) {
    throw new AppError(422, "SUBSCRIPTION_NOT_FOUND", "No subscription found for this account.");
  }
  if (subscription.status !== SubscriptionStatus.TRIALING && subscription.status !== SubscriptionStatus.ACTIVE) {
    throw new AppError(422, "SUBSCRIPTION_NOT_ACTIVE", "Subscription is not active. Establishments cannot be created.");
  }
  return subscription;
}

function maxEstablishmentsForPlan(planType: PlanType): number {
  return PLAN_MAX_ACTIVE_ESTABLISHMENTS[planType];
}

export function generateSlugFromName(name: string): string {
  const nfd = name.normalize("NFD");
  const withoutDiacritics = nfd.replace(/\p{M}/gu, "");
  const lower = withoutDiacritics.toLowerCase();
  const replaced = lower
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (replaced.length === 0) {
    return "establishment";
  }
  return replaced;
}

export class EstablishmentsService {
  constructor(
    private readonly establishmentsRepository: EstablishmentsRepository,
    private readonly findSubscriptionByUserId: (userId: string) => Promise<SubscriptionRow | null>,
  ) {}

  async listByUser(userId: string): Promise<EstablishmentPublicDto[]> {
    return this.establishmentsRepository.findAllActiveByUserId(userId);
  }

  async findById(userId: string, id: string): Promise<EstablishmentPublicDto> {
    const row = await this.establishmentsRepository.findOwnedById(userId, id);
    if (!row) {
      throw new AppError(404, "NOT_FOUND", "Establishment not found.");
    }
    return row;
  }

  async create(userId: string, body: CreateEstablishmentBody): Promise<EstablishmentPublicDto> {
    const subscription = requireSubscriptionForCreate(await this.findSubscriptionByUserId(userId));

    const activeCount = await this.establishmentsRepository.countActiveByUserId(userId);
    const maxAllowed = maxEstablishmentsForPlan(subscription.planType);
    if (activeCount >= maxAllowed) {
      throw new AppError(422, "PLAN_LIMIT_REACHED", "You have reached the maximum number of establishments for your plan.");
    }

    const slug = await this.resolveSlugForCreate(body.name, body.slug);

    try {
      return await this.establishmentsRepository.create(userId, { ...body, slug });
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        throw new AppError(422, "SLUG_ALREADY_TAKEN", "The provided slug is already in use.");
      }
      throw error;
    }
  }

  async update(userId: string, id: string, body: PatchEstablishmentBody): Promise<EstablishmentPublicDto> {
    const keys = Object.keys(body) as (keyof PatchEstablishmentBody)[];
    const hasAnyField = keys.some((key) => body[key] !== undefined);
    if (!hasAnyField) {
      throw new AppError(400, "VALIDATION_ERROR", "At least one field is required.");
    }

    if (body.slug !== undefined) {
      const taken = await this.establishmentsRepository.findBySlugExcludingId(body.slug, id);
      if (taken) {
        throw new AppError(422, "SLUG_ALREADY_TAKEN", "The provided slug is already in use.");
      }
    }

    try {
      const updated = await this.establishmentsRepository.update(userId, id, body);
      if (!updated) {
        throw new AppError(404, "NOT_FOUND", "Establishment not found.");
      }
      return updated;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        throw new AppError(422, "SLUG_ALREADY_TAKEN", "The provided slug is already in use.");
      }
      throw error;
    }
  }

  async archive(userId: string, id: string): Promise<void> {
    const row = await this.establishmentsRepository.findOwnedById(userId, id);
    if (!row) {
      throw new AppError(404, "NOT_FOUND", "Establishment not found.");
    }
    await this.establishmentsRepository.setArchivedAt(userId, id, new Date());
  }

  private async resolveSlugForCreate(name: string, manualSlug: string | undefined): Promise<string> {
    if (manualSlug !== undefined) {
      const taken = await this.establishmentsRepository.findBySlug(manualSlug);
      if (taken) {
        throw new AppError(422, "SLUG_ALREADY_TAKEN", "The provided slug is already in use.");
      }
      return manualSlug;
    }

    const base = generateSlugFromName(name);
    let candidate = base;
    let suffix = 2;
    while (await this.establishmentsRepository.findBySlug(candidate)) {
      candidate = `${base}-${String(suffix)}`;
      suffix += 1;
      if (suffix > 10_000) {
        throw new AppError(422, "SLUG_ALREADY_TAKEN", "Could not allocate a unique slug.");
      }
    }
    return candidate;
  }
}
