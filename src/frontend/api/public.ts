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
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm or ISO if your proxy accepts
  type?: string; // DMN type id
  duration?: number; // hours (decimal) if you use it
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

export type CreateBookingPayload = {
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
  preorder_details?: string[];
  preorder?: string[];
};

export async function createBooking(payload: CreateBookingPayload) {
  const clean: CreateBookingPayload = {
    ...payload,
  };

  const res = await fetch('/wp-json/dmn/v1/create-booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(clean),
  });

  if (!res.ok) {
    // try to surface API error text
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Booking failed');
  }
  return res.json();
}

/* ---------- Addons ---------- */

export async function getAddons(venueId: string, activityId?: string) {
  const base = (window as any).__DMN_API_BASE__ || '/wp-json/dmn/v1';
  if (!venueId) {
    throw new Error('Missing venue id');
  }

  const url = new URL(`${base}/addons`, window.location.origin);
  // IMPORTANT: send the external DMN venue id (string), not a number
  url.searchParams.set('venue_id', String(venueId));
  if (activityId) url.searchParams.set('activity_id', String(activityId));

  const r = await fetch(url.toString(), { credentials: 'same-origin' });
  if (!r.ok) {
    let msg = 'Failed to load add-ons';
    try {
      const j = await r.json();
      msg = j?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  const j = await r.json();
  return { data: j?.data ?? [] };
}

// public.ts

/** Base fetch for public endpoints */
async function wpPublicFetch<T = any>(slug: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/wp-json/dmn/v1/public/${slug}`, {
    method: init.method || 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    body: init.body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

/** Get FAQs for a venue */
export async function getFaqs(
  venue_id: number | string,
): Promise<{ faqs: Array<{ question: string; answer: string }> }> {
  return wpPublicFetch(`faqs?venue_id=${encodeURIComponent(String(venue_id))}`);
}

/** Get Large Group link config for a venue */
export async function getLargeGroupLink(
  venue_id: number | string,
): Promise<{ enabled: boolean; minSize: number; label: string; url: string }> {
  return wpPublicFetch(`large-group-link?venue_id=${encodeURIComponent(String(venue_id))}`);
}

/** Convenience: fetch both in parallel */
export async function getFaqsAndLink(venue_id: number | string): Promise<{
  faqs: Array<{ question: string; answer: string }>;
  largeGroup: { enabled: boolean; minSize: number; label: string; url: string };
}> {
  const [faqsRes, linkRes] = await Promise.all([getFaqs(venue_id), getLargeGroupLink(venue_id)]);
  return { faqs: faqsRes.faqs ?? [], largeGroup: linkRes };
}
