import React, { useId } from 'react';
import { StepShell } from '../StepShell';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import type { VenueStepProps } from '../../types';

export function VenueStep({ venues, initialLoading, error, forcedVenueId }: VenueStepProps) {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();

  const VenueId = useId();

  // If a venue is forced (via config), we don’t show this step.
  if (forcedVenueId) return null;
  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const id = e.target.value || '';
    // 1) Set the new venue
    dispatch({ type: 'SET_VENUE', id: id || null });
    dispatch({ type: 'SET_DATE', date: '' as any });
    dispatch({ type: 'SET_TIME', value: '' as any });
    dispatch({ type: 'SET_TYPE', value: '' as any });
  };

  return (
    <StepShell className="venues">
      {initialLoading && <p>Loading venues…</p>}
      {error && <p className="venues__error">{error}</p>}

      {!initialLoading && !error && (
        <div className="venues__select-wrapper">
          <label className="venues__label" htmlFor={VenueId}>
            Select a venue
          </label>
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
    </StepShell>
  );
}
