import { z } from 'zod';
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const optionalText = z.string().trim().max(200).nullable().optional();
const fields = z.strictObject({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(10000).nullable().optional(),
  date: z.iso.datetime({ offset: true }),
  startTime: time,
  endTime: time,
  targetLevel: z.enum(['NOT_SET', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  maxParticipants: z.number().int().min(1).max(100),
  price: z.number().finite().nonnegative().nullable().optional(),
  coachName: optionalText,
  location: optionalText,
});
export const CreateTrainingSchema = fields.refine(
  (value) => value.endTime > value.startTime,
  { path: ['endTime'], message: 'Окончание должно быть позже начала' },
);
export const UpdateTrainingSchema = fields.partial().extend({ isActive: z.boolean().optional() })
  .refine((value) => Object.keys(value).length > 0, 'Укажите поля для изменения')
  .refine((value) => !value.startTime || !value.endTime || value.endTime > value.startTime,
    { path: ['endTime'], message: 'Окончание должно быть позже начала' });
export type CreateTrainingDto = z.infer<typeof CreateTrainingSchema>;
export type UpdateTrainingDto = z.infer<typeof UpdateTrainingSchema>;
/** JSON response. Counts include CONFIRMED bookings only; isBooked is viewer-specific. */
export interface Training {
  id: number;
  title: string;
  description: string | null;
  date: string;
  startTime: string;
  endTime: string;
  targetLevel: import('./enums.js').SkillLevel;
  maxParticipants: number;
  currentParticipants: number;
  isBooked: boolean;
  price: number | null;
  coachName: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
