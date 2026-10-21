import { z } from 'zod';
import { BookingResponseSchema } from './booking.js';
import { SkillLevel } from './enums.js';
const id = z.number().int().positive().max(2147483647);
const action = { requestId: z.uuid(), reason: z.string().trim().min(1).max(500) };
export const ParticipantActionSchema = z.discriminatedUnion('field', [
  z.strictObject({ ...action, field: z.literal('ATTENDANCE'), value: z.enum(['UNMARKED', 'ATTENDED', 'NO_SHOW']) }),
  z.strictObject({ ...action, field: z.literal('CASH_PAYMENT'), value: z.boolean() }),
]);
export type ParticipantAction = z.infer<typeof ParticipantActionSchema>;
const actor = z.object({ id, firstName: z.string().nullable(), lastName: z.string().nullable(), username: z.string().nullable() });
export const ParticipantResponseSchema = BookingResponseSchema.omit({ training: true }).extend({
  user: actor.extend({ skillLevel: z.enum(SkillLevel) }),
  history: z.array(z.object({ id, actor, field: z.enum(['ATTENDANCE', 'CASH_PAYMENT']), oldValue: z.string(), newValue: z.string(), reason: z.string(), createdAt: z.iso.datetime() })),
});
export type Participant = z.infer<typeof ParticipantResponseSchema>;
