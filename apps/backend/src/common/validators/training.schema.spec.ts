import {
  CreateTrainingSchema,
  UpdateTrainingSchema,
} from './training.schema.js';
import { UpdateUserSchema } from './user.schema.js';

const valid = {
  title: 'Beach',
  date: '2026-11-01T00:00:00.000Z',
  startTime: '07:00',
  endTime: '09:00',
  maxParticipants: 10,
  targetLevel: 'NOT_SET',
};

describe('HTTP payload contracts', () => {
  it.each([
    { title: ' ' },
    { date: 'tomorrow' },
    { startTime: '25:00' },
    { endTime: '06:00' },
    { maxParticipants: 1.5 },
    { price: -1 },
    { id: 5 },
    { isActive: false },
  ])('rejects invalid create %o', (fields) => {
    expect(
      CreateTrainingSchema.safeParse({ ...valid, ...fields }).success,
    ).toBe(false);
  });
  it('accepts a partial update and nullable fields', () => {
    expect(
      UpdateTrainingSchema.safeParse({ location: null, price: null }).success,
    ).toBe(true);
  });
  it.each([
    { maxParticipants: -1 },
    { currentParticipants: 0 },
    { endTime: '99:99' },
    {},
  ])('rejects invalid update %o', (fields) => {
    expect(UpdateTrainingSchema.safeParse(fields).success).toBe(false);
  });
  it.each([
    { image: '/uploads/../../src/main.ts' },
    { role: 'ADMIN' },
    { isLevelVerified: true },
  ])('rejects privileged profile fields %o', (body) => {
    expect(UpdateUserSchema.safeParse(body).success).toBe(false);
  });
});
