// src/admin/components/ActivityManagerCard.tsx
import React, { useEffect, useState } from 'react';
import { adminListActivities, adminListVenues, adminSaveActivity } from '../api';

type AdminVenue = { id: number; title: string; dmn_id: string };
type AdminActivity = {
  id: number;
  dmn_type_id: string;
  name: string;
  description?: string;
  priceText?: string;
  image_id?: number | null;
  image_url?: string | null;
  gallery_ids?: number[];
};

export default function ActivityManagerCard() {
  const [venues, setVenues] = useState<AdminVenue[]>([]);
  const [selected, setSelected] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AdminActivity[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await adminListVenues();
        setVenues(r.venues);
      } catch (e: any) {
        setErr(e.message || 'Failed to load venues.');
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) {
      setRows([]);
      return;
    }
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);
      try {
        const r = await adminListActivities(Number(selected));
        setRows(r.activities);
      } catch (e: any) {
        setErr(e.message || 'Failed to load activities.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selected]);

  const onCell = (id: number, key: keyof AdminActivity, value: any) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));

  const saveOne = async (row: AdminActivity) => {
    setOk(null);
    setErr(null);
    try {
      await adminSaveActivity(row.id, {
        name: row.name,
        description: row.description ?? '',
        priceText: row.priceText ?? '',
        image_id: row.image_id ?? null,
        image_url: row.image_url ?? null,
        gallery_ids: row.gallery_ids ?? [],
      });
      setOk('Saved.');
    } catch (e: any) {
      setErr(e.message || 'Save failed.');
    }
  };

  return (
    <section className="card" style={{ marginTop: 16 }}>
      <h2>Activity Manager</h2>
      <label style={{ display: 'block', marginBottom: 8 }}>
        <span>Select venue</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value ? Number(e.target.value) : '')}
          style={{ display: 'block', marginTop: 4 }}
        >
          <option value="">— Choose a venue —</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title} (DMN {v.dmn_id})
            </option>
          ))}
        </select>
      </label>

      {loading && <p>Loading activities…</p>}
      {err && <p className="err">{err}</p>}
      {!loading && selected && rows.length === 0 && (
        <p>No activities imported for this venue yet.</p>
      )}

      {!loading && rows.length > 0 && (
        <div className="table">
          <div
            className="thead"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.8fr .7fr .6fr 1.4fr 1.1fr auto',
              gap: 8,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            <div>Name</div>
            <div>Description</div>
            <div>Price</div>
            <div>Image ID</div>
            <div>Image URL</div>
            <div>Gallery IDs (comma)</div>
            <div></div>
          </div>
          {rows.map((r) => (
            <div
              className="tr"
              key={r.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.8fr .7fr .6fr 1.4fr 1.1fr auto',
                gap: 8,
                alignItems: 'start',
                marginBottom: 8,
              }}
            >
              <input value={r.name} onChange={(e) => onCell(r.id, 'name', e.target.value)} />
              <textarea
                rows={2}
                value={r.description || ''}
                onChange={(e) => onCell(r.id, 'description', e.target.value)}
              />
              <input
                value={r.priceText || ''}
                onChange={(e) => onCell(r.id, 'priceText', e.target.value)}
              />
              <input
                type="number"
                value={r.image_id ?? ''}
                onChange={(e) =>
                  onCell(r.id, 'image_id', e.target.value ? Number(e.target.value) : null)
                }
              />
              <input
                value={r.image_url || ''}
                onChange={(e) => onCell(r.id, 'image_url', e.target.value)}
              />
              <input
                placeholder="e.g. 12,34,56"
                value={(r.gallery_ids || []).join(',')}
                onChange={(e) =>
                  onCell(
                    r.id,
                    'gallery_ids',
                    e.target.value
                      .split(',')
                      .map((s) => Number(s.trim()))
                      .filter((n) => !Number.isNaN(n)),
                  )
                }
              />
              <button onClick={() => saveOne(r)}>Save</button>
            </div>
          ))}
        </div>
      )}

      {ok && (
        <p className="ok" style={{ marginTop: 8 }}>
          {ok}
        </p>
      )}
    </section>
  );
}
