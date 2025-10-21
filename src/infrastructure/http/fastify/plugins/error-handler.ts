import { AppError } from "@shared/errors/app-error";
import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

export async function errorHandle(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: "Erro de validação",
        errors: error.flatten().fieldErrors,
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        message: error.message,
      });
    }

    console.error(error);

    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  });
}
