import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastify from "fastify";
import { errorHandle } from "./plugins/error-handler";

export async function buildApp() {
  const app = fastify();

  await app.register(cors);
  await app.register(helmet);
  await app.register(errorHandle);

  return app;
}
