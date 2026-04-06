import { z } from 'zod';

export const CreateTrainingSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  targetLevel: z.enum(['NOT_SET', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  maxParticipants: z.number().min(1).max(100),
  price: z.coerce.number().nullable().optional(),
  coachName: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
});

export const UpdateTrainingSchema = CreateTrainingSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// типы автоматически
export type CreateTrainingDto = z.infer<typeof CreateTrainingSchema>;
export type UpdateTrainingDto = z.infer<typeof UpdateTrainingSchema>;
