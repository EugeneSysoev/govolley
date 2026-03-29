/**
 * Уровни подготовки участников
 */
export enum SkillLevel {
  NOT_SET = "NOT_SET",
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

/**
 * Роли пользователей в системе
 */
export enum Role {
  USER = "USER",
  COACH = "COACH",
  ADMIN = "ADMIN",
}

/**
 * Тренировка
 */
export interface Training {
  id: number;
  title: string;
  description: string | null;
  date: Date | string;
  startTime: string;
  endTime: string;
  targetLevel: SkillLevel;
  maxParticipants: number;
  currentParticipants: number;
  price: number | null;
  coachName: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * DTO для создания тренировки
 */
export interface CreateTrainingDto {
  title: string;
  description?: string | null;
  date: Date | string;
  startTime: string;
  endTime: string;
  targetLevel: SkillLevel;
  maxParticipants?: number;
  price?: number | null;
  coachName?: string | null;
  location?: string | null;
}

/**
 * DTO для обновления тренировки
 */
export interface UpdateTrainingDto extends Partial<CreateTrainingDto> {
  isActive?: boolean;
}

/**
 * Пользователь системы
 */
export interface User {
  id: number;
  telegramId: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  role: Role;
  skillLevel: SkillLevel;
  isLevelVerified: boolean;
  balance: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Бронирование места на тренировке
 */
export interface Booking {
  id: number;
  userId: number;
  trainingId: number;
  status: "CONFIRMED" | "CANCELLED";
  paymentType: "CASH" | "BALANCE";
  createdAt: Date | string;
  updatedAt: Date | string;
}
