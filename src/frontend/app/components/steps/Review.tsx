import React, { useMemo, useState } from 'react';
import { useWidgetConfig, useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { Building, Calendar, Clock4, MicVocal, Rocket, User } from 'lucide-react';
import { fmt, fmtDate, toNum } from '../../utils/helpers';
import { continueCheckout } from '../../utils/checkout';
import CircularProgress from '@mui/material/CircularProgress';

type ReviewStepProps = {
  sections?: { booking?: boolean; details?: boolean; payment?: boolean };
  venues: any[];
  types?: any[];
};

export function Review({ sections, venues, types = [] }: ReviewStepProps) {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const { returnUrl } = useWidgetConfig();

  const [submitting, setSubmitting] = useState(false);

  const venueName = useMemo(
    () =>
      venues.find((v) => v._id === state.venueId)?.name ??
      venues.find((v) => v._id === state.venueId)?.title,
    [venues, state.venueId],
  );

  const selectedType = useMemo(
    () => types.find((t) => t.id === state.bookingType) || null,
    [types, state.bookingType],
  );

  const selectedAddons = useMemo(
    () => state.addons.filter((p) => state.addonsSelected.includes(p.id)),
    [state.addons, state.addonsSelected],
  );

  const perPerson = useMemo(() => toNum(selectedType?.priceText), [selectedType]);
  const basePrice = useMemo(() => perPerson * (state.partySize ?? 0), [perPerson, state.partySize]);
  const addonsTotal = useMemo(
    () => selectedAddons.reduce((s, p) => s + toNum(p.priceText), 0),
    [selectedAddons],
  );
  const grandTotal = useMemo(() => basePrice + addonsTotal, [basePrice, addonsTotal]);

  const disabled =
    !state.venueId ||
    !state.partySize ||
    !state.date ||
    !state.time ||
    !state.bookingType ||
    !state.customer.first_name ||
    !state.customer.last_name ||
    !state.customer.email ||
    !state.customer.phone;

  const handleContinue = async () => {
    if (disabled || submitting) return;
    try {
      setSubmitting(true);
      await continueCheckout({ state, returnUrl, dispatch });
      // likely redirects; if not, we'll re-enable below
    } finally {
      setSubmitting(false);
    }
  };

  const show = {
    booking: sections?.booking ?? true,
    details: sections?.details ?? true,
    payment: sections?.payment ?? true,
  };

  const timeRange = useMemo(() => {
    if (!state.time) return '';
    let s = String(state.time);
    try {
      s = decodeURIComponent(s);
    } catch {}
    const m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return s;
    const h = parseInt(m[1], 10);
    const mm = m[2];
    const endH = (h + 1) % 24;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${mm} to ${pad(endH)}:${mm}`;
  }, [state.time]);

  return (
    <section className="review">
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
                <User />
                Group
              </span>
              <strong>{state.partySize}</strong>
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
              <strong>{timeRange || state.time}</strong>
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
          disabled={disabled || submitting}
          aria-busy={submitting}
          data-return-url={returnUrl || undefined}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {submitting ? (
            <>
              <CircularProgress size={18} thickness={5} />
              <span>Processing…</span>
            </>
          ) : (
            <span>Continue to payment</span>
          )}
        </button>
      )}
    </section>
  );
}
