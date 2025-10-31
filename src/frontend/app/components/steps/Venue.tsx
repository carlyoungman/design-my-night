import React, { useId } from 'react';
import { useWidgetConfig, useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import type { VenueStepProps } from '../../types';
import LoadingAnimation from '../LoadingAnimation';

export function Venue({ venues, initialLoading, error, defaultVenueId }: VenueStepProps) {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const VenueId = useId();
  const locked = Boolean(defaultVenueId);

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    if (locked) return; // ignore when locked
    const id = e.target.value || '';
    dispatch({ type: 'SET_VENUE', id: id || null });
    dispatch({ type: 'SET_VENUE_NAME', name: e.target.selectedOptions[0].text });
    dispatch({ type: 'SET_DATE', date: null });
    dispatch({ type: 'SET_TIME', value: null });
    dispatch({ type: 'SET_TYPE', value: null });
    dispatch({ type: 'SET_AVAIL', value: null });
  };

  return (
    <section className="venues">
      {initialLoading && (
        <LoadingAnimation type="loading" text="Loading venues…"></LoadingAnimation>
      )}
      {error && <p className="dmn-widget__error">{error}</p>}
      {!initialLoading && !error && (
        <div className="venues__select-wrapper">
          <select
            id={VenueId}
            className="venues__select"
            value={state.venueId || ''}
            onChange={handleChange}
            disabled={locked}
          >
            <option value="" disabled>
              Choose…
            </option>
            {venues.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name || v.title}
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  );
}
