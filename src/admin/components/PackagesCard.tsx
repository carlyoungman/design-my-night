import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { adminBulkSavePackages, adminDeletePackage, adminGetPackages } from '../api';
import type { AdminPackage } from '../../frontend/app/types';

type Busy = false | 'loading' | 'saving' | `delete:${number}`;
declare const wp: any; // WordPress media

export default function PackagesCard() {
  const { selectedVenueId: venueId } = useAdmin();
  const [busy, setBusy] = useState<Busy>(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminPackage[]>([]);
  const [orig, setOrig] = useState<AdminPackage[]>([]);
  const MAX = 200;

  const load = async () => {
    setBusy('loading');
    setErr(null);
    setOk(null);
    try {
      if (!venueId) {
        setRows([]);
        setOrig([]);
        return;
      }
      const items = await adminGetPackages({ venueId: String(venueId) });
      setRows(items);
      setOrig(items);
    } catch (e: any) {
      setErr(e.message || 'Failed to load add-ons.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, [venueId]);

  const setField = (idx: number, key: keyof AdminPackage, value: any) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  };

  const addRow = () => {
    setRows((r) => [
      {
        name: 'New add-on',
        description: '',
        priceText: '',
        visible: true,
        image_id: null,
        image_url: null,
        venueIds: venueId ? [String(venueId)] : [],
      },
      ...r,
    ]);
  };

  const pickImage = (idx: number) => {
    const frame = wp?.media?.({
      title: 'Choose image',
      multiple: false,
      library: { type: 'image' },
    });
    if (!frame) {
      setErr('WordPress media library not available.');
      return;
    }
    frame.on('select', () => {
      const att = frame.state().get('selection').first().toJSON();
      setField(idx, 'image_id', att.id);
      setField(idx, 'image_url', att.sizes?.medium?.url || att.url);
    });
    frame.open();
  };

  const clearImage = (idx: number) => {
    setField(idx, 'image_id', null);
    setField(idx, 'image_url', null);
  };

  const del = async (row: AdminPackage) => {
    if (!row.id) {
      setRows((r) => r.filter((x) => x !== row));
      return;
    }
    if (!confirm('Delete this add-on?')) return;
    setBusy(`delete:${row.id}`);
    try {
      await adminDeletePackage(row.id);
      setRows((r) => r.filter((x) => x !== row));
      setOk('Deleted.');
    } catch (e: any) {
      setErr(e.message || 'Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy('saving');
    setErr(null);
    setOk(null);
    try {
      const saved = await adminBulkSavePackages(rows);
      setRows(saved);
      setOrig(saved);
      setOk(`Saved ${saved.length} add-on(s).`);
    } catch (e: any) {
      setErr(e.message || 'Save failed.');
    } finally {
      setBusy(false);
    }
  };

  // show a dirty badge similar to Activity Manager
  const dirtyCount = useMemo(() => {
    const sameArr = (a?: string[], b?: string[]) =>
      JSON.stringify((a || []).slice().sort()) === JSON.stringify((b || []).slice().sort());
    return rows.reduce((n, r) => {
      const o = orig.find((x) => x.id === r.id);
      if (!o) return n + 1;
      if (
        r.name !== o.name ||
        (r.description || '') !== (o.description || '') ||
        (r.priceText || '') !== (o.priceText || '') ||
        (r.image_id || null) !== (o.image_id || null) ||
        !!r.visible !== !!o.visible ||
        !sameArr(r.venueIds, o.venueIds)
      )
        return n + 1;
      return n;
    }, 0);
  }, [rows, orig]);

  return (
    <section className="dmn-admin__card" style={{ marginTop: 16 }}>
      <div className="dmn-admin__header">
        <h2 className="dmn-admin__header__headline">Add-on Packages</h2>
        <span className="dmn-admin__header__inner">
          {dirtyCount > 0 && (
            <p className="dmn-admin__header__dirty">
              You have unsaved changes ({dirtyCount} {dirtyCount === 1 ? 'package' : 'packages'}).
            </p>
          )}
          {ok && <p className="dmn-admin__header__ok">{ok}</p>}
          <button className="button" onClick={addRow} disabled={!venueId}>
            + New
          </button>
          <button
            className="button button-primary"
            onClick={save}
            disabled={busy === 'saving' || dirtyCount === 0}
          >
            {busy === 'saving' ? 'Saving…' : 'Save changes'}
          </button>
        </span>
      </div>

      {!venueId && <p className="dmn-admin__help">Pick a venue above to manage add-ons.</p>}
      {busy === 'loading' && <p>Loading…</p>}
      {err && (
        <div className="notice notice-error">
          <p>{err}</p>
        </div>
      )}

      {/* list, using the same div-based layout as Activity Manager */}
      {venueId && busy !== 'loading' && rows.length === 0 && <p>No add-ons found.</p>}

      {rows.length > 0 && (
        <div className="table">
          {rows.map((row, i) => (
            <div className="table__row" key={row.id ?? `new-${i}`}>
              <div className="table__left">
                <div className="table__cell">
                  <div className="table__label">Name</div>
                  <input value={row.name} onChange={(e) => setField(i, 'name', e.target.value)} />
                </div>

                <div className="table__cell">
                  <div className="table__label">Description - (Max 200)</div>
                  <textarea
                    rows={2}
                    maxLength={MAX}
                    value={row.description || ''}
                    onChange={(e) => setField(i, 'description', e.target.value)}
                  />
                </div>

                <div className="table__cell">
                  <div className="table__label">Price</div>
                  <input
                    value={row.priceText || ''}
                    onChange={(e) => setField(i, 'priceText', e.target.value)}
                  />
                </div>
                <div className="table__cell">
                  <label>
                    <input
                      type="checkbox"
                      checked={!!row.visible}
                      onChange={(e) => setField(i, 'visible', e.target.checked)}
                    />{' '}
                    Visible
                  </label>
                </div>
              </div>

              <div className="table__right">
                <div className="table__image-picker">
                  <div className="table__label">Image</div>
                  {row.image_url ? (
                    <img src={row.image_url} alt="" className="table__image-picker__image" />
                  ) : (
                    <div className="table__image-picker__image-preview"></div>
                  )}
                  <div className="table__image-picker__button-wrap">
                    <button
                      className="table__image-picker__btn button"
                      type="button"
                      onClick={() => pickImage(i)}
                    >
                      Choose image
                    </button>
                    {row.image_id ? (
                      <button
                        className="table__image-picker__btn button button--remove"
                        type="button"
                        onClick={() => clearImage(i)}
                      >
                        Remove
                      </button>
                    ) : null}
                    <button
                      className="table__image-picker__btn button-link-delete"
                      type="button"
                      onClick={() => del(row)}
                      disabled={busy === `delete:${row.id}`}
                      style={{ marginLeft: 8 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
