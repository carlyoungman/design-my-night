import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdmin } from '@admin/AdminContext';
import {
  adminGetVenueDisplay,
  adminSaveVenueDisplay,
  type VenueDisplayMode,
  type VenueDisplaySettings,
} from '@admin/api';
import {
  FieldError,
  LoadError,
  Loading,
  SaveState,
  StatusMessage,
  errorMessage,
  isValidUrl,
} from '@admin/components/ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const wp: any;

type Props = { onDirty?: (d: boolean) => void };

const ALLOWED_MODES: VenueDisplayMode[] = ['display', 'external_booking', 'hidden'];

const MODE_LABELS: Record<VenueDisplayMode, string> = {
  display: 'Bookable in the widget',
  external_booking: 'Booked elsewhere',
  hidden: 'Hidden',
};

const EMPTY: VenueDisplaySettings = {
  mode: 'display',
  inline_message: '',
  title: '',
  content: '',
  button_text: '',
  button_url: '',
  image_id: null,
  image_url: null,
};

export default function VenueDisplayCard({ onDirty }: Props) {
  const { selectedVenueId } = useAdmin();

  const [current, setCurrent] = useState<VenueDisplaySettings>(EMPTY);
  const [saved, setSaved] = useState<VenueDisplaySettings>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const dirty =
    current.mode !== saved.mode ||
    current.inline_message !== saved.inline_message ||
    current.title !== saved.title ||
    current.content !== saved.content ||
    current.button_text !== saved.button_text ||
    current.button_url !== saved.button_url ||
    (current.image_id ?? null) !== (saved.image_id ?? null);

  const invalid = useMemo(() => !isValidUrl(current.button_url), [current.button_url]);

  useEffect(() => {
    onDirty?.(dirty);
  }, [dirty, onDirty]);

  const load = useCallback(async () => {
    if (!selectedVenueId) {
      setCurrent(EMPTY);
      setSaved(EMPTY);
      return;
    }
    setLoading(true);
    setLoadErr(null);
    setErr(null);
    setOk(null);
    try {
      const r = await adminGetVenueDisplay(Number(selectedVenueId));
      const normalised: VenueDisplaySettings = {
        mode: ALLOWED_MODES.includes(r.mode) ? r.mode : 'display',
        inline_message: r.inline_message ?? '',
        title: r.title ?? '',
        content: r.content ?? '',
        button_text: r.button_text ?? '',
        button_url: r.button_url ?? '',
        image_id: r.image_id ?? null,
        image_url: r.image_url ?? null,
      };
      setCurrent(normalised);
      setSaved(normalised);
    } catch (e) {
      setLoadErr(errorMessage(e, 'Display settings could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, [selectedVenueId]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (patch: Partial<VenueDisplaySettings>) => {
    setOk(null);
    setCurrent((prev) => ({ ...prev, ...patch }));
  };

  const openMedia = () => {
    if (!wp?.media) {
      setErr('The WordPress media library is not available on this page. Reload and try again.');
      return;
    }
    const frame = wp.media({
      title: 'Select image',
      button: { text: 'Use this image' },
      multiple: false,
      library: { type: 'image' },
    });
    frame.on('select', () => {
      const att = frame.state().get('selection').first().toJSON();
      set({ image_id: att.id, image_url: att.sizes?.medium?.url || att.url });
    });
    frame.open();
  };

  const clearImage = () => set({ image_id: null, image_url: null });

  const save = async () => {
    if (!selectedVenueId || !dirty || invalid) return;
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      await adminSaveVenueDisplay(Number(selectedVenueId), {
        mode: current.mode,
        inline_message: current.inline_message,
        title: current.title,
        content: current.content,
        button_text: current.button_text,
        button_url: current.button_url,
        image_id: current.image_id,
      });
      setSaved({ ...current });
      setOk('Display settings saved.');
    } catch (e) {
      setErr(errorMessage(e, 'Display settings could not be saved. Try again.'));
    } finally {
      setSaving(false);
    }
  };

  const ready = selectedVenueId && !loading && !loadErr;

  return (
    <div>
      <div className="dmn-admin__header dmn-admin__header--sticky">
        <h2 className="dmn-admin__header__headline">Venue display</h2>
        <div className="dmn-admin__header__inner">
          <SaveState dirty={dirty} ok={ok} />
          {ready && (
            <button
              type="button"
              className="button"
              onClick={save}
              disabled={saving || !dirty || invalid}
              aria-busy={saving}
            >
              {saving ? 'Saving…' : 'Save display settings'}
            </button>
          )}
        </div>
      </div>

      {err && (
        <StatusMessage tone="error" block>
          {err}
        </StatusMessage>
      )}

      {!selectedVenueId && (
        <p className="dmn-admin__empty">Choose a venue above to set how it appears.</p>
      )}
      {selectedVenueId && loading && <Loading />}
      {selectedVenueId && !loading && loadErr && <LoadError message={loadErr} onRetry={load} />}

      {ready && (
        <div className="table dmn-admin__spacer-top">
          <div className="table__row">
            <div className="table__left">
              <div className="table__cell">
                <label htmlFor="dmn-display-mode">How this venue appears</label>
                <select
                  id="dmn-display-mode"
                  value={current.mode}
                  aria-describedby="dmn-display-mode-help"
                  onChange={(e) => set({ mode: e.target.value as VenueDisplayMode })}
                >
                  {ALLOWED_MODES.map((m) => (
                    <option key={m} value={m}>
                      {MODE_LABELS[m]}
                    </option>
                  ))}
                </select>
                <ul id="dmn-display-mode-help" className="dmn-admin__help">
                  <li>
                    <strong>{MODE_LABELS.display}</strong>: listed in the widget and bookable
                    (default).
                  </li>
                  <li>
                    <strong>{MODE_LABELS.external_booking}</strong>: listed in the widget, but
                    choosing it shows the inline message below instead of the booking steps. When
                    the shortcode preselects this venue, the panel below is shown instead of the
                    widget.
                  </li>
                  <li>
                    <strong>{MODE_LABELS.hidden}</strong>: not listed. When the shortcode
                    preselects this venue, nothing is shown.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {current.mode === 'external_booking' && (
            <div className="table__row">
              <h3 className="table__row-title">External booking content</h3>
              <div className="table__left">
                <div className="table__cell">
                  <label htmlFor="dmn-display-inline">Inline message</label>
                  <textarea
                    id="dmn-display-inline"
                    value={current.inline_message}
                    onChange={(e) => set({ inline_message: e.target.value })}
                    aria-describedby="dmn-display-inline-help"
                    rows={4}
                  />
                  <p id="dmn-display-inline-help" className="dmn-admin__help">
                    Shown under the venue dropdown when this venue is chosen. HTML is allowed, e.g.
                    a link to your booking partner.
                  </p>
                </div>
                <div className="table__cell">
                  <label htmlFor="dmn-display-title">Panel title</label>
                  <input
                    id="dmn-display-title"
                    type="text"
                    value={current.title}
                    onChange={(e) => set({ title: e.target.value })}
                  />
                </div>
                <div className="table__cell">
                  <label htmlFor="dmn-display-content">Panel content</label>
                  <textarea
                    id="dmn-display-content"
                    value={current.content}
                    onChange={(e) => set({ content: e.target.value })}
                    aria-describedby="dmn-display-content-help"
                    rows={5}
                  />
                  <p id="dmn-display-content-help" className="dmn-admin__help">
                    Shown in the panel when the shortcode preselects this venue. Basic HTML is
                    allowed.
                  </p>
                </div>
                <div className="table__cell">
                  <label htmlFor="dmn-display-btn-text">Button text</label>
                  <input
                    id="dmn-display-btn-text"
                    type="text"
                    value={current.button_text}
                    onChange={(e) => set({ button_text: e.target.value })}
                  />
                </div>
                <div className="table__cell">
                  <label htmlFor="dmn-display-btn-url">Button URL</label>
                  <input
                    id="dmn-display-btn-url"
                    type="text"
                    inputMode="url"
                    value={current.button_url}
                    onChange={(e) => set({ button_url: e.target.value })}
                    aria-invalid={invalid || undefined}
                    aria-describedby={
                      invalid ? 'dmn-display-btn-url-err' : 'dmn-display-btn-url-help'
                    }
                  />
                  {invalid ? (
                    <FieldError id="dmn-display-btn-url-err">
                      Start the URL with https://, http:// or / (for a page on this site), or leave
                      it blank.
                    </FieldError>
                  ) : (
                    <p id="dmn-display-btn-url-help" className="dmn-admin__help">
                      A full URL (https://…) or a path on this site (/book). The button only shows
                      when both text and URL are set.
                    </p>
                  )}
                </div>
              </div>
              <div className="table__right">
                <div className="table__image-picker">
                  <span className="dmn-admin__label">Panel image</span>
                  {current.image_url ? (
                    <img
                      src={current.image_url}
                      alt="Current panel image"
                      className="table__image-picker__image"
                    />
                  ) : (
                    <div className="table__image-picker__image-preview">No image</div>
                  )}
                  <div className="table__image-picker__button-wrap">
                    <button
                      className="table__image-picker__btn button button--secondary"
                      type="button"
                      onClick={openMedia}
                    >
                      {current.image_id ? 'Change image' : 'Choose image'}
                    </button>
                    {current.image_id && (
                      <button
                        className="table__image-picker__btn button button--danger"
                        type="button"
                        onClick={clearImage}
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
