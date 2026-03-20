import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useWidgetDispatch, useWidgetState } from '@app/WidgetProvider';
import { NumberField } from '@base-ui-components/react/number-field';
import { Minus, Plus } from 'lucide-react';
import { useBookingLink } from '@app/hooks/useBookingLink';
import { StepPrerequisite } from '@app/components/StepPrerequisite';

export function PartySize() {
  const { partySize, venueId } = useWidgetState();
  const dispatch = useWidgetDispatch();
  const id = useId();
  const hasVenue = Boolean(venueId);

  const { data: groupLink } = useBookingLink(venueId);

  const max = groupLink?.maxPartySize ?? 12;

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
      const clamped = Math.min(max, Math.max(1, n));

      setLocalSize(clamped);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        dispatch({ type: 'SET_PARTY_SIZE', size: clamped });
      }, 500);
    },
    [dispatch, max],
  );

  if (!hasVenue) {
    return (
      <section className="party-size">
        <StepPrerequisite requires={['venue']} />
      </section>
    );
  }

  const isGroupEligible = groupLink?.enabled && groupLink.url;

  return (
    <section className="party-size">
      <NumberField.Root
        id={id}
        value={localSize}
        min={1}
        max={max}
        step={1}
        className="party-size__picker"
        onValueChange={handleValueChange}
      >
        <NumberField.Group className="party-size__group">
          <NumberField.Decrement className="party-size__decrement">
            <Minus />
          </NumberField.Decrement>
          <NumberField.Input className="party-size__input" />
          <NumberField.Increment className="party-size__increment">
            <Plus />
          </NumberField.Increment>
        </NumberField.Group>
      </NumberField.Root>

      {isGroupEligible && (
        <a
          className="party-size__group-link"
          target="_blank"
          rel="noopener noreferrer"
          href={groupLink.url}
        >
          {groupLink.label}
        </a>
      )}
    </section>
  );
}
