import { BaseError } from "@shared/errors/base_error";
import type { FastifyInstance } from "fastify";
import z, { ZodError } from "zod";

export async function errorHandle(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: "Erro de validação",
        errors: z.treeifyError(error),
      });
    }

    if (error instanceof BaseError) {
      return reply.status(error.statusCode).send({
        message: error.message,
      });
    }

    if (process.env.NODE_ENV === "development") {
      console.error(error);
    } else {
      console.error("Internal server error:", {
        message: error.message,
        name: error.name,
      });
    }

    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  });
}
