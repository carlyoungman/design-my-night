// src/admin/components/Choices.tsx
// Controls for choosing one option. Which to use (see CLAUDE.md section 6):
// - Segmented: two to four short options that fit on one line, such as Light / Dark / Match device.
// - ChoiceCards: options that need a sentence of explanation, or sit in a narrow column.
// - A native <select>: longer lists, or options whose labels are long.
// Both are native radio buttons, so arrow keys move between options and forms read them as usual.
import React, { useId } from 'react';
import { Check } from 'lucide-react';

type Option<T extends string> = { value: T; label: string };

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  labelledBy,
  describedBy,
  compact = false,
}: {
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  /** Id of the visible label for the whole group. */
  labelledBy: string;
  describedBy?: string;
  /** Smaller text and padding, for four options in a narrow space. */
  compact?: boolean;
}) {
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={`dmn-admin__segmented${compact ? ' dmn-admin__segmented--compact' : ''}`}
    >
      {options.map((o) => (
        <label key={o.value} className="dmn-admin__segment">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <Check className="dmn-admin__segment-check" aria-hidden="true" />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

type Choice<T extends string> = { value: T; title: string; help: string };

export function ChoiceCards<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly Choice<T>[];
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <div className="dmn-admin__choices">
      {options.map((o) => (
        <label key={o.value} className="dmn-admin__choice">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span>
            <span className="dmn-admin__choice-title">{o.title}</span>
            <span className="dmn-admin__choice-help">{o.help}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
