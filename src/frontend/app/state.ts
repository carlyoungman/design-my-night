// state.ts

// ---- Steps in DMN-recommended order ----
export type Step = 'party' | 'venue' | 'date_time' | 'type' | 'packages' | 'details' | 'review';

// Keep Customer in sync with how it's used in the widget (message + gdpr supported)
export type Customer = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  gdpr?: boolean;
};

export type Availability = {
  valid: boolean;
  action?: 'accept' | 'enquire' | 'may_enquire' | 'reject';
  nextWeb?: string | null;
} | null;

export type State = {
  step: Step;
  venueId?: string | null;

  partySize: number;
  date?: string | null; // YYYY-MM-DD
  time?: string | null; // HH:mm
  bookingType?: string | null;

  avail?: Availability;
  suggestions: string[]; // suggested times (from API or fallback)

  packages: Array<{ id: string; name: string }>;
  packagesSelected: string[]; // ids
  // internal flag to allow advancing past packages
  packagesResolved?: boolean;

  customer: Customer;
  error: string | null;

  // review countdown
  reviewDeadline?: number; // epoch ms

  // create-booking UX flag
  submitting: boolean;
};

// Single source of truth for flow order
export const STEP_FLOW: Step[] = [
  'party',
  'venue',
  'date_time',
  'type',
  'packages',
  'details',
  'review',
];

// derive current step from data so order is enforced
export function computeStep(s: State): Step {
  if (!s.partySize) return 'party';
  if (!s.venueId) return 'venue';
  if (!s.date /* also require time if desired: || !s.time */) return 'date_time';
  if (!s.bookingType) return 'type';
  if (!s.packagesResolved) return 'packages';
  if (!s.customer?.name || !s.customer?.email || !s.customer?.gdpr) return 'details';
  return 'review';
}

// ---- Defaults ----
export const initialState: State = {
  step: 'venue',
  venueId: null,

  partySize: 2,
  date: null,
  time: null,
  bookingType: null,

  avail: null,
  suggestions: [],

  packages: [],
  packagesSelected: [],
  packagesResolved: false,

  customer: { name: '', email: '', gdpr: false },
  error: null,

  submitting: false,
};

// ---- Actions ----
export type Action =
  | { type: 'SET_PARTY_SIZE'; size: number } // size only
  | { type: 'SET_VENUE'; id: string | null }
  | { type: 'SET_DATE'; date: string | null } // date only
  | { type: 'SET_TYPE'; value: string | null }
  | { type: 'SET_TIME'; value: string | null }
  | { type: 'SET_AVAIL'; value: State['avail'] }
  | { type: 'SET_SUGGESTIONS'; value: string[] }
  | { type: 'SET_PACKAGES'; value: State['packages'] }
  | { type: 'SET_PACKAGES_SELECTED'; value: string[] }
  | { type: 'SET_CUSTOMER'; value: State['customer'] }
  | { type: 'START_REVIEW_TIMER'; deadline: number }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_END' }
  | { type: 'ERROR'; message: string | null }
  | { type: 'NEXT' }
  | { type: 'BACK' };

// ---- Reducer ----
export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'SET_PARTY_SIZE': {
      const next = { ...s, partySize: a.size };
      return { ...next, step: computeStep(next) };
    }
    case 'SET_VENUE': {
      const next = { ...s, venueId: a.id };
      return { ...next, step: computeStep(next) };
    }
    case 'SET_DATE': {
      const next = { ...s, date: a.date, time: null };
      return { ...next, step: computeStep(next) };
    }
    case 'SET_TIME': {
      const next = { ...s, time: a.value };
      return { ...next, step: computeStep(next) };
    }
    case 'SET_TYPE': {
      const next = { ...s, bookingType: a.value };
      return { ...next, step: computeStep(next) };
    }
    case 'SET_AVAIL':
      return { ...s, avail: a.value };
    case 'SET_SUGGESTIONS':
      return { ...s, suggestions: a.value };
    case 'SET_PACKAGES':
      return { ...s, packages: a.value };
    case 'SET_PACKAGES_SELECTED': {
      const next = { ...s, packagesSelected: a.value, packagesResolved: true };
      return { ...next, step: computeStep(next) };
    }
    case 'SET_CUSTOMER': {
      const next = { ...s, customer: a.value };
      return { ...next, step: computeStep(next) };
    }
    case 'START_REVIEW_TIMER':
      return { ...s, reviewDeadline: a.deadline };
    case 'SUBMIT_START':
      return { ...s, submitting: true, error: null };
    case 'SUBMIT_END':
      return { ...s, submitting: false };
    case 'ERROR':
      return { ...s, error: a.message };

    case 'NEXT': {
      const i = Math.max(0, STEP_FLOW.indexOf(s.step));
      const step = STEP_FLOW[Math.min(i + 1, STEP_FLOW.length - 1)];
      return { ...s, step };
    }
    case 'BACK': {
      const i = Math.max(0, STEP_FLOW.indexOf(s.step));
      const step = STEP_FLOW[Math.max(i - 1, 0)];
      return { ...s, step };
    }

    default:
      return s;
  }
}
