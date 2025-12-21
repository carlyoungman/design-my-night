import React, { useMemo } from 'react';
import { WidgetProvider, useWidgetConfig, useWidgetState } from './WidgetProvider';
import type { RootProps } from './WidgetProvider';
import { Building, Calendar, PenLine, Rocket, Clock4, User } from 'lucide-react';
import { Venue } from './components/steps/Venue';
import { PartySize } from './components/steps/PartySize';
import { Date } from './components/steps/Date';
import { Time } from './components/steps/Time';
import { Type } from './components/steps/Type';
import { useVenues } from './hooks/useVenues';
import { Details } from './components/steps/Details';
import { Review } from './components/steps/Review';
import ProgressBar from './components/ProgressBar';
import { Faqs } from './components/steps/Faqs';
import { useBookingTypes } from './hooks/useBookingTypes';
import { hhmmFromState } from './utils/helpers';
import AddonsNew from './components/steps/AddonsNew';
import { parseAllowedDays } from './utils/helpers';

export default function WidgetRoot(props: Omit<RootProps, 'children'>) {
  return (
    <div className="dmn-widget" role="form" aria-labelledby="dmn-title">
      <WidgetProvider {...props}>
        <WidgetInner />
      </WidgetProvider>
    </div>
  );
}

function WidgetInner() {
  const { venueGroup, defaultVenueId, defaultTypeId, defaultTypeIds, allowedDays } =
    useWidgetConfig();
  const state = useWidgetState();
  const { venues, loading, error } = useVenues(venueGroup);
  const formattedAllowedDays = useMemo(() => parseAllowedDays(allowedDays), [allowedDays]);

  const timeHHmm = useMemo(() => hhmmFromState(state.time), [state.time]);
  const enabled = !!state.venueId && state.partySize != null && !!state.date;

  const {
    types = [],
    loading: typesLoading,
    error: typesError,
  } = useBookingTypes({
    venueId: state.venueId ?? null,
    partySize: state.partySize ?? null,
    date: state.date ?? null,
    time: timeHHmm,
    enabled,
  });

  return (
    <>
      <ProgressBar></ProgressBar>
      <div className="dmn-widget__grid">
        <div className="dmn-widget__main">
          <section className="dmn-widget__section">
            <p className="dmn-widget__header">
              <Building className="dmn-widget__icon" />
              1. Select a venue
            </p>
            <div className="dmn-widget__body">
              <Venue
                venues={venues}
                initialLoading={loading}
                error={error}
                defaultVenueId={defaultVenueId}
              />
            </div>
          </section>

          <section className="dmn-widget__section">
            <p className="dmn-widget__header">
              <User className="dmn-widget__icon" />
              2. Size of your group?
            </p>
            <div className="dmn-widget__body">
              <PartySize />
            </div>
          </section>

          <section className="dmn-widget__section">
            <p className="dmn-widget__header">
              <Calendar className="dmn-widget__icon" />
              3. Select a date
            </p>
            <div className="dmn-widget__body">
              <Date allowedDays={formattedAllowedDays} />
            </div>
          </section>

          <section className="dmn-widget__section">
            <p className="dmn-widget__header">
              <Rocket className="dmn-widget__icon" />
              4. Choose your experience
            </p>
            <div className="dmn-widget__body">
              <Type
                types={types}
                loading={typesLoading}
                error={typesError}
                enabled={enabled}
                defaultTypeId={defaultTypeId}
                defaultTypeIds={defaultTypeIds}
              />
            </div>
          </section>

          <section className="dmn-widget__section">
            <p className="dmn-widget__header">
              <Clock4 className="dmn-widget__icon" />
              5. Pick a time
            </p>
            <div className="dmn-widget__body">
              <Time />
            </div>
          </section>

          <section className="dmn-widget__section">
            <p className="dmn-widget__header">
              <PenLine className="dmn-widget__icon" />
              6. Confirm your details
            </p>
            <div className="dmn-widget__body">
              <Details />
            </div>
          </section>
        </div>

        <div className="dmn-widget__side">
          <ProgressBar></ProgressBar>
          <Review sections={{ details: false }} venues={venues} types={types} />
        </div>
      </div>

      <Faqs venues={venues} />
      <AddonsNew />
    </>
  );
}
