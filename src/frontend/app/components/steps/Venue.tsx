import React, { useCallback, useMemo, useEffect } from 'react';
import { useWidgetDispatch, useWidgetState } from '@app/WidgetProvider';
import type { VenueStepProps } from '@app/types';
import LoadingAnimation from '@app/components/LoadingAnimation';
import { StateMessage } from '@app/components/StateMessage';
import { goToStep } from '@app/utils/scroll';

type Props = VenueStepProps & { onRetry?: () => void; labelledBy: string };

export function Venue({
  venues,
  initialLoading,
  error,
  defaultVenueId,
  onRetry,
  labelledBy,
}: Props) {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();

  const defaultExists = useMemo(() => {
    if (!defaultVenueId) return false;
    return venues.some((v) => String(v._id) === String(defaultVenueId));
  }, [venues, defaultVenueId]);

  // Preselect once (but DO NOT lock the select).
  useEffect(() => {
    if (!defaultVenueId) return;
    if (!defaultExists) return;
    if (state.venueId) return;

    const selected = venues.find((v) => String(v._id) === String(defaultVenueId));
    if (!selected) return;

    dispatch({ type: 'SET_VENUE', id: String(selected._id) });
    dispatch({ type: 'SET_VENUE_NAME', name: selected.name || selected.title || '' });
  }, [defaultVenueId, defaultExists, state.venueId, venues, dispatch]);

  // Changing venue clears the later steps (see the reducer). goToStep leaves focus alone while
  // the options are being changed with the arrow keys.
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = e.target.value || null;
      const selectedName = e.target.selectedOptions[0]?.text || '';

      dispatch({ type: 'SET_VENUE', id: selectedId });
      dispatch({ type: 'SET_VENUE_NAME', name: selectedName });
      if (selectedId) goToStep('party', { from: e.target });
    },
    [dispatch],
  );

  return (
    <div className="venues">
      {initialLoading && <LoadingAnimation text="Loading venues…" />}
      {!initialLoading && error && (
        <StateMessage kind="error" onAction={onRetry}>
          {error}
        </StateMessage>
      )}
      {!initialLoading && !error && venues.length === 0 && (
        <StateMessage kind="empty">No venues are taking bookings right now.</StateMessage>
      )}
      {!initialLoading && !error && venues.length > 0 && (
        <div className="venues__select-wrapper">
          <select
            className="venues__select"
            aria-labelledby={labelledBy}
            value={state.venueId || ''}
            onChange={handleChange}
          >
            <option value="" disabled>
              Choose a venue
            </option>
            {venues.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name || v.title}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
