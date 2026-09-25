import { j } from './http';

/* ---------- Venues ---------- */

export type Venue = { _id: string; title: string; name?: string; path: string };

export function getVenues(q: { venue_group?: string; fields?: string } = {}) {
  const qs = new URLSearchParams(q as Record<string, string>);
  return j<{
    data: { payload?: { pages?: Venue[] } };
  }>('venues' + (qs.toString() ? `?${qs}` : ''));
}

/* ---------- Availability (DMN booking-availability) ---------- */
export type AvailabilityReq = {
  venue_id: string;
  num_people?: number;
  date?: string;
  time?: string;
  type?: string;
  duration?: number;
  getOffers?: boolean;
};

export type CheckFields = 'type' | 'date' | 'time';

export type AvailabilityPayload = {
  payload: {
    valid: boolean;
    validation?: Record<string, unknown>;
    action?: 'accept' | 'enquire' | 'may_enquire' | 'reject';
    next?: { web?: string; api?: string };
    bookingDetails?: Record<string, unknown>;
  };
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

/* ---------- Booking Types ---------- */

export type BookingTypeQuery = {
  venueId: string;
  numPeople?: number;
  time?: string;
  date?: string;
  allowDisabled?: boolean;
};

export function getBookingTypes(params: BookingTypeQuery) {
  const qs = new URLSearchParams();
  qs.set('venue_id', params.venueId);
  if (params.numPeople) qs.set('num_people', String(params.numPeople));
  if (params.date) qs.set('date', params.date);
  if (params.time) qs.set('time', String(params.time));
  if (params.allowDisabled) qs.set('allow_disabled', '1');

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
      duration?: number | null;
      price_mode?: 'per_person' | 'per_room' | 'display' | null;
      /** Optional: reflects WP activity visibility when allow_disabled is used */
      visible?: boolean;
    }>;
  }>('booking-types?' + qs.toString());
}

/* ---------- Addons ---------- */

export async function getAddons(venueId: string, activityId?: string, allowDisabled?: boolean) {
  const base =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__DMN_API_BASE__ ||
    (window.DMN_PUBLIC_BOOT?.restUrl || '/wp-json/dmn/v1/').replace(/\/$/, '');
  if (!venueId) {
    throw new Error('Missing venue id');
  }

  const url = new URL(`${base}/addons`, window.location.origin);
  // IMPORTANT: send the external DMN venue id (string), not a number
  url.searchParams.set('venue_id', String(venueId));
  if (activityId) url.searchParams.set('activity_id', String(activityId));
  if (allowDisabled) url.searchParams.set('allow_disabled', '1');

  const r = await fetch(url.toString(), { credentials: 'same-origin' });
  if (!r.ok) {
    let msg = 'Failed to load add-ons';
    try {
      const jj = await r.json();
      msg = jj?.message || msg;
    } catch {
      // Not JSON; keep the default message.
    }
    throw new Error(msg);
  }

  const jj = await r.json();
  return { data: jj?.data ?? [] };
}
