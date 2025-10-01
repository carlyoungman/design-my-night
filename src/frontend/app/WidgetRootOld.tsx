import React from 'react';
import { WidgetProvider, useWidgetConfig } from './WidgetProvider';
import type { RootProps } from './WidgetProvider';

import { Accordion } from '@base-ui-components/react/accordion';
import { PlusIcon } from 'lucide-react';

import { Venue } from './components/steps/Venue';
import { PartySize } from './components/steps/PartySize';
import { Date } from './components/steps/Date';
import { Time } from './components/steps/Time';
import { Type } from './components/steps/Type';
import { useVenues } from './hooks/useVenues';
import { Details } from './components/steps/Details';
import { Review } from './components/steps/Review';
import Addons from './components/steps/Addons';

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
    <div className="dmn-widget__grid">
      <div className="dmn-widget__main">
        <Accordion.Root
          className="accordion"
          openMultiple={true}
          defaultValue={['venues', 'date-and-time', 'types', 'addons', 'details']}
        >
          <Accordion.Item className="accordion__item accordion__item--venues venues" value="venues">
            <Accordion.Header render={<h4 className="accordion__header" />}>
              <Accordion.Trigger className="accordion__trigger">
                1. Secure your spot
                <PlusIcon className="accordion__icon" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="accordion__panel">
              <PartySize />
              <Venue
                venues={venues}
                initialLoading={loading}
                error={error}
                forcedVenueId={forcedVenueId}
              />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item
            className="accordion__item accordion__item--date-and-time date-and-time"
            value="date-and-time"
          >
            <Accordion.Header render={<h4 className="accordion__header" />}>
              <Accordion.Trigger className="accordion__trigger">
                2. Select date and time
                <PlusIcon className="accordion__icon" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="accordion__panel">
              <Date />
              <Time />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item className="accordion__item accordion__item--types types" value="types">
            <Accordion.Header render={<h4 className="accordion__header" />}>
              <Accordion.Trigger className="accordion__trigger">
                3. Choose your experience
                <PlusIcon className="accordion__icon" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="accordion__panel">
              <Type />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item className="accordion__item accordion__item--addons" value="addons">
            <Accordion.Header render={<h4 className="accordion__header" />}>
              <Accordion.Trigger className="accordion__trigger">
                4. Choose your add-ons
                <PlusIcon className="accordion__icon" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="accordion__panel">
              <Addons />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item
            className="accordion__item accordion__item--details details"
            value="details"
          >
            <Accordion.Header render={<h4 className="accordion__header" />}>
              <Accordion.Trigger className="accordion__trigger">
                5. Confirm your details
                <PlusIcon className="accordion__icon" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="accordion__panel">
              <Details />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion.Root>
      </div>
      <div className="dmn-widget__side">
        <Review sections={{ details: false }} />
      </div>
    </div>
  );
}
