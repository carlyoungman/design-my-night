import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { adminListMenuItems, adminSaveMenuItem, type AdminMenuItemsResponse } from '../api';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

declare const wp: any;

type ItemRow = AdminMenuItemsResponse['menus'][number]['items'][number] & {
  visible?: boolean;
};
type Group = AdminMenuItemsResponse['menus'][number];

type Props = { onDirty?: (d: boolean) => void };

export default function PreorderMenusCard({ onDirty }: Props) {
  const { selectedVenueId } = useAdmin();
  const [groups, setGroups] = useState<Group[]>([]);
  const [orig, setOrig] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const dirtyIds = useMemo(() => {
    const set = new Set<number>();
    const byMenu = new Map<number, Group>(orig.map((g) => [g.menu_post_id, g]));
    for (const g of groups) {
      const og = byMenu.get(g.menu_post_id);
      if (!og) {
        g.items.forEach((i) => set.add(i.id));
        continue;
      }
      const byId = new Map(og.items.map((i) => [i.id, i]));
      for (const i of g.items) {
        const oi = byId.get(i.id);
        if (!oi) {
          set.add(i.id);
          continue;
        }
        if (
          (i.name ?? '') !== (oi.name ?? '') ||
          (i.description ?? '') !== (oi.description ?? '') ||
          (i.image_id ?? null) !== (oi.image_id ?? null) ||
          (i.visible ?? true) !== (oi.visible ?? true)
        ) {
          set.add(i.id);
        }
      }
    }
    return set;
  }, [groups, orig]);

  useEffect(() => {
    onDirty?.(dirtyIds.size > 0);
  }, [dirtyIds, onDirty]);

  useEffect(() => {
    if (!selectedVenueId) {
      setGroups([]);
      setOrig([]);
      return;
    }
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);
      try {
        const r = await adminListMenuItems(Number(selectedVenueId));
        const withDefaults = r.menus.map((g) => ({
          ...g,
          items: g.items.map((i) => ({ ...i, visible: i.visible ?? true })),
        }));
        setGroups(withDefaults);
        setOrig(withDefaults);
      } catch (e: any) {
        setErr(e.message || 'Failed to load menu items.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedVenueId]);

  const onItem = (menuId: number, itemId: number, patch: Partial<ItemRow>) => {
    setGroups((gs) =>
      gs.map((g) =>
        g.menu_post_id === menuId
          ? { ...g, items: g.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
          : g,
      ),
    );
  };

  const openMedia = (menuId: number, item: ItemRow) => {
    if (!wp?.media) {
      setErr('Media library unavailable');
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
      onItem(menuId, item.id, {
        image_id: att.id,
        image_url: att.sizes?.medium?.url || att.url,
      });
    });
    frame.open();
  };

  const clearImage = (menuId: number, itemId: number) => {
    onItem(menuId, itemId, { image_id: null, image_url: null });
  };

  const saveAll = async () => {
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      const changes: ItemRow[] = [];
      for (const g of groups) {
        for (const i of g.items) {
          if (dirtyIds.has(i.id)) changes.push(i);
        }
      }
      if (changes.length === 0) {
        setOk('Nothing to save.');
        return;
      }
      const results = await Promise.allSettled(
        changes.map((i) =>
          adminSaveMenuItem(i.id, {
            name: i.name,
            description: i.description,
            image_id: i.image_id ?? null,
            visible: i.visible ?? true,
          }),
        ),
      );
      const failed = results.filter((x) => x.status === 'rejected') as PromiseRejectedResult[];
      if (failed.length) {
        setErr(
          `Saved ${changes.length - failed.length}/${changes.length}. Last error: ${(failed[0] as any)?.reason?.message || 'Unknown error'}`,
        );
      } else {
        setOk(`Saved ${changes.length} item${changes.length === 1 ? '' : 's'}.`);
        if (selectedVenueId) {
          const r = await adminListMenuItems(Number(selectedVenueId));
          const refreshed = r.menus.map((g) => ({
            ...g,
            items: g.items.map((i) => ({ ...i, visible: i.visible ?? true })),
          }));
          setGroups(refreshed);
          setOrig(refreshed);
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
        <h2 className="dmn-admin__header__headline">Pre-order Menus</h2>
        <span className="dmn-admin__header__inner">
          {dirtyIds.size > 0 && (
            <p className="dmn-admin__header__dirty">Unsaved changes ({dirtyIds.size})</p>
          )}
          {ok && <p className="dmn-admin__header__ok">{ok}</p>}
          <button
            className="button button--action"
            onClick={saveAll}
            disabled={saving || dirtyIds.size === 0}
          >
            {saving ? 'Saving…' : 'Save Add-on changes'}
          </button>
        </span>
      </div>

      {!selectedVenueId && <p className="dmn-admin__help">Pick a venue above to manage Add-ons.</p>}
      {loading && <p>Loading menu items…</p>}
      {err && <p className="err">{err}</p>}

      {!loading && groups.length === 0 && selectedVenueId && (
        <p>No activities have a pre-order menu selected for this venue.</p>
      )}

      {!loading &&
        groups.map((g) => (
          <div key={g.menu_post_id} className="dmn-menu-group">
            <h3 className="dmn-menu-group__title">{g.menu_title}</h3>
            <div className="table">
              {g.items.map((i) => (
                <div key={i.id} className="table__row">
                  <div className="table__left">
                    <div className="table__cell">
                      <div className="table__label">Name</div>
                      <input
                        value={i.name}
                        onChange={(e) => onItem(g.menu_post_id, i.id, { name: e.target.value })}
                      />
                    </div>
                    <div className="table__cell">
                      <div className="table__label">Description</div>
                      <textarea
                        rows={2}
                        value={i.description || ''}
                        onChange={(e) =>
                          onItem(g.menu_post_id, i.id, { description: e.target.value })
                        }
                      />
                    </div>
                    <div className="table__cell">
                      <div className="table__label">DMN ID</div>
                      <input type="text" value={i.dmn_item_id || ''} disabled placeholder="Type" />
                    </div>
                    <div className="table__cell">
                      <div className="table__label">Price</div>
                      <input
                        type="text"
                        value={`£${i.price_ro.toFixed(2)}`}
                        disabled
                        placeholder="Price"
                      />
                    </div>
                  </div>
                  <div className="table__right">
                    <div className="table__image-picker">
                      <div className="table__label">Image</div>
                      {i.image_url ? (
                        <img src={i.image_url} alt="" className="table__image-picker__image" />
                      ) : (
                        <div className="table__image-picker__image-preview"></div>
                      )}
                      <div className="table__image-picker__button-wrap">
                        <button
                          className="table__image-picker__btn button"
                          type="button"
                          onClick={() => openMedia(g.menu_post_id, i)}
                        >
                          Choose image
                        </button>
                        {i.image_id ? (
                          <button
                            className="table__image-picker__btn button button--sub"
                            type="button"
                            onClick={() => clearImage(g.menu_post_id, i.id)}
                          >
                            Clear image
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div className="table__cell" style={{ marginTop: '1.5rem' }}>
                      <div className="table__label">Visibility</div>
                      <ToggleButtonGroup
                        value={i.visible ? 'enabled' : 'disabled'}
                        exclusive
                        onChange={(_, newValue) =>
                          onItem(g.menu_post_id, i.id, { visible: newValue === 'enabled' })
                        }
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
          </div>
        ))}
    </section>
  );
}
