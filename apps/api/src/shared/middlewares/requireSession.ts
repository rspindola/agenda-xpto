import type { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";

import { getAuth } from "~/lib/auth.js";
import { AppError } from "~/shared/errors/AppError.js";

export async function requireSession(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const session = await getAuth().api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session?.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required.");
  }

  request.authUser = {
    id: session.user.id,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    name: session.user.name,
  };
}
