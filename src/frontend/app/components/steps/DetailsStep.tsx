import React, { useId, useState } from 'react';
import { StepShell } from '../StepShell';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { ErrorNotice } from '../ErrorNotice';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const phoneOk = (v: string) => v.trim() === '' || /^[\d\s()+-]{6,20}$/.test(v.trim());

export function DetailsStep() {
  const { customer } = useWidgetState();
  const dispatch = useWidgetDispatch();

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const firstId = useId();
  const lastId = useId();
  const emailId = useId();
  const phoneId = useId();
  const msgId = useId();
  const termsId = useId();

  const set = (patch: Partial<typeof customer>) => dispatch({ type: 'SET_CUSTOMER', value: patch }); // I patch state

  const firstNameInvalid = touched.first && (customer.first_name || '').trim().length < 2;
  const lastNameInvalid = touched.last && (customer.last_name || '').trim().length < 2;
  const emailInvalid = touched.email && !emailOk(customer.email || '');
  const phoneInvalid = touched.phone && !phoneOk(customer.phone || '');
  const msgTooLong = (customer.message || '').length > 500;

  const ERR_MSG = {
    firstName: 'Enter your first name.',
    lastName: 'Enter your last name',
    email: 'Enter a valid email, e.g. name@example.com.',
    phone: 'Enter a phone number using digits, spaces, +, ( ) or - only.',
    message: 'Special requests must be 500 characters or fewer.',
    consent: 'Tick this box to allow us to contact you about your booking.',
    generic: 'Please check this field.',
    formSummary: 'Let’s fix the highlighted details to continue.',
  } as const;

  return (
    <StepShell className="details">
      <div className="details__group">
        <div className="details__field-wrapper">
          <label className="details__label" htmlFor={firstId}>
            First name <span className="details__label-hint">*</span>
          </label>
          <input
            id={firstId}
            className="details__input"
            value={customer.first_name}
            onChange={(e) => set({ first_name: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, first: true }))}
            aria-invalid={touched.first && (customer.first_name || '').trim().length < 2}
          />
          <ErrorNotice
            invalid={firstNameInvalid}
            message={ERR_MSG.firstName}
            inlineId={`${firstId}-err`}
          />
        </div>
        <div className="details__field-wrapper">
          <label className="details__label" htmlFor={lastId}>
            Last name <span className="details__label-hint">*</span>
          </label>
          <input
            id={lastId}
            className="details__input"
            value={customer.last_name}
            onChange={(e) => set({ last_name: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, last: true }))}
            aria-invalid={touched.last && (customer.last_name || '').trim().length < 2}
          />
          <ErrorNotice
            invalid={lastNameInvalid}
            message={ERR_MSG.lastName}
            inlineId={`${lastId}-err`}
          />
        </div>
        <div className="details__field-wrapper">
          <label className="details__label" htmlFor={emailId}>
            Email <span className="details__label-hint">*</span>
          </label>
          <input
            id={emailId}
            className="details__input"
            type="email"
            value={customer.email}
            onChange={(e) => set({ email: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            aria-invalid={emailInvalid}
          />
          <ErrorNotice invalid={emailInvalid} message={ERR_MSG.email} inlineId={`${lastId}-err`} />
        </div>
        <div className="details__field-wrapper">
          <label className="details__label" htmlFor={phoneId}>
            Phone <span className="details__label-hint">( optional )</span>
          </label>
          <input
            id={phoneId}
            className="details__input"
            inputMode="tel"
            value={customer.phone || ''}
            onChange={(e) => set({ phone: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            aria-invalid={phoneInvalid}
          />
          <ErrorNotice invalid={phoneInvalid} message={ERR_MSG.phone} inlineId={`${phoneId}-err`} />
        </div>
        <div className="details__field-wrapper">
          <label className="details__label" htmlFor={msgId}>
            Special requests <span className="details__label-hint">( optional )</span>
          </label>
          <textarea
            id={msgId}
            className="details__textarea"
            maxLength={500}
            value={customer.message || ''}
            onChange={(e) => set({ message: e.target.value })}
          />
          <div className="details__hint">{(customer.message || '').length}/500</div>
          <ErrorNotice invalid={msgTooLong} message={ERR_MSG.message} inlineId={`${msgId}-err`} />
        </div>
        <div className="details__field-wrapper">
          <FormControlLabel
            required
            className="details__checkbox"
            control={
              <Checkbox
                id={termsId}
                checked={!!customer.gdpr}
                sx={{
                  color: 'var( --c-theme-primary)',
                  '&.Mui-checked': {
                    color: 'var( --c-theme-primary)',
                  },
                }}
                onChange={(e) => set({ gdpr: e.target.checked })}
              />
            }
            label="I am happy for NQ64 to send me exclusive information and deals from time to time."
          />
        </div>
      </div>
    </StepShell>
  );
}
