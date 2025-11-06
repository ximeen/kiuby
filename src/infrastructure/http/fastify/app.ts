import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastify from "fastify";
import { errorHandle } from "./plugins/error-handler";
import { userRoutes } from "./routes/user_routes";
import { customerRoutes } from "./routes/customer_routes";
import { productRoutes } from "./routes/product_routes";
import { saleRoutes } from "./routes/sale_routes";
import { stockRoutes } from "./routes/stock_routes";
import { warehousesRoutes } from "./routes/warehouses_routes";

export async function buildApp() {
  const app = fastify();

  await app.register(cors);
  await app.register(helmet);
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
