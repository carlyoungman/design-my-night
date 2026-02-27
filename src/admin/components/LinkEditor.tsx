// src/admin/components/LinkEditor.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../AdminContext';
import {
  adminGetLargeGroupLink,
  adminSaveLargeGroupLink,
  adminGetReturnUrl,
  adminSaveReturnUrl,
} from '../api';

type Props = { onDirty?: (d: boolean) => void };

const MAX_URL = 300;
const MAX_LABEL = 120;
const DEFAULT_LABEL = 'Groups of 12 and above — Enquire here';
const DEFAULT_MAX_PARTY_SIZE = 12;

const isValidUrl = (u: string) =>
  u === '' || u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/');

function useLargeGroupEditor(venueId: number | null) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [maxPartySize, setMaxPartySize] = useState(DEFAULT_MAX_PARTY_SIZE);

  const [origUrl, setOrigUrl] = useState('');
  const [origLabel, setOrigLabel] = useState('');
  const [origMaxPartySize, setOrigMaxPartySize] = useState(DEFAULT_MAX_PARTY_SIZE);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const dirty = url !== origUrl || label !== origLabel || maxPartySize !== origMaxPartySize;
  const invalid = useMemo(
    () => !isValidUrl(url) || url.length > MAX_URL || label.length > MAX_LABEL || maxPartySize < 1,
    [url, label, maxPartySize],
  );

  useEffect(() => {
    if (!venueId) {
      setUrl('');
      setLabel('');
      setMaxPartySize(DEFAULT_MAX_PARTY_SIZE);
      setOrigUrl('');
      setOrigLabel('');
      setOrigMaxPartySize(DEFAULT_MAX_PARTY_SIZE);
      return;
    }
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);
      try {
        const r = await adminGetLargeGroupLink(venueId);
        const incomingUrl = typeof r?.url === 'string' ? r.url.slice(0, MAX_URL) : '';
        const incomingLabel = typeof r?.label === 'string' ? r.label.slice(0, MAX_LABEL) : '';
        const incomingMax = r?.maxPartySize > 0 ? r.maxPartySize : DEFAULT_MAX_PARTY_SIZE;
        setUrl(incomingUrl);
        setOrigUrl(incomingUrl);
        setLabel(incomingLabel);
        setOrigLabel(incomingLabel);
        setMaxPartySize(incomingMax);
        setOrigMaxPartySize(incomingMax);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load link.');
      } finally {
        setLoading(false);
      }
    })();
  }, [venueId]);

  const save = async () => {
    if (!venueId || invalid || !dirty) return;
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      await adminSaveLargeGroupLink(venueId, {
        enabled: url.trim() !== '',
        url: url.trim(),
        label: label.trim() || DEFAULT_LABEL,
        minSize: maxPartySize,
        maxPartySize,
      });
      setOk('Saved.');
      setOrigUrl(url);
      setOrigLabel(label);
      setOrigMaxPartySize(maxPartySize);
    } catch (e: any) {
      setErr(e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return {
    url, setUrl,
    label, setLabel,
    maxPartySize, setMaxPartySize,
    loading, saving, ok, err, dirty, invalid, save,
  };
}

function useVenueLink<T extends { url?: string }>(
  venueId: number | null,
  loader: (venueId: number) => Promise<T>,
  saver: (venueId: number, payload: any) => Promise<void>,
) {
  const [url, setUrl] = useState('');
  const [origUrl, setOrigUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const dirty = useMemo(() => url !== origUrl, [url, origUrl]);
  const invalid = useMemo(() => !isValidUrl(url) || url.length > MAX_URL, [url]);

  useEffect(() => {
    if (!venueId) {
      setUrl('');
      setOrigUrl('');
      return;
    }
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);
      try {
        const r = await loader(venueId);
        const incomingUrl = typeof r?.url === 'string' ? r.url.slice(0, MAX_URL) : '';
        setUrl(incomingUrl);
        setOrigUrl(incomingUrl);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load link.');
        setUrl('');
        setOrigUrl('');
      } finally {
        setLoading(false);
      }
    })();
  }, [venueId, loader]);

  const save = async () => {
    if (!venueId || invalid || !dirty) return;
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      await saver(venueId, {
        enabled: url.trim() !== '',
        url: url.trim(),
      });
      setOk('Saved.');
      setOrigUrl(url);
    } catch (e: any) {
      setErr(e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return { url, setUrl, origUrl, loading, saving, ok, err, dirty, invalid, save };
}

export default function LinkEditor({ onDirty }: Props) {
  const { selectedVenueId } = useAdmin();
  const saveReturnVoid = async (id: number, payload: any): Promise<void> => {
    await adminSaveReturnUrl(id, payload);
  };
  const large = useLargeGroupEditor(selectedVenueId);
  const ret = useVenueLink(selectedVenueId, adminGetReturnUrl, saveReturnVoid);

  const anyDirty = large.dirty || ret.dirty;
  useEffect(() => onDirty?.(anyDirty), [anyDirty, onDirty]);

  return (
    <section className="link-editor">
      <div>
        <div className="dmn-admin__header__inner">
          {anyDirty && <p className="dmn-admin__header__dirty">Unsaved changes</p>}
          {!anyDirty && (large.ok || ret.ok) && (
            <p className="dmn-admin__header__ok">{large.ok || ret.ok}</p>
          )}
        </div>
      </div>

      {!selectedVenueId && <p className="dmn-admin__help">Pick a venue to edit.</p>}

      {/* Large-group link */}
      <section className="large-group-link">
        <div className="dmn-admin__header">
          <h4 className="dmn-admin__header__headline">Large groups booking link</h4>
          <div className="dmn-admin__header__inner">
            <button
              className="button button--action"
              onClick={large.save}
              disabled={large.saving || !selectedVenueId || !large.dirty || large.invalid}
              aria-disabled={large.saving || !selectedVenueId || !large.dirty || large.invalid}
            >
              {large.saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
        {large.loading && <p>Loading…</p>}
        {large.err && <p className="err">{large.err}</p>}
        {!large.loading && selectedVenueId && (
          <div className="table">
            <div className="table__row">
              <div className="table__left">
                <label className="dmn-admin__label">URL</label>
                <div className="table__cell">
                  <input
                    type="text"
                    value={large.url}
                    onChange={(e) => large.setUrl(e.target.value)}
                    placeholder="https://example.com/enquire or /enquire"
                    aria-invalid={large.invalid || undefined}
                  />
                </div>
              </div>
            </div>
            {large.invalid && <p className="err">Enter a valid URL or leave blank.</p>}
            <div className="table__row">
              <div className="table__left">
                <label className="dmn-admin__label">Message</label>
                <div className="table__cell">
                  <input
                    type="text"
                    value={large.label}
                    onChange={(e) => large.setLabel(e.target.value)}
                    placeholder={DEFAULT_LABEL}
                    maxLength={MAX_LABEL}
                  />
                </div>
              </div>
            </div>
            <div className="table__row">
              <div className="table__left">
                <label className="dmn-admin__label">Maximum party size</label>
                <div className="table__cell">
                  <input
                    type="number"
                    value={large.maxPartySize}
                    min={1}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v >= 1) large.setMaxPartySize(v);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Return URL */}
      <section className="return-url-link">
        <div className="dmn-admin__header">
          <h4 className="dmn-admin__header__headline">Return URL (post-booking)</h4>
          <div className="dmn-admin__header__inner">
            <button
              className="button button--action"
              onClick={ret.save}
              disabled={ret.saving || !selectedVenueId || !ret.dirty || ret.invalid}
              aria-disabled={ret.saving || !selectedVenueId || !ret.dirty || ret.invalid}
            >
              {ret.saving ? 'Saving…' : 'Save URL'}
            </button>
          </div>
        </div>
        {ret.loading && <p>Loading…</p>}
        {ret.err && <p className="err">{ret.err}</p>}
        {!ret.loading && selectedVenueId && (
          <div className="table">
            <div className="table__row">
              <div className="table__left">
                <div className="table__cell">
                  <input
                    type="text"
                    value={ret.url}
                    onChange={(e) => {
                      if (ret.ok) /* no-op */ null;
                      ret.setUrl(e.target.value);
                    }}
                    placeholder="https://example.com/thank-you or /thank-you"
                    aria-invalid={ret.invalid || undefined}
                  />
                </div>
              </div>
            </div>
            {ret.invalid && <p className="err">Enter a valid URL or leave blank.</p>}
          </div>
        )}
      </section>
    </section>
  );
}
