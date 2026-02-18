import { Permission } from "@domain/entities/user/permissions";
import fastifyRateLimit from "@fastify/rate-limit";
import {
  AuthenticateOutputSchema,
  RefreshTokenOutputSchema,
} from "@shared/validators/zod/auth_validators";
import { uuidParamSchema } from "@shared/validators/zod/common_validators";
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

  await app.register(fastifyRateLimit, {
    max: 5,
    timeWindow: "15 minutes",
    prefix: "/auth",
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
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_USERS])],
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
        params: uuidParamSchema,
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
        params: uuidParamSchema,
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
        params: uuidParamSchema,
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
        params: uuidParamSchema,
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
        params: uuidParamSchema,
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
        params: uuidParamSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_USERS])],
    },
    controller.activate.bind(controller),
  );
}
