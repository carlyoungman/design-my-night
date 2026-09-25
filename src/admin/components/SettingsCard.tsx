// src/admin/components/SettingsCard.tsx
import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { getSettings, saveSettings, testConnection } from '@admin/api';
import { Globe, Plug } from 'lucide-react';
import {
  LoadError,
  Loading,
  ProgressPanel,
  StatusMessage,
  errorMessage,
  type ProgressState,
} from '@admin/components/ui';

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
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [test, setTest] = useState<{ state: ProgressState; message?: string } | null>(null);
  const testing = test?.state === 'running';
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [details, setDetails] = useState<unknown | null>(null);

  const [form, setForm] = useState<FormState>({
    app_id: '',
    api_key: '',
    environment: 'prod',
    venue_group: '',
    debug_mode: false,
  });
  const [mask, setMask] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
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
    } catch (e) {
      setLoadErr(errorMessage(e, 'Settings could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setOk(null);
    setTest(null);
    try {
      const payload = {
        app_id: form.app_id.trim(),
        api_key: form.api_key.trim(), // blank => keep existing on server
        environment: form.environment,
        venue_group: form.venue_group.trim(),
        debug_mode: form.debug_mode,
      };
      await saveSettings(payload);
      if (form.api_key) {
        // Refresh the key mask; the write-only key field is cleared by the reload.
        const s = await getSettings();
        setMask(s.api_key_mask || '');
      }
      setForm((f) => ({ ...f, api_key: '' }));
      setOk('Settings saved.');
    } catch (e) {
      setErr(errorMessage(e, 'Settings could not be saved. Check your connection and try again.'));
    } finally {
      setSaving(false);
    }
  };

  const onTest = async () => {
    // aria-disabled rather than disabled, so the button keeps focus while the test runs.
    if (testing) return;
    setTest({ state: 'running' });
    setErr(null);
    setOk(null);
    setDetails(null);
    try {
      const r = await testConnection(form.debug_mode);
      if (r.debug) setDetails(r.debug);
      if (r.ok) setTest({ state: 'success', message: `Connection works (status ${r.status}).` });
      else
        setTest({
          state: 'error',
          message: `Connection failed (status ${r.status}). ${r.error || 'Check the App ID, API key and environment.'}`,
        });
    } catch (e) {
      setTest({ state: 'error', message: errorMessage(e, 'The connection test could not run.') });
    }
  };

  return (
    <section className="dmn-admin__card" aria-labelledby="dmn-admin-settings-title">
      <div className="dmn-admin__card-header">
        <h2 id="dmn-admin-settings-title">API credentials</h2>
        <p className="dmn-admin__help">
          Connects the plugin to your DesignMyNight account. After saving, use{' '}
          <strong>Import from DesignMyNight</strong> at the top of the page to bring in your venues
          and activities.
        </p>
      </div>

      {loading && <Loading>Loading settings…</Loading>}
      {!loading && loadErr && <LoadError message={loadErr} onRetry={load} />}

      {!loading && !loadErr && (
        <>
          <form onSubmit={onSave} className="dmn-admin__form">
            <div className="dmn-admin__form-grid">
              <div className="dmn-admin__field">
                <label htmlFor="dmn-settings-app-id">App ID</label>
                <input
                  id="dmn-settings-app-id"
                  value={form.app_id}
                  onChange={(e) => setForm({ ...form, app_id: e.target.value })}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="dmn-admin__field">
                <label htmlFor="dmn-settings-api-key">API key</label>
                <input
                  id="dmn-settings-api-key"
                  type="password"
                  value={form.api_key}
                  autoComplete="new-password"
                  placeholder={mask || ''}
                  aria-describedby="dmn-settings-api-key-help"
                  onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                />
                <p id="dmn-settings-api-key-help" className="dmn-admin__help">
                  {mask
                    ? 'A key is saved. Leave this blank to keep it, or enter a new key to replace it.'
                    : 'Enter the API key from your DesignMyNight account.'}
                </p>
              </div>

              <div className="dmn-admin__field">
                <label htmlFor="dmn-settings-env">Environment</label>
                <select
                  id="dmn-settings-env"
                  value={form.environment}
                  onChange={(e) => setForm({ ...form, environment: e.target.value as Env })}
                >
                  <option value="prod">Production</option>
                  <option value="qa">QA / Sandbox</option>
                </select>
              </div>

              <div className="dmn-admin__field">
                <label htmlFor="dmn-settings-vg">
                  Default venue group <span className="dmn-admin__label-hint">(optional)</span>
                </label>
                <input
                  id="dmn-settings-vg"
                  value={form.venue_group}
                  onChange={(e) => setForm({ ...form, venue_group: e.target.value })}
                />
              </div>
            </div>

            <label className="dmn-admin__checkbox">
              <input
                type="checkbox"
                checked={form.debug_mode}
                aria-describedby="dmn-settings-debug-help"
                onChange={(e) => setForm({ ...form, debug_mode: e.target.checked })}
              />
              Debug mode
            </label>
            <p id="dmn-settings-debug-help" className="dmn-admin__help dmn-admin__help--flush">
              Shows request details when you test the connection.
            </p>

            <div className="dmn-admin__form-footer">
              <div className="actions">
                <button className="button" type="submit" disabled={saving} aria-busy={saving}>
                  {saving ? 'Saving…' : 'Save settings'}
                </button>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={onTest}
                  aria-disabled={testing}
                  aria-busy={testing}
                  aria-describedby="dmn-settings-test-help"
                >
                  <Plug aria-hidden="true" className={testing ? 'dmn-admin__pulse' : undefined} />
                  {testing ? 'Testing…' : 'Test connection'}
                </button>
              </div>
              <p id="dmn-settings-test-help" className="dmn-admin__help">
                Test connection uses the last <em>saved</em> credentials and environment, so save
                any changes first.
              </p>
            </div>
          </form>

          {ok && (
            <StatusMessage tone="success" block>
              {ok}
            </StatusMessage>
          )}
          {err && (
            <StatusMessage tone="error" block>
              {err}
            </StatusMessage>
          )}
          {test && (
            <div className="dmn-admin__spacer-top">
              <ProgressPanel
                state={test.state}
                visual={<ConnectionVisual />}
                onDismiss={() => setTest(null)}
                actions={
                  test.state === 'error' && (
                    <button type="button" className="button button--secondary" onClick={onTest}>
                      Try again
                    </button>
                  )
                }
              >
                {test.state === 'running' ? (
                  <p className="dmn-admin__progress-title" role="status">
                    Contacting DesignMyNight with your saved credentials…
                  </p>
                ) : (
                  <StatusMessage tone={test.state === 'success' ? 'success' : 'error'}>
                    {test.message}
                  </StatusMessage>
                )}
              </ProgressPanel>
            </div>
          )}
          {details != null && (
            <pre className="dmn-admin__debug-dump">{JSON.stringify(details, null, 2)}</pre>
          )}
        </>
      )}
    </section>
  );
}

/**
 * This site and DesignMyNight joined by a line: a signal travels along it while testing, and it
 * turns solid (connected) or broken (failed) with the result. Decorative; the text says the outcome.
 */
function ConnectionVisual() {
  return (
    <div className="dmn-admin__link-visual" aria-hidden="true">
      <span className="dmn-admin__link-node">
        <Globe />
        This site
      </span>
      <span className="dmn-admin__link-line">
        <span className="dmn-admin__link-signal" />
      </span>
      <span className="dmn-admin__link-node">
        <Plug />
        DesignMyNight
      </span>
    </div>
  );
}
