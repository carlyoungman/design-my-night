import React, { useState } from 'react';
import { StepShell } from '../StepShell';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import type { VenueStepProps } from '../../types';
import { checkAvailability } from '../../../api/public';
import { useBookingTypes } from '../../hooks/useBookingTypes';

export function VenueStep({ venues, initialLoading, error, forcedVenueId }: VenueStepProps) {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const [loading] = useState(initialLoading);
  if (forcedVenueId) return null;
  return (
    <StepShell className="venue">
      {loading && <p>Loading venues…</p>}
      {error && <p className="step__error">{error}</p>}

      {!loading && !error && (
        <>
          <p className="step__label">Select a venue</p>
          <div className="select-wrapper">
            <select
              name="venues"
              className="select"
              value={state.venueId || ''}
              onChange={(e) => {
                const id = e.target.value || null;
                dispatch({ type: 'SET_VENUE', id });

                if (id) {
                  checkAvailability({ venue_id: id, num_people: state.partySize })
                    .then((res) => {
                      dispatch({ type: 'SET_AVAIL', value: res.payload });
                    })
                    .catch((err) => dispatch({ type: 'ERROR', message: err.message }));
                }
              }}
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
