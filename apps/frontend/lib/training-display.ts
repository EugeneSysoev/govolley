import { SCHOOL_TIME_ZONE, type SkillLevel } from '@govolley/shared-types';

export const SCHOOL_TIME_LABEL = 'Время Пхукета (Asia/Bangkok, UTC+7)';
export const LEVEL_LABELS: Record<SkillLevel, string> = {
  NOT_SET: 'Не указан',
  BEGINNER: 'Начинающий',
  INTERMEDIATE: 'Средний',
  ADVANCED: 'Продвинутый',
};
export function locationLabel(value: string | null | undefined): string {
  return value?.trim() || 'Уточняется';
}
export function priceLabel(value: number | null): string {
  return value === null ? 'Уточняется' : `${value} ฿`;
}
export function formatSchoolDate(value: string | Date, options: Intl.DateTimeFormatOptions): string {
  return new Date(value).toLocaleDateString('ru-RU', { ...options, timeZone: SCHOOL_TIME_ZONE });
}
