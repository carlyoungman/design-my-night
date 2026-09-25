import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { WidgetProvider, useWidgetConfig, useWidgetState } from '@app/WidgetProvider';
import type { RootProps } from '@app/WidgetProvider';
import { Venue } from '@app/components/steps/Venue';
import { PartySize } from '@app/components/steps/PartySize';
import { Date } from '@app/components/steps/Date';
import { Time } from '@app/components/steps/Time';
import { Type } from '@app/components/steps/Type';
import { useVenues } from '@app/hooks/useVenues';
import { Details } from '@app/components/steps/Details';
import { Review } from '@app/components/steps/Review';
import ProgressBar from '@app/components/ProgressBar';
import { useBookingTypes } from '@app/hooks/useBookingTypes';
import { parseAllowedDays } from '@app/utils/helpers';
import { STEPS, stepHeadingId, type StepKey } from '@app/utils/steps';

export default function WidgetRoot(props: Omit<RootProps, 'children'>) {
  return (
    <div className="dmn-widget" role="form" aria-label="Make a booking">
      <WidgetProvider {...props}>
        <WidgetInner />
      </WidgetProvider>
    </div>
  );
}

const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.key, i])) as Record<StepKey, number>;

function Step({
  widgetId,
  step,
  children,
}: {
  widgetId: string;
  step: StepKey;
  children: React.ReactNode;
}) {
  const def = STEPS[STEP_INDEX[step]];
  const headingId = stepHeadingId(widgetId, step);
  return (
    <section className="dmn-widget__section" data-step={step} aria-labelledby={headingId}>
      <h2 id={headingId} className="dmn-widget__header" tabIndex={-1}>
        <span className="dmn-widget__step-number" aria-hidden="true">
          {STEP_INDEX[step] + 1}
        </span>
        <span>
          <span className="screen-reader-text">
            Step {STEP_INDEX[step] + 1} of {STEPS.length}:{' '}
          </span>
          {def.title}
        </span>
      </h2>
      <div className="dmn-widget__body">{children}</div>
    </section>
  );
}

/** Politely announces what was just chosen and what comes next. */
function useStepAnnouncement() {
  const state = useWidgetState();
  const [message, setMessage] = useState('');
  const prev = useRef(state);

  useEffect(() => {
    const p = prev.current;
    prev.current = state;
    if (state.venueId && state.venueId !== p.venueId)
      setMessage(`${state.venueName || 'Venue'} selected. Next, choose your group size and date.`);
    else if (state.date && state.date !== p.date)
      setMessage('Date selected. Next, choose your experience.');
    else if (state.bookingType && state.bookingType !== p.bookingType)
      setMessage('Experience selected. Next, choose a time.');
    else if (state.time && state.time !== p.time)
      setMessage('Time selected. Next, enter your details.');
  }, [state]);

  return message;
}

function WidgetInner() {
  const { venueGroup, defaultVenueId, defaultTypeId, defaultTypeIds, allowedDays, allowDisabled } =
    useWidgetConfig();
  const state = useWidgetState();
  const widgetId = useId().replace(/:/g, '');
  const { venues, loading, error, reload: reloadVenues } = useVenues(venueGroup);
  const formattedAllowedDays = useMemo(() => parseAllowedDays(allowedDays), [allowedDays]);
  const announcement = useStepAnnouncement();

  const enabled = !!state.venueId && state.partySize != null && !!state.date;

  const {
    types = [],
    loading: typesLoading,
    error: typesError,
    reload: reloadTypes,
  } = useBookingTypes({
    venueId: state.venueId ?? null,
    partySize: state.partySize ?? null,
    date: state.date ?? null,
    enabled,
    allowDisabled,
  });

  return (
    <>
      <ProgressBar compact />
      <div className="dmn-widget__grid">
        <div className="dmn-widget__main">
          <Step widgetId={widgetId} step="venue">
            <Venue
              venues={venues}
              initialLoading={loading}
              error={error}
              onRetry={reloadVenues}
              defaultVenueId={defaultVenueId}
              labelledBy={stepHeadingId(widgetId, 'venue')}
            />
          </Step>

          <Step widgetId={widgetId} step="party">
            <PartySize labelledBy={stepHeadingId(widgetId, 'party')} />
          </Step>

          <Step widgetId={widgetId} step="date">
            <Date allowedDays={formattedAllowedDays} />
          </Step>

          <Step widgetId={widgetId} step="experience">
            <Type
              types={types}
              loading={typesLoading}
              error={typesError}
              onRetry={reloadTypes}
              enabled={enabled}
              defaultTypeId={defaultTypeId}
              defaultTypeIds={defaultTypeIds}
              labelledBy={stepHeadingId(widgetId, 'experience')}
            />
          </Step>

          <Step widgetId={widgetId} step="time">
            <Time labelledBy={stepHeadingId(widgetId, 'time')} />
          </Step>

          <Step widgetId={widgetId} step="details">
            <Details />
          </Step>
        </div>

        <aside className="dmn-widget__side" aria-label="Booking summary">
          <ProgressBar showSteps />
          <Review sections={{ details: false }} venues={venues} types={types} />
        </aside>
      </div>

      <div className="screen-reader-text" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </>
  );
}
