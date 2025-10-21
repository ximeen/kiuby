import { buildApp } from "@infrastructure/http/fastify/app";
import { env } from "@shared/utils/env";

async function server() {
  const app = await buildApp();
  await app.listen({
    port: env.PORT,
    host: "0.0.0.0",
  });

  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
}
server();
