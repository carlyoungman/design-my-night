// src/admin/components/DataSyncCard.tsx
import React, { useState } from 'react';
import { adminSyncAll } from '../api';

export default function DataSyncCard() {
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setOk(null);
    setErr(null);
    try {
      const r = await adminSyncAll();
      setOk(r.message || `Imported ${r.venues_count} venues and ${r.types_count} activity types.`);
    } catch (e: any) {
      setErr(e.message || 'Sync failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="dmn-admin__card" style={{ marginTop: 16 }}>
      <h2>Data Sync</h2>
      <p>Import / update venues and activity types from DesignMyNight into WordPress.</p>
      <div className="actions">
        <button className="button button--action" onClick={run} disabled={busy}>
          {busy ? 'Importing…' : 'Import data'}
        </button>
      </div>
      {ok && (
        <p className="ok" style={{ marginTop: 8 }}>
          {ok}
        </p>
      )}
      {err && (
        <p className="err" style={{ marginTop: 8 }}>
          {err}
        </p>
      )}
    </section>
  );
}
