import { z } from "zod";

const reportTypeEnum = z.enum([
  "appointments-completed",
  "cancellations",
  "no-show-rate",
  "by-professional",
  "by-service",
  "peak-hours",
  "most-profitable",
  "return-rate",
  "avg-advance",
  "cancellation-reasons",
]);

export type ReportType = z.infer<typeof reportTypeEnum>;

const proReportTypes: ReportType[] = ["no-show-rate", "return-rate", "peak-hours", "most-profitable"];

export function isProReport(reportType: ReportType): boolean {
  return proReportTypes.includes(reportType);
}

export const reportParamsSchema = z.object({
  establishmentId: z.string().min(1).describe("Establishment cuid2 identifier"),
  reportType: reportTypeEnum.describe("Type of report to retrieve"),
});

export type ReportParams = z.infer<typeof reportParamsSchema>;

export const reportQuerySchema = z
  .object({
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Start date (YYYY-MM-DD) in establishment timezone"),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("End date (YYYY-MM-DD) inclusive, establishment timezone"),
    professionalId: z.string().min(1).optional().describe("Filter by professional cuid2"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine((q) => q.from !== undefined || q.to !== undefined, {
    message: "At least one of from or to is required.",
    path: ["from"],
  });

export type ReportQuery = z.infer<typeof reportQuerySchema>;

// Shared response types
export const reportItemSchema = z.object({
  label: z.string().describe("Display label"),
  value: z.union([z.string(), z.number()]).describe("Metric value"),
  context: z.record(z.string(), z.unknown()).optional().describe("Additional context data"),
});

export type ReportItem = z.infer<typeof reportItemSchema>;

export const reportResponseSchema = z.object({
  reportType: reportTypeEnum,
  period: z
    .object({
      from: z.string(),
      to: z.string(),
    })
    .describe("Report period in UTC"),
  generatedAt: z.string(),
  data: z.array(reportItemSchema),
  summary: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

export type ReportResponse = z.infer<typeof reportResponseSchema>;

export const reportRequiresUpgradeResponseSchema = z.object({
  statusCode: z.literal(403),
  code: z.literal("REPORT_REQUIRES_UPGRADE"),
  message: z.string(),
  requiredPlan: z.enum(["PRO", "BUSINESS"]).optional(),
});

export type ReportRequiresUpgradeResponse = z.infer<typeof reportRequiresUpgradeResponseSchema>;

export const errorResponseSchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  message: z.string(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Specific report data structures (internal)
export type CompletedAppointment = {
  id: string;
  startAt: Date;
  endAt: Date;
  clientEmail: string;
  professionalId: string;
  services: Array<{
    snapshotName: string;
    snapshotPriceCents: number;
    snapshotDurationMinutes: number;
  }>;
};

export type CancellationRecord = {
  id: string;
  startAt: Date;
  clientEmail: string;
  cancelledBy: string | null;
};

export type AppointmentForReturnRate = {
  clientEmail: string;
  appointmentCount: number;
};

export type PeakHourRecord = {
  hour: number;
  count: number;
};

export type AppointmentByProfessional = {
  professionalId: string;
  professionalName: string;
  count: number;
  totalRevenue: number;
};

export type AppointmentByService = {
  serviceName: string;
  count: number;
  totalRevenue: number;
};

export type NoShowRateData = {
  noShowCount: number;
  totalCount: number;
  rate: number;
};

export type ReturnRateData = {
  returnCount: number;
  uniqueClients: number;
  rate: number;
};

export type CancellationReasonData = {
  reason: string;
  count: number;
};
