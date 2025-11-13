import React, { useCallback, useEffect, useId } from 'react';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { NumberField } from '@base-ui-components/react/number-field';
import { Minus, Plus } from 'lucide-react';
import { useBookingLink } from '../../hooks/useBookingLink';
import LoadingAnimation from '../LoadingAnimation';

export function PartySize() {
  const { partySize, venueId } = useWidgetState();
  const dispatch = useWidgetDispatch();
  const id = useId();
  const hasVenue = Boolean(venueId);

  const { data: groupLink } = useBookingLink(venueId);

  useEffect(() => {
    if (partySize == null) {
      dispatch({ type: 'SET_PARTY_SIZE', size: 2 });
    }
  }, [partySize, dispatch]);

  const handleValueChange = useCallback(
    (value: number | null) => {
      const n = value == null ? 1 : Math.floor(value);
      const clamped = Math.min(12, Math.max(1, n));
      dispatch({ type: 'SET_PARTY_SIZE', size: clamped });
    },
    [dispatch],
  );

  if (!hasVenue) {
    return (
      <section className="party-size">
        <LoadingAnimation type="required" text="Venue required" />
      </section>
    );
  }

  const isGroupEligible = groupLink?.enabled && groupLink.url;

  return (
    <section className="party-size">
      <NumberField.Root
        id={id}
        value={partySize ?? 2}
        min={1}
        max={12}
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
          Large groups of 12 or more,
          <br /> click here
        </a>
      )}
    </section>
  );
}
