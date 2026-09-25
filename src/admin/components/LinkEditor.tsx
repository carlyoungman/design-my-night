// src/admin/components/LinkEditor.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdmin } from '@admin/AdminContext';
import {
  adminGetLargeGroupLink,
  adminSaveLargeGroupLink,
  adminGetReturnUrl,
  adminSaveReturnUrl,
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

type Props = { onDirty?: (d: boolean) => void };

const MAX_URL = 300;
// The server stores at most 80 characters for the label.
const MAX_LABEL = 80;
const DEFAULT_LABEL = 'Groups of 12 and above — Enquire here';
const DEFAULT_MAX_PARTY_SIZE = 12;

const URL_ERROR =
  'Start the URL with https://, http:// or / (for a page on this site), or leave it blank.';

function useLargeGroupEditor(venueId: number | null) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [maxPartySize, setMaxPartySize] = useState(String(DEFAULT_MAX_PARTY_SIZE));

  const [origUrl, setOrigUrl] = useState('');
  const [origLabel, setOrigLabel] = useState('');
  const [origMaxPartySize, setOrigMaxPartySize] = useState(String(DEFAULT_MAX_PARTY_SIZE));

  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const dirty = url !== origUrl || label !== origLabel || maxPartySize !== origMaxPartySize;
  const urlInvalid = !isValidUrl(url.trim()) || url.length > MAX_URL;
  const maxInvalid = !/^\d+$/.test(maxPartySize) || Number(maxPartySize) < 1;
  const invalid = urlInvalid || maxInvalid || label.length > MAX_LABEL;

  const load = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);
    setLoadErr(null);
    setErr(null);
    setOk(null);
    try {
      const r = await adminGetLargeGroupLink(venueId);
      const incomingUrl = typeof r?.url === 'string' ? r.url.slice(0, MAX_URL) : '';
      const incomingLabel = typeof r?.label === 'string' ? r.label.slice(0, MAX_LABEL) : '';
      const incomingMax = String(r?.maxPartySize > 0 ? r.maxPartySize : DEFAULT_MAX_PARTY_SIZE);
      setUrl(incomingUrl);
      setOrigUrl(incomingUrl);
      setLabel(incomingLabel);
      setOrigLabel(incomingLabel);
      setMaxPartySize(incomingMax);
      setOrigMaxPartySize(incomingMax);
    } catch (e) {
      setLoadErr(errorMessage(e, 'The large group settings could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!venueId || invalid || !dirty) return;
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      const max = Number(maxPartySize);
      await adminSaveLargeGroupLink(venueId, {
        enabled: url.trim() !== '',
        url: url.trim(),
        label: label.trim() || DEFAULT_LABEL,
        minSize: max,
        maxPartySize: max,
      });
      setOk('Large group settings saved.');
      setOrigUrl(url);
      setOrigLabel(label);
      setOrigMaxPartySize(maxPartySize);
    } catch (e) {
      setErr(errorMessage(e, 'The large group settings could not be saved. Try again.'));
    } finally {
      setSaving(false);
    }
  };

  const edit =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setOk(null);
      setter(v);
    };

  return {
    url,
    setUrl: edit(setUrl),
    label,
    setLabel: edit(setLabel),
    maxPartySize,
    setMaxPartySize: edit(setMaxPartySize),
    loading,
    loadErr,
    load,
    saving,
    ok,
    err,
    dirty,
    invalid,
    urlInvalid,
    maxInvalid,
    save,
  };
}

