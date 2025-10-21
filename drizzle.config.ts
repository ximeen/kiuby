import type { Config } from "drizzle-kit";
import { env } from "./src/shared/utils/env";

export default {
  schema: "./src/infrastructure/database/drizzle/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
