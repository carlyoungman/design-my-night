export type AvailabilityValidationField = {
  suggestedValues?: string[];
  message?: string;
};

export type Venue = {
  _id: string;
  title: string;
  name?: string;
};

export type VenueStepProps = {
  venues: Venue[];
  initialLoading: boolean;
  error: string | null;
  defaultVenueId?: string | undefined;
  defaultTypeId?: string | undefined;
};

// types.ts
export type NextInfo = { api?: boolean; web?: string | null };

export type DepositRequired = {
  type: 'authenticate' | 'deposit';
  amount: number;
  amount_per?: 'guest' | 'booking';
  total: number;
  currency: string;
  terms?: string;
};

export type AvailabilityPayload = {
  valid: boolean;
  next?: NextInfo;
  depositRequired?: DepositRequired | false | null;
  preordersAvailable?: boolean;
  action?: 'accept' | 'enquire' | 'may_enquire' | 'reject';
  bookingDetails?: {
    venue_id: string;
    venue_group?: string;
    date: string; // ISO or YYYY-MM-DD
    time: string; // HH:mm
    num_people: number;
    type: string;
    duration?: number; // minutes
    offer?: string;
    package?: string;
    payments?: unknown[];
  };
  validation?: unknown;
};

export type AvailabilityRes = { data: { payload: AvailabilityPayload } };

export type BookingCreate = {
  source?: 'partner';
  venue_id: string;
  type: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  num_people: number;
  duration?: number; // minutes
  offer?: string;
  package?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  dob?: string; // YYYY-MM-DD
  newsletter_signup?: boolean;
  marketing_preferences?: string[];
  notes?: string;
};

export type DayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type DateProps = {
  allowedDays?: DayName[];
};
