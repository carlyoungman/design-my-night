import React, { useEffect, useId } from 'react';
import { StepShell } from '../StepShell';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { useAvailability } from '../../hooks/useAvailability';
import { useBookingTypes } from '../../hooks/useBookingTypes';
import { Radio } from '@base-ui-components/react/radio';
import { RadioGroup } from '@base-ui-components/react/radio-group';

export function TypeStep() {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const isActive = state.step === 'type';

  const { types, loading, error, reload } = useBookingTypes({
    venueId: state.venueId ?? null,
    date: state.date ?? null, // pass date
    partySize: state.partySize ?? null,
    enabled: !!state.venueId && state.partySize != null && !!state.date && !!state.time,
  });

  // Clear selected type when venue/date/time changes to avoid stale selection
  useEffect(() => {
    if (state.bookingType) dispatch({ type: 'SET_TYPE', value: null });
  }, [state.venueId, state.date, state.time]); // keep lean; no extra deps

  // Auto-select if only one option, but do NOT refresh date/time here
  useEffect(() => {
    if (state.bookingType) return;
    if (types.length === 1) {
      dispatch({ type: 'SET_TYPE', value: types[0].id });
    }
  }, [types, state.bookingType, dispatch]);

  const captionId = useId();

  return (
    <StepShell className="type">
      {loading && <p>Loading experiences…</p>}
      {!loading && error && <p className="step__error">{error}</p>}

      {!loading && !error && (
        <div className="step_field">
          {isActive && types.length === 0 && <p>No experiences configured.</p>}

          {types.length > 0 && (
            <RadioGroup
              aria-labelledby={captionId}
              value={state.bookingType ?? ''}
              onValueChange={(value) => {
                const next = String(value);
                if (next !== (state.bookingType ?? '')) {
                  dispatch({ type: 'SET_TYPE', value: next }); // no availability call
                }
              }}
              className="radio-group"
            >
              {types.map((t) => {
                const isDisabled = loading || t.valid === false;
                return (
                  <label
                    key={t.id}
                    className={`radio${isDisabled ? ' radio--disabled' : ''}`}
                    data-disabled={isDisabled ? 'true' : 'false'}
                  >
                    <Radio.Root
                      value={t.id}
                      className="radio__radio"
                      disabled={isDisabled}
                      aria-disabled={isDisabled}
                    >
                      <div className={`type-card${isDisabled ? ' type-card--disabled' : ''}`}>
                        {t.image_url && (
                          <div className="type-card__image-wrapper">
                            <img src={t.image_url} alt={t.name} className="type-card__image" />
                          </div>
                        )}
                        <article className="type-card__article">
                          {t.name && (
                            <h6
                              className="type-card__name"
                              dangerouslySetInnerHTML={{ __html: t.name }}
                            />
                          )}
                          {t.description && (
                            <p
                              className="type-card__description"
                              dangerouslySetInnerHTML={{ __html: t.description }}
                            />
                          )}
                          <div className="type-card__article-footer">
                            <h6 className="type-card__price">{t.priceText}</h6>
                            <span
                              className={`type-card__button${isDisabled ? ' type-card__button--disabled' : ''}`}
                              aria-hidden={isDisabled}
                            >
                              {isDisabled ? 'Unavailable' : 'Select'}
                            </span>
                          </div>
                        </article>
                      </div>
                    </Radio.Root>
                  </label>
                );
              })}
            </RadioGroup>
          )}
        </div>
      )}
    </StepShell>
  );
}
