import type { CreateUserOutput } from "@application/use_cases/user/create_user";
import type { GetUserOutput } from "@application/use_cases/user/get_user";
import type { ListUserOutput } from "@application/use_cases/user/list_users";
import { Permission } from "@domain/entities/user/permissions";
import z from "zod";

const PermisionSchema = z.enum(Permission);

export const CreateUserOutputZodSchema: z.ZodType<CreateUserOutput> = z.object({
  id: z.string(),
  email: z.email(),
  username: z.string(),
});

export const ListUserOutputZodSchema: z.ZodType<ListUserOutput> = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  username: z.string(),
  role: z.string(),
  status: z.string(),
  lastLoginAt: z.date(),
});

export const QueryParamsListUserZodSchema = z.object({
  status: z.string().optional(),
  role: z.string().optional(),
  serchTerm: z.string().optional(),
});

export const GetUserOutputZodSchema: z.ZodType<GetUserOutput> = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  phone: z.string().optional(),
  permissions: z.array(PermisionSchema),
  lastLoginAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
