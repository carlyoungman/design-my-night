// src/admin/components/LargeGroupLinkEditor.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { adminGetLargeGroupLink, adminSaveLargeGroupLink } from '../api';

type Props = { onDirty?: (d: boolean) => void };

const MAX_URL = 300;
const DEFAULT_LABEL = 'Groups of 12+ — Enquire here';
const DEFAULT_MIN = 12;

const isValidUrl = (u: string) =>
  u === '' || u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/');

export default function LargeGroupLinkEditor({ onDirty }: Props) {
  const { selectedVenueId } = useAdmin();

  const [url, setUrl] = useState('');
  const [origUrl, setOrigUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const dirty = useMemo(() => url !== origUrl, [url, origUrl]);
  const invalid = useMemo(() => !isValidUrl(url) || url.length > MAX_URL, [url]);

  useEffect(() => onDirty?.(dirty), [dirty, onDirty]);

  useEffect(() => {
    if (!selectedVenueId) {
      setUrl('');
      setOrigUrl('');
      return;
    }
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);
      try {
        const r = await adminGetLargeGroupLink(Number(selectedVenueId));
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
  }, [selectedVenueId]);

  const save = async () => {
    if (!selectedVenueId || invalid || !dirty) return;
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      await adminSaveLargeGroupLink(Number(selectedVenueId), {
        enabled: url.trim() !== '',
        minSize: DEFAULT_MIN,
        label: DEFAULT_LABEL,
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

  return (
    <section className="large-group-link">
      <div className="dmn-admin__header">
        <h4 className="dmn-admin__header__headline">Large Groups booking link</h4>
        <div className="dmn-admin__header__inner">
          {dirty && <p className="dmn-admin__header__dirty">Unsaved changes</p>}
          {ok && !dirty && <p className="dmn-admin__header__ok">{ok}</p>}
          <button
            className="button button--action"
            onClick={save}
            disabled={saving || !dirty || !selectedVenueId || invalid}
            aria-disabled={saving || !dirty || !selectedVenueId || invalid}
          >
            {saving ? 'Saving…' : 'Save URL'}
          </button>
        </div>
      </div>
      {!selectedVenueId && <p className="dmn-admin__help">Pick a venue to edit.</p>}
      {loading && <p>Loading…</p>}
      {err && <p className="err">{err}</p>}

      {!loading && selectedVenueId && (
        <div className="table">
          <div className="table__row">
            <div className="table__left">
              <div className="table__cell">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setOk(null);
                    setUrl(e.target.value);
                  }}
                  placeholder="https://example.com/enquire or /enquire"
                  aria-invalid={invalid || undefined}
                />
              </div>
            </div>
          </div>
          {invalid && <p className="err">Enter a valid URL or leave blank.</p>}
        </div>
      )}
    </section>
  );
}
