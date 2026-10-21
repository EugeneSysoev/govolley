import {
  evaluateLevel,
  CompleteOnboardingSchema,
} from '@govolley/shared-types';
describe('approved onboarding policy', () => {
  it.each([
    [[1, 1, 1, 1, 1], 'BEGINNER'],
    [[2, 3, 3, 3, 3], 'BEGINNER'],
    [[3, 3, 3, 3, 3], 'INTERMEDIATE'],
    [[3, 3, 3, 4, 4], 'INTERMEDIATE'],
    [[3, 3, 4, 4, 4], 'ADVANCED'],
    [[4, 4, 4, 4, 4], 'ADVANCED'],
  ])('scores %j as %s', (answers, expected) => {
    expect(evaluateLevel(answers)).toBe(expected);
  });
  it.each([
    { answers: [4, 4, 4, 4] },
    { answers: [1, 1, 1, 1, 5] },
    { totalScore: 100 },
    { answers: [1.5, 1, 1, 1, 1] },
  ])('rejects %o', (payload) => {
    expect(CompleteOnboardingSchema.safeParse(payload).success).toBe(false);
  });
});
