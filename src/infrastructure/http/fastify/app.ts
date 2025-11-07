import { fastifyCors } from "@fastify/cors";
import helmet from "@fastify/helmet";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastify from "fastify";
import { fastifySwagger } from "@fastify/swagger";
import ScalarApiReference from "@scalar/fastify-api-reference";
import { errorHandle } from "./plugins/error-handler";
import { userRoutes } from "./routes/user_routes";
import { customerRoutes } from "./routes/customer_routes";
import { productRoutes } from "./routes/product_routes";
import { saleRoutes } from "./routes/sale_routes";
import { stockRoutes } from "./routes/stock_routes";
import { warehousesRoutes } from "./routes/warehouses_routes";

export async function buildApp() {
  const app = fastify().withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
        scriptSrc: ["'self'", "'unsafe-inline'", "'wasm-unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
  });
  await app.register(errorHandle);

  app.get("/health", async () => ({ status: "OK", timestamp: new Date().toISOString() }));

  await app.register(userRoutes);
  await app.register(customerRoutes);
  await app.register(productRoutes);
  await app.register(saleRoutes);
  await app.register(stockRoutes);
  await app.register(warehousesRoutes);

  return app;
}
