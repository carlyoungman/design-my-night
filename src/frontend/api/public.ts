import { j } from './http';

type DmnVenuesJson = { payload?: { pages?: Venue[] } };
type Venue = { _id: string; title: string; name?: string; path: string };

export function getPackages(venue_id: string) {
  return j<{ data: Array<{ id: string; label: string }> }>(
    `/wp-json/dmn/v1/packages?venue_id=${encodeURIComponent(venue_id)}`,
  );
}

export function getBookingTypes(venue_id: string) {
  return j<{ data: Array<{ id: string; name: string; description?: string; priceText?: string }> }>(
    `/wp-json/dmn/v1/booking-types?venue_id=${encodeURIComponent(venue_id)}`,
  );
}

export function getVenues(q: { venue_group?: string; fields?: string } = {}) {
  const qs = new URLSearchParams(q as Record<string, string>);
  return j<{
    data: any;
    payload: { pages: Venue[] };
  }>('venues' + (qs.toString() ? `?${qs}` : ''));
}

export type AvailabilityReq = {
  venue_id: string;
  num_people?: number;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type?: string;
  duration?: number; // hours, decimal (DMN accepts) or minutes if your server converts
  getOffers?: boolean;
};
export type AvailabilityRes = {
  payload: {
    valid: boolean;
    validation?: Record<string, unknown>;
    action?: 'accept' | 'enquire' | 'may_enquire' | 'reject';
    next?: { web?: string; api?: string };
    bookingDetails?: Record<string, unknown>;
  };
  status: number;
};

export function checkAvailability(p: AvailabilityReq) {
  return j<AvailabilityRes>('booking-availability', { method: 'POST', body: JSON.stringify(p) });
}

// Optional if you choose API submission when permitted by DMN
export type BookingReq = {
  source: 'partner';
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  dob?: string;
  num_people: number;
  type: string;
  venue_id: string;
  date: string;
  time: string;
  duration?: number;
  offer?: string;
  notes?: string;
  package?: string;
  newsletter_signup?: boolean;
  marketing_preferences?: string[];
  custom_field_value?: string;
};
export type BookingRes = { payload?: any; status: number };

export function createBooking(p: BookingReq) {
  return j<BookingRes>('bookings', { method: 'POST', body: JSON.stringify(p) });
}
