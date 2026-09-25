import type { State } from '@app/state';
import { isCustomerValid } from '@app/utils/validation';

export type StepKey = 'venue' | 'party' | 'date' | 'experience' | 'time' | 'details';

export type StepDef = { key: StepKey; label: string; title: string };

/** Booking steps in the order they appear in the widget. */
export const STEPS: StepDef[] = [
  { key: 'venue', label: 'Venue', title: 'Choose a venue' },
  { key: 'party', label: 'Group size', title: 'How many people?' },
  { key: 'date', label: 'Date', title: 'Choose a date' },
  { key: 'experience', label: 'Experience', title: 'Choose your experience' },
  { key: 'time', label: 'Time', title: 'Choose a time' },
  { key: 'details', label: 'Your details', title: 'Your details' },
];

export function isStepDone(key: StepKey, s: State): boolean {
  switch (key) {
    case 'venue':
      return !!s.venueId;
    case 'party':
      return !!s.venueId && (s.partySize ?? 0) >= 1;
    case 'date':
      return !!s.venueId && !!s.date;
    case 'experience':
      return !!s.date && !!s.bookingType;
    case 'time':
      return !!s.bookingType && !!s.time;
    case 'details':
      return isCustomerValid(s.customer);
  }
}

export type StepStatus = StepDef & { status: 'done' | 'current' | 'todo' };

/** Each step's status; the first step that isn't done is the current one. */
export function stepStatuses(s: State): StepStatus[] {
  let currentFound = false;
  return STEPS.map((step) => {
    if (isStepDone(step.key, s)) return { ...step, status: 'done' as const };
    if (!currentFound) {
      currentFound = true;
      return { ...step, status: 'current' as const };
    }
    return { ...step, status: 'todo' as const };
  });
}

export const stepHeadingId = (widgetId: string, key: StepKey) => `${widgetId}-step-${key}`;
