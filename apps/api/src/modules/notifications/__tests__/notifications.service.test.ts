import { Prisma } from "@prisma/client";
import type { Queue } from "bullmq";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { ReminderFireJobData, SendNotificationJobData } from "~/jobs/queues.js";
import type { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import {
  FIRE_REMINDER_JOB_NAME,
  SEND_NOTIFICATION_JOB_NAME,
  reminder24hJobId,
  reminder2hJobId,
} from "~/modules/notifications/notifications.constants.js";
import type { NotificationsRepository } from "~/modules/notifications/notifications.repository.js";
import { maskRecipientEmailForLogs, NotificationsService } from "~/modules/notifications/notifications.service.js";

const establishment = {
  id: "est_1",
  name: "Shop",
  slug: "shop",
  email: "shop@example.com",
  phone: null,
  address: null,
  timezone: "America/Sao_Paulo",
  minAdvanceMinutes: 60,
  isActive: true,
  operationalEmail: "ops@example.com" as string | null,
  archivedAt: null as string | null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function buildTemplateContext(overrides: Partial<{ startAt: Date; status: string }> = {}) {
  const startAt = overrides.startAt ?? new Date("2030-01-15T14:00:00.000Z");
  return {
    id: "appt_1",
    status: overrides.status ?? "CONFIRMED",
    startAt,
    endAt: new Date(startAt.getTime() + 60 * 60 * 1000),
    clientName: "Jane",
    clientEmail: "jane@example.com",
    cancelToken: "full-cancel-token-uuid",
    reminder24hJobId: null as string | null,
    reminder2hJobId: null as string | null,
    establishment: {
      id: "est_1",
      name: "Shop",
      email: "shop@example.com",
      operationalEmail: "ops@example.com" as string | null,
    },
    professional: { name: "Alex" },
    appointmentServices: [
      {
        snapshotName: "Cut",
        snapshotDurationMinutes: 60,
        snapshotPriceCents: 5000,
        sortOrder: 0,
      },
    ],
  };
}

function buildRepository(): NotificationsRepository {
  return {
    findNotificationById: vi.fn(),
    findByIdempotencyKey: vi.fn(),
    createNotification: vi.fn(),
    updateNotificationStatus: vi.fn(),
    incrementNotificationAttemptCount: vi.fn(),
    findAppointmentTemplateContext: vi.fn(),
    deletePendingReminderNotifications: vi.fn(),
    setAppointmentReminderJobIds: vi.fn(),
    clearAppointmentReminderJobIds: vi.fn(),
    listForEstablishment: vi.fn(),
  } as unknown as NotificationsRepository;
}

function buildEstablishmentsRepo(): EstablishmentsRepository {
  return {
    findOwnedById: vi.fn(),
  } as unknown as EstablishmentsRepository;
}

function buildQueues(): {
  notificationsQueue: Queue<SendNotificationJobData>;
  remindersQueue: Queue<ReminderFireJobData>;
} {
  return {
    notificationsQueue: {
      add: vi.fn(),
      getJob: vi.fn(),
    } as unknown as Queue<SendNotificationJobData>,
    remindersQueue: {
      add: vi.fn(),
      getJob: vi.fn(),
    } as unknown as Queue<ReminderFireJobData>,
  };
}

describe("maskRecipientEmailForLogs", () => {
  it("should mask a typical e-mail address", () => {
    expect(maskRecipientEmailForLogs("jane@example.com")).toBe("j***@example.com");
  });

  it("should return a safe placeholder for invalid shapes", () => {
    expect(maskRecipientEmailForLogs("@nodomain")).toBe("***");
    expect(maskRecipientEmailForLogs("a@")).toBe("***");
  });

  it("should mask single-character local part with star prefix", () => {
    expect(maskRecipientEmailForLogs("x@example.com")).toBe("*@example.com");
  });
});

describe("NotificationsService", () => {
  let mockRepo: NotificationsRepository;
  let mockEstablishments: EstablishmentsRepository;
  let queues: ReturnType<typeof buildQueues>;
  let service: NotificationsService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = buildRepository();
    mockEstablishments = buildEstablishmentsRepo();
    queues = buildQueues();
    service = new NotificationsService(
      mockRepo,
      mockEstablishments,
      queues.notificationsQueue,
      queues.remindersQueue,
      "http://localhost:3001",
    );
  });

  describe("getApiBaseUrl", () => {
    it("should return the configured API base URL", () => {
      expect(service.getApiBaseUrl()).toBe("http://localhost:3001");
    });
  });

  describe("listNotificationLogs", () => {
    it("should return paginated masked rows when establishment is owned", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      const createdAt = new Date("2026-01-01T00:00:00.000Z");
      vi.mocked(mockRepo.listForEstablishment).mockResolvedValue({
        total: 1,
        rows: [
          {
            id: "n1",
            establishmentId: "est_1",
            appointmentId: "appt_1",
            type: "APPOINTMENT_CONFIRMATION",
            status: "SENT",
            recipientEmail: "jane@example.com",
            attemptCount: 1,
            lastError: null,
            scheduledFor: null,
            sentAt: createdAt,
            idempotencyKey: "k1",
            createdAt,
            updatedAt: createdAt,
          },
        ],
      });

      const result = await service.listNotificationLogs("user_1", "est_1", { page: 1, pageSize: 20 });
      expect(result.total).toBe(1);
      expect(result.data[0]?.recipientEmailMasked).toBe("j***@example.com");
    });

    it("should serialize scheduledFor and sentAt when present", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(establishment);
      const scheduled = new Date("2026-01-02T10:00:00.000Z");
      const sent = new Date("2026-01-02T10:05:00.000Z");
      const createdAt = new Date("2026-01-01T00:00:00.000Z");
      vi.mocked(mockRepo.listForEstablishment).mockResolvedValue({
        total: 1,
        rows: [
          {
            id: "n2",
            establishmentId: "est_1",
            appointmentId: null,
            type: "REMINDER_24H",
            status: "SENT",
            recipientEmail: "jane@example.com",
            attemptCount: 0,
            lastError: null,
            scheduledFor: scheduled,
            sentAt: sent,
            idempotencyKey: null,
            createdAt,
            updatedAt: createdAt,
          },
        ],
      });

      const result = await service.listNotificationLogs("user_1", "est_1", { page: 1, pageSize: 10 });
      expect(result.data[0]?.scheduledFor).toBe(scheduled.toISOString());
      expect(result.data[0]?.sentAt).toBe(sent.toISOString());
    });

    it("should throw NOT_FOUND when establishment is missing", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue(null);
      await expect(service.listNotificationLogs("user_1", "est_x", { page: 1, pageSize: 20 })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("should throw NOT_FOUND when establishment is archived", async () => {
      vi.mocked(mockEstablishments.findOwnedById).mockResolvedValue({
        ...establishment,
        archivedAt: "2026-06-01T12:00:00.000Z",
      });
      await expect(service.listNotificationLogs("user_1", "est_1", { page: 1, pageSize: 20 })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("scheduleAfterBooking", () => {
    it("should enqueue confirmation and schedule reminder jobs", async () => {
      const ctx = buildTemplateContext();
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(ctx);
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue(null);
      vi.mocked(mockRepo.createNotification).mockResolvedValue({ id: "notif_1" });
      vi.mocked(queues.notificationsQueue.add).mockResolvedValue(undefined as never);
      vi.mocked(queues.remindersQueue.add).mockResolvedValue(undefined as never);

      await service.scheduleAfterBooking("appt_1");

      expect(mockRepo.createNotification).toHaveBeenCalled();
      expect(queues.notificationsQueue.add).toHaveBeenCalledWith(
        SEND_NOTIFICATION_JOB_NAME,
        { notificationId: "notif_1" },
        { jobId: "send-notif:notif_1" },
      );
      expect(queues.remindersQueue.add).toHaveBeenCalledWith(
        FIRE_REMINDER_JOB_NAME,
        { appointmentId: "appt_1", kind: "REMINDER_24H" },
        expect.objectContaining({ jobId: reminder24hJobId("appt_1") }),
      );
      expect(queues.remindersQueue.add).toHaveBeenCalledWith(
        FIRE_REMINDER_JOB_NAME,
        { appointmentId: "appt_1", kind: "REMINDER_2H" },
        expect.objectContaining({ jobId: reminder2hJobId("appt_1") }),
      );
      expect(mockRepo.setAppointmentReminderJobIds).toHaveBeenCalled();
    });
  });

  describe("onAppointmentRescheduled", () => {
    it("should clear reminders then enqueue confirmation and reminders again", async () => {
      const remove = vi.fn().mockResolvedValue(undefined);
      vi.mocked(queues.remindersQueue.getJob).mockResolvedValue({ remove } as never);
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext());
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue(null);
      vi.mocked(mockRepo.createNotification).mockResolvedValue({ id: "notif_r" });
      vi.mocked(queues.notificationsQueue.add).mockResolvedValue(undefined as never);
      vi.mocked(queues.remindersQueue.add).mockResolvedValue(undefined as never);

      await service.onAppointmentRescheduled("appt_1");

      expect(remove).toHaveBeenCalled();
      expect(mockRepo.deletePendingReminderNotifications).toHaveBeenCalledWith("appt_1");
      expect(mockRepo.clearAppointmentReminderJobIds).toHaveBeenCalledWith("appt_1");
      expect(mockRepo.createNotification).toHaveBeenCalled();
    });
  });

  describe("onClientCancelledAppointment", () => {
    it("should clear reminders and enqueue client and owner cancellation notifications", async () => {
      vi.mocked(queues.remindersQueue.getJob).mockResolvedValue(undefined);
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext());
      vi.mocked(mockRepo.createNotification)
        .mockResolvedValueOnce({ id: "nc" })
        .mockResolvedValueOnce({ id: "no" });
      vi.mocked(queues.notificationsQueue.add).mockResolvedValue(undefined as never);

      await service.onClientCancelledAppointment("appt_1");

      expect(mockRepo.createNotification).toHaveBeenCalledTimes(2);
      expect(queues.notificationsQueue.add).toHaveBeenCalledTimes(2);
    });

    it("should swallow unique violations when cancellation rows already exist", async () => {
      vi.mocked(queues.remindersQueue.getJob).mockResolvedValue(undefined);
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext());
      const dup = new Prisma.PrismaClientKnownRequestError("dup", { code: "P2002", clientVersion: "t" });
      vi.mocked(mockRepo.createNotification).mockRejectedValue(dup);

      await expect(service.onClientCancelledAppointment("appt_1")).resolves.toBeUndefined();
    });
  });

  describe("onOwnerCancelledAppointment", () => {
    it("should remove reminder jobs and clear pending reminder rows", async () => {
      vi.mocked(queues.remindersQueue.getJob).mockResolvedValue(undefined);
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext());

      await service.onOwnerCancelledAppointment("appt_1");

      expect(mockRepo.deletePendingReminderNotifications).toHaveBeenCalledWith("appt_1");
      expect(mockRepo.clearAppointmentReminderJobIds).toHaveBeenCalledWith("appt_1");
    });
  });

  describe("onOwnerBulkCancelled", () => {
    it("should clear reminders for every appointment id", async () => {
      vi.mocked(queues.remindersQueue.getJob).mockResolvedValue(undefined);
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext());

      await service.onOwnerBulkCancelled(["a1", "a2"]);

      expect(mockRepo.clearAppointmentReminderJobIds).toHaveBeenCalledWith("a1");
      expect(mockRepo.clearAppointmentReminderJobIds).toHaveBeenCalledWith("a2");
    });
  });

  describe("onTerminalAppointmentStatus", () => {
    it("should clear reminders only", async () => {
      vi.mocked(queues.remindersQueue.getJob).mockResolvedValue(undefined);
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext());

      await service.onTerminalAppointmentStatus("appt_1");

      expect(mockRepo.deletePendingReminderNotifications).toHaveBeenCalledWith("appt_1");
    });
  });

  describe("enqueueReminderNotificationFromWorker", () => {
    it("should create reminder notification and enqueue send job", async () => {
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext());
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue(null);
      vi.mocked(mockRepo.createNotification).mockResolvedValue({ id: "nr" });
      vi.mocked(queues.notificationsQueue.add).mockResolvedValue(undefined as never);

      await service.enqueueReminderNotificationFromWorker("appt_1", "REMINDER_2H");

      expect(mockRepo.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: "REMINDER_2H", idempotencyKey: "reminder2h:appt_1" }),
      );
      expect(queues.notificationsQueue.add).toHaveBeenCalled();
    });

    it("should re-enqueue send when a pending row already exists", async () => {
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext());
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue({
        id: "existing",
        status: "PENDING",
      } as never);

      await service.enqueueReminderNotificationFromWorker("appt_1", "REMINDER_24H");

      expect(mockRepo.createNotification).not.toHaveBeenCalled();
      expect(queues.notificationsQueue.add).toHaveBeenCalledWith(
        SEND_NOTIFICATION_JOB_NAME,
        { notificationId: "existing" },
        { jobId: "send-notif:existing" },
      );
    });
  });

  describe("enqueueOwnerFailForReminder2hFromWorker", () => {
    it("should create owner fail notification once", async () => {
      const row = buildTemplateContext();
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue(null);
      vi.mocked(mockRepo.createNotification).mockResolvedValue({ id: "nf" });
      vi.mocked(queues.notificationsQueue.add).mockResolvedValue(undefined as never);

      await service.enqueueOwnerFailForReminder2hFromWorker(row);

      expect(mockRepo.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: "OWNER_NOTIFICATION_FAIL" }),
      );
    });

    it("should skip when idempotency row already exists", async () => {
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue({ id: "x" } as never);
      await service.enqueueOwnerFailForReminder2hFromWorker(buildTemplateContext());
      expect(mockRepo.createNotification).not.toHaveBeenCalled();
    });
  });

  describe("enqueueAppointmentConfirmation edge cases", () => {
    it("should re-queue send when idempotent row is still pending", async () => {
      const ctx = buildTemplateContext();
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(ctx);
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue({
        id: "dup",
        status: "PENDING",
      } as never);

      await service.scheduleAfterBooking("appt_1");

      expect(mockRepo.createNotification).not.toHaveBeenCalled();
      expect(queues.notificationsQueue.add).toHaveBeenCalledWith(
        SEND_NOTIFICATION_JOB_NAME,
        { notificationId: "dup" },
        { jobId: "send-notif:dup" },
      );
    });

    it("should not enqueue send when idempotent confirmation already exists in a non-pending state", async () => {
      const ctx = buildTemplateContext();
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(ctx);
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue({
        id: "sent-row",
        status: "SENT",
      } as never);
      vi.mocked(queues.remindersQueue.add).mockResolvedValue(undefined as never);

      await service.scheduleAfterBooking("appt_1");

      expect(mockRepo.createNotification).not.toHaveBeenCalled();
      expect(queues.notificationsQueue.add).not.toHaveBeenCalled();
    });

    it("should re-queue send after unique race on create then pending row appears", async () => {
      const ctx = buildTemplateContext();
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(ctx);
      const dup = new Prisma.PrismaClientKnownRequestError("dup", { code: "P2002", clientVersion: "t" });
      vi.mocked(mockRepo.findByIdempotencyKey)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "race", status: "PENDING" } as never);
      vi.mocked(mockRepo.createNotification).mockRejectedValueOnce(dup);
      vi.mocked(queues.notificationsQueue.add).mockResolvedValue(undefined as never);
      vi.mocked(queues.remindersQueue.add).mockResolvedValue(undefined as never);

      await service.scheduleAfterBooking("appt_1");

      expect(queues.notificationsQueue.add).toHaveBeenCalledWith(
        SEND_NOTIFICATION_JOB_NAME,
        { notificationId: "race" },
        { jobId: "send-notif:race" },
      );
    });

    it("should propagate non-unique errors from confirmation create", async () => {
      const ctx = buildTemplateContext();
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(ctx);
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue(null);
      vi.mocked(mockRepo.createNotification).mockRejectedValue(new Error("database unavailable"));

      await expect(service.scheduleAfterBooking("appt_1")).rejects.toThrow("database unavailable");
    });

    it("should skip confirmation when appointment context is missing", async () => {
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(null);
      vi.mocked(queues.remindersQueue.add).mockResolvedValue(undefined as never);

      await service.scheduleAfterBooking("missing");

      expect(mockRepo.createNotification).not.toHaveBeenCalled();
      expect(queues.notificationsQueue.add).not.toHaveBeenCalled();
    });

    it("should skip confirmation when appointment is not confirmed", async () => {
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(
        buildTemplateContext({ status: "CANCELLED" }),
      );
      vi.mocked(queues.remindersQueue.add).mockResolvedValue(undefined as never);

      await service.scheduleAfterBooking("appt_x");

      expect(mockRepo.createNotification).not.toHaveBeenCalled();
    });
  });

  describe("scheduleReminderJobsFromDb timing", () => {
    it("should schedule only the 2h reminder when the 24h window is already in the past", async () => {
      const startAt = new Date(Date.now() + 3 * 60 * 60 * 1000);
      const ctx = buildTemplateContext({ startAt });
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(ctx);
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue(null);
      vi.mocked(mockRepo.createNotification).mockResolvedValue({ id: "n1" });
      vi.mocked(queues.notificationsQueue.add).mockResolvedValue(undefined as never);
      vi.mocked(queues.remindersQueue.add).mockResolvedValue(undefined as never);

      await service.scheduleAfterBooking("appt_window");

      const reminderCalls = vi.mocked(queues.remindersQueue.add).mock.calls;
      expect(
        reminderCalls.some((c) => (c[1] as { kind: string }).kind === "REMINDER_24H"),
      ).toBe(false);
      expect(reminderCalls.some((c) => (c[1] as { kind: string }).kind === "REMINDER_2H")).toBe(true);
    });

    it("should schedule no reminder jobs when the appointment is too soon for both windows", async () => {
      const startAt = new Date(Date.now() + 30 * 60 * 1000);
      const ctx = buildTemplateContext({ startAt });
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(ctx);
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue(null);
      vi.mocked(mockRepo.createNotification).mockResolvedValue({ id: "n1" });
      vi.mocked(queues.notificationsQueue.add).mockResolvedValue(undefined as never);

      await service.scheduleAfterBooking("appt_soon");

      expect(queues.remindersQueue.add).not.toHaveBeenCalled();
      expect(mockRepo.setAppointmentReminderJobIds).toHaveBeenCalledWith("appt_soon", {
        reminder24hJobId: null,
        reminder2hJobId: null,
      });
    });
  });

  describe("clearReminderInfrastructure legacy job ids", () => {
    it("should remove legacy BullMQ jobs when stored ids differ from deterministic ids", async () => {
      const legacyRemove = vi.fn().mockResolvedValue(undefined);
      const ctx = buildTemplateContext();
      ctx.reminder24hJobId = "legacy-24";
      ctx.reminder2hJobId = "legacy-2";
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(ctx);
      vi.mocked(queues.remindersQueue.getJob).mockImplementation((jobId: string) => {
        if (jobId === "legacy-24" || jobId === "legacy-2") {
          return Promise.resolve({ remove: legacyRemove } as never);
        }
        return Promise.resolve(undefined);
      });

      await service.onOwnerCancelledAppointment("appt_1");

      expect(legacyRemove).toHaveBeenCalled();
    });
  });

  describe("onClientCancelledAppointment edge cases", () => {
    it("should return early when appointment context is missing after clear", async () => {
      vi.mocked(queues.remindersQueue.getJob).mockResolvedValue(undefined);
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(null);

      await service.onClientCancelledAppointment("gone");

      expect(mockRepo.createNotification).not.toHaveBeenCalled();
    });

    it("should rethrow when client cancellation create fails with a non-unique error", async () => {
      vi.mocked(queues.remindersQueue.getJob).mockResolvedValue(undefined);
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext());
      vi.mocked(mockRepo.createNotification).mockRejectedValue(new Error("db down"));

      await expect(service.onClientCancelledAppointment("appt_1")).rejects.toThrow("db down");
    });

    it("should rethrow when owner cancellation create fails after client row succeeds", async () => {
      vi.mocked(queues.remindersQueue.getJob).mockResolvedValue(undefined);
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext());
      vi.mocked(mockRepo.createNotification)
        .mockResolvedValueOnce({ id: "nc" })
        .mockRejectedValueOnce(new Error("owner row failed"));
      vi.mocked(queues.notificationsQueue.add).mockResolvedValue(undefined as never);

      await expect(service.onClientCancelledAppointment("appt_1")).rejects.toThrow("owner row failed");
    });

    it("should use establishment email when operational email is unset for owner cancellation", async () => {
      vi.mocked(queues.remindersQueue.getJob).mockResolvedValue(undefined);
      const ctx = buildTemplateContext();
      ctx.establishment.operationalEmail = null;
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(ctx);
      vi.mocked(mockRepo.createNotification)
        .mockResolvedValueOnce({ id: "nc" })
        .mockResolvedValueOnce({ id: "no" });
      vi.mocked(queues.notificationsQueue.add).mockResolvedValue(undefined as never);

      await service.onClientCancelledAppointment("appt_1");

      expect(mockRepo.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: "CANCELLATION_OWNER", recipientEmail: "shop@example.com" }),
      );
    });
  });

  describe("enqueueReminderNotificationFromWorker edge cases", () => {
    it("should return without side effects when appointment context is missing", async () => {
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(null);
      await service.enqueueReminderNotificationFromWorker("x", "REMINDER_24H");
      expect(mockRepo.createNotification).not.toHaveBeenCalled();
    });

    it("should return without enqueue when appointment is not confirmed", async () => {
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext({ status: "NO_SHOW" }));
      await service.enqueueReminderNotificationFromWorker("appt_1", "REMINDER_2H");
      expect(queues.notificationsQueue.add).not.toHaveBeenCalled();
    });

    it("should not enqueue send when reminder row exists but is not pending", async () => {
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext());
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue({
        id: "done",
        status: "SENT",
      } as never);

      await service.enqueueReminderNotificationFromWorker("appt_1", "REMINDER_24H");

      expect(queues.notificationsQueue.add).not.toHaveBeenCalled();
    });

    it("should swallow unique violations on reminder create", async () => {
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext());
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue(null);
      const dup = new Prisma.PrismaClientKnownRequestError("dup", { code: "P2002", clientVersion: "t" });
      vi.mocked(mockRepo.createNotification).mockRejectedValue(dup);

      await expect(service.enqueueReminderNotificationFromWorker("appt_1", "REMINDER_2H")).resolves.toBeUndefined();
    });

    it("should rethrow non-unique errors from reminder create", async () => {
      vi.mocked(mockRepo.findAppointmentTemplateContext).mockResolvedValue(buildTemplateContext());
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue(null);
      vi.mocked(mockRepo.createNotification).mockRejectedValue(new Error("write failed"));

      await expect(service.enqueueReminderNotificationFromWorker("appt_1", "REMINDER_24H")).rejects.toThrow(
        "write failed",
      );
    });
  });

  describe("enqueueOwnerFailForReminder2hFromWorker edge cases", () => {
    it("should use establishment email when operational email is null", async () => {
      const row = buildTemplateContext();
      row.establishment.operationalEmail = null;
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue(null);
      vi.mocked(mockRepo.createNotification).mockResolvedValue({ id: "nf" });
      vi.mocked(queues.notificationsQueue.add).mockResolvedValue(undefined as never);

      await service.enqueueOwnerFailForReminder2hFromWorker(row);

      expect(mockRepo.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ recipientEmail: "shop@example.com" }),
      );
    });

    it("should swallow unique violations on owner-fail create", async () => {
      const row = buildTemplateContext();
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue(null);
      const dup = new Prisma.PrismaClientKnownRequestError("dup", { code: "P2002", clientVersion: "t" });
      vi.mocked(mockRepo.createNotification).mockRejectedValue(dup);

      await expect(service.enqueueOwnerFailForReminder2hFromWorker(row)).resolves.toBeUndefined();
    });

    it("should rethrow non-unique errors from owner-fail create", async () => {
      const row = buildTemplateContext();
      vi.mocked(mockRepo.findByIdempotencyKey).mockResolvedValue(null);
      vi.mocked(mockRepo.createNotification).mockRejectedValue(new Error("outage"));

      await expect(service.enqueueOwnerFailForReminder2hFromWorker(row)).rejects.toThrow("outage");
    });
  });
});
