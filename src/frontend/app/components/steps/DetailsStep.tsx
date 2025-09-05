import React from 'react';
import { StepShell } from '../StepShell';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';

export function DetailsStep() {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();

  return (
    <StepShell className="details">
      <div className="dmn-widget__field">
        <label className="dmn-widget__label">Name</label>
        <input
          className="dmn-widget__input"
          value={state.customer.name}
          onChange={(e) =>
            dispatch({ type: 'SET_CUSTOMER', value: { ...state.customer, name: e.target.value } })
          }
        />
      </div>
      <div className="dmn-widget__field">
        <label className="dmn-widget__label">Email</label>
        <input
          className="dmn-widget__input"
          type="email"
          value={state.customer.email}
          onChange={(e) =>
            dispatch({ type: 'SET_CUSTOMER', value: { ...state.customer, email: e.target.value } })
          }
        />
      </div>
      <div className="dmn-widget__field">
        <label className="dmn-widget__label">Phone (optional)</label>
        <input
          className="dmn-widget__input"
          value={state.customer.phone || ''}
          onChange={(e) =>
            dispatch({ type: 'SET_CUSTOMER', value: { ...state.customer, phone: e.target.value } })
          }
        />
      </div>
      <div className="dmn-widget__field">
        <label className="dmn-widget__label">Message (optional)</label>
        <textarea
          className="dmn-widget__textarea"
          value={state.customer.message || ''}
          onChange={(e) =>
            dispatch({
              type: 'SET_CUSTOMER',
              value: { ...state.customer, message: e.target.value },
            })
          }
        />
      </div>
      <label className="dmn-widget__checkbox">
        <input
          type="checkbox"
          checked={!!state.customer.gdpr}
          onChange={(e) =>
            dispatch({ type: 'SET_CUSTOMER', value: { ...state.customer, gdpr: e.target.checked } })
          }
        />
        <span>I agree to be contacted (GDPR).</span>
      </label>
    </StepShell>
  );
}
