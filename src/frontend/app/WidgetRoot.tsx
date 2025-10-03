import React from 'react';
import { WidgetProvider, useWidgetConfig } from './WidgetProvider';
import type { RootProps } from './WidgetProvider';
import { Building, Calendar, PenLine, Rocket, MicVocal, Clock4, User } from 'lucide-react';
import { Venue } from './components/steps/Venue';
import { PartySize } from './components/steps/PartySize';
import { Date } from './components/steps/Date';
import { Time } from './components/steps/Time';
import { Type } from './components/steps/Type';
import { useVenues } from './hooks/useVenues';
import { Details } from './components/steps/Details';
import { Review } from './components/steps/Review';
import Addons from './components/steps/Addons';
import ProgressBar from './components/ProgressBar';
import { Faqs } from './components/steps/Faqs';

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
  const { venueGroup, forcedVenueId } = useWidgetConfig();
  const { venues, loading, error } = useVenues(venueGroup, !!forcedVenueId);

  return (
    <>
      {' '}
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
                forcedVenueId={forcedVenueId}
              />
            </div>
          </section>
          <section className="dmn-widget__section">
            <p className="dmn-widget__header">
              <User className="dmn-widget__icon" />
              2. How many people in your group?
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
              <Date />
            </div>
          </section>
          <section className="dmn-widget__section">
            <p className="dmn-widget__header">
              <Clock4 className="dmn-widget__icon" />
              4. Pick a time
            </p>
            <div className="dmn-widget__body">
              <Time />
            </div>
          </section>
          <section className="dmn-widget__section">
            <p className="dmn-widget__header">
              <Rocket className="dmn-widget__icon" />
              5. Choose your experience
            </p>
            <div className="dmn-widget__body">
              <Type />
            </div>
          </section>
          <section className="dmn-widget__section">
            <p className="dmn-widget__header">
              <MicVocal className="dmn-widget__icon" />
              6. Choose your add-ons
            </p>
            <div className="dmn-widget__body">
              <Addons />
            </div>
          </section>
          <section className="dmn-widget__section">
            <p className="dmn-widget__header">
              <PenLine className="dmn-widget__icon" />
              7. Confirm your details
            </p>
            <div className="dmn-widget__body">
              <Details />
            </div>
          </section>
        </div>
        <div className="dmn-widget__side">
          <ProgressBar></ProgressBar>
          <Review sections={{ details: false }} />
        </div>
      </div>
      <Faqs />
    </>
  );
}
