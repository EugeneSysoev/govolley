export * from "./enums";
export * from "./ids";

/**
 * Training
 */
export interface Training {
  id: number;
  title: string;
  description: string | null;
  date: string;
  startTime: string;
  endTime: string;
  targetLevel: import("./enums").SkillLevel;
  maxParticipants: number;
  currentParticipants: number;
  price: number | null;
  coachName: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO
 */
export interface CreateTrainingDto {
  title: string;
  description?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  targetLevel: import("./enums").SkillLevel;
  maxParticipants?: number;
  price?: number | null;
  coachName?: string | null;
  location?: string | null;
}

export interface UpdateTrainingDto extends Partial<CreateTrainingDto> {
  isActive?: boolean;
}

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
  role: import("./enums").Role;
  skillLevel: import("./enums").SkillLevel;
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
  status: import("./enums").BookingStatus;
  paymentType: import("./enums").PaymentType;
  createdAt: string;
  updatedAt: string;
}
