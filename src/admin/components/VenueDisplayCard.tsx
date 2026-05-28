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
  inline_message: '',
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
      setOk('Saved.');
    } catch (e: any) {
      setErr(e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dmn-admin__card">
      <div className="dmn-admin__header">
        <h2 className="dmn-admin__header__headline">Venue Display</h2>
        <span className="dmn-admin__header__inner">
          {dirty && <p className="dmn-admin__header__dirty">Unsaved changes</p>}
          {ok && !dirty && <p className="dmn-admin__header__ok">{ok}</p>}
          <button
            type="button"
            className="button button--action"
            onClick={save}
            disabled={saving || !dirty || invalid || !selectedVenueId}
          >
            {saving ? 'Saving…' : 'Save display settings'}
          </button>
        </span>
      </div>

      {!selectedVenueId && (
        <p className="dmn-admin__help">Pick a venue above to manage display settings.</p>
      )}
      {selectedVenueId && loading && <p>Loading…</p>}
      {err && <p className="err">{err}</p>}

      {selectedVenueId && !loading && (
        <div className="table">
          <div className="table__row">
            <div className="table__left">
              <label className="dmn-admin__label">Display mode</label>
              <div className="table__cell">
                <select
                  value={current.mode}
                  onChange={(e) => set({ mode: e.target.value as VenueDisplayMode })}
                >
                  {ALLOWED_MODES.map((m) => (
                    <option key={m} value={m}>{MODE_LABELS[m]}</option>
                  ))}
                </select>
                <p className="dmn-admin__help" style={{ marginTop: 8 }}>
                  <strong>Display</strong>: shown in the booking widget dropdown (default).<br />
                  <strong>External Booking</strong>: shown in the booking widget dropdown; when selected, displays the Inline message below and disables the booking flow. Also renders as a panel when preselected via shortcode.<br />
                  <strong>Hidden</strong>: hidden from dropdown; widget does not render when preselected via shortcode.
                </p>
              </div>
            </div>
          </div>

          {current.mode === 'external_booking' && (
            <div className="table__row">
              <div className="table__left">
                <div className="table__cell">
                  <div className="table__label">Inline message</div>
                  <textarea
                    value={current.inline_message}
                    onChange={(e) => set({ inline_message: e.target.value })}
                    placeholder="e.g. Online bookings for this venue have moved to our new booking partner, <a href="https://…">click here to book</a>."
                    rows={4}
                  />
                  <span className="dmn-admin__help">Shown below the venue dropdown when this venue is selected. HTML is supported.</span>
                </div>
                <div className="table__cell">
                  <div className="table__label">Title</div>
                  <input
                    type="text"
                    value={current.title}
                    onChange={(e) => set({ title: e.target.value })}
                    placeholder="e.g. Games"
                  />
                </div>
                <div className="table__cell">
                  <div className="table__label">Content</div>
                  <textarea
                    value={current.content}
                    onChange={(e) => set({ content: e.target.value })}
                    placeholder="Panel body copy…"
                    rows={5}
                  />
                  <span className="dmn-admin__help">Shown inline when a user selects this venue from the dropdown. Also used as the panel body when the venue is preselected via shortcode. Basic HTML is supported.</span>
                </div>
                <div className="table__cell">
                  <div className="table__label">Button text</div>
                  <input
                    type="text"
                    value={current.button_text}
                    onChange={(e) => set({ button_text: e.target.value })}
                    placeholder="e.g. View all games"
                  />
                </div>
                <div className="table__cell">
                  <div className="table__label">Button URL</div>
                  <input
                    type="text"
                    value={current.button_url}
                    onChange={(e) => set({ button_url: e.target.value })}
                    placeholder="https://… or /relative-path"
                    aria-invalid={(invalid && !!current.button_url) || undefined}
                  />
                  {invalid && current.button_url && (
                    <span className="err" style={{ fontSize: 13 }}>
                      URL must be empty, start with / or http(s)://
                    </span>
                  )}
                </div>
              </div>
              <div className="table__right">
                <div className="table__image-picker">
                  <div className="table__label">Image</div>
                  {current.image_url ? (
                    <img src={current.image_url} alt="" className="table__image-picker__image" />
                  ) : (
                    <div className="table__image-picker__image-preview" />
                  )}
                  <div className="table__image-picker__button-wrap">
                    <button
                      className="table__image-picker__btn button"
                      type="button"
                      onClick={openMedia}
                    >
                      Choose image
                    </button>
                    {current.image_id && (
                      <button
                        className="table__image-picker__btn button button--sub"
                        type="button"
                        onClick={clearImage}
                      >
                        Clear image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
