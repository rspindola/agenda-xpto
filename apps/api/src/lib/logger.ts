import pino from "pino";
import type { FastifyBaseLogger } from "fastify";

 
export const logger: FastifyBaseLogger = pino();
