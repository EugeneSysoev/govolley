import { z } from 'zod';
export { TrainingResponseSchema as trainingSchema } from '@govolley/shared-types';
import { BookingResponseSchema } from '@govolley/shared-types';
export const profileSchema = z.object({
  id: z.number().int().positive(), firstName: z.string().nullable(), lastName: z.string().nullable(),
  username: z.string().nullable(), image: z.string().nullable(), role: z.enum(['USER','COACH','ADMIN']),
  balance: z.number().int(), skillLevel: z.enum(['NOT_SET','BEGINNER','INTERMEDIATE','ADVANCED']),
  isLevelVerified: z.boolean(), createdAt: z.iso.datetime(),
});
export type Profile = z.infer<typeof profileSchema>;
export const roleCandidatesSchema = z.array(profileSchema.pick({
  id: true, firstName: true, lastName: true, username: true, role: true,
}));
export const loginSchema = profileSchema.extend({ accessToken: z.string().min(1) });
export const bookingsSchema = z.array(BookingResponseSchema);
