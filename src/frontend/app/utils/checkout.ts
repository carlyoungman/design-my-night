// src/frontend/app/helpers/checkout.ts
import { checkAvailability, getReturnUrl } from '../../api/public';

// ——— Types ———
export type BookingCustomer = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message?: string;
  newsletter?: boolean;
  marketing_prefs?: unknown[];
  [k: string]: unknown;
};

export type WidgetState = {
  venueId?: string | null;
  partySize?: number | null;
  date?: string | null;
  time?: string | null;
  bookingType?: string | null;
  duration?: number | null; // ← add duration to state
  customer: BookingCustomer;
};

export type ErrorDispatch = (action: { type: 'ERROR'; message: string }) => void;

// API shapes from DMN responses
export type NextInfo = { api?: boolean; web?: string | null };
export type BookingDetails = {
  venue_id: string;
  type: string;
  date: string;
  time: string; // HH:mm
  num_people: number;
  duration?: number; // minutes
  offer?: string;
  package?: string;
};
export type AvailPayload = {
  valid: boolean;
  next?: NextInfo;
  depositRequired?: unknown;
  preordersAvailable?: boolean;
  bookingDetails?: BookingDetails;
};

// ——— Small helpers ———
const decodeMaybe = (v: string) => {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
};

const normalizeTime = (t: string): string => {
  const s = decodeMaybe(String(t));
  if (/^\d{2}:\d{2}$/.test(s)) return s; // already HH:mm
  if (/^\d{1}:\d{2}$/.test(s)) return s.padStart(5, '0'); // H:mm -> HH:mm
  if (/^\d{4}$/.test(s)) return `${s.slice(0, 2)}:${s.slice(2)}`; // HHmm -> HH:mm
  const digits = s.replace(/\D/g, '');
  if (digits.length >= 3) return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  return s.padStart(5, '0');
};

const resolveReturnUrl = async (
  venueId: string | null | undefined,
  explicitReturnUrl: string | null | undefined,
  buttonSelector: string,
): Promise<string> => {
  const fromButton = (document.querySelector(buttonSelector) as HTMLElement | null)?.dataset
    ?.returnUrl;
  const perVenue = venueId ? ((await getReturnUrl(venueId)).url ?? '') : '';
  return fromButton || perVenue || explicitReturnUrl || window.location.href;
};

// src/frontend/app/helpers/checkout.ts

function buildRedirectUrl(
  base: string,
  params: Record<string, unknown>,
  urlParams?: Record<string, string>,
): string {
  // Parse base, including its existing query string
  const url = new URL(base, window.location.origin);
  const search = new URLSearchParams(url.search);

  // Merge booking params: overwrite any existing values from `base`
  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;
    search.set(key, String(value));
  });

  // Extra URL params from config.urlParams; do NOT override booking fields
  if (urlParams) {
    Object.entries(urlParams).forEach(([key, value]) => {
      if (value == null) return;
      if (!search.has(key)) {
        search.set(key, String(value));
      }
    });
  }

  url.search = search.toString();
  return url.toString();
}

const ensureRequiredState = (state: WidgetState) => {
  const venue_id = state.venueId ?? null;
  const type = state.bookingType ?? null;
  const num_people = state.partySize ?? null;
  const date = state.date ?? null;
  const time = state.time ? normalizeTime(state.time) : null;

  if (!venue_id) throw new Error('Missing venue');
  if (!type) throw new Error('Missing booking type');
  if (!num_people) throw new Error('Missing party size');
  if (!date) throw new Error('Missing date');
  if (!time) throw new Error('Missing time');

  return { venue_id, type, num_people, date, time } as const;
};
const normalizeDate = (d: string): string => d.split('T')[0] || d;
const buildBookingPayload = (
  bd: BookingDetails,
  customer: BookingCustomer,
  return_url: string,
  durationOverride?: number | null,
) => {
  const resolvedDuration =
    typeof durationOverride === 'number' && durationOverride > 0
      ? durationOverride
      : typeof bd.duration === 'number' && bd.duration > 0
        ? bd.duration
        : undefined;

  return {
    venue_id: bd.venue_id,
    type: bd.type,
    date: normalizeDate(bd.date), // ← strip the time part
    time: normalizeTime(bd.time),
    num_people: bd.num_people,
    ...(resolvedDuration != null ? { duration: resolvedDuration } : {}),
    ...(bd.offer ? { offer: bd.offer } : {}),
    ...(bd.package ? { package: bd.package } : {}),
    source: 'partner' as const,
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    ...(customer.phone ? { phone: customer.phone } : {}),
    ...(typeof customer.newsletter === 'boolean' ? { newsletter_signup: customer.newsletter } : {}),
    ...(Array.isArray(customer.marketing_prefs) && customer.marketing_prefs.length
      ? { marketing_preferences: customer.marketing_prefs }
      : {}),
    ...(customer.message ? { notes: String(customer.message).trim() } : {}),
    return_url,
  };
};

// ——— Main ———
// ——— Main ———
export async function continueCheckout(opts: {
  state: WidgetState;
  returnUrl?: string | null;
  urlParams?: Record<string, string>;
  buttonSelector?: string;
}): Promise<void> {
  const {
    state,
    returnUrl,
    urlParams, // ← include urlParams here
    buttonSelector = '.review__button',
  } = opts;

  try {
    // 1) Validate inputs up front
    const required = ensureRequiredState(state);
    const stateDuration =
      typeof state.duration === 'number' && state.duration > 0 ? state.duration : undefined;

    // 2) Availability check using normalized time (+ duration if present)
    const avail = await checkAvailability(
      {
        venue_id: required.venue_id,
        type: required.type,
        num_people: required.num_people,
        date: required.date,
        time: required.time,
        ...(stateDuration ? { duration: stateDuration } : {}),
      },
      'time',
    );

    const p = (avail?.data?.payload ?? {}) as AvailPayload;
    if (!p.valid) throw new Error('Selected time is no longer valid. Choose another.');

    // 3) Resolve single source of truth for return_url
    const ru = await resolveReturnUrl(state.venueId ?? null, returnUrl ?? null, buttonSelector);

    // 4) Redirect with full booking params in query
    if (!p.bookingDetails) throw new Error('Missing booking details for web submission.');
    const payload = buildBookingPayload(p.bookingDetails, state.customer, ru, stateDuration);
    const base = p.next?.web;
    if (!base) throw new Error('Redirect URL not available for this slot.');

    // IMPORTANT: pass urlParams into the URL builder
    const url = buildRedirectUrl(base, payload, urlParams); // ← use urlParams here
    window.location.assign(url);
    return;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Booking failed. Please try again.';
    // (log or dispatch msg if needed)
  }
}
