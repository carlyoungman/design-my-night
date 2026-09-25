// src/admin/components/PageHeader.tsx
// Page identity plus the page-level action: importing venues and activities from DesignMyNight.
import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminOverview, adminSyncAll } from '@admin/api';
import { useAdmin } from '@admin/AdminContext';
import { ProgressPanel, useElapsedSeconds } from '@admin/components/ui';
import { useToast } from '@admin/components/Toasts';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const seconds = (ms: number) => Math.max(1, Math.round(ms / 1000));

export default function PageHeader() {
  const { notifyDataChanged, goToSection } = useAdmin();
  const [busy, setBusy] = useState(false);
  // How long the last successful import took, to set expectations for the next one.
  const [typicalMs, setTypicalMs] = useState<number | null>(null);
  const elapsed = useElapsedSeconds(busy);
  const importToast = useToast();
  // Try again in the toast runs the import as it is then.
  const runImportRef = useRef<() => void>(() => {});

  // Reads the stored import record; makes no DesignMyNight request.
  useEffect(() => {
    adminOverview()
      .then((o) => {
        if (o.last_import?.ok) setTypicalMs(o.last_import.duration_ms);
      })
      .catch(() => {});
  }, []);

  // Leaving the page would lose the outcome of the import, so ask first.
  useEffect(() => {
    if (!busy) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [busy]);

  const runImport = async () => {
    // aria-disabled rather than disabled, so the button keeps focus while the import runs.
    if (busy) return;
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
            : undefined,
        },
      );
      if (r.duration_ms) setTypicalMs(r.duration_ms);
      notifyDataChanged();
    } catch (e) {
      importToast.error('Import from DesignMyNight failed.', {
        error: e,
        action: { label: 'Try again', onClick: () => runImportRef.current() },
      });
      // A failed import is recorded too, so the dashboard shows it.
      notifyDataChanged();
    } finally {
      setBusy(false);
    }
  };

  runImportRef.current = runImport;

  let expectation = 'This can take a minute if you have many venues.';
  if (typicalMs != null) {
    const typical = seconds(typicalMs);
    expectation =
      elapsed <= typical
        ? `The last import took about ${typical} s.`
        : `Taking longer than last time (about ${typical} s). DesignMyNight may be slow to respond.`;
  }

  return (
    <header className="dmn-admin__page-header">
      <div className="dmn-admin__page-header-text">
        <h1 className="dmn-admin__title">DesignMyNight bookings</h1>
        <p className="dmn-admin__intro">
          Your DesignMyNight venues and how their activities appear in the booking widget. Import
          again after you add or change venues or activities in DesignMyNight.
        </p>
      </div>
      <div className="dmn-admin__page-header-actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={runImport}
          aria-disabled={busy}
          aria-busy={busy}
        >
          <RefreshCw aria-hidden="true" className={busy ? 'dmn-admin__spin' : undefined} />
          {busy ? 'Importing…' : 'Import from DesignMyNight'}
        </button>
      </div>
      {busy && (
        <div className="dmn-admin__page-header-status">
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
    </header>
  );
}
