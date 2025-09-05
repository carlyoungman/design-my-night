// src/admin/components/SettingsCard.tsx
import React, { FormEvent, useEffect, useState } from 'react';
import { getSettings, saveSettings, testConnection } from '../api';

type Env = 'prod' | 'qa';
type FormState = {
  app_id: string;
  api_key: string;
  environment: Env;
  venue_group: string;
  debug_mode: boolean;
};

export default function SettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [details, setDetails] = useState<any | null>(null);

  const [form, setForm] = useState<FormState>({
    app_id: '',
    api_key: '',
    environment: 'prod',
    venue_group: '',
    debug_mode: false,
  });
  const [mask, setMask] = useState('');

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const s = await getSettings();
      setForm({
        app_id: s.app_id || '',
        api_key: '',
        environment: s.environment,
        venue_group: s.venue_group || '',
        debug_mode: !!s.debug_mode,
      });
      setMask(s.api_key_mask || '');
    } catch (e: any) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      const payload = {
        app_id: form.app_id.trim(),
        api_key: form.api_key.trim(), // blank => keep existing on server
        environment: form.environment,
        venue_group: form.venue_group.trim(),
        debug_mode: form.debug_mode,
      };
      await saveSettings(payload);
      setOk('Settings saved.');
      if (form.api_key) await load(); // refresh mask if key changed
      setForm((f) => ({ ...f, api_key: '' })); // clear write-only field
    } catch (e: any) {
      setErr(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onTest = async () => {
    setTesting(true);
    setErr(null);
    setOk(null);
    setDetails(null);
    try {
      const r = await testConnection(form.debug_mode);
      if (r.debug) setDetails(r.debug);
      if (r.ok) setOk(`Test OK. Status ${r.status}.`);
      else setErr(`Test failed (${r.status}). ${r.error || ''}`);
    } catch (e: any) {
      setErr(e.message || 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <section className="card">
      <h2>API Credentials</h2>
      <form onSubmit={onSave} className="grid">
        <label>
          <span>App ID</span>
          <input
            value={form.app_id}
            onChange={(e) => setForm({ ...form, app_id: e.target.value })}
            required
          />
        </label>

        <label>
          <span>API Key</span>
          <input
            value={form.api_key}
            autoComplete="new-password"
            placeholder={mask ? `${mask}` : 'your_api_key'}
            onChange={(e) => setForm({ ...form, api_key: e.target.value })}
          />
        </label>

        <label>
          <span>Environment</span>
          <select
            value={form.environment}
            onChange={(e) => setForm({ ...form, environment: e.target.value as Env })}
          >
            <option value="prod">Production</option>
            <option value="qa">QA / Sandbox</option>
          </select>
        </label>

        <label>
          <span>Default Venue Group (optional)</span>
          <input
            value={form.venue_group}
            onChange={(e) => setForm({ ...form, venue_group: e.target.value })}
          />
        </label>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={form.debug_mode}
            onChange={(e) => setForm({ ...form, debug_mode: e.target.checked })}
          />
          Debug mode (saved with settings)
        </label>

        <div className="actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
          <button type="button" onClick={onTest} disabled={testing}>
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
        </div>
      </form>

      {ok && <p className="ok">{ok}</p>}
      {err && <p className="err">{err}</p>}
      {details && (
        <pre
          className="debug-dump"
          style={{
            background: '#f6f7f7',
            padding: 12,
            borderRadius: 6,
            overflow: 'auto',
            maxHeight: 320,
            marginTop: 8,
          }}
        >
          {JSON.stringify(details, null, 2)}
        </pre>
      )}

      <p style={{ opacity: 0.7, marginTop: 8 }}>
        <small>
          Note: Test Connection uses the last <em>saved</em> credentials & environment. Click{' '}
          <strong>Save Settings</strong> after any changes.
        </small>
      </p>
    </section>
  );
}
