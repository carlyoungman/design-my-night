// utils/parseAllowedDays.ts
import type { DayName } from '../types';

const VALID_DAYS: DayName[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

type AllowedDaysInput = string | DayName[] | null | undefined;

export function parseAllowedDays(input: AllowedDaysInput): DayName[] | undefined {
  if (!input) return undefined;

  if (Array.isArray(input)) {
    return input;
  }

  const days = input
    .split(',')
    .map((d) => d.trim())
    .filter((d): d is DayName => VALID_DAYS.includes(d as DayName));

  return days.length ? days : undefined;
}
