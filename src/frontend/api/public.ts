import { j } from './http';

/* ---------- Venues ---------- */

export type Venue = { _id: string; title: string; name?: string; path: string };

export function getVenues(q: { venue_group?: string; fields?: string } = {}) {
  const qs = new URLSearchParams(q as Record<string, string>);
  return j<{
    data: { payload?: { pages?: Venue[] } };
  }>('venues' + (qs.toString() ? `?${qs}` : ''));
}

/* ---------- Packages ---------- */

export function getPackages(venueId: string) {
  return j<{ data: Array<{ id: string; label: string }> }>(
    'packages?venue_id=' + encodeURIComponent(venueId),
  );
}

/* ---------- Availability (DMN booking-availability) ---------- */
// I keep all fields optional, so I never need to send `null`; callers can conditionally spread keys.
export type AvailabilityReq = {
  venue_id: string;
  num_people?: number;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm or ISO if your proxy accepts
  type?: string; // DMN type id
  duration?: number; // hours (decimal) if you use it
  getOffers?: boolean;
};

export type CheckFields = 'type' | 'date' | 'time';

// The PHP proxy usually wraps the DMN result in { data: { payload: {...}, ... }, status: number }.
// I model the inner `payload` exactly how we consume it elsewhere.
export type AvailabilityPayload = {
  payload: {
    valid: boolean;
    validation?: Record<string, unknown>;
    action?: 'accept' | 'enquire' | 'may_enquire' | 'reject';
    next?: { web?: string; api?: string };
    bookingDetails?: Record<string, unknown>;
  };
  // Your proxy often includes these extra bits; they’re not strictly required, so I keep them loose.
  status?: number;
  statusText?: string;
  requestTime?: string;
  responseTime?: string;
};

export type AvailabilityResponse = {
  payload: any;
  data?: AvailabilityPayload;
  status: number;
  error?: unknown;
};

export function checkAvailability(p: AvailabilityReq, fields?: CheckFields) {
  const qs = fields ? `?fields=${encodeURIComponent(fields)}` : '';
  return j<AvailabilityResponse>('booking-availability' + qs, {
    method: 'POST',
    body: JSON.stringify(p),
  });
}

export type BookingTypeQuery = {
  venueId: string;
  numPeople?: number;
  date?: string;
};

export function getBookingTypes(params: BookingTypeQuery) {
  const qs = new URLSearchParams();
  qs.set('venue_id', params.venueId);
  if (params.numPeople) qs.set('num_people', String(params.numPeople));
  if (params.date) qs.set('date', params.date);
  return j<{
    data: Array<{
      id: string;
      name: string;
      description?: string;
      priceText?: string;
      image_url?: string | null;
      image_id?: number | null;
      valid?: boolean | null;
      message?: string | null;
    }>;
  }>('booking-types?' + qs.toString());
}

export type BookingReq = {
  source: 'partner';
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  dob?: string; // YYYY-MM-DD
  num_people: number;
  type: string; // DMN type id
  venue_id: string; // DMN venue id
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration?: number; // minutes
  offer?: string | null; // offer id
  notes?: string | null;
  package?: string | null; // add-on/package id (single)
  newsletter_signup?: boolean;
  marketing_preferences?: string[];
  custom_field_value?: string | null;
};

export type BookingRes = { data?: any; status: number; error?: unknown };

/** Remove nullish keys so the proxy only receives set fields */
function prune<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') (out as any)[k] = v;
  });
  return out;
}

// NEW: create booking via your WP proxy -> DMN /v4/bookings

export async function createBooking(payload: {
  source: 'partner';
  venue_id: string;
  type: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  num_people: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  notes?: string;
}) {
  const res = await fetch('/wp-json/dmn/v1/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Booking failed');
  }
  return res.json();
}
