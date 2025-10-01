import React, { useMemo } from 'react';
import { useWidgetConfig, useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { useBookingTypes } from '../../hooks/useBookingTypes';
import { useVenues } from '../../hooks/useVenues';
import { createBooking, checkAvailability } from '../../../api/public';
import { Building, Calendar, Clock4, MicVocal, Rocket, User } from 'lucide-react';
import { fmt, fmtDate, toNum } from '../../utils/helpers';

type Sections = { booking?: boolean; details?: boolean; payment?: boolean };
type ReviewStepProps = { sections?: Sections };

export function Review({ sections }: ReviewStepProps) {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const { returnUrl, venueGroup } = useWidgetConfig();

  // venue label
  const { venues } = useVenues(venueGroup, false);
  const venueName = useMemo(
    () =>
      venues.find((v) => v._id === state.venueId)?.name ??
      venues.find((v) => v._id === state.venueId)?.title,
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

  // add-ons (display only)
  const selectedAddons = useMemo(
    () => state.addons.filter((p) => state.addonsSelected.includes(p.id)),
    [state.addons, state.addonsSelected],
  );

  // prices
  const perPerson = useMemo(() => toNum((selectedType as any)?.priceText), [selectedType]);
  const basePrice = useMemo(() => perPerson * (state.partySize ?? 0), [perPerson, state.partySize]);
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
      // 1) Re-validate exact slot
      const avail = await checkAvailability(
        {
          venue_id: state.venueId!,
          type: state.bookingType!,
          num_people: state.partySize!,
          date: state.date!,
          time: state.time!.padStart(5, '0'),
        },
        'time',
      );

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

      const p = (avail?.data?.payload ?? {}) as AvailPayload;
      if (!p.valid) throw new Error('Selected time is no longer valid. Choose another.');

      // 2) Redirect if payment OR pre-orders OR no API route
      const mustRedirect = !p.next?.api || !!p.depositRequired || p.preordersAvailable === true;
      if (mustRedirect) {
        const base = p.next?.web;
        if (!base) throw new Error('Redirect URL not available for this slot.');
        const ru =
          (document.querySelector('.review__button') as HTMLElement)?.dataset?.returnUrl ||
          returnUrl ||
          window.location.href;
        const url = `${base}${base.includes('?') ? '&' : '?'}return_url=${encodeURIComponent(ru)}`;
        window.location.assign(url);
        return;
      }

      // 3) Build booking payload from bookingDetails + customer (no add-ons/pre-orders)
      const bd = p.bookingDetails;
      if (!bd) throw new Error('Missing booking details for API submission.');

      const bookingPayload = {
        // bookingDetails
        venue_id: bd.venue_id,
        type: bd.type,
        date: bd.date,
        time: bd.time.padStart(5, '0'),
        num_people: bd.num_people,
        ...(bd.duration != null ? { duration: bd.duration } : {}),
        ...(bd.offer ? { offer: bd.offer } : {}),
        ...(bd.package ? { package: bd.package } : {}),

        // customer
        source: 'partner' as const,
        first_name: state.customer.first_name!,
        last_name: state.customer.last_name!,
        email: state.customer.email!,
        ...(state.customer.phone ? { phone: state.customer.phone } : {}),
        // ...(state.customer.dob ? { dob: state.customer.dob } : {}),
        ...(typeof (state.customer as any).newsletter === 'boolean'
          ? { newsletter_signup: (state.customer as any).newsletter }
          : {}),
        ...((state.customer as any).marketing_prefs?.length
          ? { marketing_preferences: (state.customer as any).marketing_prefs }
          : {}),
        ...(state.customer.message ? { notes: state.customer.message.trim() } : {}),
      };

      const res = await createBooking(bookingPayload);

      const nextWeb =
        res?.data?.next?.web ||
        res?.next?.web ||
        res?.data?.payment_url ||
        (res as any)?.payment_url ||
        null;

      if (nextWeb) {
        window.location.assign(String(nextWeb));
        return;
      }

      console.log('Booking confirmed. Confirmation sent by email.');
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
    <section className="review">
      {show.booking && (
        <section className="review__section">
          <h4 className="review__heading">Your booking</h4>
          <ul className="review__list">
            <li>
              <span>
                <User />
                Group
              </span>
              <strong>{state.partySize}</strong>
            </li>
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
              <strong>{state.time}</strong>
            </li>
            <li>
              <span>
                <Rocket />
                Experience
              </span>
              <strong>
                {selectedType?.name && (
                  <span dangerouslySetInnerHTML={{ __html: selectedType.name }} />
                )}
              </strong>
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
            <span>Base {state.partySize ? `(x${state.partySize})` : ''}</span>
            <strong>{fmt(basePrice)}</strong>
          </div>

          {selectedAddons.length > 0 && (
            <div className="review__addons">
              {selectedAddons.map((a) => (
                <div key={a.id} className="review__row">
                  <MicVocal />
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
    </section>
  );
}
