export * from './enums.js';
export * from './ids.js';
export * from './training.js';
export * from './onboarding.js';
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

/**
 * Booking
 */
export interface Booking {
  id: number;
  userId: number;
  trainingId: number;
  status: import("./enums.js").BookingStatus;
  paymentType: import("./enums.js").PaymentType;
  createdAt: string;
  updatedAt: string;
}
