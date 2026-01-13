import { Permission } from "@domain/entities/user/permissions";
import {
  AuthenticateOutputSchema,
  RefreshTokenOutputSchema,
} from "@shared/validators/zod/auth_validators";
import {
  CreateUserOutputZodSchema,
  GetUserOutputZodSchema,
  ListUserOutputZodSchema,
  QueryParamsListUserZodSchema,
} from "@shared/validators/zod/user_validators";
import type { FastifyInstance } from "fastify";
import {
  AuthController,
  loginSchema,
  logoutSchema,
  refreshSchema,
} from "../controllers/auth_controller";
import {
  changePasswordSchema,
  changeRoleSchema,
  createUserSchema,
  UserController,
  updateUserSchema,
} from "../controllers/user_controller";
import { authMiddleware } from "../middlewares/auth_middleware";
import { requiredPermission } from "../middlewares/permissions_middleware";

export async function userRoutes(app: FastifyInstance) {
  const controller = new UserController();
  const auth = new AuthController();

  app.post(
    "/auth/login",
    {
      schema: {
        tags: ["AUTH"],
        description: "Rota para realizar o login do user",
        body: loginSchema,
        response: {
          200: AuthenticateOutputSchema,
        },
      },
    },
    auth.login.bind(auth),
  );

  app.post(
    "/auth/refresh",
    {
      schema: {
        tags: ["AUTH"],
        description: "Rota para pegar o novo accessToken do user",
        body: refreshSchema,
        response: {
          200: RefreshTokenOutputSchema,
        },
      },
    },
    auth.refresh.bind(auth),
  );

  app.post(
    "/auth/logout",
    {
      schema: {
        tags: ["AUTH"],
        description: "Rota para realizar o logout do user",
        body: logoutSchema,
      },
    },
    auth.logout.bind(auth),
  );

  app.post(
    "/user",
    {
      schema: {
        tags: ["USER"],
        description: "Rota para cadastrar usuário",
        body: createUserSchema,
        response: {
          200: CreateUserOutputZodSchema,
        },
      },
    },
    controller.create.bind(controller),
  );
  app.get(
    "/users",
    {
      schema: {
        tags: ["USER"],
        description: "Rota que lista os users",
        querystring: QueryParamsListUserZodSchema,
        response: {
          200: ListUserOutputZodSchema,
        },
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_USERS])],
    },
    controller.list.bind(controller),
  );
  app.get(
    "/users/:id",
    {
      schema: {
        tags: ["USER"],
        description: "Rota que busca um user por id",
        response: {
          200: GetUserOutputZodSchema,
        },
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_USERS])],
    },
    controller.get.bind(controller),
  );
  app.put(
    "/users/:id",
    {
      schema: {
        tags: ["USER"],
        description: "Rota para atualizar users",
        body: updateUserSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_USERS])],
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
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_USERS])],
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
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_USERS])],
    },
    controller.changeRole.bind(controller),
  );
  app.patch(
    "/users/:id/block",
    {
      schema: {
        tags: ["USER"],
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_USERS])],
    },
    controller.block.bind(controller),
  );
  app.patch(
    "/users/:id/activate",
    {
      schema: {
        tags: ["USER"],
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_USERS])],
    },
    controller.activate.bind(controller),
  );
}
