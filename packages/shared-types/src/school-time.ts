/** School calendar dates and wall times always belong to Phuket (UTC+07:00).
 * Persisted legacy timestamps are interpreted by their calendar date in Bangkok.
 */
export const SCHOOL_TIME_ZONE = 'Asia/Bangkok';
export function schoolDateKey(value: string | Date): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHOOL_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
/** Canonical storage of a school date: midnight in Bangkok, as a UTC instant. */
export function schoolDateIso(value: string | Date): string {
  return new Date(`${schoolDateKey(value)}T00:00:00+07:00`).toISOString();
}
/** Use for booking/cancellation deadlines; never combine date/time in host TZ. */
export function schoolTimeInstant(date: string | Date, time: string): Date {
  return new Date(`${schoolDateKey(date)}T${time}:00+07:00`);
}
