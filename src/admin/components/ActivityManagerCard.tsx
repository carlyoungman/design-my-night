import React, { useEffect, useMemo, useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { adminListActivities, adminSaveActivity, adminListMenus } from '../api';
import { useAdmin } from '../AdminContext';

type AdminActivity = {
  id: number;
  dmn_type_id: string;
  name: string;
  description?: string;
  priceText?: string;
  image_id?: number | null;
  image_url?: string | null;
  menu_post_id?: number | null;
  visible?: boolean;
  duration_minutes?: number;
};

type MenuOption = { id: number; title: string; fixed_price?: boolean };

declare const wp: any;

type Props = { onDirty?: (d: boolean) => void };

function formatDuration(minutes?: number): string {
  if (!minutes || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function ActivityManagerCard({ onDirty }: Props) {
  const { selectedVenueId } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AdminActivity[]>([]);
  const [orig, setOrig] = useState<AdminActivity[]>([]);
  const [menus, setMenus] = useState<MenuOption[]>([]);
  const [menusLoading, setMenusLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const MAX = 200;

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
        (r.image_id || null) !== (o.image_id || null) ||
        (r.menu_post_id || null) !== (o.menu_post_id || null) ||
        (r.visible ?? true) !== (o.visible ?? true)
      )
        d.add(r.id);
    }
    return d;
  }, [rows, orig]);

  useEffect(() => {
    onDirty?.(dirty.size > 0);
  }, [dirty, onDirty]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setMenusLoading(true);
      try {
        const r = await adminListMenus();
        if (!cancel) setMenus(r.menus || []);
      } catch (e: any) {
        if (!cancel) setErr(e.message || 'Failed to load menus.');
      } finally {
        if (!cancel) setMenusLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedVenueId) {
      setRows([]);
      setOrig([]);
      return;
    }
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);
      try {
        const r = await adminListActivities(Number(selectedVenueId));
        const rowsWithDefaults = r.activities.map((a: AdminActivity) => ({
          ...a,
          visible: a.visible ?? true,
        }));
        setRows(rowsWithDefaults);
        setOrig(rowsWithDefaults);
      } catch (e: any) {
        setErr(e.message || 'Failed to load activities.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedVenueId]);

  const onCell = (id: number, key: keyof AdminActivity, value: any) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));

  const openMedia = (id: number) => {
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
      const att = frame.state().get('selection').first().toJSON();
      onCell(id, 'image_id', att.id);
      onCell(id, 'image_url', att.sizes?.medium?.url || att.url);
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
            menu_post_id: r.menu_post_id ?? null,
            visible: r.visible ?? true,
          }),
        ),
      );
      const failed = results.filter((x) => x.status === 'rejected') as PromiseRejectedResult[];
      if (failed.length) {
        setErr(
          `Saved ${changed.length - failed.length}/${changed.length}. Last error: ${(failed[0] as any)?.reason?.message || 'Unknown error'}`,
        );
      } else {
        setOk(`Saved ${changed.length} activities.`);
        if (selectedVenueId) {
          const r = await adminListActivities(Number(selectedVenueId));
          const updatedRows = r.activities.map((a: AdminActivity) => ({
            ...a,
            visible: a.visible ?? true,
          }));
          setRows(updatedRows);
          setOrig(updatedRows);
        }
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
          <button
            className="button button--action"
            onClick={saveAll}
            disabled={saving || dirty.size === 0}
          >
            {saving ? 'Saving…' : 'Save activity changes'}
          </button>
        </span>
      </div>

      {!selectedVenueId && (
        <p className="dmn-admin__help">Pick a venue above to manage activities.</p>
      )}
      {loading && <p>Loading activities…</p>}
      {err && <p className="err">{err}</p>}
      {!loading && selectedVenueId && rows.length === 0 && (
        <p>No activities imported for this venue yet.</p>
      )}

      {!loading && rows.length > 0 && (
        <div className="table">
          {rows.map((r) => (
            <div className="table__row" key={r.id}>
              <div className="table__left">
                <div className="table__cell">
                  <div className="table__label">Name</div>
                  <input value={r.name} onChange={(e) => onCell(r.id, 'name', e.target.value)} />
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
                {/*<div className="table__cell">*/}
                {/*  <div className="table__label">Pre-order Menu</div>*/}
                {/*  <select*/}
                {/*    value={r.menu_post_id ?? ''}*/}
                {/*    onChange={(e) =>*/}
                {/*      onCell(r.id, 'menu_post_id', e.target.value ? Number(e.target.value) : null)*/}
                {/*    }*/}
                {/*    disabled={menusLoading}*/}
                {/*  >*/}
                {/*    <option value="">— No menu —</option>*/}
                {/*    {menus.map((m) => (*/}
                {/*      <option key={m.id} value={m.id}>*/}
                {/*        {m.title}*/}
                {/*        {m.fixed_price ? ' (fixed price)' : ''}*/}
                {/*      </option>*/}
                {/*    ))}*/}
                {/*  </select>*/}
                {/*</div>*/}
                <div className="table__cell">
                  <div className="table__label">Type ID</div>
                  <input type="text" value={r.dmn_type_id || ''} disabled placeholder="Type" />
                </div>
                <div className="table__cell">
                  <div className="table__label">Duration</div>
                  <input type="text" value={r.duration_minutes} disabled placeholder="HH:MM" />
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
                        className="table__image-picker__btn  button button--sub"
                        type="button"
                        onClick={() => clearImage(r.id)}
                      >
                        Clear image
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="table__cell" style={{ marginTop: '1.5rem' }}>
                  <div className="table__label">Visibility</div>
                  <ToggleButtonGroup
                    value={r.visible ? 'enabled' : 'disabled'}
                    exclusive
                    onChange={(_, newValue) => onCell(r.id, 'visible', newValue === 'enabled')}
                    aria-label="Visibility"
                  >
                    <ToggleButton value="enabled">Enabled</ToggleButton>
                    <ToggleButton value="disabled">Disabled</ToggleButton>
                  </ToggleButtonGroup>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
