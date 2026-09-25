// src/admin/components/AppearanceCard.tsx
// Theme colour and light/dark mode for this admin screen and the booking widget, and whether the
// widget's stylesheet is loaded.
import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { getAppearance, saveAppearance, type Appearance, type ColourMode } from '@admin/api';
import { FieldError, LoadError, Loading, SaveState, errorMessage } from '@admin/components/ui';
import { useErrorToast } from '@admin/components/Toasts';

type FormState = {
  theme_colour: string;
  admin_mode: ColourMode;
  widget_mode: ColourMode;
  widget_styles: boolean;
};

const MODES: { value: ColourMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Match device' },
];

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `#abc` or `abc` → `#aabbcc`; null when it isn't a hex colour. */
function normaliseHex(value: string): string | null {
  const m = HEX.exec(value.trim());
  if (!m) return null;
  const hex = m[1].toLowerCase();
  return `#${hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex}`;
}

/**
 * Applies saved appearance to the admin root (`.dmn-admin`, rendered by dmn-booking-plugin.php
 * with the same attributes), so a save takes effect without reloading.
 */
function applyToAdmin(a: Appearance) {
  const root = document.querySelector<HTMLElement>('.dmn-admin');
  if (!root) return;
  root.dataset.mode = a.admin_mode;
  Object.entries(a.css_vars).forEach(([name, value]) => root.style.setProperty(name, value));
}

