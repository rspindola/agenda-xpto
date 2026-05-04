import { AppError } from "~/shared/errors/AppError.js";
import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import type * as subscriptionRepository from "~/modules/plans/subscription.repository.js";
import type {
  ReportQuery,
  ReportResponse,
  ReportType,
} from "~/modules/reports/reports.schema.js";
import { isProReport } from "~/modules/reports/reports.schema.js";
import type { ReportsRepository } from "~/modules/reports/reports.repository.js";
import { parseLocalDate, toUtcDateRange } from "~/shared/utils/dateUtils.js";

type SubscriptionRepository = typeof subscriptionRepository;

export class ReportsService {
  constructor(
    private repository: ReportsRepository,
    private establishmentsRepository: EstablishmentsRepository,
    private subscriptionRepository: SubscriptionRepository,
  ) {}

  async getReport(
    userId: string,
    establishmentId: string,
    reportType: ReportType,
    query: ReportQuery,
  ): Promise<ReportResponse> {
    // Validate establishment ownership
    const establishment = await this.establishmentsRepository.findOwnedById(userId, establishmentId);
    if (!establishment) {
      throw new AppError(404, "NOT_FOUND", "Establishment not found.");
    }

    // Check plan access for Pro reports
    if (isProReport(reportType)) {
      const subscription = await this.subscriptionRepository.findSubscriptionByUserId(userId);
      if (!subscription || (subscription.planType !== "PRO" && subscription.planType !== "BUSINESS")) {
        throw new AppError(403, "REPORT_REQUIRES_UPGRADE", "This report requires a Pro or Business plan.");
      }
    }

    // Parse dates
    const { from, to } = query;
    if (!from && !to) {
      throw new AppError(400, "INVALID_DATE_RANGE", "At least one of from or to is required.");
    }

    const now = new Date();
    const fromDate = from ? parseLocalDate(from, establishment.timezone) : new Date(0);
    const toDate = to
      ? parseLocalDate(to, establishment.timezone, { endOfDay: true })
      : parseLocalDate(now.toISOString().split("T")[0] ?? "", establishment.timezone, { endOfDay: true });

    if (fromDate > toDate) {
      throw new AppError(400, "INVALID_DATE_RANGE", "from date cannot be after to date.");
    }

    const { start: utcStart, end: utcEnd } = toUtcDateRange(fromDate, toDate, establishment.timezone);

    // Generate report data
    let data;
    switch (reportType) {
      case "appointments-completed":
        data = await this.buildCompletedAppointmentsReport(establishmentId, utcStart, utcEnd);
        break;
      case "cancellations":
        data = await this.buildCancellationsReport(establishmentId, utcStart, utcEnd);
        break;
      case "no-show-rate":
        data = await this.buildNoShowRateReport(establishmentId, utcStart, utcEnd);
        break;
      case "by-professional":
        data = await this.buildByProfessionalReport(establishmentId, utcStart, utcEnd);
        break;
      case "by-service":
        data = await this.buildByServiceReport(establishmentId, utcStart, utcEnd);
        break;
      case "peak-hours":
        data = await this.buildPeakHoursReport(establishmentId, utcStart, utcEnd);
        break;
      case "most-profitable":
        data = await this.buildMostProfitableReport(establishmentId, utcStart, utcEnd);
        break;
      case "return-rate":
        data = await this.buildReturnRateReport(establishmentId, utcStart, utcEnd);
        break;
      case "avg-advance":
        data = await this.buildAvgAdvanceReport(establishmentId, utcStart, utcEnd);
        break;
      case "cancellation-reasons":
        data = await this.buildCancellationReasonsReport(establishmentId, utcStart, utcEnd);
        break;
    }

    return {
      reportType,
      period: {
        from: utcStart.toISOString(),
        to: utcEnd.toISOString(),
      },
      generatedAt: new Date().toISOString(),
      data,
      summary: this.calculateSummary(data),
    };
  }

