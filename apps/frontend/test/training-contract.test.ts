/** @jest-environment node */
import { trainingSchema } from '@/lib/contracts';
import { CreateTrainingSchema, UpdateTrainingSchema } from '@govolley/shared-types';

const response = {
  id: 7, title: 'Saved training', description: null,
  date: '2026-11-01T00:00:00.000Z', startTime: '07:00', endTime: '09:00',
  targetLevel: 'BEGINNER', maxParticipants: 10, currentParticipants: 1,
  isBooked: true, price: null, coachName: null, location: null, isActive: true,
  createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z',
};

it('reads nullable fields without inventing defaults or altering saved text', () => {
  expect(trainingSchema.parse(response)).toEqual(response);
  expect(trainingSchema.parse({ ...response, title: '  Saved title  ' }).title).toBe('  Saved title  ');
});

it.each([
  { isBooked: 'true' }, { currentParticipants: '1' }, { location: 1 },
  { price: '500' }, { targetLevel: 'EXPERT' }, { date: 'tomorrow' },
  { description: undefined }, { coachName: undefined },
])('rejects malformed response fields %o', (fields) => {
  expect(trainingSchema.safeParse({ ...response, ...fields }).success).toBe(false);
});

it('distinguishes omitted PATCH fields from explicit nullable clearing', () => {
  expect(UpdateTrainingSchema.parse({ title: 'Updated' })).toEqual({ title: 'Updated' });
  expect(UpdateTrainingSchema.parse({ location: null, price: null })).toEqual({ location: null, price: null });
});

it('reads saved training independently of creation limits', () => {
  const saved = { ...response, title: 'x'.repeat(201), maxParticipants: 101, endTime: '06:00' };
  expect(trainingSchema.parse(saved)).toEqual(saved);
  expect(CreateTrainingSchema.safeParse({
    title: saved.title, date: saved.date, startTime: saved.startTime, endTime: saved.endTime,
    targetLevel: saved.targetLevel, maxParticipants: saved.maxParticipants,
  }).success).toBe(false);
});
