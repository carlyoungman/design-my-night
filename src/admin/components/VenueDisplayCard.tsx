import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '@admin/AdminContext';
import {
  adminGetVenueDisplay,
  adminSaveVenueDisplay,
  type VenueDisplayMode,
  type VenueDisplaySettings,
} from '@admin/api';

declare const wp: any;

type Props = { onDirty?: (d: boolean) => void };

const ALLOWED_MODES: VenueDisplayMode[] = ['display', 'external_booking', 'hidden'];

const MODE_LABELS: Record<VenueDisplayMode, string> = {
  display: 'Display',
  external_booking: 'External Booking',
  hidden: 'Hidden',
};

const EMPTY: VenueDisplaySettings = {
  mode: 'display',
  title: '',
  content: '',
  button_text: '',
  button_url: '',
  image_id: null,
  image_url: null,
};

const isValidUrl = (u: string) =>
  u === '' || u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/');

export default function VenueDisplayCard({ onDirty }: Props) {
  const { selectedVenueId } = useAdmin();

  const [current, setCurrent] = useState<VenueDisplaySettings>(EMPTY);
  const [saved, setSaved] = useState<VenueDisplaySettings>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const dirty =
    current.mode !== saved.mode ||
    current.title !== saved.title ||
    current.content !== saved.content ||
    current.button_text !== saved.button_text ||
    current.button_url !== saved.button_url ||
    (current.image_id ?? null) !== (saved.image_id ?? null);

  const invalid = useMemo(
    () => !isValidUrl(current.button_url),
    [current.button_url],
  );

  useEffect(() => {
    onDirty?.(dirty);
  }, [dirty, onDirty]);

  useEffect(() => {
    if (!selectedVenueId) {
      setCurrent(EMPTY);
      setSaved(EMPTY);
      return;
    }
    let cancel = false;
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);
      try {
        const r = await adminGetVenueDisplay(Number(selectedVenueId));
        if (cancel) return;
        const normalised: VenueDisplaySettings = {
          mode: ALLOWED_MODES.includes(r.mode) ? r.mode : 'display',
          title: r.title ?? '',
          content: r.content ?? '',
          button_text: r.button_text ?? '',
          button_url: r.button_url ?? '',
          image_id: r.image_id ?? null,
          image_url: r.image_url ?? null,
        };
        setCurrent(normalised);
        setSaved(normalised);
      } catch (e: any) {
        if (!cancel) setErr(e?.message || 'Failed to load display settings.');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [selectedVenueId]);

  const set = (patch: Partial<VenueDisplaySettings>) =>
    setCurrent((prev) => ({ ...prev, ...patch }));

  const openMedia = () => {
    if (!wp?.media) {
      setErr('WordPress media library not available.');
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
      set({ image_id: att.id, image_url: att.sizes?.large?.url || att.url });
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
        title: current.title,
        content: current.content,
        button_text: current.button_text,
        button_url: current.button_url,
        image_id: current.image_id,
      });
      setSaved({ ...current });
      setOk('Saved.');
    } catch (e: any) {
      setErr(e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dmn-admin__section">
      <div className="dmn-admin__section-header">
        <h3>Venue Display</h3>
        {dirty && <p className="dmn-admin__header__dirty">Unsaved changes</p>}
      </div>

      {!selectedVenueId && (
        <p className="dmn-admin__help">Pick a venue above to manage display settings.</p>
      )}

      {selectedVenueId && loading && <p>Loading…</p>}

      {selectedVenueId && !loading && (
        <div style={{ display: 'grid', gap: 16 }}>
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ fontWeight: 600, marginBottom: 8 }}>Display mode</legend>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {ALLOWED_MODES.map((m) => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`dmn-display-mode-${selectedVenueId}`}
                    value={m}
                    checked={current.mode === m}
                    onChange={() => set({ mode: m })}
                  />
                  {MODE_LABELS[m]}
                </label>
              ))}
            </div>
            <p className="dmn-admin__help" style={{ marginTop: 8 }}>
              <strong>Display</strong>: shown in the booking widget dropdown (default).<br />
              <strong>External Booking</strong>: hidden from dropdown; shows a custom panel when preselected via shortcode.<br />
              <strong>Hidden</strong>: hidden from dropdown; widget does not render when preselected via shortcode.
            </p>
          </fieldset>

          {current.mode === 'external_booking' && (
            <div style={{ display: 'grid', gap: 12, borderTop: '1px solid #ddd', paddingTop: 16 }}>
              <h4 style={{ margin: 0 }}>External Booking Panel</h4>

              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Title</span>
                <input
                  type="text"
                  value={current.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="e.g. Games"
                  style={{ width: '100%' }}
                />
              </label>

              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Content</span>
                <textarea
                  value={current.content}
                  onChange={(e) => set({ content: e.target.value })}
                  placeholder="Panel body copy…"
                  rows={5}
                  style={{ width: '100%' }}
                />
                <span className="dmn-admin__help">Basic HTML is supported.</span>
              </label>

              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Button text</span>
                <input
                  type="text"
                  value={current.button_text}
                  onChange={(e) => set({ button_text: e.target.value })}
                  placeholder="e.g. View all games"
                  style={{ width: '100%' }}
                />
              </label>

              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Button URL</span>
                <input
                  type="text"
                  value={current.button_url}
                  onChange={(e) => set({ button_url: e.target.value })}
                  placeholder="https://… or /relative-path"
                  style={{ width: '100%', borderColor: invalid && current.button_url ? 'red' : undefined }}
                />
                {invalid && current.button_url && (
                  <span style={{ color: 'red', fontSize: 13 }}>
                    URL must be empty, start with / or http(s)://
                  </span>
                )}
              </label>

              <div>
                <span style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Image</span>
                {current.image_url && (
                  <div style={{ marginBottom: 8 }}>
                    <img
                      src={current.image_url}
                      alt=""
                      style={{ maxWidth: 200, maxHeight: 120, objectFit: 'cover', display: 'block', marginBottom: 6 }}
                    />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="button" onClick={openMedia}>
                    {current.image_id ? 'Change image' : 'Select image'}
                  </button>
                  {current.image_id && (
                    <button type="button" className="button" onClick={clearImage}>
                      Remove image
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {err && <p style={{ color: 'red', margin: 0 }}>{err}</p>}
          {ok && <p style={{ color: 'green', margin: 0 }}>{ok}</p>}

          <div>
            <button
              type="button"
              className="button button--action"
              onClick={save}
              disabled={saving || !dirty || invalid}
            >
              {saving ? 'Saving…' : 'Save display settings'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
