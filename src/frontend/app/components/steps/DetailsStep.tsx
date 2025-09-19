import React, { useId, useState } from 'react';
import { StepShell } from '../StepShell';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';



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

  const set = (patch: Partial<typeof customer>) => dispatch({ type: 'SET_CUSTOMER', value: patch }); // I patch state

  const nameInvalid =
    (touched.first && (customer.first_name || '').trim().length < 2) ||
    (touched.last && (customer.last_name || '').trim().length < 2);
  const emailInvalid = touched.email && !emailOk(customer.email || '');
  const phoneInvalid = touched.phone && !phoneOk(customer.phone || '');
  const msgTooLong = (customer.message || '').length > 500;

  return (
    <StepShell className="details">
      {/* First name */}
      <div className="dmn-widget__field">
        <label className="dmn-widget__label" htmlFor={firstId}>
          First name
        </label>
        <input
          id={firstId}
          className="dmn-widget__input"
          value={customer.first_name}
          onChange={(e) => set({ first_name: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, first: true }))}
          aria-invalid={touched.first && (customer.first_name || '').trim().length < 2}
        />
      </div>

      {/* Last name */}
      <div className="dmn-widget__field">
        <label className="dmn-widget__label" htmlFor={lastId}>
          Last name
        </label>
        <input
          id={lastId}
          className="dmn-widget__input"
          value={customer.last_name}
          onChange={(e) => set({ last_name: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, last: true }))}
          aria-invalid={touched.last && (customer.last_name || '').trim().length < 2}
        />
      </div>

      {nameInvalid && <p className="dmn-widget__error">Enter first and last name, min 2 chars.</p>}

      {/* Email */}
      <div className="dmn-widget__field">
        <label className="dmn-widget__label" htmlFor={emailId}>
          Email
        </label>
        <input
          id={emailId}
          className="dmn-widget__input"
          type="email"
          value={customer.email}
          onChange={(e) => set({ email: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          aria-invalid={emailInvalid}
        />
      </div>
      {emailInvalid && <p className="dmn-widget__error">Enter a valid email.</p>}

      {/* Phone (optional) */}
      <div className="dmn-widget__field">
        <label className="dmn-widget__label" htmlFor={phoneId}>
          Phone (optional)
        </label>
        <input
          id={phoneId}
          className="dmn-widget__input"
          inputMode="tel"
          value={customer.phone || ''}
          onChange={(e) => set({ phone: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          aria-invalid={phoneInvalid}
        />
      </div>
      {phoneInvalid && <p className="dmn-widget__error">Use digits, spaces, +, ( ), - only.</p>}

      {/* Special requests */}
      <div className="dmn-widget__field">
        <label className="dmn-widget__label" htmlFor={msgId}>
          Special requests (optional)
        </label>
        <textarea
          id={msgId}
          className="dmn-widget__textarea"
          maxLength={500}
          value={customer.message || ''}
          onChange={(e) => set({ message: e.target.value })}
        />
        <div className="dmn-widget__hint">{(customer.message || '').length}/500</div>
      </div>
      {msgTooLong && <p className="dmn-widget__error">Max 500 characters.</p>}

      {/* GDPR consent */}
      <label className="dmn-widget__checkbox">
        <input
          type="checkbox"
          checked={!!customer.gdpr}
          onChange={(e) => set({ gdpr: e.target.checked })}
        />
        <span>I agree to be contacted about this booking.</span>
      </label>
    </StepShell>
  );
}
