import { z } from "zod";

export const WEEKDAY_VALUES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export type WeekdayValue = (typeof WEEKDAY_VALUES)[number];

export const weekdaySchema = z.enum(WEEKDAY_VALUES);

const TIME_HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

export const timeHmSchema = z
  .string()
  .regex(TIME_HH_MM, "Time must be HH:mm in 24-hour format.")
  .describe("Local wall-clock time HH:mm (24h), interpreted against establishment calendar day");

export const establishmentIdParamsSchema = z.object({
  establishmentId: z.string().min(1).describe("Establishment cuid2 identifier"),
});

export type EstablishmentIdParams = z.infer<typeof establishmentIdParamsSchema>;

export const professionalIdParamsSchema = establishmentIdParamsSchema.extend({
  professionalId: z.string().min(1).describe("Professional cuid2 identifier"),
});

export type ProfessionalIdParams = z.infer<typeof professionalIdParamsSchema>;

export const businessHourDayInputSchema = z
  .object({
    weekday: weekdaySchema,
    closed: z.boolean().describe("When true, the establishment is closed this weekday"),
    opensAt: timeHmSchema.optional(),
    closesAt: timeHmSchema.optional(),
    breakStartsAt: timeHmSchema.nullable().optional(),
    breakEndsAt: timeHmSchema.nullable().optional(),
  })
  .superRefine((day, ctx) => {
    if (day.closed) {
      return;
    }
    if (day.opensAt === undefined || day.closesAt === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "opensAt and closesAt are required when closed is false.",
        path: ["opensAt"],
      });
      return;
    }
    const hasBreakStart = day.breakStartsAt !== undefined && day.breakStartsAt !== null;
    const hasBreakEnd = day.breakEndsAt !== undefined && day.breakEndsAt !== null;
    if (hasBreakStart !== hasBreakEnd) {
      ctx.addIssue({
        code: "custom",
        message: "breakStartsAt and breakEndsAt must both be set or both omitted.",
        path: ["breakStartsAt"],
      });
    }
  });

export type BusinessHourDayInput = z.infer<typeof businessHourDayInputSchema>;

export const replaceBusinessHoursBodySchema = z
  .array(businessHourDayInputSchema)
  .length(7)
  .describe("Exactly one entry per calendar weekday (Mon–Sun)")
  .refine(
    (days) => {
      const set = new Set(days.map((d) => d.weekday));
      return set.size === 7;
    },
    { message: "Each weekday (MON–SUN) must appear exactly once." },
  );

export type ReplaceBusinessHoursBody = z.infer<typeof replaceBusinessHoursBodySchema>;

/** Single weekday upsert (weekday comes from path params). Same rules as businessHourDayInputSchema without weekday field (Zod 4 disallows .omit() on refined objects). */
export const putBusinessHourBodySchema = z
  .object({
    closed: z.boolean().describe("When true, the establishment is closed this weekday (row deleted)"),
    opensAt: timeHmSchema.optional(),
    closesAt: timeHmSchema.optional(),
    breakStartsAt: timeHmSchema.nullable().optional(),
    breakEndsAt: timeHmSchema.nullable().optional(),
  })
  .superRefine((day, ctx) => {
    if (day.closed) {
      return;
    }
    if (day.opensAt === undefined || day.closesAt === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "opensAt and closesAt are required when closed is false.",
        path: ["opensAt"],
      });
      return;
    }
    const hasBreakStart = day.breakStartsAt !== undefined && day.breakStartsAt !== null;
    const hasBreakEnd = day.breakEndsAt !== undefined && day.breakEndsAt !== null;
    if (hasBreakStart !== hasBreakEnd) {
      ctx.addIssue({
        code: "custom",
        message: "breakStartsAt and breakEndsAt must both be set or both omitted.",
        path: ["breakStartsAt"],
      });
    }
  });

export type PutBusinessHourBody = z.infer<typeof putBusinessHourBodySchema>;

export const establishmentWeekdayParamsSchema = establishmentIdParamsSchema.extend({
  weekday: weekdaySchema,
});

export type EstablishmentWeekdayParams = z.infer<typeof establishmentWeekdayParamsSchema>;

export const businessHourRowSchema = z.object({
  id: z.string(),
  weekday: weekdaySchema,
  closed: z.literal(false),
  opensAt: timeHmSchema,
  closesAt: timeHmSchema,
  breakStartsAt: timeHmSchema.nullable(),
  breakEndsAt: timeHmSchema.nullable(),
});

export const businessHourClosedRowSchema = z.object({
  weekday: weekdaySchema,
  closed: z.literal(true),
});

export const businessHourResponseItemSchema = z.union([businessHourRowSchema, businessHourClosedRowSchema]);

export const businessHoursListResponseSchema = z.array(businessHourResponseItemSchema);

