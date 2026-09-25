/**
 * Types used by the frontend booking plugin.
 */

/**
 * Represents a single validation field returned from availability checks,
 * including optional suggested values and a human-readable message.
 */
export type AvailabilityValidationField = {
  suggestedValues?: string[];
  message?: string;
};

/**
 * Minimal venue representation used in lists and selections.
 */
export type Venue = {
  _id: string;
  title: string;
  name?: string;
};

/**
 * Props passed to the venue selection step component:
 * - `venues`: available venues to choose from
 * - `initialLoading`: whether initial data is still loading
 * - `error`: error message if loading failed
 * - optional defaults for venue and type selection
 */
export type VenueStepProps = {
  venues: Venue[];
  initialLoading: boolean;
  error: string | null;
  defaultVenueId?: string | undefined;
  defaultTypeId?: string | undefined;
};

/**
 * Information for next actions after availability check:
 * - `api`: whether API should be called next
 * - `web`: optional web URL to navigate to
 */
export type NextInfo = { api?: boolean; web?: string | null };

/**
 * Details about a required deposit for a booking:
 * - `type`: how deposit is handled
 * - `amount`, `total`, `currency`: monetary details
 * - `amount_per`: whether amount is per guest or per booking
 * - `terms`: optional text describing deposit terms
 */
export type DepositRequired = {
  type: 'authenticate' | 'deposit';
  amount: number;
  amount_per?: 'guest' | 'booking';
  total: number;
  currency: string;
  terms?: string;
};

/**
 * Payload returned by availability API:
 * - `valid`: whether requested slot is available
 * - `next`: optional next action info
 * - `depositRequired`: deposit details or false/null
 * - `preordersAvailable`: whether preorders can be added
 * - `action`: recommended action for booking flow
 * - `bookingDetails`: canonical booking data when accepted
 * - `validation`: any additional validation info (opaque)
 */
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

/**
 * Wrapper for API response containing availability payload.
 */
export type AvailabilityRes = { data: { payload: AvailabilityPayload } };

/**
 * Shape of data required to create a booking via API:
 * includes customer details, booking slot, optional marketing and notes.
 */
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

/**
 * Named day-of-week values used for allowed-days configuration.
 */
export type DayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

/**
 * Props for date picker components:
 * - `allowedDays`: optional whitelist of allowed DayName values
 */
export type DateProps = {
  allowedDays?: DayName[];
};

/**
 * Input type used when specifying allowed days:
 * can be a single string, an array of DayName, or null/undefined.
 */
export type AllowedDaysInput = string | DayName[] | null | undefined;