export default function AppearanceCard({ onDirty }: { onDirty?: (d: boolean) => void }) {
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const saveError = useErrorToast();
  const [ok, setOk] = useState<string | null>(null);
  const [colourErr, setColourErr] = useState<string | null>(null);
  const [defaultColour, setDefaultColour] = useState('#6750a4');
  const [saved, setSaved] = useState<FormState | null>(null);
  const [form, setForm] = useState<FormState>({
    theme_colour: '#6750a4',
    admin_mode: 'light',
    widget_mode: 'light',
    widget_styles: true,
  });

  const dirty = useMemo(
    () =>
      !!saved &&
      ((normaliseHex(form.theme_colour) ?? form.theme_colour) !== saved.theme_colour ||
        form.admin_mode !== saved.admin_mode ||
        form.widget_mode !== saved.widget_mode ||
        form.widget_styles !== saved.widget_styles),
    [form, saved],
  );

  useEffect(() => {
    onDirty?.(dirty);
  }, [dirty, onDirty]);

  const accept = (a: Appearance) => {
    const next = {
      theme_colour: a.theme_colour,
      admin_mode: a.admin_mode,
      widget_mode: a.widget_mode,
      widget_styles: a.widget_styles,
    };
    setForm(next);
    setSaved(next);
    setDefaultColour(a.default_theme_colour);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      accept(await getAppearance());
    } catch (e) {
      setLoadErr(errorMessage(e, 'Appearance settings could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (patch: Partial<FormState>) => {
    setOk(null);
    setForm((f) => ({ ...f, ...patch }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    saveError.clear();
    setOk(null);
    const colour = normaliseHex(form.theme_colour);
    if (!colour) {
      setColourErr('Enter a hex colour such as #6750a4, or pick one with the swatch.');
      document.getElementById('dmn-appearance-colour-hex')?.focus();
      return;
    }
    setColourErr(null);
    setSaving(true);
    try {
      const res = await saveAppearance({ ...form, theme_colour: colour });
      accept(res);
      applyToAdmin(res);
      setOk('Appearance saved.');
    } catch (e2) {
      saveError.show('Appearance could not be saved. Try again.', { error: e2 });
    } finally {
      setSaving(false);
    }
  };

  const pickerValue = normaliseHex(form.theme_colour) ?? saved?.theme_colour ?? defaultColour;

  return (
    <section className="dmn-admin__card" aria-labelledby="dmn-admin-appearance-title">
      <div className="dmn-admin__card-header dmn-admin__card-header--split">
        <div>
          <h2 id="dmn-admin-appearance-title">Appearance</h2>
          <p className="dmn-admin__help">
            The theme colour and light or dark mode for this screen and the booking widget.
          </p>
        </div>
        <SaveState dirty={dirty} ok={ok} />
      </div>

      {loading && <Loading>Loading appearance…</Loading>}
      {!loading && loadErr && <LoadError message={loadErr} onRetry={load} />}

      {!loading && !loadErr && (
        <form onSubmit={onSubmit} className="dmn-admin__form dmn-admin__spacer-top" noValidate>
          <div className="dmn-admin__field">
            <label htmlFor="dmn-appearance-colour-hex">Theme colour</label>
            <div className="dmn-admin__colour">
              <input
                type="color"
                className="dmn-admin__colour-swatch"
                value={pickerValue}
                aria-label="Pick theme colour"
                onChange={(e) => {
                  setColourErr(null);
                  update({ theme_colour: e.target.value });
                }}
              />
              <input
                id="dmn-appearance-colour-hex"
                type="text"
                className="dmn-admin__colour-hex"
                value={form.theme_colour}
                spellCheck={false}
                autoComplete="off"
                aria-invalid={colourErr ? true : undefined}
                aria-describedby={`dmn-appearance-colour-help${colourErr ? ' dmn-appearance-colour-err' : ''}`}
                onChange={(e) => update({ theme_colour: e.target.value })}
                onBlur={() => {
                  const hex = normaliseHex(form.theme_colour);
                  if (hex) update({ theme_colour: hex });
                }}
              />
              <button
                type="button"
                className="button button--text"
                disabled={normaliseHex(form.theme_colour) === defaultColour}
                onClick={() => {
                  setColourErr(null);
                  update({ theme_colour: defaultColour });
                }}
              >
                Reset to default
              </button>
            </div>
            {colourErr && <FieldError id="dmn-appearance-colour-err">{colourErr}</FieldError>}
            <p id="dmn-appearance-colour-help" className="dmn-admin__help">
              Used for buttons, links, selection and focus. Where the colour would be hard to read,
              a lighter or darker shade of it is used so text and controls stay readable.
            </p>
          </div>

          <div className="dmn-admin__form-grid">
            <ModeField
              id="dmn-appearance-admin-mode"
              label="Admin mode"
              help="This plugin screen only; the rest of WordPress is unchanged."
              value={form.admin_mode}
              onChange={(admin_mode) => update({ admin_mode })}
            />
            <ModeField
              id="dmn-appearance-widget-mode"
              label="Booking widget mode"
              help="The booking form on your site. Pick the mode that suits your theme's background."
              value={form.widget_mode}
              onChange={(widget_mode) => update({ widget_mode })}
            />
          </div>
          <p className="dmn-admin__help dmn-admin__help--flush">
            <strong>Match device</strong> follows the light or dark setting of the device the page
            is viewed on.
          </p>

          <label className="dmn-admin__checkbox">
            <input
              type="checkbox"
              checked={form.widget_styles}
              aria-describedby="dmn-appearance-widget-styles-help"
              onChange={(e) => update({ widget_styles: e.target.checked })}
            />
            Load the booking widget styles
          </label>
          <p id="dmn-appearance-widget-styles-help" className="dmn-admin__help dmn-admin__help--flush">
            Turn this off to style the booking widget from your theme instead. The widget keeps its
            markup and <code>dmn-</code> class names, but the plugin's stylesheet, including the
            theme colour and widget mode above, is not loaded on your site.
          </p>

          <div className="actions dmn-admin__form-footer">
            <button type="submit" className="button" disabled={saving || !dirty} aria-busy={saving}>
              {saving ? 'Saving…' : 'Save appearance'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function ModeField({
  id,
  label,
  help,
  value,
  onChange,
}: {
  id: string;
  label: string;
  help: string;
  value: ColourMode;
  onChange: (mode: ColourMode) => void;
}) {
  return (
    <div className="dmn-admin__field">
      <span className="dmn-admin__label" id={`${id}-label`}>
        {label}
      </span>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, next: ColourMode | null) => {
          if (next) onChange(next); // one option must stay selected
        }}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-help`}
      >
        {MODES.map((m) => (
          <ToggleButton key={m.value} value={m.value}>
            {m.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <p id={`${id}-help`} className="dmn-admin__help">
        {help}
      </p>
    </div>
  );
}
