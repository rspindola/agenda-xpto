import {
  AppointmentStatus,
  BlockScope,
  NotificationStatus,
  NotificationType,
  PlanType,
  PrismaClient,
  SubscriptionStatus,
  Weekday,
} from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

/** PostgreSQL TIME(6): usar data base UTC e só hora (DATABASE.md notas). */
function time(h: number, m: number, s = 0, ms = 0): Date {
  return new Date(Date.UTC(1970, 0, 1, h, m, s, ms));
}

async function main() {
  const email = "teste@example.com";
  const passwordPlain = "senha-teste-123";

  await prisma.notification.deleteMany();
  await prisma.appointmentService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.block.deleteMany();
  await prisma.professionalAvailability.deleteMany();
  await prisma.professionalService.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.service.deleteMany();
  await prisma.establishmentHoliday.deleteMany();
  await prisma.establishmentBusinessHour.deleteMany();
  await prisma.establishment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hashPassword(passwordPlain);

  const user = await prisma.user.create({
    data: {
      email,
      emailVerified: true,
      name: "Utilizador Demo",
    },
  });

  await prisma.account.create({
    data: {
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: passwordHash,
    },
  });

  const trialEndsAt = new Date();
  trialEndsAt.setUTCDate(trialEndsAt.getUTCDate() + 15);

  await prisma.subscription.create({
    data: {
      userId: user.id,
      planType: PlanType.PRO,
      status: SubscriptionStatus.TRIALING,
      trialEndsAt,
    },
  });

  const establishment = await prisma.establishment.create({
    data: {
      userId: user.id,
      name: "Demo Salão",
      slug: "demo-salao",
      email,
      timezone: "America/Sao_Paulo",
      minAdvanceMinutes: 120,
      operationalEmail: email,
    },
  });

  const weekdaysBusiness = [
    Weekday.MON,
    Weekday.TUE,
    Weekday.WED,
    Weekday.THU,
    Weekday.FRI,
  ];
  for (const weekday of weekdaysBusiness) {
    await prisma.establishmentBusinessHour.create({
      data: {
        establishmentId: establishment.id,
        weekday,
        opensAt: time(9, 0),
        closesAt: time(18, 0),
        breakStartsAt: time(12, 0),
        breakEndsAt: time(13, 0),
      },
    });
  }

  await prisma.establishmentBusinessHour.create({
    data: {
      establishmentId: establishment.id,
      weekday: Weekday.SAT,
      opensAt: time(9, 0),
      closesAt: time(13, 0),
      breakStartsAt: null,
      breakEndsAt: null,
    },
  });

  await prisma.establishmentHoliday.create({
    data: {
      establishmentId: establishment.id,
      date: new Date("2030-12-25T00:00:00.000Z"),
      reason: "Teste feriado",
    },
  });

  const serviceCorte = await prisma.service.create({
    data: {
      establishmentId: establishment.id,
      name: "Corte",
      durationMinutes: 45,
      priceCents: 5000,
      catalogCombo: false,
    },
  });

  const serviceBarba = await prisma.service.create({
    data: {
      establishmentId: establishment.id,
      name: "Barba",
      durationMinutes: 30,
      priceCents: 3000,
      catalogCombo: false,
    },
  });

  const serviceCombo = await prisma.service.create({
    data: {
      establishmentId: establishment.id,
      name: "Combo Corte+Barba",
      durationMinutes: 75,
      priceCents: 7500,
      catalogCombo: true,
    },
  });

  const profA = await prisma.professional.create({
    data: {
      establishmentId: establishment.id,
      name: "Profissional A",
      email: "prof-a@example.com",
    },
  });

  const profB = await prisma.professional.create({
    data: {
      establishmentId: establishment.id,
      name: "Profissional B",
      email: "prof-b@example.com",
    },
  });

  const services = [serviceCorte, serviceBarba, serviceCombo];
  for (const s of services) {
    await prisma.professionalService.create({
      data: {
        professionalId: profA.id,
        serviceId: s.id,
        priceOverrideCents:
          s.id === serviceCorte.id ? 5500 : null,
      },
    });
    await prisma.professionalService.create({
      data: {
        professionalId: profB.id,
        serviceId: s.id,
        priceOverrideCents: null,
      },
    });
  }

  await prisma.professionalAvailability.createMany({
    data: [
      {
        professionalId: profA.id,
        weekday: Weekday.MON,
        startsAt: time(9, 0),
        endsAt: time(12, 0),
      },
      {
        professionalId: profA.id,
        weekday: Weekday.MON,
        startsAt: time(14, 0),
        endsAt: time(18, 0),
      },
    ],
  });

  const start1 = new Date("2026-05-01T14:00:00.000Z");
  const end1 = new Date(start1.getTime() + 45 * 60 * 1000);

  const appt1 = await prisma.appointment.create({
    data: {
      establishmentId: establishment.id,
      professionalId: profA.id,
      status: AppointmentStatus.CONFIRMED,
      startAt: start1,
      endAt: end1,
      clientName: "Cliente Um",
      clientPhone: "+5511999990001",
      clientEmail: "cliente1@example.com",
      cancelToken: randomUUID(),
      createdByUserId: user.id,
    },
  });

  await prisma.appointmentService.create({
    data: {
      appointmentId: appt1.id,
      serviceId: serviceCorte.id,
      snapshotName: serviceCorte.name,
      snapshotDurationMinutes: 45,
      snapshotPriceCents: 5500,
      sortOrder: 0,
    },
  });

  const start2 = new Date("2026-05-02T15:00:00.000Z");
  const end2 = new Date(start2.getTime() + (30 + 75) * 60 * 1000);

  const appt2 = await prisma.appointment.create({
    data: {
      establishmentId: establishment.id,
      professionalId: profB.id,
      status: AppointmentStatus.CONFIRMED,
      startAt: start2,
      endAt: end2,
      clientName: "Cliente Dois",
      clientPhone: "+5511999990002",
      clientEmail: "cliente2@example.com",
      cancelToken: randomUUID(),
      createdByUserId: user.id,
    },
  });

  await prisma.appointmentService.createMany({
    data: [
      {
        appointmentId: appt2.id,
        serviceId: serviceBarba.id,
        snapshotName: serviceBarba.name,
        snapshotDurationMinutes: 30,
        snapshotPriceCents: 3000,
        sortOrder: 0,
      },
      {
        appointmentId: appt2.id,
        serviceId: serviceCombo.id,
        snapshotName: serviceCombo.name,
        snapshotDurationMinutes: 75,
        snapshotPriceCents: 7500,
        sortOrder: 1,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        establishmentId: establishment.id,
        appointmentId: appt1.id,
        type: NotificationType.APPOINTMENT_CONFIRMATION,
        status: NotificationStatus.SENT,
        recipientEmail: "cliente1@example.com",
        sentAt: new Date(),
        idempotencyKey: `seed-confirm-${appt1.id}`,
      },
      {
        establishmentId: establishment.id,
        appointmentId: appt2.id,
        type: NotificationType.REMINDER_24H,
        status: NotificationStatus.PENDING,
        recipientEmail: "cliente2@example.com",
        scheduledFor: new Date("2026-05-01T12:00:00.000Z"),
        idempotencyKey: `seed-reminder-${appt2.id}`,
      },
      {
        establishmentId: establishment.id,
        type: NotificationType.TRIAL_EXPIRY_ALERT,
        status: NotificationStatus.SENT,
        recipientEmail: email,
        sentAt: new Date(),
        idempotencyKey: `seed-trial-${establishment.id}`,
      },
    ],
  });

  // eslint-disable-next-line no-console -- script de seed
  console.log("Seed OK:", { user: email, establishment: establishment.slug });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
