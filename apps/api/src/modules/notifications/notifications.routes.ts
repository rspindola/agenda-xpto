import type { FastifyInstance, FastifyPluginCallback } from "fastify";

import { AppError } from "~/shared/errors/AppError.js";
import { requireSession } from "~/shared/middlewares/requireSession.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

import type { NotificationsService } from "~/modules/notifications/notifications.service.js";
import {
  listNotificationsParamsSchema,
  listNotificationsQuerySchema,
  listNotificationsResponseSchema,
  type ListNotificationsResponse,
} from "~/modules/notifications/notifications.schema.js";

export function createNotificationsModulePlugin(notificationsService: NotificationsService): FastifyPluginCallback {
  return (fastify, _opts, done): void => {
    fastify.addHook("preHandler", requireSession);

    fastify.get(
      "/:establishmentId/notifications",
      {
        schema: {
          tags: ["notifications"],
          summary: "List notification logs",
          description:
            "Returns paginated outbound notification records for the establishment. Recipient e-mail addresses are masked in the response.",
          params: listNotificationsParamsSchema,
          querystring: listNotificationsQuerySchema,
          response: {
            200: listNotificationsResponseSchema,
            401: errorResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request): Promise<ListNotificationsResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId } = listNotificationsParamsSchema.parse(request.params);
        const query = listNotificationsQuerySchema.parse(request.query);
        return notificationsService.listNotificationLogs(user.id, establishmentId, query);
      },
    );

    done();
  };
}

export async function registerNotificationsModule(
  app: FastifyInstance,
  options: { notificationsService: NotificationsService },
): Promise<void> {
  await app.register(createNotificationsModulePlugin(options.notificationsService), {
    prefix: "/api/v1/establishments",
  });
}
