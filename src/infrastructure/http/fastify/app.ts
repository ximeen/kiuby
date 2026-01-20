import { fastifyCors } from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import { fastifySwagger } from "@fastify/swagger";
import ScalarApiReference from "@scalar/fastify-api-reference";
import fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";
import { env } from "@shared/utils/env";
import { errorHandle } from "./plugins/error-handler";
import { customerRoutes } from "./routes/customer_routes";
import { productRoutes } from "./routes/product_routes";
import { saleRoutes } from "./routes/sale_routes";
import { stockRoutes } from "./routes/stock_routes";
import { userRoutes } from "./routes/user_routes";
import { warehousesRoutes } from "./routes/warehouses_routes";

export async function buildApp() {
  const app = fastify().withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const corsOrigins = env.CORS_ORIGIN
    ? env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : env.NODE_ENV === "production"
      ? []
      : true; 

  await app.register(fastifyCors, {
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });

  await app.register(fastifyRateLimit, {
    max: 100, 
    timeWindow: "1 minute", 
    skipOnError: false,
    addHeadersOnExceeding: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
    },
    addHeaders: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
      "retry-after": true,
    },
  });
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "API Kiuby",
        description: "Documentation for api kiuby",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(ScalarApiReference, {
    routePrefix: "/docs",
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          ...(env.NODE_ENV === "development" ? ["'unsafe-inline'"] : []),
          "'wasm-unsafe-eval'", 
        ],
        styleSrc: [
          "'self'",
          ...(env.NODE_ENV === "development" ? ["'unsafe-inline'"] : []),
        ],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
  });
  await app.register(errorHandle);

  app.get(
    "/health",
    {
      schema: {
        tags: ["HEALTH"],
        description: "Verificar o status da API",
        response: {
          200: z.object({
            status: z.literal("OK"),
            timestamp: z.string(),
          }),
        },
      },
    },
    async () => ({ status: "OK" as const, timestamp: new Date().toISOString() }),
  );

  await app.register(userRoutes);
  await app.register(customerRoutes);
  await app.register(productRoutes);
  await app.register(saleRoutes);
  await app.register(stockRoutes);
  await app.register(warehousesRoutes);

  return app;
}
