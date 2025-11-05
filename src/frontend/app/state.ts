// state.ts

export type Customer = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message?: string;
  gdpr?: boolean;
};

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
  duration?: number | null;
  customer: Customer;
  reviewDeadline?: number;
  submitting: boolean;
  addons: AddonLine[];
  addonsSelected: string[];
  addonsResolved: boolean;
};

export const initialState: State = {
  venueId: null,
  venueName: null,
  partySize: 2,
  date: null,
  time: null,
  bookingType: null,
  duration: null,
  customer: { first_name: '', last_name: '', email: '', phone: '', message: '', gdpr: false },
  submitting: false,
  addons: [],
  addonsSelected: [],
  addonsResolved: false,
};

export type Action =
  | { type: 'SET_PARTY_SIZE'; size: number }
  | { type: 'SET_VENUE'; id: string | null }
  | { type: 'SET_VENUE_NAME'; name: string | null }
  | { type: 'SET_DATE'; date: string | null }
  | { type: 'SET_TYPE'; value: string | null }
  | { type: 'SET_DURATION'; value: number | null }
  | { type: 'SET_TIME'; value: string | null }
  | { type: 'SET_CUSTOMER'; value: Partial<Customer> }
  | { type: 'SET_ADDONS'; value: AddonLine[] }
  | { type: 'SET_ADDONS_SELECTED'; value: string[] };

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'SET_VENUE': {
      return {
        ...s,
        venueId: a.id,
        partySize: 2,
        date: null,
        bookingType: null,
        time: null,
      };
    }
    case 'SET_PARTY_SIZE': {
      return {
        ...s,
        partySize: a.size,
        date: null,
        bookingType: null,
        time: null,
      };
    }
    case 'SET_VENUE_NAME': {
      return { ...s, venueName: a.name };
    }
    case 'SET_DATE': {
      return {
        ...s,
        date: a.date,
        bookingType: null,
        time: null,
      };
    }
    case 'SET_TIME': {
      return {
        ...s,
        time: a.value,
      };
    }
    case 'SET_TYPE': {
      return {
        ...s,
        bookingType: a.value,
        time: null,
      };
    }
    case 'SET_DURATION': {
      return { ...s, duration: a.value };
    }
    case 'SET_CUSTOMER':
      return { ...s, customer: { ...s.customer, ...a.value } };
    case 'SET_ADDONS':
      return { ...s, addons: a.value };
    case 'SET_ADDONS_SELECTED':
      return { ...s, addonsSelected: a.value };
    default:
      return s;
  }
}
