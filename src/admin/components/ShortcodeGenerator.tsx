// src/admin/components/ShortcodeGenerator.tsx
// Builds a [dmn_booking] shortcode from the imported venues and activities. Nothing is saved and
// no DesignMyNight request is made: it only reads what has already been imported.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Copy, RotateCcw } from 'lucide-react';
import { adminListActivities, getSettings } from '@admin/api';
import { useVenues } from '@admin/components/useVenues';
import { FieldError, LoadError, Loading, StatusMessage, errorMessage } from '@admin/components/ui';
import { useErrorToast } from '@admin/components/Toasts';

type Activity = Awaited<ReturnType<typeof adminListActivities>>['activities'][number];

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/** Venue choice: a DesignMyNight venue ID, or '' to let the customer choose. */
export type ShortcodeState = {
  venueId: string;
  typeIds: string[];
  days: string[];
  allowDisabled: boolean;
  disableGroupLimit: boolean;
  venueGroup: string;
  urlParams: { name: string; value: string }[];
};

const EMPTY: ShortcodeState = {
  venueId: '',
  typeIds: [],
  days: [],
  allowDisabled: false,
  disableGroupLimit: false,
  venueGroup: '',
  urlParams: [],
};

// Quotes and square brackets would end the attribute or the shortcode early.
const clean = (v: string) => v.replace(/["[\]]/g, '').trim();

/**
 * A URL parameter name as the shortcode handler will send it: PHP's parse_str turns spaces and
 * dots into underscores, then sanitize_key lowercases it and drops anything but a-z, 0-9, _ and -.
 * Doing it here as well means the shortcode shows what is actually sent, and brackets never reach
 * parse_str (which would read them as an array).
 */
export const paramName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[ .]/g, '_')
    .replace(/[^a-z0-9_-]/g, '');

/** The shortcode for a generator state. Only options that change the default are included. */
export function buildShortcode(s: ShortcodeState): string {
  const attrs: string[] = [];
  const add = (name: string, value: string) => {
    const v = clean(value);
    if (v) attrs.push(`${name}="${v}"`);
  };

  add('venue_group', s.venueGroup);
  add('venue_id', s.venueId);
  if (s.venueId) add('type_id', s.typeIds.join(','));
  // Weekday order, whatever order they were ticked in.
  add('allowed_days', DAYS.filter((d) => s.days.includes(d)).join(','));

  const params = new URLSearchParams();
  s.urlParams.forEach((p) => {
    const name = paramName(p.name);
    if (name) params.append(name, p.value.trim());
  });
  add('url_params', params.toString());

  // Flags are on when the bare attribute is present (see the shortcode in dmn-booking-plugin.php).
  if (s.allowDisabled) attrs.push('allow_disabled');
  if (s.disableGroupLimit) attrs.push('disable_group_limit');

  return attrs.length ? `[dmn_booking ${attrs.join(' ')}]` : '[dmn_booking]';
}

const toggle = (list: string[], value: string, on: boolean) =>
  on ? [...list, value] : list.filter((v) => v !== value);

/** The activities imported for one venue (by WordPress post ID), reloaded when it changes. */
function useActivities(venuePostId: number | null) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setActivities([]);
    setError(null);
    if (venuePostId == null) return;
    let cancel = false;
    setLoading(true);
    (async () => {
      try {
        const r = await adminListActivities(venuePostId);
        if (!cancel) setActivities(r?.activities ?? []);
      } catch (e) {
        if (!cancel) setError(errorMessage(e, 'Activities could not be loaded.'));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [venuePostId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { activities, loading, error, retry };
}

export default function ShortcodeGenerator() {
  const { venues, loading: venuesLoading, error: venuesError, retry: retryVenues } = useVenues();
  const [state, setState] = useState<ShortcodeState>(EMPTY);
  const [defaultGroup, setDefaultGroup] = useState('');
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const copyError = useErrorToast();

  const set = (patch: Partial<ShortcodeState>) => {
    setCopied(false);
    setState((s) => ({ ...s, ...patch }));
  };

  // The Connection setting is only used as the venue group placeholder, so a failure is ignored.
  useEffect(() => {
    let cancel = false;
    getSettings()
      .then((r) => !cancel && setDefaultGroup(r?.venue_group ?? ''))
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);

  // Venues can only be preselected by their DesignMyNight ID.
  const pickable = useMemo(() => venues.filter((v) => v.dmn_id), [venues]);
  const venue = pickable.find((v) => v.dmn_id === state.venueId) ?? null;
  const {
    activities,
    loading: activitiesLoading,
    error: activitiesError,
    retry: retryActivities,
  } = useActivities(venue?.id ?? null);
  const pickableActivities = activities.filter((a) => a.dmn_type_id);

  const shortcode = buildShortcode(state);
  const hiddenPicked =
    !state.allowDisabled &&
    pickableActivities.some((a) => a.visible === false && state.typeIds.includes(a.dmn_type_id));

  const selectCode = () => {
    const el = codeRef.current;
    const sel = window.getSelection();
    if (!el || !sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const onCopy = async () => {
    copyError.clear();
    try {
      await navigator.clipboard.writeText(shortcode);
      setCopied(true);
    } catch {
      selectCode();
      copyError.show('The shortcode could not be copied', {
        description: 'It is selected: copy it with Ctrl+C (⌘C on a Mac).',
      });
    }
  };

  const onReset = () => {
    copyError.clear();
    set(EMPTY);
  };

  const updateParam = (i: number, patch: Partial<{ name: string; value: string }>) =>
    set({ urlParams: state.urlParams.map((p, j) => (j === i ? { ...p, ...patch } : p)) });

  return (
    <div className="dmn-admin__split dmn-admin__generator">
      <form className="dmn-admin__form" onSubmit={(e) => e.preventDefault()}>
        <div className="dmn-admin__field">
          <label htmlFor="dmn-sc-venue">Venue</label>
          <select
            id="dmn-sc-venue"
            value={state.venueId}
            aria-describedby="dmn-sc-venue-help"
            onChange={(e) => set({ venueId: e.target.value, typeIds: [] })}
          >
            <option value="">Let the customer choose</option>
            {pickable.map((v) => (
              <option key={v.id} value={v.dmn_id}>
                {v.title || v.dmn_id}
              </option>
            ))}
          </select>
          <p id="dmn-sc-venue-help" className="dmn-admin__help">
            Choosing a venue starts the booking with it selected.
          </p>
          {venuesLoading && <Loading>Loading venues…</Loading>}
          {!venuesLoading && venuesError && (
            <LoadError message={venuesError} onRetry={retryVenues} />
          )}
          {!venuesLoading && !venuesError && pickable.length === 0 && (
            <p className="dmn-admin__empty">
              No venues imported yet. Use <strong>Import from DesignMyNight</strong> to list them
              here.
            </p>
          )}
        </div>

        {venue && (
          <fieldset className="dmn-admin__field">
            <legend className="dmn-admin__label">
              Activities <span className="dmn-admin__label-hint">(optional)</span>
            </legend>
            <p className="dmn-admin__help">
              Choose one or more to preselect them. Leave all unticked to show every activity.
            </p>
            {activitiesLoading && <Loading>Loading activities…</Loading>}
            {!activitiesLoading && activitiesError && (
              <LoadError message={activitiesError} onRetry={retryActivities} />
            )}
            {!activitiesLoading && !activitiesError && pickableActivities.length === 0 && (
              <p className="dmn-admin__empty">This venue has no imported activities.</p>
            )}
            {!activitiesLoading && pickableActivities.length > 0 && (
              <div className="dmn-admin__check-list">
                {pickableActivities.map((a) => (
                  <label key={a.id} className="dmn-admin__checkbox">
                    <input
                      type="checkbox"
                      checked={state.typeIds.includes(a.dmn_type_id)}
                      onChange={(e) =>
                        set({ typeIds: toggle(state.typeIds, a.dmn_type_id, e.target.checked) })
                      }
                    />
                    <span>
                      {a.name || a.dmn_type_id}
                      {a.visible === false && (
                        <span className="dmn-admin__label-hint"> (hidden)</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {hiddenPicked && (
              <StatusMessage tone="warning">
                A chosen activity is hidden. Tick <strong>Also show hidden activities</strong> so
                customers can see it.
              </StatusMessage>
            )}
          </fieldset>
        )}

        <fieldset className="dmn-admin__field">
          <legend className="dmn-admin__label">
            Days that can be booked <span className="dmn-admin__label-hint">(optional)</span>
          </legend>
          <p className="dmn-admin__help">Leave all unticked to allow every day.</p>
          <div className="dmn-admin__check-list dmn-admin__check-list--days">
            {DAYS.map((d) => (
              <label key={d} className="dmn-admin__checkbox">
                <input
                  type="checkbox"
                  checked={state.days.includes(d)}
                  onChange={(e) => set({ days: toggle(state.days, d, e.target.checked) })}
                />
                {d}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="dmn-admin__field">
          <legend className="dmn-admin__label">Options</legend>
          <label className="dmn-admin__checkbox">
            <input
              type="checkbox"
              checked={state.allowDisabled}
              aria-describedby="dmn-sc-disabled-help"
              onChange={(e) => set({ allowDisabled: e.target.checked })}
            />
            Also show hidden activities
          </label>
          <p id="dmn-sc-disabled-help" className="dmn-admin__help dmn-admin__help--flush">
            Shows activities that are hidden under Venues.
          </p>
          <label className="dmn-admin__checkbox">
            <input
              type="checkbox"
              checked={state.disableGroupLimit}
              aria-describedby="dmn-sc-group-help"
              onChange={(e) => set({ disableGroupLimit: e.target.checked })}
            />
            Remove the group size limit
          </label>
          <p id="dmn-sc-group-help" className="dmn-admin__help dmn-admin__help--flush">
            Removes the maximum group size and hides the group enquiry link.
          </p>
        </fieldset>

        <details className="dmn-admin__disclosure">
          <summary>Advanced options</summary>
          <div className="dmn-admin__form dmn-admin__spacer-top">
            <div className="dmn-admin__field">
              <label htmlFor="dmn-sc-group">
                Venue group <span className="dmn-admin__label-hint">(optional)</span>
              </label>
              <input
                id="dmn-sc-group"
                value={state.venueGroup}
                placeholder={defaultGroup}
                aria-describedby="dmn-sc-group-field-help"
                onChange={(e) => set({ venueGroup: e.target.value })}
              />
              <p id="dmn-sc-group-field-help" className="dmn-admin__help">
                Leave empty to use the venue group set under Connection.
              </p>
            </div>

            <fieldset className="dmn-admin__field">
              <legend className="dmn-admin__label">
                Extra URL parameters <span className="dmn-admin__label-hint">(optional)</span>
              </legend>
              <p className="dmn-admin__help">
                Added to the booking URL with the ones set under URL parameters. Rows without a name
                are ignored.
              </p>
              {state.urlParams.map((p, i) => {
                const sent = paramName(p.name);
                const changed = p.name.trim() !== '' && sent !== p.name.trim();
                return (
                  <fieldset key={i} className="dmn-admin__param-row">
                    <legend className="screen-reader-text">Parameter {i + 1}</legend>
                    <div className="dmn-admin__field">
                      <label htmlFor={`dmn-sc-param-name-${i}`}>Name</label>
                      <input
                        id={`dmn-sc-param-name-${i}`}
                        value={p.name}
                        aria-invalid={changed}
                        aria-describedby={changed ? `dmn-sc-param-name-${i}-error` : undefined}
                        onChange={(e) => updateParam(i, { name: e.target.value })}
                      />
                      {changed && (
                        <FieldError id={`dmn-sc-param-name-${i}-error`}>
                          {sent ? (
                            <>
                              Will be sent as <code>{sent}</code>.
                            </>
                          ) : (
                            'Will be ignored.'
                          )}{' '}
                          Use lowercase letters, numbers, _ and -.
                        </FieldError>
                      )}
                    </div>
                    <div className="dmn-admin__field">
                      <label htmlFor={`dmn-sc-param-value-${i}`}>Value</label>
                      <input
                        id={`dmn-sc-param-value-${i}`}
                        value={p.value}
                        onChange={(e) => updateParam(i, { value: e.target.value })}
                      />
                    </div>
                    <button
                      type="button"
                      className="button button--danger"
                      aria-label={`Remove parameter ${p.name || i + 1}`}
                      onClick={() => set({ urlParams: state.urlParams.filter((_, j) => j !== i) })}
                    >
                      Remove
                    </button>
                  </fieldset>
                );
              })}
              <div className="actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => set({ urlParams: [...state.urlParams, { name: '', value: '' }] })}
                >
                  Add parameter
                </button>
              </div>
            </fieldset>
          </div>
        </details>
      </form>

      <div className="dmn-admin__generator-output">
        <h3 id="dmn-sc-output-title">Your shortcode</h3>
        <code
          ref={codeRef}
          className="dmn-admin__code-block"
          aria-labelledby="dmn-sc-output-title"
          aria-live="polite"
        >
          {shortcode}
        </code>
        <div className="actions">
          <button type="button" className="button" onClick={onCopy}>
            <Copy aria-hidden="true" />
            Copy shortcode
          </button>
          <button type="button" className="button button--text" onClick={onReset}>
            <RotateCcw aria-hidden="true" />
            Reset
          </button>
          {copied && <StatusMessage tone="success">Copied</StatusMessage>}
        </div>
        <p className="dmn-admin__help">
          Paste it into any page or post to show the booking widget.
        </p>
      </div>
    </div>
  );
}
