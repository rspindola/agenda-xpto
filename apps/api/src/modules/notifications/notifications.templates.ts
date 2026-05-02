export type AppointmentServiceLineForTemplate = {
  snapshotName: string;
  snapshotDurationMinutes: number;
  snapshotPriceCents: number;
  sortOrder: number;
};

export type AppointmentEmailContext = {
  establishmentName: string;
  professionalName: string;
  clientName: string;
  startAtIso: string;
  endAtIso: string;
  services: AppointmentServiceLineForTemplate[];
  cancelToken: string;
  cancelRequestUrl: string;
};

export type CancellationClientContext = {
  establishmentName: string;
  clientName: string;
  startAtIso: string;
  endAtIso: string;
};

export type CancellationOwnerContext = {
  establishmentName: string;
  clientName: string;
  startAtIso: string;
  endAtIso: string;
};

export type OwnerFailReminderContext = {
  establishmentName: string;
  appointmentId: string;
  startAtIso: string;
};

export function buildPublicCancelRequestUrl(apiBaseUrl: string, cancelToken: string): string {
  const base = apiBaseUrl.replace(/\/$/, "");
  return `${base}/api/v1/public/booking/appointments/cancel/${cancelToken}`;
}

function formatServiceLines(services: AppointmentServiceLineForTemplate[]): string {
  return [...services]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => `- ${s.snapshotName} (${String(s.snapshotDurationMinutes)} min)`)
    .join("\n");
}

export function buildAppointmentConfirmationEmail(ctx: AppointmentEmailContext): { subject: string; text: string } {
  const subject = `Appointment confirmed — ${ctx.establishmentName}`;
  const lines = formatServiceLines(ctx.services);
  const text = [
    `Hello ${ctx.clientName},`,
    "",
    `Your appointment at ${ctx.establishmentName} is confirmed.`,
    "",
    `Professional: ${ctx.professionalName}`,
    `Start (UTC): ${ctx.startAtIso}`,
    `End (UTC): ${ctx.endAtIso}`,
    "",
    "Services:",
    lines,
    "",
    "To cancel this appointment, send an HTTP POST request to:",
    ctx.cancelRequestUrl,
    "",
    `Your cancellation token (include in the URL path only): ${ctx.cancelToken}`,
    "",
    "Thank you for booking with us.",
  ].join("\n");
  return { subject, text };
}

export function buildReminder24hEmail(ctx: AppointmentEmailContext): { subject: string; text: string } {
  const subject = `Reminder: appointment tomorrow — ${ctx.establishmentName}`;
  const lines = formatServiceLines(ctx.services);
  const text = [
    `Hello ${ctx.clientName},`,
    "",
    `This is a reminder that you have an appointment at ${ctx.establishmentName} in about 24 hours.`,
    "",
    `Professional: ${ctx.professionalName}`,
    `Start (UTC): ${ctx.startAtIso}`,
    `End (UTC): ${ctx.endAtIso}`,
    "",
    "Services:",
    lines,
    "",
    "To cancel, send an HTTP POST request to:",
    ctx.cancelRequestUrl,
    "",
    `Cancellation token: ${ctx.cancelToken}`,
  ].join("\n");
  return { subject, text };
}

export function buildReminder2hEmail(ctx: AppointmentEmailContext): { subject: string; text: string } {
  const subject = `Reminder: appointment in 2 hours — ${ctx.establishmentName}`;
  const lines = formatServiceLines(ctx.services);
  const text = [
    `Hello ${ctx.clientName},`,
    "",
    `Your appointment at ${ctx.establishmentName} starts in about 2 hours.`,
    "",
    `Professional: ${ctx.professionalName}`,
    `Start (UTC): ${ctx.startAtIso}`,
    `End (UTC): ${ctx.endAtIso}`,
    "",
    "Services:",
    lines,
    "",
    "To cancel, send an HTTP POST request to:",
    ctx.cancelRequestUrl,
    "",
    `Cancellation token: ${ctx.cancelToken}`,
  ].join("\n");
  return { subject, text };
}

export function buildCancellationClientEmail(ctx: CancellationClientContext): { subject: string; text: string } {
  const subject = `Appointment cancelled — ${ctx.establishmentName}`;
  const text = [
    `Hello ${ctx.clientName},`,
    "",
    `Your appointment at ${ctx.establishmentName} has been cancelled.`,
    "",
    `Previous start (UTC): ${ctx.startAtIso}`,
    `Previous end (UTC): ${ctx.endAtIso}`,
    "",
    "If you did not request this cancellation, please contact the establishment.",
  ].join("\n");
  return { subject, text };
}

export function buildCancellationOwnerEmail(ctx: CancellationOwnerContext): { subject: string; text: string } {
  const subject = `Client cancelled an appointment — ${ctx.establishmentName}`;
  const text = [
    "An appointment was cancelled by the client.",
    "",
    `Establishment: ${ctx.establishmentName}`,
    `Client: ${ctx.clientName}`,
    `Previous start (UTC): ${ctx.startAtIso}`,
    `Previous end (UTC): ${ctx.endAtIso}`,
  ].join("\n");
  return { subject, text };
}

export function buildOwnerNotificationFailEmail(ctx: OwnerFailReminderContext): { subject: string; text: string } {
  const subject = `Reminder e-mail failed permanently — ${ctx.establishmentName}`;
  const text = [
    "The 2-hour reminder e-mail for an appointment failed after all retry attempts.",
    "",
    `Establishment: ${ctx.establishmentName}`,
    `Appointment ID: ${ctx.appointmentId}`,
    `Appointment start (UTC): ${ctx.startAtIso}`,
    "",
    "Please follow up with the client if needed.",
  ].join("\n");
  return { subject, text };
}
