// src/admin/components/UrlParamsCard.tsx
import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { getUrlParams, saveUrlParams, type UrlParamRow } from '@admin/api';
import { LoadError, Loading, SaveState, StatusMessage, errorMessage } from '@admin/components/ui';

export default function UrlParamsCard() {
  const [rows, setRows] = useState<UrlParamRow[]>([]);
  const [orig, setOrig] = useState<UrlParamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(rows) !== JSON.stringify(orig), [rows, orig]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const res = await getUrlParams();
      setRows(res.items || []);
      setOrig(res.items || []);
    } catch (e) {
      setLoadErr(errorMessage(e, 'URL parameters could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addRow = () => {
    setOk(null);
    setRows((prev) => [...prev, { name: '', value: '' }]);
  };

  const removeRow = (index: number) => {
    setOk(null);
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, patch: Partial<UrlParamRow>) => {
    setOk(null);
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      // Rows without a name are dropped.
      const cleaned = rows
        .map((r) => ({
          name: r.name.trim(),
          value: r.value.trim(),
        }))
        .filter((r) => r.name !== '');

      const res = await saveUrlParams(cleaned);
      setRows(res.items || []);
      setOrig(res.items || []);
      setOk('URL parameters saved.');
    } catch (e) {
      setErr(errorMessage(e, 'URL parameters could not be saved. Try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dmn-admin__card" aria-labelledby="dmn-admin-params-title">
      <div className="dmn-admin__header">
        <h2 id="dmn-admin-params-title" className="dmn-admin__header__headline">
          URL parameters
        </h2>
        <SaveState dirty={dirty} ok={ok} />
      </div>
      <p className="dmn-admin__help">
        Added as query parameters to every DesignMyNight booking URL. Rows without a name are
        ignored.
      </p>

      {loading && <Loading />}
      {!loading && loadErr && <LoadError message={loadErr} onRetry={load} />}

      {!loading && !loadErr && (
        <form onSubmit={onSubmit} className="dmn-admin__spacer-top">
          {rows.length === 0 && <p className="dmn-admin__empty">No parameters yet.</p>}

          {rows.map((row, i) => (
            <fieldset key={i} className="dmn-admin__urlparams-row">
              <legend className="screen-reader-text">Parameter {i + 1}</legend>
              <div className="dmn-admin__field">
                <label htmlFor={`dmn-param-name-${i}`}>Name</label>
                <input
                  id={`dmn-param-name-${i}`}
                  type="text"
                  value={row.name}
                  onChange={(e) => updateRow(i, { name: e.target.value })}
                />
              </div>
              <div className="dmn-admin__field">
                <label htmlFor={`dmn-param-value-${i}`}>Value</label>
                <input
                  id={`dmn-param-value-${i}`}
                  type="text"
                  value={row.value}
                  onChange={(e) => updateRow(i, { value: e.target.value })}
                />
              </div>

              <button
                type="button"
                className="button button--danger"
                onClick={() => removeRow(i)}
                aria-label={`Remove parameter ${row.name || i + 1}`}
              >
                Remove
              </button>
            </fieldset>
          ))}
          <div className="actions dmn-admin__spacer-top">
            <button type="submit" className="button" disabled={saving || !dirty} aria-busy={saving}>
              {saving ? 'Saving…' : 'Save URL parameters'}
            </button>
            <button type="button" className="button button--secondary" onClick={addRow}>
              Add parameter
            </button>
          </div>
        </form>
      )}

      {err && (
        <StatusMessage tone="error" block>
          {err}
        </StatusMessage>
      )}
    </section>
  );
}
