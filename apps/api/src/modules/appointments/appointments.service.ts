import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import { AppError } from "~/shared/errors/AppError.js";

import type { AppointmentsRepository } from "./appointments.repository.js";
import type { BulkCancelAppointmentsBody } from "./appointments.schema.js";

export class AppointmentsService {
  constructor(
    private readonly repository: AppointmentsRepository,
    private readonly establishmentsRepository: EstablishmentsRepository,
  ) {}

  async bulkCancelConfirmed(
    userId: string,
    establishmentId: string,
    body: BulkCancelAppointmentsBody,
  ): Promise<{ cancelledIds: string[] }> {
    const establishment = await this.establishmentsRepository.findOwnedById(userId, establishmentId);
    if (!establishment || establishment.archivedAt !== null) {
      throw new AppError(404, "NOT_FOUND", "Establishment not found.");
    }

    const uniqueIds = [...new Set(body.appointmentIds)];
    return this.repository.bulkCancelConfirmedInTransaction(establishmentId, uniqueIds);
  }
}
