import { z } from 'zod';
export const ONBOARDING_QUESTION_COUNT = 5;
export const CompleteOnboardingSchema = z.strictObject({
  answers: z.array(z.number().int().min(1).max(4)).length(ONBOARDING_QUESTION_COUNT),
});
// Approved: preserve INTERMEDIATE at 15; ADVANCED is reachable at 18/20.
export function evaluateLevel(answers: number[]): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  const { answers: validated } = CompleteOnboardingSchema.parse({ answers });
  const total = validated.reduce((sum, score) => sum + score, 0);
  return total >= 18 ? 'ADVANCED' : total >= 15 ? 'INTERMEDIATE' : 'BEGINNER';
}
