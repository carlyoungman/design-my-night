// src/admin/components/DataSyncCard.tsx
import React, { useState } from 'react';
import { adminSyncTypesAll, adminSyncVenues } from '../api';

export default function DataSyncCard() {
  const [busy, setBusy] = useState<'v' | 't' | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (which: 'v' | 't') => {
    setBusy(which);
    setOk(null);
    setErr(null);
    try {
      if (which === 'v') {
        const r = await adminSyncVenues();
        setOk(`Imported/updated ${r.count} venues.`);
      } else {
        const r = await adminSyncTypesAll();
        setOk(`Imported/updated ${r.count} activity types across venues.`);
      }
    } catch (e: any) {
      setErr(e.message || 'Sync failed.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="card" style={{ marginTop: 16 }}>
      <h2>Data Sync</h2>
      <p>Pull venues and activity types from DesignMyNight into WordPress.</p>
      <div className="actions">
        <button onClick={() => run('v')} disabled={busy !== null}>
          {busy === 'v' ? 'Importing venues…' : 'Import Venues'}
        </button>
        <button onClick={() => run('t')} disabled={busy !== null}>
          {busy === 't' ? 'Importing types…' : 'Import Activity Types'}
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
