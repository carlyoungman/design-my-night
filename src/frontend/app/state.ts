// state.ts

// ---- Steps in DMN-recommended order ----
export type Step =
  | 'venue' // pre-step (only shown if multi-venue)
  | 'stage1' // guests + date
  | 'type' // experience / booking type
  | 'time' // time selection
  | 'packages' // add-on packages
  | 'details' // customer details
  | 'review'; // summary + countdown

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

  packages: Array<{ id: string; label: string }>;
  packagesSelected: string[]; // ids

  customer: Customer;
  error: string | null;

  // review countdown
  reviewDeadline?: number; // epoch ms

  // create-booking UX flag
  submitting: boolean;
};

// Single source of truth for flow order
export const FLOW_ORDER: Step[] = [
  'venue',
  'stage1',
  'type',
  'time',
  'packages',
  'details',
  'review',
];

// ---- Defaults ----
// NOTE: Widget sets the first step dynamically:
// - forcedVenueId ? 'stage1' : 'venue'
export const initialState: State = {
  step: 'stage1',
  venueId: null,

  partySize: 2,
  date: null,
  time: null,
  bookingType: null,

  avail: null,
  suggestions: [],

  packages: [],
  packagesSelected: [],

  customer: { name: '', email: '' },
  error: null,

  submitting: false,
};

export type Action =
  | { type: 'SET_VENUE'; id: string | null }
  | { type: 'SET_GUESTS_DATE'; size: number; date: string } // Stage 1
  | { type: 'SET_TYPE'; value: string | null } // Stage 2
  | { type: 'SET_TIME'; value: string | null } // Stage 3
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

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'SET_VENUE':
      return { ...s, venueId: a.id, avail: null, suggestions: [] };

    case 'SET_GUESTS_DATE': {
      const dateChanged = a.date !== s.date;
      return {
        ...s,
        partySize: Math.max(1, a.size),
        date: a.date,
        // Reset time/availability if the date changed
        time: dateChanged ? null : s.time,
        avail: dateChanged ? null : s.avail,
        suggestions: [],
      };
    }

    case 'SET_TYPE':
      return {
        ...s,
        bookingType: a.value,
        // Changing type invalidates previous time/availability
        time: null,
        avail: null,
        suggestions: [],
      };

    case 'SET_TIME':
      return { ...s, time: a.value ?? null };

    case 'SET_AVAIL':
      return { ...s, avail: a.value || null };

    case 'SET_SUGGESTIONS':
      return { ...s, suggestions: a.value || [] };

    case 'SET_PACKAGES':
      return { ...s, packages: a.value || [] };

    case 'SET_PACKAGES_SELECTED':
      return { ...s, packagesSelected: a.value || [] };

    case 'SET_CUSTOMER':
      return { ...s, customer: a.value };

    case 'START_REVIEW_TIMER':
      return { ...s, reviewDeadline: a.deadline };

    case 'SUBMIT_START':
      return { ...s, submitting: true, error: null };

    case 'SUBMIT_END':
      return { ...s, submitting: false };

    case 'ERROR':
      return { ...s, error: a.message };

    case 'NEXT': {
      const idx = FLOW_ORDER.indexOf(s.step);
      const nextIdx = Math.min(FLOW_ORDER.length - 1, idx + 1);
      return { ...s, step: FLOW_ORDER[nextIdx] };
    }

    case 'BACK': {
      const idx = FLOW_ORDER.indexOf(s.step);
      const prevIdx = Math.max(0, idx - 1);
      return { ...s, step: FLOW_ORDER[prevIdx] };
    }

    default:
      return s;
  }
}
