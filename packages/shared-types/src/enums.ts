export const Role = {
  USER: "USER",
  COACH: "COACH",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const SkillLevel = {
  NOT_SET: "NOT_SET",
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
} as const;

export type SkillLevel = (typeof SkillLevel)[keyof typeof SkillLevel];

export const BookingStatus = {
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentType = {
  CASH: "CASH",
  BALANCE: "BALANCE",
} as const;

export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];
