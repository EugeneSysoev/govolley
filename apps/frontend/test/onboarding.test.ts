import { QUESTIONS } from '@/app/onboarding/constants';
import { evaluateLevel, ONBOARDING_QUESTION_COUNT } from '@govolley/shared-types';
it('keeps the rendered questionnaire within the server scoring contract', () => {
  expect(QUESTIONS).toHaveLength(ONBOARDING_QUESTION_COUNT);
  const minimum = QUESTIONS.map((question) => Math.min(...question.options.map((option) => option.score)));
  const maximum = QUESTIONS.map((question) => Math.max(...question.options.map((option) => option.score)));
  expect(minimum.reduce((sum, score) => sum + score, 0)).toBe(5);
  expect(maximum.reduce((sum, score) => sum + score, 0)).toBe(20);
  expect(evaluateLevel(minimum)).toBe('BEGINNER');
  expect(evaluateLevel(maximum)).toBe('ADVANCED');
});
