import React from 'react';
import { StepShell } from '../StepShell';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import type { VenueStepProps } from '../../types';

export function VenueStep({ venues, initialLoading, error, forcedVenueId }: VenueStepProps) {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();

  // If a venue is forced (via config), we don’t show this step.
  if (forcedVenueId) return null;

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const id = e.target.value || '';
    // 1) Set the new venue
    dispatch({ type: 'SET_VENUE', id: id || null });

    // 2) Clear dependent selections so later steps re-compute from DMN:
    //    - Date suggestions (DateStep) will fetch `fields=date` when shown
    //    - Types list (TypeStep) will fetch via your WP route when shown
    //    - Time suggestions (TimeStep) will prefetch once date+type are set
    dispatch({ type: 'SET_DATE', date: '' as any });
    dispatch({ type: 'SET_TIME', value: '' as any });
    dispatch({ type: 'SET_TYPE', value: '' as any });

    // NOTE: intentionally NO raw `booking-availability` call here.
    // DMN-recommended pattern: compute only what you need with `fields=…`
    // on the specific steps that need it.
  };

  return (
    <StepShell className="venue">
      {initialLoading && <p>Loading venues…</p>}
      {error && <p className="step__error">{error}</p>}

      {!initialLoading && !error && (
        <>
          <p className="step__label">Select a venue</p>
          <div className="select-wrapper">
            <select
              name="venues"
              className="select"
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
        </>
      )}
    </StepShell>
  );
}
