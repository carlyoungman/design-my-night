import React, { useCallback, useEffect, useId } from 'react';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { NumberField } from '@base-ui-components/react/number-field';
import { Minus, Plus } from 'lucide-react';
import { StepShell } from '../StepShell';

export function PartySizeStep() {
  const { partySize } = useWidgetState();
  const dispatch = useWidgetDispatch();
  const id = useId();

  // I seed a starting value so the field is controlled from mount.
  useEffect(() => {
    if (partySize == null) {
      dispatch({ type: 'SET_PARTY_SIZE', size: 2 });
    }
  }, [partySize, dispatch]);

  // Base UI calls me with number | null on every change (typing & +/-).
  const handleValueChange = useCallback(
    (value: number | null) => {
      const n = value == null ? 1 : Math.floor(value);
      const clamped = Math.min(12, Math.max(1, n));
      dispatch({ type: 'SET_PARTY_SIZE', size: clamped });
    },
    [dispatch],
  );

  return (
    <StepShell className="party-size">
      <p className="step__label">
        Whats your
        <br />
        party size?
      </p>

      <NumberField.Root
        id={id}
        value={partySize ?? 2} // controlled
        min={1}
        max={12}
        step={1}
        className="timepicker"
        onValueChange={handleValueChange}
      >
        <NumberField.Group className="timepicker__group">
          <NumberField.Decrement className="timepicker__decrement">
            <Minus />
          </NumberField.Decrement>
          <NumberField.Input className="timepicker__input" />
          <NumberField.Increment className="timepicker__increment">
            <Plus />
          </NumberField.Increment>
        </NumberField.Group>
      </NumberField.Root>
    </StepShell>
  );
}

export default function ExampleNumberField() {}
