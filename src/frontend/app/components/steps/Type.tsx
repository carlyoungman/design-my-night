import React, { useEffect, useId, useMemo } from 'react';
import { useWidgetConfig, useWidgetDispatch, useWidgetState } from '@app/WidgetProvider';
import { Radio } from '@base-ui-components/react/radio';
import { RadioGroup } from '@base-ui-components/react/radio-group';
import { Check } from 'lucide-react';
import LoadingAnimation from '@app/components/LoadingAnimation';
import { StepPrerequisite } from '@app/components/StepPrerequisite';
import { StateMessage } from '@app/components/StateMessage';
import { goToStep } from '@app/utils/scroll';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  types: any[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  enabled: boolean;
  labelledBy: string;

  // single
  defaultTypeId?: string | null;
  // multiple defaults (from comma-separated shortcode)
  defaultTypeIds?: string[] | null;
};

export function Type({
  types = [],
  loading = false,
  error = null,
  onRetry,
  enabled,
  labelledBy,
  defaultTypeId = '',
  defaultTypeIds = null,
}: Props) {
  const dispatch = useWidgetDispatch();
  const state = useWidgetState();
  const { allowDisabled } = useWidgetConfig();
  const uid = useId();

  const allowedIds = useMemo(() => {
    const list: string[] = [];

    if (Array.isArray(defaultTypeIds)) list.push(...defaultTypeIds);
    if (defaultTypeId) list.push(defaultTypeId);

    const cleaned = list.map((s) => String(s).trim()).filter(Boolean);

    return Array.from(new Set(cleaned));
  }, [defaultTypeIds, defaultTypeId]);

  const filteredTypes = useMemo(() => {
    if (!allowedIds.length) return types;
    return types.filter((t) => allowedIds.includes(String(t.id)));
  }, [types, allowedIds]);

  const shortcodeHasType = allowedIds.length > 0;

  // Clear selection if prerequisites are not met
  useEffect(() => {
    if (!enabled && state.bookingType) {
      dispatch({ type: 'SET_TYPE', value: null });
      dispatch({ type: 'SET_DURATION', value: null });
    }
  }, [enabled, state.bookingType, dispatch]);

  // If we have a single allowed ID, auto-select it (same as previous single behavior)
  useEffect(() => {
    if (!enabled || loading) return;
    if (allowedIds.length !== 1) return;

    const onlyId = allowedIds[0];

    const match = types.find((t) => {
      if (String(t.id) !== onlyId) return false;
      if (t.valid === false) return false;

      // If the type is dashboard-disabled, only allow auto-select when allowDisabled is enabled
      const isVisible = t.visible !== false;
      if (!allowDisabled && !isVisible) return false;

      return true;
    });

    if (!match) return;

    if (state.bookingType !== match.id) {
      dispatch({ type: 'SET_TYPE', value: match.id });
      dispatch({ type: 'SET_DURATION', value: match.duration ?? null });
    }
  }, [enabled, loading, allowedIds, types, state.bookingType, dispatch, allowDisabled]);

  // If multiple allowed IDs are provided, ensure any existing selection stays within them
  useEffect(() => {
    if (!enabled || loading) return;
    if (allowedIds.length <= 1) return;
    if (!state.bookingType) return;

    const stillAllowed = filteredTypes.some((t) => String(t.id) === String(state.bookingType));
    if (!stillAllowed) {
      dispatch({ type: 'SET_TYPE', value: null });
      dispatch({ type: 'SET_DURATION', value: null });
    }
  }, [enabled, loading, allowedIds, filteredTypes, state.bookingType, dispatch]);

  // Auto-select when exactly one valid option and ready (only if no shortcode restriction)
  useEffect(() => {
    if (!enabled || loading || allowedIds.length) return;
    if (types.length !== 1) return;

    const only = types[0]!;
    if (only?.valid === false) return;

    // If dashboard-disabled, only auto-select when allowDisabled
    const isVisible = only.visible !== false;
    if (!allowDisabled && !isVisible) return;

    if (only.id !== state.bookingType) {
      dispatch({ type: 'SET_TYPE', value: only.id });
      dispatch({ type: 'SET_DURATION', value: only.duration ?? null });
    }
  }, [enabled, loading, allowedIds.length, types, state.bookingType, dispatch, allowDisabled]);

  const selectedForExtraText = useMemo(() => {
    if (!shortcodeHasType) return null;

    const current = filteredTypes.find((t) => String(t.id) === String(state.bookingType));
    if (current) return current;

    // If nothing selected yet and there's only one in filteredTypes, use it for text
    if (filteredTypes.length === 1) return filteredTypes[0];

    return null;
  }, [shortcodeHasType, filteredTypes, state.bookingType]);

  if (!enabled) {
    return <StepPrerequisite requires={['venue', 'partySize', 'date']} />;
  }

  if (loading) return <LoadingAnimation text="Loading experiences…" />;

  if (error) {
    return (
      <StateMessage kind="error" onAction={onRetry}>
        We couldn’t load experiences for this date.
      </StateMessage>
    );
  }

  if (filteredTypes.length === 0) {
    return (
      <StateMessage kind="empty">
        No experiences are available for this date and group size. Try another date.
      </StateMessage>
    );
  }

  return (
    <div className="type">
      <RadioGroup
        aria-labelledby={labelledBy}
        value={state.bookingType ?? ''}
        onValueChange={(value) => {
          const next = String(value);
          if (next !== (state.bookingType ?? '')) {
            dispatch({ type: 'SET_TYPE', value: next });
            const selected = filteredTypes.find((t) => String(t.id) === next);

            dispatch({ type: 'SET_DURATION', value: selected?.duration ?? null });
            goToStep('time');
          }
        }}
        className="type__list"
      >
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {filteredTypes.map((t: any) => {
          const isVisible = t.visible !== false;

          // Disable only when DMN says invalid/unavailable, OR dashboard-disabled AND allowDisabled is NOT enabled.
          const isDisabled = t.valid === false || (!allowDisabled && !isVisible);
          const isSelected = state.bookingType === t.id;
          const base = `${uid}-${t.id}`;

          return (
            <label key={t.id} className={`type-card${isDisabled ? ' type-card--disabled' : ''}`}>
              {t.image_url && (
                <div className="type-card__image-wrapper">
                  <img src={t.image_url} alt="" className="type-card__image" />
                </div>
              )}
              <div className="type-card__article">
                {t.name && (
                  <h3
                    id={`${base}-name`}
                    className="type-card__name"
                    dangerouslySetInnerHTML={{ __html: t.name }}
                  />
                )}
                {t.description && (
                  <p
                    id={`${base}-desc`}
                    className="type-card__description"
                    dangerouslySetInnerHTML={{ __html: t.description }}
                  />
                )}
                {isDisabled && t.message && <p id={`${base}-msg`}>{t.message}</p>}
                <div className="type-card__footer">
                  <p id={`${base}-price`} className="type-card__price">
                    {t.priceText}
                  </p>
                  <Radio.Root
                    value={t.id}
                    data-duration={t.duration}
                    className="type-card__radio"
                    disabled={isDisabled}
                    aria-labelledby={`${base}-name`}
                    aria-describedby={[
                      t.description ? `${base}-desc` : '',
                      t.priceText ? `${base}-price` : '',
                      isDisabled && t.message ? `${base}-msg` : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {isSelected && <Check aria-hidden="true" />}
                    <span aria-hidden="true">
                      {isDisabled ? 'Unavailable' : isSelected ? 'Selected' : 'Select'}
                    </span>
                  </Radio.Root>
                </div>
              </div>
            </label>
          );
        })}
      </RadioGroup>

      {/* Only show when shortcode type_id is provided (single or multiple) */}
      {shortcodeHasType && selectedForExtraText?.type_text && (
        <div
          className="type__extra-text"
          dangerouslySetInnerHTML={{ __html: selectedForExtraText.type_text }}
        />
      )}
    </div>
  );
}
