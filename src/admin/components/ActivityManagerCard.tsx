import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { adminListActivities, adminSaveActivity } from '@admin/api';
import { useAdmin } from '@admin/AdminContext';
import { LoadError, Loading, SaveState, StatusMessage, errorMessage } from '@admin/components/ui';

type PriceMode = 'per_person' | 'per_room' | 'display';

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
  duration_minutes?: number | null;
  type_text?: string;
  price_mode?: PriceMode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const wp: any;

type Props = { onDirty?: (d: boolean) => void };

const MAX = 200;

function formatDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return 'Not set';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h ? `${h} h` : '', m ? `${m} min` : ''].filter(Boolean).join(' ');
}

const withDefaults = (a: AdminActivity): AdminActivity => ({
  ...a,
  visible: a.visible ?? true,
  price_mode: a.price_mode ?? 'per_person',
});

const isChanged = (r: AdminActivity, o: AdminActivity) =>
  r.name !== o.name ||
  (r.description || '') !== (o.description || '') ||
  (r.priceText || '') !== (o.priceText || '') ||
  (r.image_id ?? null) !== (o.image_id ?? null) ||
  (r.menu_post_id ?? null) !== (o.menu_post_id ?? null) ||
  (r.visible ?? true) !== (o.visible ?? true) ||
  (r.type_text || '') !== (o.type_text || '') ||
  (r.price_mode || 'per_person') !== (o.price_mode || 'per_person');

