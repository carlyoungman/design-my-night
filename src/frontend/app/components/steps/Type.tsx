import React, { useEffect, useId } from 'react';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { useBookingTypes } from '../../hooks/useBookingTypes';
import { Radio } from '@base-ui-components/react/radio';
import { RadioGroup } from '@base-ui-components/react/radio-group';
import LoadingAnimation from '../LoadingAnimation';

export function Type() {
  const dispatch = useWidgetDispatch();
  const state = useWidgetState();
  const captionId = useId();

  const enabled = !!state.venueId && state.partySize != null && !!state.date && !!state.time;

  const {
    types = [],
    loading,
    error,
  } = useBookingTypes({
    venueId: state.venueId ?? null,
    date: state.date ?? null,
    partySize: state.partySize ?? null,
  });

  // Clear selection if prerequisites are not met
  useEffect(() => {
    if (!enabled && state.bookingType) {
      dispatch({ type: 'SET_TYPE', value: null });
    }
  }, [enabled, state.bookingType, dispatch]);

  // Auto-select when exactly one valid option and ready
  useEffect(() => {
    if (enabled && !loading && types.length === 1 && types[0]?.valid !== false) {
      const only = types[0]!;
      if (only.id !== state.bookingType) {
        dispatch({ type: 'SET_TYPE', value: only.id });
      }
    }
  }, [enabled, loading, types, state.bookingType, dispatch]);

  // Prerequisites not met: show hint and stop
  if (!enabled) {
    return (
      <section className="type">
        <LoadingAnimation text="Venue, date and time required" />
      </section>
    );
  }

  return (
    <section className="type">
      {loading && <LoadingAnimation text="Loading experiences…" />}

      {!loading && error && (
        <p className="type__error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && types.length === 0 && (
        <p className="type__empty">No experiences available for this selection.</p>
      )}

      {!loading && !error && types.length > 0 && (
        <div className="step_field">
          <RadioGroup
            aria-labelledby={captionId}
            value={state.bookingType ?? ''}
            onValueChange={(value) => {
              const next = String(value);
              if (next !== (state.bookingType ?? '')) {
                dispatch({ type: 'SET_TYPE', value: next });
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
                            className={`type-card__button${
                              isDisabled ? ' type-card__button--disabled' : ''
                            }`}
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
        </div>
      )}
    </section>
  );
}
