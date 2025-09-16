// src/admin/components/ActivityManagerCard.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
};

declare const wp: any; // WP media global

export default function ActivityManagerCard() {
  const [venues, setVenues] = useState<AdminVenue[]>([]);
  const [selected, setSelected] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const [rows, setRows] = useState<AdminActivity[]>([]);
  const [orig, setOrig] = useState<AdminActivity[]>([]);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const MAX = 200;
  // Track which rows have changes
  const dirty = useMemo(() => {
    const d = new Set<number>();
    const byId = new Map(orig.map((r) => [r.id, r]));
    for (const r of rows) {
      const o = byId.get(r.id);
      if (!o) {
        d.add(r.id);
        continue;
      }
      if (
        r.name !== o.name ||
        (r.description || '') !== (o.description || '') ||
        (r.priceText || '') !== (o.priceText || '') ||
        (r.image_id || null) !== (o.image_id || null)
      ) {
        d.add(r.id);
      }
    }
    return d;
  }, [rows, orig]);

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
      setOrig([]);
      return;
    }
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);
      try {
        const r = await adminListActivities(Number(selected));
        setRows(r.activities);
        setOrig(r.activities);
      } catch (e: any) {
        setErr(e.message || 'Failed to load activities.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selected]);

  const onCell = (id: number, key: keyof AdminActivity, value: any) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));

  const openMedia = (id: number) => {
    // Ensure wp.media is availabel (enqueue_media in PHP)
    if (!wp?.media) {
      setErr('WordPress media library not available.');
      return;
    }
    const frame = wp.media({
      title: 'Select image',
      button: { text: 'Use this image' },
      multiple: false,
      library: { type: 'image' },
    });
    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();
      onCell(id, 'image_id', attachment.id);
      onCell(id, 'image_url', attachment.sizes?.medium?.url || attachment.url);
    });
    frame.open();
  };

  const clearImage = (id: number) => {
    onCell(id, 'image_id', null);
    onCell(id, 'image_url', null);
  };

  const saveAll = async () => {
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      // Only save changed rows
      const changed = rows.filter((r) => dirty.has(r.id));
      if (changed.length === 0) {
        setOk('Nothing to save.');
        return;
      }
      const results = await Promise.allSettled(
        changed.map((r) =>
          adminSaveActivity(r.id, {
            name: r.name,
            description: r.description ?? '',
            priceText: r.priceText ?? '',
            image_id: r.image_id ?? null,
          }),
        ),
      );

      const failed = results.filter((x) => x.status === 'rejected') as PromiseRejectedResult[];
      if (failed.length) {
        setErr(
          `Saved ${changed.length - failed.length}/${changed.length}. Last error: ${failed[0].reason?.message || 'Unknown error'}`,
        );
      } else {
        setOk(`Saved ${changed.length} activities.`);
        // Refresh from server so image_url reflects generated sizes/changes
        const r = await adminListActivities(Number(selected));
        setRows(r.activities);
        setOrig(r.activities);
      }
    } catch (e: any) {
      setErr(e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dmn-admin__card">
      <div className="dmn-admin__header">
        <h2 className="dmn-admin__header__headline">Activity Manager</h2>
        <span className="dmn-admin__header__inner">
          {dirty.size > 0 && (
            <p className="dmn-admin__header__dirty">
              You have unsaved changes ({dirty.size} {dirty.size === 1 ? 'activity' : 'activities'}
              ).
            </p>
          )}
          {ok && <p className="dmn-admin__header__ok">{ok}</p>}
          <button className="button" onClick={saveAll} disabled={saving || dirty.size === 0}>
            {saving ? 'Saving…' : 'Save all changes'}
          </button>
        </span>
      </div>

      <label style={{ display: 'block', marginBottom: 30 }}>
        <span>Select venue</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value ? Number(e.target.value) : '')}
          style={{ display: 'block', marginTop: 7.5 }}
        >
          <option value="">— Choose a venue —</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title} {v.dmn_id ? `(DMN ${v.dmn_id})` : ''}
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
        <>
          <div className="table">
            {rows.map((r) => (
              <React.Fragment key={r.id}>
                <div className="table__row">
                  <div className="table__left">
                    <div className="table__cell">
                      <div className="table__label">Name</div>
                      <input
                        value={r.name}
                        onChange={(e) => onCell(r.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="table__cell">
                      <div className="table__label">Description - (Max 200)</div>
                      <textarea
                        rows={2}
                        maxLength={MAX}
                        value={r.description || ''}
                        onChange={(e) => onCell(r.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="table__cell">
                      <div className="table__label">Price</div>
                      <input
                        value={r.priceText || ''}
                        onChange={(e) => onCell(r.id, 'priceText', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="table__right">
                    <div className="table__image-picker">
                      <div className="table__label">Image</div>
                      {r.image_url ? (
                        <img src={r.image_url} alt="" className="table__image-picker__image" />
                      ) : (
                        <div className="table__image-picker__image-preview"></div>
                      )}
                      <div className="table__image-picker__button-wrap">
                        <button
                          className="table__image-picker__btn button"
                          type="button"
                          onClick={() => openMedia(r.id)}
                        >
                          Choose image
                        </button>
                        {r.image_id ? (
                          <button
                            className="table__image-picker__btn  button button--remove"
                            type="button"
                            onClick={() => clearImage(r.id)}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
