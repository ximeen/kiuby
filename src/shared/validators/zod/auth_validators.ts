import type { RefreshTokenOutput } from "@application/use_cases/auth/refresh_token";
import type { AuthenticateOutput } from "@application/use_cases/user/authenticate_user";
import { Permission } from "@domain/entities/user/permissions";
import z from "zod";

const PermisionSchema = z.enum(Permission);

export const AuthenticateOutputSchema: z.ZodType<AuthenticateOutput> = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expireIn: z.number(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
    email: z.string(),
    role: z.string(),
    permissions: z.array(PermisionSchema),
  }),
});

export const RefreshTokenOutputSchema: z.ZodType<RefreshTokenOutput> = z.object({
  accessToken: z.string(),
  expireIn: z.number(),
});
