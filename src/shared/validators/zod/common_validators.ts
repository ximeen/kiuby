import { z } from "zod";
export const uuidParamSchema = z.object({
  id: z.uuid("Invalid UUID format"),
});

export function validateUuid(id: string): void {
  uuidParamSchema.parse({ id });
}
