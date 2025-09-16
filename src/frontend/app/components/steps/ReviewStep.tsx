import React, { useEffect, useState } from 'react';
import { StepShell } from '../StepShell';
import { useWidgetConfig, useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { createBooking } from '../../../api/public';

export function ReviewStep() {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const { returnUrl } = useWidgetConfig();

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // I start a 10-minute hold when this step mounts.
    const deadline = Date.now() + 10 * 60 * 1000;
    dispatch({ type: 'START_REVIEW_TIMER', deadline });
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [dispatch]);

  const remainingSec = Math.max(0, Math.floor(((state.reviewDeadline || 0) - now) / 1000));
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');
  const expired = remainingSec <= 0;

  async function onConfirm() {
    if (expired) {
      dispatch({ type: 'ERROR', message: 'Your selection expired. Please re-check availability.' });
      return;
    }

    if (
      !state.venueId ||
      !state.partySize ||
      !state.date ||
      !state.time ||
      !state.bookingType ||
      !state.customer.name ||
      !state.customer.email
    ) {
      dispatch({ type: 'ERROR', message: 'Missing details. Please complete all steps.' });
      return;
    }

    // I split the name into first/last for the DMN API.
    const [first_name, ...rest] = (state.customer.name || '').trim().split(/\s+/);
    const last_name = rest.join(' ');

    // I join selected package labels into a single string (shown on the DMN side).
    const packageLabels = state.packages
      .filter((p) => state.packagesSelected.includes(p.id))
      .map((p) => p.label)
      .join(', ');

    try {
      const res = await createBooking({
        source: 'partner',
        first_name,
        last_name,
        email: state.customer.email,
        phone: state.customer.phone,
        notes: state.customer.message || undefined,
        num_people: state.partySize!,
        type: state.bookingType!,
        venue_id: state.venueId!,
        date: state.date!,
        time: state.time!,
        // I mirror packages to both `package` and `custom_field_value` for venue visibility.
        package: packageLabels || undefined,
        custom_field_value: packageLabels || undefined,
        // DMN will redirect here after payment/confirmation.
        // (Your WP REST layer passes this through to DMN.)
        // @see public.ts -> createBooking
        // @see PHP PublicController for request proxy
        ...(returnUrl ? { return_url: returnUrl } : {}),
      });

      const nextWeb =
        // prefer payload shape
        (res as any)?.payload?.next?.web ||
        // some handlers bubble `data` like your old fetch
        (res as any)?.data?.next?.web ||
        // extremely defensive
        (res as any)?.next?.web;

      if (nextWeb) {
        window.location.assign(nextWeb);
      } else {
        dispatch({ type: 'ERROR', message: 'Booking created but no redirect URL returned.' });
      }
    } catch (e: any) {
      dispatch({ type: 'ERROR', message: e?.message || 'Failed to create booking.' });
    }
  }

  return (
    <StepShell className="review">
      <h5 className="dmn-widget__title">Review your booking</h5>
      <ol className="dmn-widget__instructions">
        <li>Please confirm your details below.</li>
        <li>Click “Continue to payment” to finalise your booking.</li>
        <li>You’ll be redirected to our secure payment page.</li>
      </ol>

      <ul className="dmn-widget__summary">
        <li>
          Venue: <code>{state.venueId}</code>
        </li>
        <li>Guests: {state.partySize}</li>
        <li>Date: {state.date}</li>
        <li>Time: {state.time}</li>
        <li>Experience: {state.bookingType}</li>
        <li>
          Packages:{' '}
          {state.packages
            .filter((p) => state.packagesSelected.includes(p.id))
            .map((p) => p.label)
            .join(', ') || 'None'}
        </li>
        <li>
          Name/Email: {state.customer.name} / {state.customer.email}
        </li>
      </ul>

      <div className="dmn-widget__promo">
        <div className="dmn-widget__promo-item">
          <img src="/path/to/promo1.jpg" alt="" />
          <div>
            <strong>Summer specials</strong> — Save 10% on midweek bookings
          </div>
        </div>
      </div>

      <details className="dmn-widget__faq">
        <summary>Can I change my booking later?</summary>
        <p>Contact the venue via your confirmation email.</p>
      </details>

      <details className="dmn-widget__faq">
        <summary>What if I’m running late?</summary>
        <p>Please let the venue know; policies vary.</p>
      </details>

      <p
        className={`dmn-widget__countdown${expired ? ' is-expired' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        Hold expires in{' '}
        <strong>
          {mm}:{ss}
        </strong>
      </p>

      <div className="dmn-widget__actions">
        <button
          type="button"
          className="dmn-widget__button dmn-widget__button--primary"
          onClick={onConfirm}
          disabled={expired}
        >
          Continue to payment
        </button>
      </div>
    </StepShell>
  );
}
