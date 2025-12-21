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
  defaultTypeId?: string | null;
};

export function Type({
  types = [],
  loading = false,
  error = null,
  enabled,
  defaultTypeId = '',
}: Props) {
  const dispatch = useWidgetDispatch();
  const state = useWidgetState();
  const captionId = useId();

  // Clear selection if prerequisites are not met
  useEffect(() => {
    if (!enabled && state.bookingType) {
      dispatch({ type: 'SET_TYPE', value: null });
      dispatch({ type: 'SET_DURATION', value: null });
    }
  }, [enabled, state.bookingType, dispatch]);

  // Preselect when defaultTypeId is provided
  useEffect(() => {
    if (!enabled || loading) return;
    if (!defaultTypeId) return;

    const match = types.find((t) => t.id === defaultTypeId && t.valid !== false);
    if (!match) return;

    if (state.bookingType !== match.id) {
      dispatch({ type: 'SET_TYPE', value: match.id });
      dispatch({ type: 'SET_DURATION', value: match.duration ?? null });
    }
  }, [enabled, loading, defaultTypeId, types, state.bookingType, dispatch]);

  // Auto-select when exactly one valid option and ready (only if no defaultTypeId)
  useEffect(() => {
    if (enabled && !loading && !defaultTypeId && types.length === 1 && types[0]?.valid !== false) {
      const only = types[0]!;
      if (only.id !== state.bookingType) {
        dispatch({ type: 'SET_TYPE', value: only.id });
        dispatch({ type: 'SET_DURATION', value: only.duration ?? null });
      }
    }
  }, [enabled, loading, defaultTypeId, types, state.bookingType, dispatch]);

  // When defaultTypeId is set, only show that type
  const filteredTypes = defaultTypeId ? types.filter((t) => t.id === defaultTypeId) : types;

  const showList = !loading && !error && filteredTypes.length > 0;
  const showEmpty = !loading && !error && filteredTypes.length === 0;
  const showError = !loading && !!error;

  const selectedTypeForText = defaultTypeId && filteredTypes.length > 0 ? filteredTypes[0] : null;

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
                    const selected = types.find((t) => t.id === next);

                    dispatch({ type: 'SET_DURATION', value: selected?.duration ?? null });
                    scrollToSection('section.time', {
                      offset: { mobile: 190, desktop: 200 },
                      delay: 400,
                    });
                  }
                }}
                className="radio-group"
              >
                {filteredTypes.map((t: any) => {
                  const isDisabled = loading || t.valid === false;
                  const isSelected = state.bookingType === t.id;

                  return (
                    <label
                      key={t.id}
                      className={`radio${isDisabled ? ' radio--disabled' : ''}`}
                      data-disabled={isDisabled ? 'true' : 'false'}
                    >
                      <Radio.Root
                        id={t.id}
                        value={t.id}
                        data-duration={t.duration}
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
                                }${isSelected ? ' type-card__button--selected' : ''}`}
                                aria-hidden={isDisabled}
                              >
                                {isDisabled ? 'Unavailable' : isSelected ? 'Selected' : 'Select'}
                              </span>
                            </div>
                          </article>
                        </div>
                      </Radio.Root>
                    </label>
                  );
                })}
              </RadioGroup>
              {defaultTypeId && selectedTypeForText?.type_text && (
                <div
                  className="type__extra-text"
                  dangerouslySetInnerHTML={{ __html: selectedTypeForText.type_text }}
                />
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
