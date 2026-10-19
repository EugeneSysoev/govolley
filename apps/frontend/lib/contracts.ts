import { z } from 'zod';
import { CreateTrainingSchema } from '@govolley/shared-types';
export const trainingSchema = CreateTrainingSchema.safeExtend({
  id: z.number().int().positive(), description: z.string().nullable(), price: z.number().nullable(),
  coachName: z.string().nullable(), location: z.string().nullable(), isActive: z.boolean(),
  currentParticipants: z.number().int().nonnegative(), isBooked: z.boolean(),
  createdAt: z.iso.datetime(), updatedAt: z.iso.datetime(),
});
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
