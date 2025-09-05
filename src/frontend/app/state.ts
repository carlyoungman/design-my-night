// state.ts

// ---- Steps in DMN-recommended order ----
export type Step =
  | 'venue' // pre-step (only shown if multi-venue)
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
export const FLOW_ORDER: Step[] = ['venue', 'type', 'time', 'packages', 'details', 'review'];

// ---- Defaults ----
// NOTE: Widget sets the first step dynamically:
// - forcedVenueId ? 'stage1' : 'venue'
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

  customer: { name: '', email: '' },
  error: null,

  submitting: false,
};

// ---- Actions ----
export type Action =
  | { type: 'SET_VENUE'; id: string | null }
  | { type: 'SET_PARTY_SIZE'; size: number } // size only
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
    case 'SET_VENUE':
      return { ...s, venueId: a.id, avail: null, suggestions: [] };

    case 'SET_PARTY_SIZE': {
      const size = Math.max(1, a.size);
      // Capacity affects availability/time; clear them
      return {
        ...s,
        partySize: size,
        time: null,
        avail: null,
        suggestions: [],
      };
    }

    case 'SET_DATE': {
      const dateChanged = a.date !== s.date;
      if (!dateChanged) return s;
      // Date change invalidates previously selected time/availability
      return {
        ...s,
        date: a.date, // YYYY-MM-DD or null
        time: null,
        avail: null,
        suggestions: [],
      };
    }

    case 'SET_TYPE':
      // Changing type usually affects availability/time
      return {
        ...s,
        bookingType: a.value,
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
