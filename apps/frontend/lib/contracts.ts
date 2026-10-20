import { z } from 'zod';
export { TrainingResponseSchema as trainingSchema } from '@govolley/shared-types';
export const profileSchema = z.object({
  id: z.number().int().positive(), firstName: z.string().nullable(), lastName: z.string().nullable(),
  username: z.string().nullable(), image: z.string().nullable(), role: z.enum(['USER','COACH','ADMIN']),
  balance: z.number().int(), skillLevel: z.enum(['NOT_SET','BEGINNER','INTERMEDIATE','ADVANCED']),
  isLevelVerified: z.boolean(), createdAt: z.iso.datetime(),
});
export type Profile = z.infer<typeof profileSchema>;
export const loginSchema = profileSchema.extend({ accessToken: z.string().min(1) });
export const bookingsSchema = z.array(z.object({
  id: z.number().int(), status: z.enum(['CONFIRMED','CANCELLED']), createdAt: z.iso.datetime(),
  training: z.object({ id: z.number().int(), title: z.string(), date: z.iso.datetime(), startTime: z.string(), location: z.string().nullable(), isActive: z.boolean() }),
}));
