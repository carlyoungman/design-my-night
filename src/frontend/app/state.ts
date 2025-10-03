// state.ts

export type Customer = {
  first_name: string;
  last_name: string;
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

export type AddonLine = {
  id: string;
  dmn_package_id: string;
  name: string;
  priceText: string;
  quantity: number;
};

export type State = {
  venueId?: string | null;
  venueName?: string | null;
  partySize: number;
  date?: string | null;
  time?: string | null;
  bookingType?: string | null;
  avail?: Availability;
  suggestions: string[];
  customer: Customer;
  error: string | null;
  reviewDeadline?: number;
  submitting: boolean;
  addons: AddonLine[];
  addonsSelected: string[];
  addonsResolved: boolean;
};

// derive current step from data

// ---- Defaults ----
export const initialState: State = {
  venueId: null,
  venueName: null,
  partySize: 2,
  date: null,
  time: null,
  bookingType: null,
  avail: null,
  suggestions: [],
  customer: { first_name: '', last_name: '', email: '', phone: '', message: '', gdpr: false },
  error: null,
  submitting: false,
  addons: [],
  addonsSelected: [],
  addonsResolved: false,
};

// ---- Actions ----
export type Action =
  | { type: 'SET_PARTY_SIZE'; size: number }
  | { type: 'SET_VENUE'; id: string | null }
  | { type: 'SET_VENUE_NAME'; name: string | null }
  | { type: 'SET_DATE'; date: string | null }
  | { type: 'SET_TYPE'; value: string | null }
  | { type: 'SET_TIME'; value: string | null }
  | { type: 'SET_AVAIL'; value: State['avail'] }
  | { type: 'SET_SUGGESTIONS'; value: string[] }
  | { type: 'SET_CUSTOMER'; value: Partial<Customer> }
  | { type: 'ERROR'; message: string | null }
  | { type: 'SET_ADDONS'; value: AddonLine[] }
  | { type: 'SET_ADDONS_SELECTED'; value: string[] };

// ---- Reducer ----
export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'SET_PARTY_SIZE': {
      // optional but safer: type/add-ons can depend on party size
      return {
        ...s,
        partySize: a.size,
        bookingType: null,
        addons: [],
        addonsSelected: [],
        addonsResolved: false,
      };
    }
    case 'SET_VENUE': {
      return {
        ...s,
        venueId: a.id,
        date: null,
        time: null,
        bookingType: null,
        avail: null, // clear stale availability
        suggestions: [], // clear stale suggestions
        error: null,
        addons: [],
        addonsSelected: [],
        addonsResolved: false,
      };
    }
    case 'SET_VENUE_NAME': {
      return { ...s, venueName: a.name };
    }
    case 'SET_DATE': {
      return {
        ...s,
        date: a.date,
        time: null,
        bookingType: null,
        avail: null, // clear stale availability
        suggestions: [],
        error: null,
        addons: [],
        addonsSelected: [],
        addonsResolved: false,
      };
    }
    case 'SET_TIME': {
      return {
        ...s,
        time: a.value,
        bookingType: null,
        avail: null, // clear stale availability
        suggestions: [],
        error: null,
        addons: [],
        addonsSelected: [],
        addonsResolved: false,
      };
    }
    case 'SET_TYPE': {
      return {
        ...s,
        bookingType: a.value,
        addons: [],
        addonsSelected: [],
        addonsResolved: false,
      };
    }
    case 'SET_AVAIL':
      return { ...s, avail: a.value };
    case 'SET_SUGGESTIONS':
      return { ...s, suggestions: a.value };
    case 'SET_CUSTOMER':
      return { ...s, customer: { ...s.customer, ...a.value } };
    case 'ERROR':
      return { ...s, error: a.message };
    case 'SET_ADDONS':
      return { ...s, addons: a.value };
    case 'SET_ADDONS_SELECTED':
      return { ...s, addonsSelected: a.value };
    default:
      return s;
  }
}
