export * from './enums.js';
export * from './ids.js';
export * from './training.js';
export * from './school-time.js';
export * from './onboarding.js';
export * from './booking.js';
export * from './participants.js';
export * from './notifications.js';
/**
 * User
 */
export interface User {
  id: number;
  telegramId: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  role: import("./enums.js").Role;
  skillLevel: import("./enums.js").SkillLevel;
  isLevelVerified: boolean;
  balance: number;
  createdAt: string;
  updatedAt: string;
}
