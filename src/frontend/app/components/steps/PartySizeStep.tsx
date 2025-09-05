import React from 'react';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { NumberField } from '@base-ui-components/react/number-field';
import { Minus, Plus } from 'lucide-react';
import { StepShell } from '../StepShell';

export function PartySizeStep() {
  const dispatch = useWidgetDispatch();
  const id = React.useId();
  return (
    <StepShell className="party-size">
      <p className="step__label">
        Whats your<br></br>party size?
      </p>
      <NumberField.Root id={id} defaultValue={2} min={1} max={12} className="timepicker">
        <NumberField.Group className="timepicker__group">
          <NumberField.Decrement className="timepicker__decrement">
            <Minus />
          </NumberField.Decrement>
          <NumberField.Input
            className="timepicker__input"
            onChange={(e) => {
              const size = Math.max(1, Number(e.target.value || 1));
              dispatch({ type: 'SET_PARTY_SIZE', size });
            }}
          />
          <NumberField.Increment className="timepicker__increment">
            <Plus />
          </NumberField.Increment>
        </NumberField.Group>
      </NumberField.Root>
    </StepShell>
  );
}

export default function ExampleNumberField() {}
