import { PlanType, SubscriptionStatus } from "@prisma/client";

import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import type { SubscriptionRow } from "~/modules/plans/subscription.repository.js";
import { AppError } from "~/shared/errors/AppError.js";

import type { ProfessionalsRepository } from "./professionals.repository.js";
import type {
  CreateProfessionalBody,
  PatchProfessionalBody,
  ProfessionalPublic,
  ReplaceProfessionalServicesBody,
} from "./professionals.schema.js";

function requireSubscriptionForMutation(subscription: SubscriptionRow | null): SubscriptionRow {
  if (subscription === null) {
    throw new AppError(422, "SUBSCRIPTION_NOT_FOUND", "No subscription found for this account.");
  }
  if (subscription.status !== SubscriptionStatus.TRIALING && subscription.status !== SubscriptionStatus.ACTIVE) {
    throw new AppError(422, "SUBSCRIPTION_NOT_ACTIVE", "Subscription is not active.");
  }
  return subscription;
}

function maxProfessionalsForPlan(planType: PlanType): number | null {
  if (planType === PlanType.BUSINESS) {
    return null;
  }
  if (planType === PlanType.STARTER) {
    return 2;
  }
  return 10;
}

function mapToPublic(row: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ProfessionalPublic {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class ProfessionalsService {
  constructor(
    private readonly establishmentsRepository: EstablishmentsRepository,
    private readonly professionalsRepository: ProfessionalsRepository,
    private readonly getSubscription: (userId: string) => Promise<SubscriptionRow | null>,
  ) {}

  private async assertOwnedNonArchivedEstablishment(userId: string, establishmentId: string): Promise<void> {
    const establishment = await this.establishmentsRepository.findOwnedById(userId, establishmentId);
    if (!establishment || establishment.archivedAt !== null) {
      throw new AppError(404, "NOT_FOUND", "Establishment not found.");
    }
  }

  async list(userId: string, establishmentId: string): Promise<ProfessionalPublic[]> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const rows = await this.professionalsRepository.findAllActiveByEstablishmentId(establishmentId);
    return rows.map(mapToPublic);
  }

  async findById(userId: string, establishmentId: string, professionalId: string): Promise<ProfessionalPublic> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const row = await this.professionalsRepository.findActiveByIdInEstablishment(establishmentId, professionalId);
    if (!row) {
      throw new AppError(404, "NOT_FOUND", "Professional not found.");
    }
    return mapToPublic(row);
  }

  async create(userId: string, establishmentId: string, body: CreateProfessionalBody): Promise<ProfessionalPublic> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const subscription = requireSubscriptionForMutation(await this.getSubscription(userId));
    const maxAllowed = maxProfessionalsForPlan(subscription.planType);
    const current = await this.professionalsRepository.countActiveByEstablishmentId(establishmentId);
    if (maxAllowed !== null && current >= maxAllowed) {
      throw new AppError(422, "PLAN_LIMIT_REACHED", "You have reached the maximum number of professionals for your plan.");
    }

    try {
      const row = await this.professionalsRepository.create(establishmentId, body);
      return mapToPublic(row);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        throw new AppError(422, "PROFESSIONAL_EMAIL_TAKEN", "This email is already in use for another professional in this establishment.");
      }
      throw error;
    }
  }

  async update(
    userId: string,
    establishmentId: string,
    professionalId: string,
    body: PatchProfessionalBody,
  ): Promise<ProfessionalPublic> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const keys = Object.keys(body) as (keyof PatchProfessionalBody)[];
    const hasAnyField = keys.some((key) => body[key] !== undefined);
    if (!hasAnyField) {
      throw new AppError(400, "VALIDATION_ERROR", "At least one field is required.");
    }

    try {
      const row = await this.professionalsRepository.update(establishmentId, professionalId, body);
      if (!row) {
        throw new AppError(404, "NOT_FOUND", "Professional not found.");
      }
      return mapToPublic(row);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        throw new AppError(422, "PROFESSIONAL_EMAIL_TAKEN", "This email is already in use for another professional in this establishment.");
      }
      throw error;
    }
  }

  async softDelete(userId: string, establishmentId: string, professionalId: string): Promise<void> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const row = await this.professionalsRepository.findActiveByIdInEstablishment(establishmentId, professionalId);
    if (!row) {
      throw new AppError(404, "NOT_FOUND", "Professional not found.");
    }
    const hasFuture = await this.professionalsRepository.hasFutureConfirmedAppointments(professionalId);
    if (hasFuture) {
      throw new AppError(
        422,
        "PROFESSIONAL_HAS_ACTIVE_APPOINTMENTS",
        "Cannot archive this professional while future confirmed appointments exist.",
      );
    }
    const ok = await this.professionalsRepository.softDelete(establishmentId, professionalId);
    if (!ok) {
      throw new AppError(404, "NOT_FOUND", "Professional not found.");
    }
  }

  async replaceServices(
    userId: string,
    establishmentId: string,
    professionalId: string,
    body: ReplaceProfessionalServicesBody,
  ): Promise<void> {
    await this.assertOwnedNonArchivedEstablishment(userId, establishmentId);
    const prof = await this.professionalsRepository.findActiveByIdInEstablishment(establishmentId, professionalId);
    if (!prof) {
      throw new AppError(404, "NOT_FOUND", "Professional not found.");
    }
    const uniqueIds = [...new Set(body.serviceIds)];
    if (uniqueIds.length !== body.serviceIds.length) {
      throw new AppError(400, "VALIDATION_ERROR", "serviceIds must not contain duplicates.");
    }
    const matchCount = await this.professionalsRepository.countServicesInEstablishment(establishmentId, uniqueIds);
    if (matchCount !== uniqueIds.length) {
      throw new AppError(422, "INVALID_SERVICE_IDS", "One or more services do not belong to this establishment.");
    }
    await this.professionalsRepository.replaceProfessionalServices(professionalId, uniqueIds);
  }
}
