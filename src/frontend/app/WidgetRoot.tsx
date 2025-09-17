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
      defaultValue={['step1', 'step2', 'step3', 'step4']}
    >
      <Accordion.Item className="accordion__item" value="step1">
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
      {/*<Accordion.Item className="accordion__item" value="step2">*/}
      {/*  <Accordion.Header className="accordion__header">*/}
      {/*    <Accordion.Trigger className="accordion__trigger">*/}
      {/*      2. Choose your experience*/}
      {/*      <PlusIcon className="accordion__icon" />*/}
      {/*    </Accordion.Trigger>*/}
      {/*  </Accordion.Header>*/}
      {/*  <Accordion.Panel className="accordion__panel">*/}
      {/*    <TypeStep />*/}
      {/*  </Accordion.Panel>*/}
      {/*</Accordion.Item>*/}
      <Accordion.Item className="accordion__item" value="step2">
        <Accordion.Header className="accordion__header">
          <Accordion.Trigger className="accordion__trigger">
            3. Choose your Add-ons
            <PlusIcon className="accordion__icon" />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className="accordion__panel">
          <PackagesStep />
        </Accordion.Panel>
      </Accordion.Item>
      {/*<Accordion.Item className="accordion__item" value="step3">*/}
      {/*  <Accordion.Header className="accordion__header">*/}
      {/*    <Accordion.Trigger className="accordion__trigger">*/}
      {/*      4. Select date and time*/}
      {/*      <PlusIcon className="accordion__icon" />*/}
      {/*    </Accordion.Trigger>*/}
      {/*  </Accordion.Header>*/}
      {/*  <Accordion.Panel className="accordion__panel">*/}
      {/*    <DateStep />*/}
      {/*    <TimeStep />*/}
      {/*  </Accordion.Panel>*/}
      {/*</Accordion.Item>*/}
    </Accordion.Root>
  );
}
