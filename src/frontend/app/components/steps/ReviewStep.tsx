import React, { useMemo } from 'react';
import { StepShell } from '../StepShell';
import { useWidgetConfig, useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { useBookingTypes } from '../../hooks/useBookingTypes';
import { useVenues } from '../../hooks/useVenues';
import { getNextWebUrl } from '../../utils/checkout';
import { createBooking } from '../../../api/public';
import { Building, Calendar, Clock4, Rocket, User } from 'lucide-react';

type Sections = { booking?: boolean; details?: boolean; payment?: boolean };
type ReviewStepProps = { sections?: Sections };

// Robust money parser: grabs first signed decimal, strips commas/symbols
const toNum = (text?: string | null) => {
  if (!text) return 0;
  const clean = String(text).replace(/,/g, '');
  const m = clean.match(/-?\d+(?:\.\d{1,2})?/);
  const n = m ? Number(m[0]) : 0;
  return Number.isFinite(n) ? n : 0;
};
const fmt = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n || 0);

function fmtDate(d?: string | null) {
  if (!d) return '—';
  const [y, m, day] = d.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, day ?? 1));
  return dt.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
} // 9:5 -> 09:05

export function ReviewStep({ sections }: ReviewStepProps) {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const { returnUrl, venueGroup } = useWidgetConfig();

  // venue label
  const { venues } = useVenues(venueGroup, false);
  const venueName = useMemo(
    () =>
      venues.find((v) => v._id === state.venueId)?.name ??
      venues.find((v) => v._id === state.venueId)?.title ??
      '—',
    [venues, state.venueId],
  );

  // booking type
  const { types } = useBookingTypes({
    venueId: state.venueId ?? null,
    date: state.date ?? null,
    partySize: state.partySize ?? null,
    enabled: !!state.venueId && !!state.date && !!state.time,
  });
  const selectedType = useMemo(
    () => types.find((t) => t.id === state.bookingType) || null,
    [types, state.bookingType],
  );

  // add-ons
  const selectedAddons = useMemo(
    () => state.packages.filter((p) => state.packagesSelected.includes(p.id)),
    [state.packages, state.packagesSelected],
  );

  // prices
  const basePrice = useMemo(() => toNum((selectedType as any)?.priceText), [selectedType]);
  const addonsTotal = useMemo(
    () => selectedAddons.reduce((s, p) => s + toNum(p.priceText), 0),
    [selectedAddons],
  );
  const grandTotal = useMemo(() => basePrice + addonsTotal, [basePrice, addonsTotal]);

  // enable only when inputs are set
  const disabled =
    !state.venueId ||
    !state.partySize ||
    !state.date ||
    !state.time ||
    !state.bookingType ||
    !state.customer.first_name ||
    !state.customer.last_name ||
    !state.customer.email;

  async function handleContinue() {
    try {
      // 1) Build notes: customer message + selected add-ons
      const selectedAddons = state.packages.filter((p) => state.packagesSelected.includes(p.id));
      const addonsLine =
        selectedAddons.length > 0
          ? `Add-ons: ${selectedAddons
              .map((a) => `${a.name}${a.priceText ? ` (${a.priceText})` : ''}`)
              .join(', ')}.`
          : '';
      const userMsg = (state.customer.message || '').trim();
      const notes = [userMsg, addonsLine].filter(Boolean).join(' ');

      // 2) Create booking via WP → DMN /v4/bookings
      const payload = {
        source: 'partner' as const,
        venue_id: state.venueId!,
        type: state.bookingType!,
        date: state.date!,
        time: state.time!.padStart(5, '0'),
        num_people: state.partySize!,
        first_name: state.customer.first_name!,
        last_name: state.customer.last_name!,
        email: state.customer.email || undefined,
        phone: state.customer.phone || undefined,
        notes: notes || undefined,
      };

      const res = await createBooking(payload);

      // 3) Redirect for payment if required (prefer explicit payment URL / next.web)
      const nextWeb =
        res?.data?.next?.web ||
        res?.next?.web ||
        res?.data?.payment_url ||
        res?.payment_url ||
        null;

      if (nextWeb) {
        window.location.assign(String(nextWeb));
        return;
      }

      // 4) No payment needed → show a simple confirmation UX (you can replace with your own)
      // dispatch({
      //   type: 'NOTICE',
      //   message: 'Booking confirmed! Check your email for confirmation.',
      // });
      console.log('Booking confirmed! Check your email for confirmation.');
    } catch (err) {
      dispatch({
        type: 'ERROR',
        message: err instanceof Error ? err.message : 'Booking failed. Please try again.',
      });
    }
  }

  const show = {
    booking: sections?.booking ?? true,
    details: sections?.details ?? true,
    payment: sections?.payment ?? true,
  };

  return (
    <StepShell className="review">
      {show.booking && (
        <section className="review__section">
          <h4 className="review__heading">Your booking</h4>
          <ul className="review__list">
            <li>
              <span>
                <Building />
                Venue
              </span>
              <strong>{venueName}</strong>
            </li>
            <li>
              <span>
                <Calendar />
                Date
              </span>
              <strong>{fmtDate(state.date)}</strong>
            </li>
            <li>
              <span>
                <Clock4 />
                Time
              </span>
              <strong>{state.time || '—'}</strong>
            </li>
            <li>
              <span>
                <User />
                Guests
              </span>
              <strong>{state.partySize ?? '—'}</strong>
            </li>
            <li>
              <span>
                <Rocket />
                Experience
              </span>
              <strong>{selectedType?.name || '—'}</strong>
            </li>
          </ul>
        </section>
      )}

      {show.details && (
        <section className="review__section">
          <h4 className="review__heading">Your details</h4>
          <ul className="review__list">
            <li>
              <span>Name</span>
              <strong>
                {state.customer.first_name} {state.customer.last_name}
              </strong>
            </li>
            <li>
              <span>Email</span>
              <strong>{state.customer.email}</strong>
            </li>
            {state.customer.phone && (
              <li>
                <span>Phone</span>
                <strong>{state.customer.phone}</strong>
              </li>
            )}
            {state.customer.message && (
              <li>
                <span>Notes</span>
                <strong>{state.customer.message}</strong>
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="review__section">
        <h4 className="review__heading">Summary</h4>
        <div className="review__price">
          <div className="review__row">
            <span>Base</span>
            <strong>{fmt(basePrice)}</strong>
          </div>

          {selectedAddons.length > 0 && (
            <div className="review__addons">
              {selectedAddons.map((a) => (
                <div key={a.id} className="review__row">
                  <span>{a.name}</span>
                  <strong>{fmt(toNum(a.priceText))}</strong>
                </div>
              ))}
              <div className="review__row review__row--subtotal">
                <span>Add-ons</span>
                <strong>{fmt(addonsTotal)}</strong>
              </div>
            </div>
          )}

          <h6 className="review__row review__row--total">
            <span>Total</span>
            <strong>{fmt(grandTotal)}</strong>
          </h6>
        </div>
      </section>

      {show.payment && (
        <button
          type="button"
          className="review__button"
          onClick={handleContinue}
          disabled={disabled}
          data-return-url={returnUrl || undefined}
        >
          Continue to payment
        </button>
      )}
    </StepShell>
  );
}
