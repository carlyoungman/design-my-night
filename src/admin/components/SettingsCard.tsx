// src/admin/components/SettingsCard.tsx
import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
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
import { useToast } from '@admin/components/Toasts';
import { useAdmin } from '@admin/AdminContext';
import { DiscardButton } from '@admin/components/Confirm';

type Env = 'prod' | 'qa';
type FormState = {
  app_id: string;
  api_key: string;
  environment: Env;
  venue_group: string;
  debug_mode: boolean;
};

const EMPTY: FormState = {
  app_id: '',
  api_key: '',
  environment: 'prod',
  venue_group: '',
  debug_mode: false,
};

/** Unsaved when a field differs from the saved settings, or a new API key has been typed. */
const isDirty = (f: FormState, s: FormState | null) =>
  !!s &&
  (f.app_id.trim() !== s.app_id ||
    f.api_key.trim() !== '' ||
    f.environment !== s.environment ||
    f.venue_group.trim() !== s.venue_group ||
    f.debug_mode !== s.debug_mode);

export default function SettingsCard({ onDirty }: { onDirty?: (dirty: boolean) => void }) {
  const { notifyOverviewChanged } = useAdmin();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [test, setTest] = useState<{ state: ProgressState; message?: string } | null>(null);
  const testing = test?.state === 'running';
  const saveToast = useToast();
  const [details, setDetails] = useState<unknown | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY);
  // The settings as last loaded or saved; the API key is write-only, so it is always ''.
  const [saved, setSaved] = useState<FormState | null>(null);
  const [mask, setMask] = useState('');
  // Starts open when debug mode is on; after that only the user opens or closes it.
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const dirty = isDirty(form, saved);

  useEffect(() => {
    onDirty?.(dirty);
  }, [dirty, onDirty]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const s = await getSettings();
      const next = {
        app_id: s.app_id || '',
        api_key: '',
        environment: s.environment,
        venue_group: s.venue_group || '',
        debug_mode: !!s.debug_mode,
      };
      setForm(next);
      setSaved(next);
      setAdvancedOpen(next.debug_mode);
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

  /** Saves the form; resolves true when it saved. `quiet` skips the toast (Save and test). */
  const save = async (quiet = false) => {
    setSaving(true);
    saveToast.clear();
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
      if (payload.api_key) {
        // Refresh the key mask; the write-only key field is cleared below.
        const s = await getSettings();
        setMask(s.api_key_mask || '');
      }
      setSaved({ ...payload, api_key: '' });
      // Keep anything typed while the save ran, so it shows as unsaved; clear the key field only
      // if it still holds the key that was just saved.
      setForm((f) => ({ ...f, api_key: f.api_key.trim() === payload.api_key ? '' : f.api_key }));
      if (!quiet)
        saveToast.success('Settings saved.', {
          description: 'Test the connection, then import your venues in step 2.',
        });
      // Step 2 and the Dashboard read whether credentials are saved.
      notifyOverviewChanged();
      return true;
    } catch (e) {
      saveToast.error('Settings could not be saved. Check your connection and try again.', {
        error: e,
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    if (dirty && !saving) save();
  };

  /**
   * Tests the saved credentials. With unsaved edits it saves them first, so the result is always
   * for what the form shows.
   */
  const onTest = async () => {
    // aria-disabled rather than disabled, so the button keeps focus while the test runs.
    if (testing || saving) return;
    if (dirty) {
      if (!formRef.current?.reportValidity()) return;
      if (!(await save(true))) return;
    }
    setTest({ state: 'running' });
    saveToast.clear();
    setDetails(null);
    try {
      const r = await testConnection(form.debug_mode);
      if (r.debug) setDetails(r.debug);
      if (r.ok)
        setTest({
          state: 'success',
          message: `Connection works (status ${r.status}). Next, import your venues in step 2.`,
        });
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
        <h3 id="dmn-admin-settings-title">1. Connect to DesignMyNight</h3>
        <p className="dmn-admin__help">
          Enter the API credentials from your DesignMyNight account, save them, and test the
          connection.
        </p>
      </div>

      {loading && <Loading>Loading settings…</Loading>}
      {!loading && loadErr && <LoadError message={loadErr} onRetry={load} />}

      {!loading && !loadErr && (
        <>
          <form ref={formRef} onSubmit={onSave} className="dmn-admin__form">
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

            <details
              className="dmn-admin__disclosure"
              open={advancedOpen}
              onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
            >
              <summary>Advanced</summary>
              <div className="dmn-admin__form dmn-admin__spacer-top">
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
                  Shows the request details below the result when you test the connection.
                </p>
              </div>
            </details>

            <div className="dmn-admin__form-footer">
              <div className="actions">
                <button
                  className="button"
                  type="submit"
                  disabled={saving || !dirty}
                  aria-busy={saving}
                >
                  {saving ? 'Saving…' : 'Save settings'}
                </button>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={onTest}
                  aria-disabled={testing || saving}
                  aria-busy={testing}
                  aria-describedby="dmn-settings-test-help"
                >
                  <Plug aria-hidden="true" className={testing ? 'dmn-admin__pulse' : undefined} />
                  {testing ? 'Testing…' : dirty ? 'Save and test' : 'Test connection'}
                </button>
                <DiscardButton
                  dirty={dirty}
                  disabled={saving || testing}
                  what="the connection settings"
                  onDiscard={() => saved && setForm(saved)}
                />
              </div>
              <p id="dmn-settings-test-help" className="dmn-admin__help">
                {dirty
                  ? 'Save and test saves your changes, then tests the connection with them.'
                  : 'Tests the saved credentials and environment.'}
              </p>
            </div>
          </form>

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
            <section className="dmn-admin__spacer-top" aria-labelledby="dmn-settings-debug-title">
              <h4 id="dmn-settings-debug-title">Request details (debug mode)</h4>
              <pre className="dmn-admin__debug-dump" tabIndex={0}>
                {JSON.stringify(details, null, 2)}
              </pre>
            </section>
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
