import React from 'react';
import { WidgetProvider, useWidgetConfig } from './WidgetProvider';
import type { RootProps } from './WidgetProvider';

import { Accordion } from '@base-ui-components/react/accordion';
import { PlusIcon } from 'lucide-react';

import { VenueStep } from './components/steps/VenueStep';
import { PartySizeStep } from './components/steps/PartySizeStep';
import { DateStep } from './components/steps/DateStep';
import { TimeStep } from './components/steps/TimeStep';
import { TypeStep } from './components/steps/TypeStep';

import { useVenues } from './hooks/useVenues';
import { PackagesStep } from './components/steps/PackagesStep';
import { DetailsStep } from './components/steps/DetailsStep';
import { ReviewStep } from './components/steps/ReviewStep';

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
    <Accordion.Root
      className="accordion"
      openMultiple={true}
      defaultValue={['venues', 'date-and-time', 'types', 'addons', 'details']}
    >
      <Accordion.Item className="accordion__item accordion__item--venues venues" value="venues">
        <Accordion.Header className="accordion__header">
          <Accordion.Trigger className="accordion__trigger">
            1. Secure your spot
            <PlusIcon className="accordion__icon" />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className="accordion__panel">
          <PartySizeStep />
          <VenueStep
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
        <Accordion.Header className="accordion__header">
          <Accordion.Trigger className="accordion__trigger">
            2. Select date and time
            <PlusIcon className="accordion__icon" />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className="accordion__panel">
          <DateStep />
          <TimeStep />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item className="accordion__item accordion__item--types types" value="types">
        <Accordion.Header className="accordion__header">
          <Accordion.Trigger className="accordion__trigger">
            3. Choose your experience
            <PlusIcon className="accordion__icon" />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className="accordion__panel">
          <TypeStep />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item className="accordion__item accordion__item--addons addons" value="addons">
        <Accordion.Header className="accordion__header">
          <Accordion.Trigger className="accordion__trigger">
            4. Choose your add-ons
            <PlusIcon className="accordion__icon" />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className="accordion__panel">
          <PackagesStep />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item className="accordion__item accordion__item--details details" value="details">
        <Accordion.Header className="accordion__header">
          <Accordion.Trigger className="accordion__trigger">
            5. Confirm your details
            <PlusIcon className="accordion__icon" />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className="accordion__panel">
          <ReviewStep></ReviewStep>
          <DetailsStep />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}
