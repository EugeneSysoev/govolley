import { z } from 'zod';

export const UpdateUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),

  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),

  skillLevel: z
    .enum(['NOT_SET', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
    .optional(),

  image: z.string().optional(),
});

export const CompleteOnboardingSchema = z.object({
  totalScore: z.coerce.number().min(0).max(100),
});

export const VerifyLevelSchema = z.object({
  isLevelVerified: z.boolean(),
});

// типы
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type CompleteOnboardingDto = z.infer<typeof CompleteOnboardingSchema>;
