import React, { useMemo } from 'react';
import { StepShell } from '../StepShell';
import { useWidgetConfig, useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { useBookingTypes } from '../../hooks/useBookingTypes';
import { useVenues } from '../../hooks/useVenues';

// Helper: format YYYY-MM-DD as UK date
function fmtDate(d?: string | null) {
  if (!d) return '—';
  // Safe formatting without timezone shift
  const [y, m, day] = d.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, day ?? 1));
  return dt.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function ReviewStep() {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const { venueGroup, returnUrl } = useWidgetConfig();

  // Resolve venue label
  const { venues } = useVenues(venueGroup, false);
  const venueName = useMemo(
    () => venues.find((v: any) => v._id === state.venueId)?.title || '—',
    [venues, state.venueId],
  );

  // Resolve type label
  const { types } = useBookingTypes({
    venueId: state.venueId ?? null,
    date: state.date ?? null,
    partySize: state.partySize ?? null,
    enabled: !!state.venueId && !!state.date && state.partySize != null,
  });
  const typeName = useMemo(
    () => types.find((t: any) => t.id === state.bookingType)?.name || '—',
    [types, state.bookingType],
  );

  const dateText = fmtDate(state.date);
  const timeText = state.time || '—';
  const partyText = state.partySize ?? '—';

  const fullName =
    `${state.customer.first_name || ''} ${state.customer.last_name || ''}`.trim() || '—';
  const email = state.customer.email || '—';
  const phone = state.customer.phone || '—';
  const notes = state.customer.message || '—';

  const packagesSelected = state.packagesSelected || [];
  const hasPackages = packagesSelected.length > 0;

  // Optional: disable if any upstream guard fails (defensive)
  const disabled =
    !state.venueId ||
    !state.partySize ||
    !state.date ||
    !state.time ||
    !state.bookingType ||
    !state.customer.first_name ||
    !state.customer.last_name ||
    !state.customer.email ||
    !state.customer.gdpr;

  const onBack = () => dispatch({ type: 'BACK' });
  const onConfirm = () => {
    // Keep existing submission path wired elsewhere in your app.
    // If you already call availability/booking here, keep that logic.
    dispatch({ type: 'NEXT' });
  };

  return (
    <StepShell className="review">
      <h2 className="dmn-widget__heading">Review your booking</h2>

      <section className="review__section">
        <h3 className="review__title">Booking</h3>
        <ul className="review__list">
          <li>
            <strong>Venue:</strong> {venueName}
          </li>
          <li>
            <strong>Party size:</strong> {partyText}
          </li>
          <li>
            <strong>Date:</strong> {dateText}
          </li>
          <li>
            <strong>Time:</strong> {timeText}
          </li>
          <li>
            <strong>Experience:</strong> {typeName}
          </li>
        </ul>
      </section>

      <section className="review__section">
        <h3 className="review__title">Your details</h3>
        <ul className="review__list">
          <li>
            <strong>Name:</strong> {fullName}
          </li>
          <li>
            <strong>Email:</strong> {email}
          </li>
          <li>
            <strong>Phone:</strong> {phone}
          </li>
          <li>
            <strong>Special requests:</strong> {notes}
          </li>
        </ul>
      </section>

      {hasPackages && (
        <section className="review__section">
          <h3 className="review__title">Add-ons</h3>
          <ul className="review__list">
            {packagesSelected.map((p: any) => (
              <li key={p.id}>
                <strong>{p.name}</strong>
                {p.priceText ? ` — ${p.priceText}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="dmn-widget__actions">
        <button
          type="button"
          className="dmn-widget__button dmn-widget__button--secondary"
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          className="dmn-widget__button dmn-widget__button--primary"
          onClick={onConfirm}
          disabled={disabled}
          data-return-url={returnUrl || undefined}
        >
          Continue
        </button>
      </div>
    </StepShell>
  );
}
