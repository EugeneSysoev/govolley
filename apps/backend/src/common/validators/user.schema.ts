import { z } from 'zod';
export { CompleteOnboardingSchema } from '@govolley/shared-types';
export const UpdateUserSchema = z.strictObject({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
});
export const VerifyLevelSchema = z.strictObject({
  isLevelVerified: z.boolean(),
});
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
