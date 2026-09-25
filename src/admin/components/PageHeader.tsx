// src/admin/components/PageHeader.tsx
// Page identity plus the page-level action: importing venues and activities from DesignMyNight.
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminSyncAll } from '@admin/api';
import { useAdmin } from '@admin/AdminContext';
import { StatusMessage, errorMessage } from '@admin/components/ui';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default function PageHeader() {
  const { notifyDataChanged } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const runImport = async () => {
    setBusy(true);
    setOk(null);
    setErr(null);
    try {
      const r = await adminSyncAll();
      setOk(
        r.message ||
          `Imported ${plural(r.venues_count ?? 0, 'venue', 'venues')} and ${plural(
            r.types_count ?? 0,
            'activity',
            'activities',
          )}.`,
      );
      notifyDataChanged();
    } catch (e) {
      setErr(
        errorMessage(
          e,
          'Import failed. Check your API credentials under Connection with Test connection, then try again.',
        ),
      );
    } finally {
      setBusy(false);
    }
  };

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
          disabled={busy}
          aria-busy={busy}
        >
          <RefreshCw aria-hidden="true" />
          {busy ? 'Importing…' : 'Import from DesignMyNight'}
        </button>
      </div>
      {(ok || err) && (
        <div className="dmn-admin__page-header-status">
          {ok && <StatusMessage tone="success">{ok}</StatusMessage>}
          {err && <StatusMessage tone="error">{err}</StatusMessage>}
        </div>
      )}
    </header>
  );
}
