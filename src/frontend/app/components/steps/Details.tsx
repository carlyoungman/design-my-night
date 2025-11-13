import React, { useId, useMemo, useState } from 'react';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';
import { Notice } from '../Notice';
import LoadingAnimation from '../LoadingAnimation';

export function Details() {
  const state = useWidgetState();
  const { customer } = state;
  const dispatch = useWidgetDispatch();

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const firstId = useId();
  const lastId = useId();
  const emailId = useId();
  const phoneId = useId();
  const msgId = useId();

  const set = (patch: Partial<typeof customer>) => dispatch({ type: 'SET_CUSTOMER', value: patch });

  const firstNameInvalid = useMemo(
    () => touched.first && (customer.first_name || '').trim().length < 2,
    [touched.first, customer.first_name],
  );
  const lastNameInvalid = useMemo(
    () => touched.last && (customer.last_name || '').trim().length < 2,
    [touched.last, customer.last_name],
  );
  const emailInvalid = useMemo(
    () => touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((customer.email || '').trim()),
    [touched.email, customer.email],
  );
  const phoneInvalid = useMemo(
    () =>
      touched.phone &&
      !(
        (customer.phone || '').trim() === '' ||
        /^[\d\s()+-]{6,20}$/.test((customer.phone || '').trim())
      ),
    [touched.phone, customer.phone],
  );
  const msgTooLong = useMemo(() => (customer.message || '').length > 500, [customer.message]);

  const enabled = useMemo(
    () =>
      !!state.venueId &&
      state.partySize != null &&
      !!state.date &&
      !!state.time &&
      !!state.bookingType,
    [state],
  );

  const ERR_MSG = {
    firstName: 'Enter your first name.',
    lastName: 'Enter your last name',
    email: 'Enter a valid email, e.g. name@example.com.',
    phone: 'Enter a phone number using digits, spaces, +, ( ) or - only.',
    message: 'Special requests must be 500 characters or fewer.',
  } as const;

  if (!enabled) {
    return (
      <section className="details">
        <LoadingAnimation
          type="required"
          text="Venue, party size, date, experience and time required"
        />
      </section>
    );
  }

  return (
    <section className="details">
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
            aria-invalid={firstNameInvalid}
          />
          <Notice
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
            aria-invalid={lastNameInvalid}
          />
          <Notice invalid={lastNameInvalid} message={ERR_MSG.lastName} inlineId={`${lastId}-err`} />
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
          <Notice invalid={emailInvalid} message={ERR_MSG.email} inlineId={`${emailId}-err`} />
        </div>

        <div className="details__field-wrapper">
          <label className="details__label" htmlFor={phoneId}>
            Phone <span className="details__label-hint">*</span>
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
          <Notice invalid={phoneInvalid} message={ERR_MSG.phone} inlineId={`${phoneId}-err`} />
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
          <Notice invalid={msgTooLong} message={ERR_MSG.message} inlineId={`${msgId}-err`} />
        </div>
      </div>
    </section>
  );
}