function useReturnUrl(venueId: number | null) {
  const [url, setUrlState] = useState('');
  const [origUrl, setOrigUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const dirty = url !== origUrl;
  const invalid = useMemo(() => !isValidUrl(url.trim()) || url.length > MAX_URL, [url]);

  const load = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);
    setLoadErr(null);
    setErr(null);
    setOk(null);
    try {
      const r = await adminGetReturnUrl(venueId);
      const incomingUrl = typeof r?.url === 'string' ? r.url.slice(0, MAX_URL) : '';
      setUrlState(incomingUrl);
      setOrigUrl(incomingUrl);
    } catch (e) {
      setLoadErr(errorMessage(e, 'The return URL could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!venueId || invalid || !dirty) return;
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      await adminSaveReturnUrl(venueId, {
        enabled: url.trim() !== '',
        url: url.trim(),
      });
      setOk('Return URL saved.');
      setOrigUrl(url);
    } catch (e) {
      setErr(errorMessage(e, 'The return URL could not be saved. Try again.'));
    } finally {
      setSaving(false);
    }
  };

  const setUrl = (v: string) => {
    setOk(null);
    setUrlState(v);
  };

  return { url, setUrl, loading, loadErr, load, saving, ok, err, dirty, invalid, save };
}

export default function LinkEditor({ onDirty }: Props) {
  const { selectedVenueId } = useAdmin();
  const large = useLargeGroupEditor(selectedVenueId);
  const ret = useReturnUrl(selectedVenueId);

  const anyDirty = large.dirty || ret.dirty;
  useEffect(() => onDirty?.(anyDirty), [anyDirty, onDirty]);

  if (!selectedVenueId) return null;

  return (
    <>
      {/* Large-group link */}
      <section className="dmn-admin__subsection" aria-labelledby="dmn-large-group-title">
        <div className="dmn-admin__header">
          <h3 id="dmn-large-group-title" className="dmn-admin__header__headline">
            Group size and large group enquiries
          </h3>
          <div className="dmn-admin__header__inner">
            <SaveState dirty={large.dirty} ok={large.ok} />
            {!large.loading && !large.loadErr && (
              <button
                type="button"
                className="button"
                onClick={large.save}
                disabled={large.saving || !large.dirty || large.invalid}
                aria-busy={large.saving}
              >
                {large.saving ? 'Saving…' : 'Save group settings'}
              </button>
            )}
          </div>
        </div>
        {large.loading && <Loading />}
        {!large.loading && large.loadErr && (
          <LoadError message={large.loadErr} onRetry={large.load} />
        )}
        {large.err && (
          <StatusMessage tone="error" block>
            {large.err}
          </StatusMessage>
        )}
        {!large.loading && !large.loadErr && (
          <div className="dmn-admin__form">
            <div className="dmn-admin__field">
              <label htmlFor="dmn-large-max">Maximum group size</label>
              <input
                id="dmn-large-max"
                type="number"
                inputMode="numeric"
                min={1}
                value={large.maxPartySize}
                aria-invalid={large.maxInvalid || undefined}
                aria-describedby={large.maxInvalid ? 'dmn-large-max-err' : 'dmn-large-max-help'}
                onChange={(e) => large.setMaxPartySize(e.target.value)}
              />
              {large.maxInvalid ? (
                <FieldError id="dmn-large-max-err">Enter a whole number of 1 or more.</FieldError>
              ) : (
                <p id="dmn-large-max-help" className="dmn-admin__help">
                  The largest group that can book online.
                </p>
              )}
            </div>
            <div className="dmn-admin__field">
              <label htmlFor="dmn-large-url">
                Enquiry link <span className="dmn-admin__label-hint">(optional)</span>
              </label>
              <input
                id="dmn-large-url"
                type="text"
                inputMode="url"
                value={large.url}
                onChange={(e) => large.setUrl(e.target.value)}
                placeholder="https://example.com/enquire"
                aria-invalid={large.urlInvalid || undefined}
                aria-describedby={large.urlInvalid ? 'dmn-large-url-err' : 'dmn-large-url-help'}
              />
              {large.urlInvalid ? (
                <FieldError id="dmn-large-url-err">{URL_ERROR}</FieldError>
              ) : (
                <p id="dmn-large-url-help" className="dmn-admin__help">
                  Shown next to the group size picker. Leave blank to hide it.
                </p>
              )}
            </div>
            <div className="dmn-admin__field">
              <label htmlFor="dmn-large-label">Enquiry link text</label>
              <input
                id="dmn-large-label"
                type="text"
                value={large.label}
                onChange={(e) => large.setLabel(e.target.value)}
                placeholder={DEFAULT_LABEL}
                maxLength={MAX_LABEL}
                aria-describedby="dmn-large-label-help"
              />
              <p id="dmn-large-label-help" className="dmn-admin__help">
                Up to {MAX_LABEL} characters. Leave blank for “{DEFAULT_LABEL}”.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Return URL */}
      <section className="dmn-admin__subsection" aria-labelledby="dmn-return-title">
        <div className="dmn-admin__header">
          <h3 id="dmn-return-title" className="dmn-admin__header__headline">
            Return URL after booking
          </h3>
          <div className="dmn-admin__header__inner">
            <SaveState dirty={ret.dirty} ok={ret.ok} />
            {!ret.loading && !ret.loadErr && (
              <button
                type="button"
                className="button"
                onClick={ret.save}
                disabled={ret.saving || !ret.dirty || ret.invalid}
                aria-busy={ret.saving}
              >
                {ret.saving ? 'Saving…' : 'Save return URL'}
              </button>
            )}
          </div>
        </div>
        {ret.loading && <Loading />}
        {!ret.loading && ret.loadErr && <LoadError message={ret.loadErr} onRetry={ret.load} />}
        {ret.err && (
          <StatusMessage tone="error" block>
            {ret.err}
          </StatusMessage>
        )}
        {!ret.loading && !ret.loadErr && (
          <div className="dmn-admin__field">
            <label htmlFor="dmn-return-url">
              Return URL <span className="dmn-admin__label-hint">(optional)</span>
            </label>
            <input
              id="dmn-return-url"
              type="text"
              inputMode="url"
              value={ret.url}
              onChange={(e) => ret.setUrl(e.target.value)}
              placeholder="https://example.com/thank-you"
              aria-invalid={ret.invalid || undefined}
              aria-describedby={ret.invalid ? 'dmn-return-url-err' : 'dmn-return-url-help'}
            />
            {ret.invalid ? (
              <FieldError id="dmn-return-url-err">{URL_ERROR}</FieldError>
            ) : (
              <p id="dmn-return-url-help" className="dmn-admin__help">
                Where DesignMyNight sends customers after they book. Leave blank to return them to
                the page they booked from.
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
