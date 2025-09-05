import React, { useEffect, useState } from 'react';
import { StepShell } from '../StepShell';
import { useWidgetConfig, useWidgetDispatch, useWidgetState } from '../../WidgetProvider';

export function ReviewStep() {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const { returnUrl } = useWidgetConfig();

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const deadline = Date.now() + 10 * 60 * 1000; // 10 min
    dispatch({ type: 'START_REVIEW_TIMER', deadline });
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []); // only when mounted

  const remainingSec = Math.max(0, Math.floor(((state.reviewDeadline || 0) - now) / 1000));
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');
  const expired = remainingSec <= 0;

  async function onConfirm() {
    if (expired) {
      dispatch({ type: 'ERROR', message: 'Your selection expired. Please re-check availability.' });
      return;
    }
    if (!state.venueId || !state.partySize || !state.date || !state.time || !state.bookingType) {
      dispatch({ type: 'ERROR', message: 'Missing details. Please complete all steps.' });
      return;
    }
    const packageLabels = state.packages
      .filter((p) => state.packagesSelected.includes(p.id))
      .map((p) => p.label)
      .join(', ');
    const [first_name, ...rest] = (state.customer.name || '').trim().split(/\s+/);
    const last_name = rest.join(' ');

    try {
      const resp = await fetch('/wp-json/dmn/v1/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_id: state.venueId,
          type: state.bookingType,
          date: state.date,
          time: state.time,
          num_people: state.partySize,
          customer: {
            first_name,
            last_name,
            email: state.customer.email,
            phone: state.customer.phone,
          },
          package: packageLabels,
          custom_field_value: packageLabels,
          return_url: returnUrl,
        }),
      });
      const json = await resp.json();
      const nextWeb = json?.data?.next?.web || json?.next?.web;
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
      1. Please confirm your details below.
      <br />
      2. Click "Continue to payment" to finalize your booking.
      <br />
      3. You will be redirected to our secure payment page.
      <br />
      <br />
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
      <p className={`dmn-widget__countdown${expired ? ' is-expired' : ''}`}>
        Hold expires in{' '}
        <strong>
          {mm}:{ss}
        </strong>
      </p>
    </StepShell>
  );
}
