import React, { useEffect, useId } from 'react';
import { StepShell } from '../StepShell';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { useAvailability } from '../../hooks/useAvailability';
import { useBookingTypes } from '../../hooks/useBookingTypes';
import { Radio } from '@base-ui-components/react/radio';
import { RadioGroup } from '@base-ui-components/react/radio-group';

// Use the shape returned by your hook
type BookingTypeItem = {
  id: string;
  name: string;
  description?: string;
  priceText?: string;
};

export function TypeStep() {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const { runAvailability } = useAvailability();

  const { types, loading, error } = useBookingTypes({
    venueId: state.venueId,
    partySize: state.partySize,
    enabled: Boolean(state.venueId && state.partySize),
  });

  // Clear selected type when venue changes
  useEffect(() => {
    if (state.bookingType) {
      dispatch({ type: 'SET_TYPE', value: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.venueId]);

  // Auto-continue if there’s only one option
  useEffect(() => {
    if (state.bookingType) return;
    if (types.length === 1) {
      const only = types[0].id;
      dispatch({ type: 'SET_TYPE', value: only });
      (async () => {
        await runAvailability();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, types, state.bookingType]);

  const captionId = useId();

  return (
    <StepShell className="type">
      {loading && <p>Loading experiences…</p>}
      {!loading && error && <p className="step__error">{error}</p>}

      {!loading && !error && (
        <div className="step_field">
          <p className="step__label" id={captionId}>
            Choose your Activity
          </p>

          {types.length === 0 && <p>No experiences configured.</p>}

          {types.length > 0 && (
            <RadioGroup
              aria-labelledby={captionId}
              value={state.bookingType ?? ''}
              onValueChange={(value: unknown, _event: Event) => {
                const next = String(value);
                if (next !== (state.bookingType ?? '')) {
                  dispatch({ type: 'SET_TYPE', value: next });
                }
              }}
              className="radio-group"
            >
              {types.map((t) => (
                <label key={t.id} className="radio">
                  <Radio.Root value={t.id} className="radio__radio" disabled={loading}>
                    <span className="radio__span">
                      <strong>{t.name}</strong>
                      {t.priceText ? ` — ${t.priceText}` : ''}
                      {t.description ? <em> — {t.description}</em> : ''}
                    </span>
                  </Radio.Root>
                </label>
              ))}
            </RadioGroup>
          )}
        </div>
      )}
    </StepShell>
  );
}
