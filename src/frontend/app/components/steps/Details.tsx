import React, { useId, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useWidgetDispatch, useWidgetState } from '@app/WidgetProvider';
import { StepPrerequisite } from '@app/components/StepPrerequisite';
import { MAX_MESSAGE, validateCustomer, type CustomerField } from '@app/utils/validation';

type FieldDef = {
  key: CustomerField;
  label: string;
  required: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete: string;
};

const FIELDS: FieldDef[] = [
  { key: 'first_name', label: 'First name', required: true, autoComplete: 'given-name' },
  { key: 'last_name', label: 'Last name', required: true, autoComplete: 'family-name' },
  { key: 'email', label: 'Email', required: true, type: 'email', autoComplete: 'email' },
  {
    key: 'phone',
    label: 'Phone',
    required: true,
    type: 'tel',
    inputMode: 'tel',
    autoComplete: 'tel',
  },
];

export function Details() {
  const state = useWidgetState();
  const { customer, detailsAttempted } = state;
  const dispatch = useWidgetDispatch();
  const uid = useId();

  // Errors show after a field loses focus, or for every field once the customer tries to continue.
  const [touched, setTouched] = useState<Partial<Record<CustomerField, boolean>>>({});
  const errors = useMemo(() => validateCustomer(customer), [customer]);
  const visibleError = (k: CustomerField) =>
    touched[k] || detailsAttempted || k === 'message' ? errors[k] : undefined;

  const set = (patch: Partial<typeof customer>) => dispatch({ type: 'SET_CUSTOMER', value: patch });

  const enabled =
    !!state.venueId &&
    state.partySize != null &&
    !!state.date &&
    !!state.time &&
    !!state.bookingType;

  if (!enabled) {
    return <StepPrerequisite requires={['venue', 'partySize', 'date', 'experience', 'time']} />;
  }

  const msgId = `${uid}-message`;
  const msgError = visibleError('message');

  return (
    <div className="details">
      <p className="details__hint">All fields are required unless marked optional.</p>
      <div className="details__group">
        {FIELDS.map((f) => {
          const id = `${uid}-${f.key}`;
          const err = visibleError(f.key);
          return (
            <div key={f.key} className="details__field-wrapper">
              <label className="details__label" htmlFor={id}>
                {f.label}
              </label>
              <input
                id={id}
                className="details__input"
                type={f.type || 'text'}
                inputMode={f.inputMode}
                autoComplete={f.autoComplete}
                required={f.required}
                value={(customer[f.key] as string) || ''}
                onChange={(e) => set({ [f.key]: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, [f.key]: true }))}
                aria-invalid={err ? true : undefined}
                aria-describedby={err ? `${id}-err` : undefined}
              />
              {err && (
                <p id={`${id}-err`} className="details__error">
                  <AlertCircle aria-hidden="true" />
                  {err}
                </p>
              )}
            </div>
          );
        })}

        <div className="details__field-wrapper">
          <label className="details__label" htmlFor={msgId}>
            Special requests <span className="details__label-hint">(optional)</span>
          </label>
          <textarea
            id={msgId}
            className="details__textarea"
            maxLength={MAX_MESSAGE}
            value={customer.message || ''}
            onChange={(e) => set({ message: e.target.value })}
            aria-invalid={msgError ? true : undefined}
            aria-describedby={`${msgId}-count${msgError ? ` ${msgId}-err` : ''}`}
          />
          <p id={`${msgId}-count`} className="details__hint">
            {(customer.message || '').length} of {MAX_MESSAGE} characters
          </p>
          {msgError && (
            <p id={`${msgId}-err`} className="details__error">
              <AlertCircle aria-hidden="true" />
              {msgError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
