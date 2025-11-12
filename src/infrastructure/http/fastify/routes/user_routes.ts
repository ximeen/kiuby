import type { FastifyInstance } from "fastify";
import {
  authenticateUserSchema,
  changePasswordSchema,
  changeRoleSchema,
  createUserSchema,
  UserController,
  updateUserSchema,
} from "../controllers/user_controller";
import { authMiddleware } from "../middlewares/auth_middleware";
import { requiredPermission } from "../middlewares/permissions_middleware";
import { Permission } from "@domain/entities/user/permissions";

export async function userRoutes(app: FastifyInstance) {
  const controller = new UserController();

  app.post(
    "/auth/login",
    {
      schema: {
        tags: ["USER"],
        body: authenticateUserSchema,
      },
    },
    controller.authenticate.bind(controller),
  );

  app.post(
    "/users",
    {
      schema: {
        tags: ["USER"],
        description: "Rota para cadastrar usuários",
        body: createUserSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_USERS])],
    },
    controller.create.bind(controller),
  );
  app.get(
    "/users",
    {
      schema: {
        tags: ["USER"],
      },
    },
    controller.list.bind(controller),
  );
  app.get(
    "/users/:id",
    {
      schema: {
        tags: ["USER"],
      },
    },
    controller.get.bind(controller),
  );
  app.put(
    "/users/:id",
    {
      schema: {
        tags: ["USER"],
        body: updateUserSchema,
      },
    },
    controller.update.bind(controller),
  );

  app.patch(
    "/users/:id/password",
    {
      schema: {
        tags: ["USER"],
        body: changePasswordSchema,
      },
    },
    controller.changePassword.bind(controller),
  );

  app.patch(
    "/users/:id/role",
    {
      schema: {
        tags: ["USER"],
        body: changeRoleSchema,
      },
    },
    controller.changeRole.bind(controller),
  );
  app.patch(
    "/users/:id/block",
    {
      schema: {
        tags: ["USER"],
      },
    },
    controller.block.bind(controller),
  );
  app.patch(
    "/users/:id/activate",
    {
      schema: {
        tags: ["USER"],
      },
    },
    controller.activate.bind(controller),
  );
}
