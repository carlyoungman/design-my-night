import React, { useEffect, useId } from 'react';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import type { VenueStepProps } from '../../types';
import LoadingAnimation from '../LoadingAnimation';

export function Venue({ venues, initialLoading, error, forcedVenueId }: VenueStepProps) {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const VenueId = useId();

  // If a venue is forced (via config), we don’t show this step.
  if (forcedVenueId) return null;
  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
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
      {initialLoading && <LoadingAnimation text="Loading venues…"></LoadingAnimation>}
      {error && <p className="venues__error">{error}</p>}
      {!initialLoading && !error && (
        <div className="venues__select-wrapper">
          <select
            id={VenueId}
            className="venues__select"
            value={state.venueId || ''}
            onChange={handleChange}
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
