declare module "fastify" {
  interface FastifyRequest {
    authUser?: {
      id: string;
      email: string;
      emailVerified: boolean;
      name: string | null;
    };
  }
}

export type {};
