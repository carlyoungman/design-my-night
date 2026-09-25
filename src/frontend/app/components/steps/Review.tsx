import React, { useId, useMemo, useState, useCallback, useRef } from 'react';
import { useWidgetConfig, useWidgetDispatch, useWidgetState } from '@app/WidgetProvider';
import { Building, Calendar, Clock4, Rocket, User } from 'lucide-react';
import { fmt, fmtDate, toNum } from '@app/utils/helpers';
import { continueCheckout } from '@app/utils/checkout';
import { isStepDone, STEPS } from '@app/utils/steps';
import { validateCustomer } from '@app/utils/validation';
import { StateMessage } from '@app/components/StateMessage';
import { useErrorToast } from '@app/components/Toasts';

type ReviewStepProps = {
  sections?: { booking?: boolean; details?: boolean; payment?: boolean };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  venues: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  types?: any[];
};

const friendly = (msg: string) =>
  /^HTTP \d+/.test(msg) || /fetch|network/i.test(msg)
    ? 'We couldn’t reach the booking service. Check your connection and try again.'
    : msg;

export function Review({ sections, venues, types = [] }: ReviewStepProps) {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const { returnUrl, urlParams } = useWidgetConfig();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const uid = useId();
  const headingId = `${uid}-heading`;
  const missingId = `${uid}-missing`;

  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const submitError = useErrorToast();
  // Try again in the toast continues with the details as they are then.
  const continueRef = useRef<() => void>(() => {});

  const venueName = useMemo(() => {
    const selected = venues.find((v) => v._id === state.venueId);
    return selected?.name ?? selected?.title ?? '';
  }, [venues, state.venueId]);

  const selectedType = useMemo(
    () => types.find((t) => t.id === state.bookingType) || null,
    [types, state.bookingType],
  );

  // Base pricing:
  // - per_person: unit * partySize
  // - per_room: unit (no multiplication)
  const unitPrice = useMemo(() => toNum(selectedType?.priceText), [selectedType]);

  const basePrice = useMemo(() => {
    const mode = selectedType?.price_mode;
    if (mode === 'display') return 0;
    if (!unitPrice) return 0;

    const size = state.partySize ?? 0;
    return mode === 'per_room' ? unitPrice : unitPrice * size;
  }, [unitPrice, selectedType?.price_mode, state.partySize]);

  // Booking steps (everything except details) that still need doing.
  const missingSteps = useMemo(
    () => STEPS.filter((s) => s.key !== 'details' && !isStepDone(s.key, state)),
    [state],
  );
  const detailErrors = useMemo(() => validateCustomer(state.customer), [state.customer]);
  const detailErrorCount = Object.keys(detailErrors).length;

  const handleContinue = useCallback(async () => {
    if (missingSteps.length || submitting || redirecting) return;
    submitError.clear();

    // Validate the details step; show every error and move focus to the first one.
    if (detailErrorCount > 0) {
      dispatch({ type: 'ATTEMPT_DETAILS' });
      requestAnimationFrame(() => {
        const root = buttonRef.current?.closest('.dmn-widget');
        root?.querySelector<HTMLElement>('[data-step="details"] [aria-invalid="true"]')?.focus();
      });
      return;
    }

    try {
      setSubmitting(true);
      await continueCheckout({ state, returnUrl, urlParams });
      // The browser is now navigating to DesignMyNight's checkout.
      setRedirecting(true);
    } catch (e) {
      submitError.show(
        friendly(e instanceof Error ? e.message : 'We couldn’t start your booking.'),
        {
          description: 'Your details have been kept.',
          action: { label: 'Try again', onClick: () => continueRef.current() },
        },
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    missingSteps.length,
    submitting,
    redirecting,
    detailErrorCount,
    submitError,
    dispatch,
    state,
    returnUrl,
    urlParams,
  ]);
  continueRef.current = handleContinue;

  const show = {
    booking: sections?.booking ?? true,
    details: sections?.details ?? true,
    payment: sections?.payment ?? true,
  };

  const timeRange = useMemo(() => {
    if (!state.time) return '';
    const match = String(state.time).match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return state.time;

    const [, hStr, mStr] = match;
    const startH = parseInt(hStr, 10);
    const startM = parseInt(mStr, 10);
    const duration = state.duration ?? 0;
    if (duration <= 0) return state.time;

    const totalStartMin = startH * 60 + startM;
    const totalEndMin = totalStartMin + duration;
    const endH = Math.floor(totalEndMin / 60) % 24;
    const endM = totalEndMin % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(startH)}:${pad(startM)} to ${pad(endH)}:${pad(endM)}`;
  }, [state.time, state.duration]);

  const notChosen = 'Not chosen';

  return (
    <section className="review" aria-labelledby={headingId}>
      <h2 id={headingId} className="screen-reader-text">
        Booking summary
      </h2>
      {show.booking && (
        <section className="review__section">
          <h3 className="review__heading">Your booking</h3>
          <dl className="review__list">
            <div>
              <dt>
                <Building />
                Venue
              </dt>
              <dd>{venueName || notChosen}</dd>
            </div>
            <div>
              <dt>
                <User />
                Group
              </dt>
              <dd>
                {state.partySize
                  ? `${state.partySize} ${state.partySize === 1 ? 'person' : 'people'}`
                  : notChosen}
              </dd>
            </div>
            <div>
              <dt>
                <Calendar />
                Date
              </dt>
              <dd>{state.date ? fmtDate(state.date) : notChosen}</dd>
            </div>
            <div>
              <dt>
                <Rocket />
                Experience
              </dt>
              {selectedType?.name ? (
                <dd dangerouslySetInnerHTML={{ __html: selectedType.name }} />
              ) : (
                <dd>{notChosen}</dd>
              )}
            </div>
            <div>
              <dt>
                <Clock4 />
                Time
              </dt>
              <dd>{timeRange || state.time || notChosen}</dd>
            </div>
          </dl>
        </section>
      )}

      {show.details && (
        <section className="review__section">
          <h3 className="review__heading">Your details</h3>
          <dl className="review__list">
            <div>
              <dt>Name</dt>
              <dd>
                {state.customer.first_name} {state.customer.last_name}
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{state.customer.email}</dd>
            </div>
            {state.customer.phone && (
              <div>
                <dt>Phone</dt>
                <dd>{state.customer.phone}</dd>
              </div>
            )}
            {state.customer.message && (
              <div>
                <dt>Notes</dt>
                <dd>{state.customer.message}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="review__section">
        <h3 className="review__heading">Price</h3>
        {!selectedType ? (
          <p className="review__note">Choose an experience to see the price.</p>
        ) : selectedType.price_mode === 'display' ? (
          <p className="review__total review__total--display">{selectedType.priceText}</p>
        ) : (
          <>
            <p className="review__total">
              <span>Total</span>
              <span>{fmt(basePrice)}</span>
            </p>
            <p className="review__note">
              {selectedType.price_mode === 'per_room'
                ? 'Price per room.'
                : `${fmt(unitPrice)} per person × ${state.partySize ?? 0}.`}
            </p>
          </>
        )}
      </section>

      {show.payment && (
        <div className="review__section">
          {state.detailsAttempted && detailErrorCount > 0 && (
            <StateMessage kind="error">
              {detailErrorCount === 1
                ? '1 field in your details needs attention.'
                : `${detailErrorCount} fields in your details need attention.`}
            </StateMessage>
          )}
          <button
            ref={buttonRef}
            type="button"
            className="review__button"
            onClick={handleContinue}
            disabled={missingSteps.length > 0 || submitting || redirecting}
            aria-busy={submitting || redirecting}
            aria-describedby={missingSteps.length > 0 ? missingId : undefined}
            data-return-url={returnUrl || undefined}
          >
            {submitting || redirecting ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>{redirecting ? 'Going to checkout…' : 'Checking availability…'}</span>
              </>
            ) : (
              <span>Continue to payment</span>
            )}
          </button>
          {missingSteps.length > 0 && (
            <p id={missingId} className="review__missing">
              To continue, choose: {missingSteps.map((s) => s.label.toLowerCase()).join(', ')}.
            </p>
          )}
          {redirecting && (
            <p className="review__missing" role="status">
              Taking you to DesignMyNight’s secure checkout.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
