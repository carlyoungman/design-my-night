import React, { useCallback, useMemo, useId } from 'react';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import type { VenueStepProps } from '../../types';
import LoadingAnimation from '../LoadingAnimation';
import { scrollToSection } from '../../utils/scroll';

export function Venue({ venues, initialLoading, error, defaultVenueId }: VenueStepProps) {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const VenueId = useId();
  const isVenueLocked = Boolean(defaultVenueId);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (isVenueLocked) return;
      const selectedId = e.target.value || null;
      const selectedName = e.target.selectedOptions[0]?.text || '';

      dispatch({ type: 'SET_VENUE', id: selectedId });
      dispatch({ type: 'SET_VENUE_NAME', name: selectedName });
      dispatch({ type: 'SET_DATE', date: null });
      dispatch({ type: 'SET_TIME', value: null });
      dispatch({ type: 'SET_TYPE', value: null });
      scrollToSection('section.date', { offset: { mobile: 190, desktop: 200 }, delay: 400 });
    },
    [isVenueLocked, dispatch],
  );

  const venueOptions = useMemo(
    () =>
      venues.map((v) => (
        <option key={v._id} value={v._id}>
          {v.name || v.title}
        </option>
      )),
    [venues],
  );

  const renderSelect = () => (
    <div className="venues__select-wrapper">
      <select
        id={VenueId}
        className="venues__select"
        value={state.venueId || ''}
        onChange={handleChange}
        // disabled={isVenueLocked}
      >
        <option value="" disabled>
          Choose…
        </option>
        {venueOptions}
      </select>
    </div>
  );

  return (
    <section className="venues">
      {initialLoading && <LoadingAnimation type="loading" text="Loading venues…" />}
      {error && <p className="dmn-widget__error">{error}</p>}
      {!initialLoading && !error && renderSelect()}
    </section>
  );
}
