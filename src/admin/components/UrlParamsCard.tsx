// src/admin/components/UrlParamsCard.tsx
import React, { FormEvent, useEffect, useState } from 'react';
import { getUrlParams, saveUrlParams, type UrlParamRow } from '../api';

export default function UrlParamsCard() {
  const [rows, setRows] = useState<UrlParamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await getUrlParams();
        setRows(res.items || []);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load URL parameters');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addRow = () => {
    setRows((prev) => [...prev, { name: '', value: '' }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, patch: Partial<UrlParamRow>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      // Strip empty names
      const cleaned = rows
        .map((r) => ({
          name: r.name.trim(),
          value: r.value.trim(),
        }))
        .filter((r) => r.name !== '');

      const res = await saveUrlParams(cleaned);
      setRows(res.items || []);
      setOk('URL parameters saved.');
    } catch (e: any) {
      setErr(e?.message || 'Failed to save URL parameters');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="dmn-admin__card">
        <h2>URL Parameters</h2>
        <p>Loading…</p>
      </section>
    );
  }

  return (
    <section className="dmn-admin__card" style={{ marginBottom: '1.5rem' }}>
      <h2>URL Parameters</h2>
      <p className="dmn-admin__help">
        These key/value pairs will be appended to the DesignMyNight booking URL as query parameters
      </p>

      <form onSubmit={onSubmit} className="dmn-admin-urlparams">
        {rows.length === 0 && <p>No parameters configured.</p>}

        {rows.map((row, i) => (
          <div style={{ marginBottom: '1.5rem' }} key={i} className="dmn-admin-urlparams__row">
            <label style={{ marginBottom: '0.75rem' }}>
              <span>Parameter name</span>
              <input
                type="text"
                value={row.name}
                onChange={(e) => updateRow(i, { name: e.target.value })}
              />
            </label>
            <label>
              <span>Parameter value</span>
              <input
                type="text"
                value={row.value}
                onChange={(e) => updateRow(i, { value: e.target.value })}
              />
            </label>

            <button
              style={{ marginTop: '1.5rem' }}
              type="button"
              className="button button--sub"
              onClick={() => removeRow(i)}
            >
              Remove
            </button>
          </div>
        ))}
        <div className="actions" style={{ marginTop: '1.5rem' }}>
          <button type="button" className="button" onClick={addRow}>
            Add parameter
          </button>

          <button type="submit" className="button button--action" disabled={saving}>
            {saving ? 'Saving…' : 'Save URL Parameters'}
          </button>
        </div>
      </form>

      {ok && <p className="ok">{ok}</p>}
      {err && <p className="err">{err}</p>}
    </section>
  );
}
