// src/admin/components/ImportDataCard.tsx
// Step 2 of the Connection section: import venues and activities from DesignMyNight with the
// credentials saved in step 1 (SettingsCard). Shows whether credentials are saved and what the last
// import brought in, both from the stored overview; opening it makes no DesignMyNight request.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { type ImportRecord, adminOverview, adminSyncAll } from '@admin/api';
import { useAdmin } from '@admin/AdminContext';
import {
  LoadError,
  Loading,
  ProgressPanel,
  StatusMessage,
  errorMessage,
  useElapsedSeconds,
} from '@admin/components/ui';
import { useToast } from '@admin/components/Toasts';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const seconds = (ms: number) => Math.max(1, Math.round(ms / 1000));
const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function ImportDataCard() {
  const { dataVersion, overviewVersion, notifyDataChanged, notifyOverviewChanged, goToSection } =
    useAdmin();
  const [busy, setBusy] = useState(false);
  // Null until the overview loads; the button works meanwhile, and the server checks anyway.
  const [hasCredentials, setHasCredentials] = useState<boolean | null>(null);
  const [last, setLast] = useState<ImportRecord | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const elapsed = useElapsedSeconds(busy);
  const importToast = useToast();
  // Try again in the toast runs the import as it is then.
  const runImportRef = useRef<() => void>(() => {});
  // Only the newest overview request may update the card.
  const overviewRequest = useRef(0);

  // Reads the stored import record and whether credentials are saved; reloads after settings are
  // saved or an import fails (overviewVersion) or data changes (dataVersion). Later loads keep
  // the last result on screen while they run.
  const loadOverview = useCallback(async () => {
    const request = ++overviewRequest.current;
    setOverviewError(null);
    try {
      const o = await adminOverview();
      if (request !== overviewRequest.current) return;
      setHasCredentials(o.connection.has_credentials);
      setLast(o.last_import);
    } catch (e) {
      if (request !== overviewRequest.current) return;
      setOverviewError(errorMessage(e, 'The last import could not be loaded.'));
    } finally {
      if (request === overviewRequest.current) setOverviewLoading(false);
    }
  }, []);
  useEffect(() => {
    loadOverview();
  }, [loadOverview, dataVersion, overviewVersion]);

  // Leaving the page would lose the outcome of the import, so ask first.
  useEffect(() => {
    if (!busy) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [busy]);

  // Only while the explanation is on screen; if the overview failed, the server still checks.
  const blocked = !overviewError && hasCredentials === false;

  const runImport = async () => {
    // aria-disabled rather than disabled, so the button keeps focus while the import runs.
    if (busy || blocked) return;
    setBusy(true);
    importToast.clear();
    try {
      const r = await adminSyncAll();
      importToast.success(
        r.message ||
          `Imported ${plural(r.venues_count ?? 0, 'venue', 'venues')} and ${plural(
            r.types_count ?? 0,
            'activity',
            'activities',
          )}.`,
        {
          description: r.duration_ms ? `Took ${seconds(r.duration_ms)} s.` : undefined,
          action: r.issues_count
            ? { label: 'See problems on the Dashboard', onClick: () => goToSection('dashboard') }
            : { label: 'Review venues', onClick: () => goToSection('venues') },
        },
      );
      notifyDataChanged();
    } catch (e) {
      importToast.error('Import from DesignMyNight failed.', {
        error: e,
        action: { label: 'Try again', onClick: () => runImportRef.current() },
      });
      // A failed import changes only its record, not the imported data, so refresh the overview
      // without reloading the activity editor (which would discard its unsaved edits).
      notifyOverviewChanged();
    } finally {
      setBusy(false);
    }
  };

  runImportRef.current = runImport;

  // How long the last successful import took, to set expectations for this one.
  const typicalMs = last?.ok ? last.duration_ms : null;
  let expectation = 'This can take a minute if you have many venues.';
  if (typicalMs != null) {
    const typical = seconds(typicalMs);
    expectation =
      elapsed <= typical
        ? `The last import took about ${typical} s.`
        : `Taking longer than last time (about ${typical} s). DesignMyNight may be slow to respond.`;
  }

  const lastSuccess = last?.last_success_at ?? null;

  return (
    <section
      className="dmn-admin__card dmn-admin__spacer-top"
      aria-labelledby="dmn-admin-import-title"
    >
      <div className="dmn-admin__card-header">
        <h2 id="dmn-admin-import-title">2. Import venues and activities</h2>
        <p className="dmn-admin__help">
          Brings in your venues and their activities using the credentials saved in step 1. Import
          again after you add or change venues or activities in DesignMyNight; your edits in the
          plugin are kept.
        </p>
      </div>

      {overviewLoading ? (
        <Loading>Loading the last import…</Loading>
      ) : overviewError ? (
        <LoadError
          message={overviewError}
          onRetry={() => {
            setOverviewLoading(true);
            loadOverview();
          }}
        />
      ) : blocked ? (
        <div id="dmn-admin-import-blocked">
          <StatusMessage tone="warning">
            Save your App ID and API key in step 1 first.
          </StatusMessage>
        </div>
      ) : last == null ? (
        <p className="dmn-admin__help">Nothing has been imported yet.</p>
      ) : (
        <p className="dmn-admin__help">
          {lastSuccess
            ? `Last imported ${dateTime.format(new Date(lastSuccess * 1000))}.`
            : 'No import has succeeded yet.'}{' '}
          {!last.ok && 'The most recent attempt failed; see the Dashboard for details.'}
        </p>
      )}

      <div className="actions dmn-admin__spacer-top">
        <button
          type="button"
          className="button"
          onClick={runImport}
          aria-disabled={busy || blocked}
          aria-busy={busy}
          aria-describedby={blocked ? 'dmn-admin-import-blocked' : undefined}
        >
          <RefreshCw aria-hidden="true" className={busy ? 'dmn-admin__spin' : undefined} />
          {busy ? 'Importing…' : 'Import from DesignMyNight'}
        </button>
      </div>

      {busy && (
        <div className="dmn-admin__spacer-top">
          <ProgressPanel
            state="running"
            meta={
              <span aria-hidden="true" className="dmn-admin__progress-timer">
                {elapsed} s
              </span>
            }
          >
            <p className="dmn-admin__progress-title" role="status">
              Importing venues and activities from DesignMyNight…
            </p>
            <p className="dmn-admin__help">
              Fetching your venues, then each venue&rsquo;s activities. {expectation} Keep this page
              open until it finishes.
            </p>
          </ProgressPanel>
        </div>
      )}
    </section>
  );
}