  private async buildCompletedAppointmentsReport(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<Array<{ label: string; value: number }>> {
    const completed = await this.repository.findCompletedInRange(establishmentId, startAt, endAt);
    return [{ label: "Total Completed Appointments", value: completed.length }];
  }

  private async buildCancellationsReport(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<Array<{ label: string; value: number }>> {
    const cancellations = await this.repository.findCancellationsInRange(establishmentId, startAt, endAt);
    return [{ label: "Total Cancellations", value: cancellations.length }];
  }

  private async buildNoShowRateReport(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<Array<{ label: string; value: string | number }>> {
    const noShowCount = (await this.repository.findNoShowInRange(establishmentId, startAt, endAt)).length;
    const totalCount = await this.repository.countAppointmentsInRange(establishmentId, startAt, endAt);

    const rate = totalCount === 0 ? 0 : Math.round((noShowCount / totalCount) * 10000) / 100;
    return [
      { label: "No-Show Count", value: noShowCount },
      { label: "Total Appointments", value: totalCount },
      { label: "No-Show Rate (%)", value: `${rate.toFixed(2)}%` },
    ];
  }

  private async buildByProfessionalReport(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<Array<{ label: string; value: string | number }>> {
    const professionals = await this.repository.findAppointmentsByProfessional(establishmentId, startAt, endAt);
    return professionals.map((p) => ({
      label: p.professionalName,
      value: `${p.count.toString()} appointments - R$ ${(p.totalRevenue / 100).toFixed(2)}`,
    }));
  }

  private async buildByServiceReport(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<Array<{ label: string; value: string | number }>> {
    const services = await this.repository.findAppointmentsByService(establishmentId, startAt, endAt);
    return services.map((s) => ({
      label: s.serviceName,
      value: `${s.count.toString()} bookings - R$ ${(s.totalRevenue / 100).toFixed(2)}`,
    }));
  }

  private async buildPeakHoursReport(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<Array<{ label: string; value: number }>> {
    const completed = await this.repository.findCompletedInRange(establishmentId, startAt, endAt);

    const hourCounts = new Map<number, number>();
    for (const apt of completed) {
      const hour = apt.startAt.getUTCHours();
      hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
    }

    return Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([hour, count]) => ({
        label: `${hour.toString().padStart(2, "0")}:00`,
        value: count,
      }));
  }

  private async buildMostProfitableReport(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<Array<{ label: string; value: string }>> {
    const services = await this.repository.findAppointmentsByService(establishmentId, startAt, endAt);
    return services
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)
      .map((s) => ({
        label: s.serviceName,
        value: `R$ ${(s.totalRevenue / 100).toFixed(2)}`,
      }));
  }

  private async buildReturnRateReport(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<Array<{ label: string; value: string }>> {
    const clientAppointments = await this.repository.findClientAppointments(establishmentId, startAt, endAt);

    const uniqueClients = clientAppointments.length;
    const returnCount = clientAppointments.filter((c) => c.appointmentCount > 1).length;
    const rate = uniqueClients === 0 ? 0 : Math.round((returnCount / uniqueClients) * 10000) / 100;

    return [
      { label: "Unique Clients", value: uniqueClients.toString() },
      { label: "Return Clients", value: returnCount.toString() },
      { label: "Return Rate (%)", value: `${rate.toFixed(2)}%` },
    ];
  }

  private async buildAvgAdvanceReport(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<Array<{ label: string; value: string }>> {
    const avgMinutes = await this.repository.getAverageAdvanceMinutes(establishmentId, startAt, endAt);

    if (avgMinutes === null) {
      return [{ label: "Average Advance Notice", value: "N/A" }];
    }

    const days = Math.floor(avgMinutes / (60 * 24));
    const hours = Math.floor((avgMinutes % (60 * 24)) / 60);
    const minutes = avgMinutes % 60;

    let formatted = "";
    if (days > 0) formatted += `${days.toString()}d `;
    if (hours > 0) formatted += `${hours.toString()}h `;
    formatted += `${minutes.toString()}m`;

    return [{ label: "Average Advance Notice", value: formatted.trim() }];
  }

  private async buildCancellationReasonsReport(
    establishmentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<Array<{ label: string; value: number }>> {
    const reasons = await this.repository.findCancellationReasons(establishmentId, startAt, endAt);
    return reasons.map((r) => ({
      label: r.reason,
      value: r.count,
    }));
  }

  private calculateSummary(
    data: Array<{ label: string; value: unknown }>,
  ): Record<string, string | number> {
    const summary: Record<string, string | number> = {};
    for (const item of data) {
      if (typeof item.value === "string" || typeof item.value === "number") {
        summary[item.label] = item.value;
      }
    }
    return summary;
  }
}
