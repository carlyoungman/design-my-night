import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useWidgetDispatch, useWidgetState, useWidgetConfig } from '@app/WidgetProvider';
import { NumberField } from '@base-ui-components/react/number-field';
import { Minus, Plus } from 'lucide-react';
import { StepPrerequisite } from '@app/components/StepPrerequisite';

const DEFAULT_MAX_PARTY_SIZE = 12;

export function PartySize({ labelledBy }: { labelledBy: string }) {
  const { partySize, venueId } = useWidgetState();
  const dispatch = useWidgetDispatch();
  const { disableGroupLimit } = useWidgetConfig();
  const id = useId();
  const hintId = `${id}-hint`;
  const hasVenue = Boolean(venueId);

  const max = disableGroupLimit ? undefined : DEFAULT_MAX_PARTY_SIZE;

  // Local state drives the NumberField for immediate UI feedback.
  // The global dispatch (which triggers API calls) is debounced.
  const [localSize, setLocalSize] = useState<number>(partySize ?? 2);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when partySize changes externally (e.g. initial load)
  useEffect(() => {
    if (partySize != null) setLocalSize(partySize);
  }, [partySize]);

  // Clear the debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleValueChange = useCallback(
    (value: number | null) => {
      const n = value == null ? 1 : Math.floor(value);
      const clamped = max != null ? Math.min(max, Math.max(1, n)) : Math.max(1, n);

      setLocalSize(clamped);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        dispatch({ type: 'SET_PARTY_SIZE', size: clamped });
      }, 500);
    },
    [dispatch, max],
  );

  if (!hasVenue) {
    return <StepPrerequisite requires={['venue']} />;
  }

  return (
    <div className="party-size">
      <NumberField.Root
        id={id}
        value={localSize}
        min={1}
        {...(max != null ? { max } : {})}
        step={1}
        className="party-size__picker"
        onValueChange={handleValueChange}
      >
        <NumberField.Group className="party-size__group">
          <NumberField.Decrement className="party-size__decrement" aria-label="Fewer people">
            <Minus />
          </NumberField.Decrement>
          <NumberField.Input
            className="party-size__input"
            aria-labelledby={labelledBy}
            aria-describedby={max != null ? hintId : undefined}
          />
          <NumberField.Increment className="party-size__increment" aria-label="More people">
            <Plus />
          </NumberField.Increment>
        </NumberField.Group>
      </NumberField.Root>

      {max != null && (
        <p id={hintId} className="party-size__hint">
          Up to {max} people can book online.
        </p>
      )}
    </div>
  );
}
