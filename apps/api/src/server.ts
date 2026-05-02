import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import type { FastifyInstance, FastifyRequest, RouteOptions } from "fastify";
import {
  type ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { startNotificationAndReminderWorkers } from "~/jobs/notification-workers.js";
import { notificationsQueue, remindersQueue } from "~/jobs/queues.js";
import { registerAuthModule } from "~/modules/auth/auth.routes.js";
import { registerAppointmentsModule } from "~/modules/appointments/appointments.routes.js";
import { registerAvailabilityModule } from "~/modules/availability/availability.routes.js";
import { registerBookingModule } from "~/modules/booking/booking.routes.js";
import { EstablishmentsRepository } from "~/modules/establishments/establishments.repository.js";
import { registerEstablishmentsModule } from "~/modules/establishments/establishments.routes.js";
import { NotificationsRepository } from "~/modules/notifications/notifications.repository.js";
import { registerNotificationsModule } from "~/modules/notifications/notifications.routes.js";
import { NotificationsService } from "~/modules/notifications/notifications.service.js";

import { AppError } from "~/shared/errors/AppError.js";
import { healthResponseSchema } from "~/shared/schemas/health.schema.js";

const PORT = Number.parseInt(process.env.PORT ?? "3001", 10);
const API_BASE_URL = process.env.API_URL ?? `http://localhost:${String(PORT)}`;
const isNonProduction = process.env.NODE_ENV !== "production";

function applyRouteRateLimitByTags(routeOptions: RouteOptions): void {
  const rawSchema: unknown = routeOptions.schema;
  if (typeof rawSchema !== "object" || rawSchema === null || !("tags" in rawSchema)) {
    return;
  }
  const tagsUnknown = (rawSchema as { tags?: unknown }).tags;
  if (!Array.isArray(tagsUnknown)) {
    return;
  }
  const tags = tagsUnknown.filter((t): t is string => typeof t === "string");
  if (tags.length === 0) {
    return;
  }

  routeOptions.config = routeOptions.config ?? {};
  if (tags.includes("auth")) {
    routeOptions.config.rateLimit = { max: 10, timeWindow: "1 minute" };
    return;
  }
  if (tags.includes("booking-write")) {
    routeOptions.config.rateLimit = { max: 5, timeWindow: "1 minute" };
    return;
  }
  if (tags.includes("booking")) {
    routeOptions.config.rateLimit = { max: 20, timeWindow: "1 minute" };
  }
}

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

  const notificationsRepository = new NotificationsRepository();
  const establishmentsRepositoryForNotifications = new EstablishmentsRepository();
  const notificationsService = new NotificationsService(
    notificationsRepository,
    establishmentsRepositoryForNotifications,
    notificationsQueue,
    remindersQueue,
    API_BASE_URL,
  );

  let closeNotificationWorkers: (() => Promise<void>) | null = null;
  app.addHook("onReady", () => {
    if (process.env.VITEST === "true") {
      return;
    }
    closeNotificationWorkers = startNotificationAndReminderWorkers({
      logger: app.log,
      notificationsRepository,
      notificationsService,
    });
  });
  app.addHook("onClose", async () => {
    if (closeNotificationWorkers !== null) {
      await closeNotificationWorkers();
    }
  });

  app.setValidatorCompiler(validatorCompiler);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- boundary with fastify-type-provider-zod
  app.setSerializerCompiler(serializerCompiler);

  app.addHook("onRoute", applyRouteRateLimitByTags);

  app.setErrorHandler((error: unknown, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
    }
    request.log.error({ err: error }, "Unhandled error");
    return reply.status(500).send({
      statusCode: 500,
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    });
  });

  const webOrigin = process.env.WEB_URL ?? "http://localhost:5173";
  // Swagger UI is served from this API origin; the browser sends Origin: http://localhost:PORT
  // for "Try it out", which must be allowed alongside the SPA (WEB_URL) or requests fail with "Failed to fetch".
  const corsOrigin = isNonProduction
    ? Array.from(
        new Set<string>([
          webOrigin,
          API_BASE_URL,
          `http://localhost:${String(PORT)}`,
          `http://127.0.0.1:${String(PORT)}`,
        ]),
      )
    : webOrigin;

  await app.register(cors, {
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
  });

  // @fastify/swagger must load before routes so their schemas are included in OpenAPI.
  if (isNonProduction) {
    await app.register(fastifySwagger, {
      openapi: {
        openapi: "3.1.0",
        info: {
          title: "Agenda XPTO API",
          version: "1.0.0",
          description:
            "HTTP API for Agenda XPTO scheduling: establishments, availability, appointments, public booking, notifications, reports, and subscription plans.",
        },
        servers: [
          {
            url: API_BASE_URL,
            description: "Local development",
          },
        ],
        tags: [
          { name: "auth", description: "Authentication and session management" },
          { name: "establishments", description: "Establishment setup and configuration" },
          { name: "availability", description: "Business hours, holidays, and blocks" },
          { name: "appointments", description: "Appointment management (admin panel)" },
          { name: "booking", description: "Public booking page (no auth required)" },
          { name: "notifications", description: "Notification logs and alerts" },
          { name: "reports", description: "Analytics and reports" },
          { name: "plans", description: "Subscription plans and billing" },
          { name: "system", description: "Operational and health endpoints" },
        ],
      },
      transform: jsonSchemaTransform,
    });
  }

  registerAuthModule(app);
  registerEstablishmentsModule(app);
  await registerAvailabilityModule(app);
  await registerAppointmentsModule(app, { notificationsService });
  await registerNotificationsModule(app, { notificationsService });
  await registerBookingModule(app, { notificationsService });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    allowList: (request: FastifyRequest, _key: string) => {
      const pathname = request.url.split("?")[0] ?? "";
      if (pathname === "/health") {
        return true;
      }
      if (isNonProduction && (pathname === "/docs" || pathname.startsWith("/docs/"))) {
        return true;
      }
      return false;
    },
  });

  app.get(
    "/health",
    {
      schema: {
        tags: ["system"],
        summary: "Health check",
        description:
          "Returns API liveness and the current server time in ISO 8601 (UTC). Used by load balancers and monitoring.",
        response: {
          200: healthResponseSchema,
        },
      },
    },
    (): { status: "ok"; timestamp: string } => ({
      status: "ok",
      timestamp: new Date().toISOString(),
    }),
  );

  if (isNonProduction) {
    await app.register(fastifySwaggerUi, {
      routePrefix: "/docs",
    });
  }

  return app;
}
