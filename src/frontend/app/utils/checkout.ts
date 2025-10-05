// src/frontend/app/helpers/checkout.ts
import { checkAvailability, createBooking, getReturnUrl } from '../../api/public';

type BookingCustomer = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message?: string;
  // optional extras passed through verbatim if present
  newsletter?: boolean;
  marketing_prefs?: unknown[];
  [k: string]: unknown;
};

type WidgetState = {
  venueId?: string | null;
  partySize?: number | null;
  date?: string | null;
  time?: string | null;
  bookingType?: string | null;
  customer: BookingCustomer;
};

type ErrorDispatch = (action: { type: 'ERROR'; message: string }) => void;

type NextInfo = { api?: boolean; web?: string | null };
type BookingDetails = {
  venue_id: string;
  type: string;
  date: string;
  time: string;
  num_people: number;
  duration?: number;
  offer?: string;
  package?: string;
};
type AvailPayload = {
  valid: boolean;
  next?: NextInfo;
  depositRequired?: unknown;
  preordersAvailable?: boolean;
  bookingDetails?: BookingDetails;
};

export async function continueCheckout(opts: {
  state: WidgetState;
  returnUrl?: string | null;
  buttonSelector?: string; // defaults to '.review__button'
  dispatch?: ErrorDispatch;
}): Promise<void> {
  const { state, returnUrl, buttonSelector = '.review__button', dispatch } = opts;

  try {
    const avail = await checkAvailability(
      {
        venue_id: state.venueId!,
        type: state.bookingType!,
        num_people: state.partySize!,
        date: state.date!,
        time: String(state.time!).padStart(5, '0'),
      },
      'time',
    );

    const p = (avail?.data?.payload ?? {}) as AvailPayload;
    if (!p.valid) throw new Error('Selected time is no longer valid. Choose another.');
    const perVenue = state.venueId ? ((await getReturnUrl(state.venueId)).url ?? '') : '';
    const ru =
      (document.querySelector(buttonSelector) as HTMLElement | null)?.dataset?.returnUrl ||
      perVenue ||
      returnUrl || // allow widget-level default
      window.location.href; // final fallback

    const mustRedirect = !p.next?.api || !!p.depositRequired || p.preordersAvailable === true;
    if (mustRedirect) {
      const base = p.next?.web;
      if (!base) throw new Error('Redirect URL not available for this slot.');
      const url = `${base}${base.includes('?') ? '&' : '?'}return_url=${encodeURIComponent(ru)}`;
      window.location.assign(url);
      return;
    }

    const bd = p.bookingDetails;
    if (!bd) throw new Error('Missing booking details for API submission.');

    const bookingPayload = {
      venue_id: bd.venue_id,
      type: bd.type,
      date: bd.date,
      time: bd.time.padStart(5, '0'),
      num_people: bd.num_people,
      ...(bd.duration != null ? { duration: bd.duration } : {}),
      ...(bd.offer ? { offer: bd.offer } : {}),
      ...(bd.package ? { package: bd.package } : {}),
      source: 'partner' as const,
      first_name: state.customer.first_name!,
      last_name: state.customer.last_name!,
      email: state.customer.email!,
      ...(state.customer.phone ? { phone: state.customer.phone } : {}),
      ...(typeof state.customer.newsletter === 'boolean'
        ? { newsletter_signup: state.customer.newsletter }
        : {}),
      ...(Array.isArray(state.customer.marketing_prefs) && state.customer.marketing_prefs.length
        ? { marketing_preferences: state.customer.marketing_prefs }
        : {}),
      ...(state.customer.message ? { notes: state.customer.message.trim() } : {}),
      return_url: returnUrl || window.location.href,
    };

    const res = await createBooking(bookingPayload);

    const nextWeb =
      res?.data?.next?.web ||
      (res as any)?.next?.web ||
      res?.data?.payment_url ||
      (res as any)?.payment_url ||
      null;

    if (nextWeb) {
      window.location.assign(String(nextWeb));
      return;
    }

    console.log('Booking confirmed. Confirmation sent by email.');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Booking failed. Please try again.';
    if (dispatch) dispatch({ type: 'ERROR', message: msg });
    else throw err;
  }
}
