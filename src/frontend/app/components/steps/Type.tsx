import React, { useEffect, useId } from 'react';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { Radio } from '@base-ui-components/react/radio';
import { RadioGroup } from '@base-ui-components/react/radio-group';
import LoadingAnimation from '../LoadingAnimation';
import { scrollToSection } from '../../utils/scroll';

type Props = {
  types: any[];
  loading?: boolean;
  error?: string | null;
  enabled: boolean;
};

export function Type({ types = [], loading = false, error = null, enabled }: Props) {
  const dispatch = useWidgetDispatch();
  const state = useWidgetState();
  const captionId = useId();

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
      if (only.id !== state.bookingType) dispatch({ type: 'SET_TYPE', value: only.id });
    }
  }, [enabled, loading, types, state.bookingType, dispatch]);

  const showList = !loading && !error && types.length > 0;
  const showEmpty = !loading && !error && types.length === 0;
  const showError = !loading && !!error;

  return (
    <section className="type">
      {!enabled ? (
        <LoadingAnimation type="required" text="Venue, party size, date required" />
      ) : (
        <>
          {loading && <LoadingAnimation type="loading" text="Loading experiences…" />}

          {showError && (
            <p className="type__error" role="alert">
              {error}
            </p>
          )}

          {showEmpty && <p className="type__empty">No experiences available for this selection.</p>}

          {showList && (
            <div className="step_field">
              <RadioGroup
                aria-labelledby={captionId}
                value={state.bookingType ?? ''}
                onValueChange={(value) => {
                  const next = String(value);
                  if (next !== (state.bookingType ?? '')) {
                    dispatch({ type: 'SET_TYPE', value: next });
                    scrollToSection('section.time', {
                      offset: { mobile: 190, desktop: 200 },
                      delay: 400,
                    });
                  }
                }}
                className="radio-group"
              >
                {types.map((t: any) => {
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
        </>
      )}
    </section>
  );
}
