import type { FastifyPluginCallback } from "fastify";
import { z } from "zod";

import { AppError } from "~/shared/errors/AppError.js";
import { errorResponseSchema } from "~/shared/schemas/error.schema.js";

import type { AvailabilityService } from "~/modules/availability/availability.service.js";
import {
  blockIdParamsSchema,
  blocksListResponseSchema,
  createBlockBodySchema,
  createBlockResponseSchema,
  establishmentIdParamsSchema,
  type BlocksListResponse,
  type CreateBlockResponse,
} from "~/modules/availability/availability.schema.js";

const commonErrorResponses = {
  400: errorResponseSchema,
  401: errorResponseSchema,
  404: errorResponseSchema,
  422: errorResponseSchema,
} as const;

export function createBlocksRoutesPlugin(service: AvailabilityService): FastifyPluginCallback {
  return (fastify, _opts, done): void => {
    fastify.get(
      "/",
      {
        schema: {
          tags: ["availability"],
          summary: "List establishment blocks",
          description:
            "Returns time blocks (establishment-wide or per professional) that remove availability (US-413).",
          params: establishmentIdParamsSchema,
          response: {
            200: blocksListResponseSchema,
            401: errorResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (request): Promise<BlocksListResponse> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId } = establishmentIdParamsSchema.parse(request.params);
        return service.listBlocks(user.id, establishmentId);
      },
    );

    fastify.post(
      "/",
      {
        schema: {
          tags: ["availability"],
          summary: "Create availability block",
          description: "Creates a blocked interval for the whole establishment or one professional (US-413).",
          params: establishmentIdParamsSchema,
          body: createBlockBodySchema,
          response: {
            201: createBlockResponseSchema,
            ...commonErrorResponses,
          },
        },
      },
      async (request, reply) => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId } = establishmentIdParamsSchema.parse(request.params);
        const body = createBlockBodySchema.parse(request.body);
        const created: CreateBlockResponse = await service.createBlock(user.id, establishmentId, body);
        return reply.status(201).send(created);
      },
    );

    fastify.delete(
      "/:blockId",
      {
        schema: {
          tags: ["availability"],
          summary: "Delete availability block",
          description: "Deletes a block owned by the establishment.",
          params: blockIdParamsSchema,
          response: {
            204: z.null(),
            ...commonErrorResponses,
          },
        },
      },
      async (request, reply): Promise<void> => {
        const user = request.authUser;
        if (!user) {
          throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
        }
        const { establishmentId, blockId } = blockIdParamsSchema.parse(request.params);
        await service.deleteBlock(user.id, establishmentId, blockId);
        await reply.status(204).send();
      },
    );

    done();
  };
}
