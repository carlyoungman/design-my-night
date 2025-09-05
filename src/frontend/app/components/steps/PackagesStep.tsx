import React, { useEffect, useState } from 'react';
import { StepShell } from '../StepShell';
import { useWidgetDispatch, useWidgetState } from '../../WidgetProvider';

export function PackagesStep() {
  const state = useWidgetState();
  const dispatch = useWidgetDispatch();
  const [loading, setLoading] = useState(false);

  async function loadPackages() {
    if (!state.venueId) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/wp-json/dmn/v1/packages?venue_id=${encodeURIComponent(state.venueId)}`,
      );
      const json = await res.json();
      dispatch({ type: 'SET_PACKAGES', value: json?.data || [] });
    } catch {
      dispatch({ type: 'SET_PACKAGES', value: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (state.step === 'packages') loadPackages();
  }, [state.step, state.venueId]);

  return (
    <StepShell className="packages">
      {loading && <p>Loading packages…</p>}
      {!loading && (
        <ul className="dmn-widget__list">
          {state.packages.map((p) => (
            <li key={p.id}>
              <label className="dmn-widget__checkbox">
                <input
                  type="checkbox"
                  checked={state.packagesSelected.includes(p.id)}
                  onChange={(e) => {
                    const next = new Set(state.packagesSelected);
                    e.target.checked ? next.add(p.id) : next.delete(p.id);
                    dispatch({ type: 'SET_PACKAGES_SELECTED', value: Array.from(next) });
                  }}
                />
                <span>{p.label}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </StepShell>
  );
}