export type BusinessHoursListResponse = z.infer<typeof businessHoursListResponseSchema>;

export const holidayRowSchema = z.object({
  id: z.string(),
  date: z.string().describe("Calendar date ISO 8601 (YYYY-MM-DD)"),
  reason: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const holidaysListResponseSchema = z.array(holidayRowSchema);

export type HolidaysListResponse = z.infer<typeof holidaysListResponseSchema>;

export const createHolidayBodySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD.")
    .describe("Calendar date when the establishment is closed"),
  reason: z.string().min(1).max(500).describe("Human-readable reason for the closure"),
});

export type CreateHolidayBody = z.infer<typeof createHolidayBodySchema>;

export const holidayIdParamsSchema = establishmentIdParamsSchema.extend({
  holidayId: z.string().min(1),
});

export const blockScopeSchema = z.enum(["ESTABLISHMENT", "PROFESSIONAL"]);

export const createBlockBodySchema = z
  .object({
    scope: blockScopeSchema,
    professionalId: z.string().min(1).nullable().optional().describe("Required when scope is PROFESSIONAL"),
    startsAt: z.iso.datetime().describe("Block start in ISO 8601 UTC"),
    endsAt: z.iso.datetime().describe("Block end in ISO 8601 UTC (exclusive overlap rules follow slot engine)"),
    reason: z.string().min(1).max(500),
  })
  .superRefine((body, ctx) => {
    if (body.scope === "PROFESSIONAL" && (body.professionalId === undefined || body.professionalId === null)) {
      ctx.addIssue({
        code: "custom",
        message: "professionalId is required when scope is PROFESSIONAL.",
        path: ["professionalId"],
      });
    }
    if (body.scope === "ESTABLISHMENT" && body.professionalId !== undefined && body.professionalId !== null) {
      ctx.addIssue({
        code: "custom",
        message: "professionalId must be omitted when scope is ESTABLISHMENT.",
        path: ["professionalId"],
      });
    }
  });

export type CreateBlockBody = z.infer<typeof createBlockBodySchema>;

export const appointmentConflictItemSchema = z.object({
  id: z.string(),
  professionalId: z.string(),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  clientName: z.string(),
});

export type AppointmentConflictItem = z.infer<typeof appointmentConflictItemSchema>;

export const blockRowSchema = z.object({
  id: z.string(),
  scope: blockScopeSchema,
  professionalId: z.string().nullable(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  reason: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const blocksListResponseSchema = z.array(blockRowSchema);

export type BlocksListResponse = z.infer<typeof blocksListResponseSchema>;

export const createBlockResponseSchema = z.object({
  block: blockRowSchema,
  conflicts: z.array(appointmentConflictItemSchema),
});

export type CreateBlockResponse = z.infer<typeof createBlockResponseSchema>;

export const blockIdParamsSchema = establishmentIdParamsSchema.extend({
  blockId: z.string().min(1),
});

export const professionalAvailabilityInputSchema = z.object({
  weekday: weekdaySchema,
  startsAt: timeHmSchema,
  endsAt: timeHmSchema,
});

export type ProfessionalAvailabilityInput = z.infer<typeof professionalAvailabilityInputSchema>;

export const professionalAvailabilityIdParamsSchema = professionalIdParamsSchema.extend({
  availabilityId: z.string().min(1).describe("Professional availability cuid2 identifier"),
});

export type ProfessionalAvailabilityIdParams = z.infer<typeof professionalAvailabilityIdParamsSchema>;

/** Create one weekly availability window (POST). */
export const createProfessionalAvailabilityBodySchema = professionalAvailabilityInputSchema;

export type CreateProfessionalAvailabilityBody = z.infer<typeof createProfessionalAvailabilityBodySchema>;

/** Replace fields of one availability row (PATCH). */
export const patchProfessionalAvailabilityBodySchema = professionalAvailabilityInputSchema;

export type PatchProfessionalAvailabilityBody = z.infer<typeof patchProfessionalAvailabilityBodySchema>;

export const replaceProfessionalAvailabilitiesBodySchema = z
  .array(professionalAvailabilityInputSchema)
  .describe("Weekly recurring availability windows for the professional");

export type ReplaceProfessionalAvailabilitiesBody = z.infer<typeof replaceProfessionalAvailabilitiesBodySchema>;

export const professionalAvailabilityRowSchema = z.object({
  id: z.string(),
  weekday: weekdaySchema,
  startsAt: timeHmSchema,
  endsAt: timeHmSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const professionalAvailabilitiesListResponseSchema = z.array(professionalAvailabilityRowSchema);

export type ProfessionalAvailabilitiesListResponse = z.infer<typeof professionalAvailabilitiesListResponseSchema>;

export type ProfessionalAvailabilityRow = z.infer<typeof professionalAvailabilityRowSchema>;