export default function ActivityManagerCard({ onDirty }: Props) {
  const { selectedVenueId, dataVersion } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminActivity[]>([]);
  const [orig, setOrig] = useState<AdminActivity[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(() => {
    const d = new Set<number>();
    const byId = new Map(orig.map((r) => [r.id, r]));
    for (const r of rows) {
      const o = byId.get(r.id);
      if (!o || isChanged(r, o)) d.add(r.id);
    }
    return d;
  }, [rows, orig]);

  useEffect(() => {
    onDirty?.(dirty.size > 0);
  }, [dirty, onDirty]);

  // Pre-order menus are not in use. To bring back the per-activity menu picker, load the options
  // with adminListMenus() and add a select bound to `menu_post_id`.

  const load = useCallback(async () => {
    if (!selectedVenueId) {
      setRows([]);
      setOrig([]);
      return;
    }
    setLoading(true);
    setLoadErr(null);
    setErr(null);
    setOk(null);
    try {
      const r = await adminListActivities(Number(selectedVenueId));
      const list = r.activities.map(withDefaults);
      setRows(list);
      setOrig(list);
    } catch (e) {
      setLoadErr(errorMessage(e, 'Activities could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, [selectedVenueId]);

  useEffect(() => {
    load();
  }, [load, dataVersion]);

  const onCell = <K extends keyof AdminActivity>(id: number, key: K, value: AdminActivity[K]) => {
    setOk(null);
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  };

  const openMedia = (id: number) => {
    if (!wp?.media) {
      setErr('The WordPress media library is not available on this page. Reload and try again.');
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
    const changed = rows.filter((r) => dirty.has(r.id));
    if (changed.length === 0) return;
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      const results = await Promise.allSettled(
        changed.map((r) =>
          adminSaveActivity(r.id, {
            name: r.name,
            description: r.description ?? '',
            priceText: r.priceText ?? '',
            image_id: r.image_id ?? null,
            menu_post_id: r.menu_post_id ?? null,
            visible: r.visible ?? true,
            type_text: r.type_text ?? '',
            price_mode: r.price_mode ?? 'per_person',
          }),
        ),
      );

      // Rows that saved are no longer dirty, even when others failed.
      const savedIds = new Set(
        changed.filter((_, i) => results[i].status === 'fulfilled').map((r) => r.id),
      );
      setOrig((os) =>
        os.map((o) => (savedIds.has(o.id) ? (rows.find((r) => r.id === o.id) ?? o) : o)),
      );

      const failed = changed.filter((_, i) => results[i].status === 'rejected');
      if (failed.length) {
        const firstReason = (results.find((x) => x.status === 'rejected') as PromiseRejectedResult)
          ?.reason;
        const names = failed.map((r) => r.name || `#${r.id}`).join(', ');
        setErr(
          errorMessage(
            firstReason,
            `${failed.length} of ${changed.length} ${
              changed.length === 1 ? 'activity' : 'activities'
            } could not be saved: ${names}. Your changes are still here; try saving again.`,
          ),
        );
      } else {
        setOk(`Saved ${changed.length} ${changed.length === 1 ? 'activity' : 'activities'}.`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="dmn-admin__header dmn-admin__header--sticky">
        <h2 id="dmn-admin-activities-title" className="dmn-admin__header__headline">
          Activities
        </h2>
        <div className="dmn-admin__header__inner">
          <SaveState
            dirty={dirty.size > 0}
            ok={ok}
          />
          {selectedVenueId && rows.length > 0 && (
            <button
              type="button"
              className="button"
              onClick={saveAll}
              disabled={saving || dirty.size === 0}
              aria-busy={saving}
            >
              {saving
                ? 'Saving…'
                : dirty.size > 0
                  ? `Save ${dirty.size} ${dirty.size === 1 ? 'activity' : 'activities'}`
                  : 'Save activities'}
            </button>
          )}
        </div>
      </div>

      {err && <StatusMessage tone="error" block>{err}</StatusMessage>}

      {!selectedVenueId && (
        <p className="dmn-admin__empty">Choose a venue above to edit its activities.</p>
      )}
      {selectedVenueId && loading && <Loading>Loading activities…</Loading>}
      {selectedVenueId && !loading && loadErr && <LoadError message={loadErr} onRetry={load} />}
      {selectedVenueId && !loading && !loadErr && rows.length === 0 && (
        <p className="dmn-admin__empty">
          No activities for this venue yet. Use <strong>Import data</strong> to bring them in from
          DesignMyNight.
        </p>
      )}

      {selectedVenueId && !loading && !loadErr && rows.length > 0 && (
        <div className="table dmn-admin__spacer-top">
          {rows.map((r) => {
            const base = `dmn-activity-${r.id}`;
            const remaining = MAX - (r.description || '').length;

            return (
              <article className="table__row" key={r.id} aria-labelledby={`${base}-title`}>
                <h3 id={`${base}-title`} className="table__row-title">
                  {r.name || 'Untitled activity'}
                  {dirty.has(r.id) && <span className="screen-reader-text"> (unsaved)</span>}
                </h3>
                <div className="table__left">
                  <dl className="table__meta">
                    <div>
                      <dt>Type ID</dt>
                      <dd>{r.dmn_type_id || 'Not set'}</dd>
                    </div>
                    <div>
                      <dt>Duration</dt>
                      <dd>{formatDuration(r.duration_minutes)}</dd>
                    </div>
                  </dl>

                  <div className="table__cell">
                    <label htmlFor={`${base}-name`}>Name</label>
                    <input
                      id={`${base}-name`}
                      value={r.name || ''}
                      onChange={(e) => onCell(r.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="table__cell">
                    <label htmlFor={`${base}-desc`}>Description</label>
                    <textarea
                      id={`${base}-desc`}
                      rows={3}
                      maxLength={MAX}
                      value={r.description || ''}
                      aria-describedby={`${base}-desc-count`}
                      onChange={(e) => onCell(r.id, 'description', e.target.value)}
                    />
                    <p id={`${base}-desc-count`} className="dmn-admin__help">
                      {remaining} of {MAX} characters left
                    </p>
                  </div>
                  <div className="table__cell">
                    <label htmlFor={`${base}-price`}>Price</label>
                    <input
                      id={`${base}-price`}
                      value={r.priceText || ''}
                      aria-describedby={`${base}-price-help`}
                      onChange={(e) => onCell(r.id, 'priceText', e.target.value)}
                    />
                    <p id={`${base}-price-help`} className="dmn-admin__help">
                      For example £25. How it is charged is set under Pricing.
                    </p>
                  </div>

                  <div className="table__cell">
                    <label htmlFor={`${base}-typetext`}>Shortcode text</label>
                    <input
                      id={`${base}-typetext`}
                      type="text"
                      value={r.type_text || ''}
                      aria-describedby={`${base}-typetext-help`}
                      onChange={(e) => onCell(r.id, 'type_text', e.target.value)}
                    />
                    <p id={`${base}-typetext-help`} className="dmn-admin__help">
                      Shown only when the shortcode preselects this activity with{' '}
                      <code>type_id</code>. HTML is allowed.
                    </p>
                  </div>
                </div>

                <div className="table__right">
                  <div className="table__image-picker">
                    <span className="dmn-admin__label">Image</span>
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt={`Current image for ${r.name}`}
                        className="table__image-picker__image"
                      />
                    ) : (
                      <div className="table__image-picker__image-preview">No image</div>
                    )}
                    <div className="table__image-picker__button-wrap">
                      <button
                        className="table__image-picker__btn button button--secondary"
                        type="button"
                        onClick={() => openMedia(r.id)}
                        aria-label={`${r.image_id ? 'Change' : 'Choose'} image for ${r.name}`}
                      >
                        {r.image_id ? 'Change image' : 'Choose image'}
                      </button>
                      {r.image_id ? (
                        <button
                          className="table__image-picker__btn button button--danger"
                          type="button"
                          onClick={() => clearImage(r.id)}
                          aria-label={`Remove image for ${r.name}`}
                        >
                          Remove image
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="table__cell">
                    <span className="dmn-admin__label" id={`${base}-vis-label`}>
                      Visibility in the widget
                    </span>
                    <ToggleButtonGroup
                      value={r.visible ? 'enabled' : 'disabled'}
                      exclusive
                      onChange={(_, newValue) => {
                        if (!newValue) return; // one option must stay selected
                        onCell(r.id, 'visible', newValue === 'enabled');
                      }}
                      aria-labelledby={`${base}-vis-label`}
                    >
                      <ToggleButton value="enabled">Shown</ToggleButton>
                      <ToggleButton value="disabled">Hidden</ToggleButton>
                    </ToggleButtonGroup>
                  </div>

                  <div className="table__cell">
                    <span className="dmn-admin__label" id={`${base}-price-label`}>
                      Pricing
                    </span>
                    <ToggleButtonGroup
                      value={r.price_mode ?? 'per_person'}
                      exclusive
                      onChange={(_, newValue) => {
                        if (!newValue) return; // one option must stay selected
                        onCell(r.id, 'price_mode', newValue as PriceMode);
                      }}
                      aria-labelledby={`${base}-price-label`}
                      aria-describedby={`${base}-price-mode-help`}
                    >
                      <ToggleButton value="per_person">Per person</ToggleButton>
                      <ToggleButton value="per_room">Per room</ToggleButton>
                      <ToggleButton value="display">Text only</ToggleButton>
                    </ToggleButtonGroup>
                    <p id={`${base}-price-mode-help`} className="dmn-admin__help">
                      Text only shows the price text without calculating a total.
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
