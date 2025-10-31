import type { FastifyInstance } from "fastify";
import { UserController } from "../controllers/user_controller";

export async function userRoutes(app: FastifyInstance) {
  const controller = new UserController();

  app.post("/auth/login", controller.authenticate.bind(controller));

  app.post("/users", controller.create.bind(controller));
  app.get("/users", controller.list.bind(controller));
  app.get("/users/:id", controller.get.bind(controller));
  app.put("/users/:id", controller.update.bind(controller));

  app.patch("/users/:id/password", controller.changePassword.bind(controller));

  app.patch("/users/:id/role", controller.changeRole.bind(controller));
  app.patch("/users/:id/block", controller.block.bind(controller));
  app.patch("/users/:id/activate", controller.activate.bind(controller));
}
