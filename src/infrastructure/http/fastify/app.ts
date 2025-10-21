import fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { errorHandle } from "./plugins/error-handler";
import { userRoutes } from "./routes/user.routes";

export async function buildApp() {
  const app = fastify();

  await app.register(cors);
  await app.register(helmet);
  await app.register(errorHandle);

  await app.register(userRoutes, { prefix: "/api" });

  return app;
}
