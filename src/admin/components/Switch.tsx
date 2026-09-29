// src/admin/components/Switch.tsx
// An on/off setting that takes effect as part of the form it sits in, such as showing an activity
// in the widget. A native checkbox with the switch role, so it works with the keyboard (Space) and
// is announced as a switch that is on or off. The thumb moves and shows a check when on, so the
// state doesn't rely on colour alone.
import React from 'react';
import { Check } from 'lucide-react';

export default function Switch({
  checked,
  onChange,
  label,
  labelSuffix,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** The setting, which stays the same whether it is on or off, for example "Shown in widget". */
  label: string;
  /** Extra words for screen readers only, when several switches share a label (": Brunch"). */
  labelSuffix?: string;
  className?: string;
}) {
  return (
    <label className={`dmn-admin__switch${className ? ` ${className}` : ''}`}>
      <span className="dmn-admin__switch-track">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="dmn-admin__switch-thumb" aria-hidden="true">
          {checked && <Check />}
        </span>
      </span>
      <span className="dmn-admin__switch-label">
        {label}
        {labelSuffix && <span className="screen-reader-text">{labelSuffix}</span>}
      </span>
    </label>
  );
}
