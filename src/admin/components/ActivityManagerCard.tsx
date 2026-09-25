import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { CircleDot, Eye, EyeOff, Search } from 'lucide-react';
import { adminListActivities, adminSaveActivity } from '@admin/api';
import { useAdmin } from '@admin/AdminContext';
import { useVenues } from '@admin/components/useVenues';
import {
  LoadError,
  Loading,
  SaveState,
  StatusMessage,
  errorMessage,
  useLatestRequest,
} from '@admin/components/ui';

type PriceMode = 'per_person' | 'per_room' | 'display';
type VisibilityFilter = 'all' | 'shown' | 'hidden';

type AdminActivity = {
  id: number;
  dmn_type_id: string;
  name: string;
  description?: string;
  priceText?: string;
  image_id?: number | null;
  image_url?: string | null;
  visible?: boolean;
  duration_minutes?: number | null;
  price_mode?: PriceMode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const wp: any;

type Props = { onDirty?: (d: boolean) => void };

const MAX = 200;

const countLabel = (n: number) => `${n} ${n === 1 ? 'activity' : 'activities'}`;

function formatDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return 'not set';
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
  (r.visible ?? true) !== (o.visible ?? true) ||
  (r.price_mode || 'per_person') !== (o.price_mode || 'per_person');

export default function ActivityManagerCard({ onDirty }: Props) {
  const { selectedVenueId, setSelectedVenueId, dataVersion, goToSection } = useAdmin();
  const venues = useVenues();
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState<VisibilityFilter>('all');
  const [loading, setLoading] = useState(false);
  const beginRequest = useLatestRequest();
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

  // Match on the saved values, so an edit never removes the card being edited from the list.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const saved = new Map(orig.map((o) => [o.id, o]));
    return rows.filter((r) => {
      const s = saved.get(r.id) ?? r;
      return (
        (visibility === 'all' || (visibility === 'shown') === (s.visible ?? true)) &&
        (q === '' ||
          (s.name || '').toLowerCase().includes(q) ||
          (s.dmn_type_id || '').toLowerCase().includes(q))
      );
    });
  }, [rows, orig, query, visibility]);
  const isFiltered = query.trim() !== '' || visibility !== 'all';
  const clearFilters = () => {
    setQuery('');
    setVisibility('all');
  };

  const load = useCallback(async () => {
    const isCurrent = beginRequest();
    if (!selectedVenueId) {
      setRows([]);
      setOrig([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadErr(null);
    setErr(null);
    setOk(null);
    try {
      const r = await adminListActivities(Number(selectedVenueId));
      if (!isCurrent()) return;
      const list = r.activities.map(withDefaults);
      setRows(list);
      setOrig(list);
    } catch (e) {
      if (!isCurrent()) return;
      setLoadErr(errorMessage(e, 'Activities could not be loaded.'));
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [selectedVenueId, beginRequest]);

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
            visible: r.visible ?? true,
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

  const hasVenues = !venues.loading && !venues.error && venues.venues.length > 0;
  const showList = !!selectedVenueId && !loading && !loadErr && rows.length > 0;

  return (
    <section className="dmn-admin__section" aria-labelledby="dmn-admin-activities-title">
      <div className="dmn-admin__section-header dmn-admin__section-header--sticky">
        <div>
          <h2 id="dmn-admin-activities-title">Activities</h2>
          <p className="dmn-admin__help">
            Edit how each of a venue&apos;s activities appears in the booking widget.
          </p>
        </div>
        <div className="dmn-admin__section-actions">
          <SaveState dirty={dirty.size > 0} ok={ok} />
          {showList && (
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
                  ? `Save ${countLabel(dirty.size)}`
                  : 'Save activities'}
            </button>
          )}
        </div>
      </div>

      {venues.loading && <Loading>Loading venues…</Loading>}
      {!venues.loading && venues.error && (
        <LoadError message={venues.error} onRetry={venues.retry} />
      )}
      {!venues.loading && !venues.error && venues.venues.length === 0 && (
        <div className="dmn-admin__empty">
          <p>
            No venues yet. Save your API credentials under Connection, then use{' '}
            <strong>Import from DesignMyNight</strong> to bring in your venues and activities.
          </p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => goToSection('connection')}
          >
            Go to Connection
          </button>
        </div>
      )}

      {hasVenues && (
        <div className="dmn-admin__toolbar">
          <div className="dmn-admin__field dmn-admin__toolbar-venue">
            <label htmlFor="dmn-admin-venue-picker">Venue</label>
            <select
              id="dmn-admin-venue-picker"
              value={selectedVenueId ?? ''}
              onChange={(e) => setSelectedVenueId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Choose a venue</option>
              {venues.venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title} {v.dmn_id ? `(DMN ${v.dmn_id})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="dmn-admin__field dmn-admin__toolbar-search">
            <label htmlFor="dmn-admin-activity-search">Search activities</label>
            <div className="dmn-admin__search">
              <Search aria-hidden="true" />
              <input
                id="dmn-admin-activity-search"
                type="search"
                value={query}
                placeholder="Name or type ID"
                disabled={!showList}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="dmn-admin__field dmn-admin__toolbar-filter">
            <label htmlFor="dmn-admin-activity-filter">Show</label>
            <select
              id="dmn-admin-activity-filter"
              value={visibility}
              disabled={!showList}
              onChange={(e) => setVisibility(e.target.value as VisibilityFilter)}
            >
              <option value="all">All activities</option>
              <option value="shown">Shown in widget</option>
              <option value="hidden">Hidden from widget</option>
            </select>
          </div>
        </div>
      )}

      {err && (
        <StatusMessage tone="error" block>
          {err}
        </StatusMessage>
      )}

      {hasVenues && !selectedVenueId && (
        <p className="dmn-admin__empty">Choose a venue to edit its activities.</p>
      )}
      {hasVenues && selectedVenueId && loading && <Loading>Loading activities…</Loading>}
      {hasVenues && selectedVenueId && !loading && loadErr && (
        <LoadError message={loadErr} onRetry={load} />
      )}
      {hasVenues && selectedVenueId && !loading && !loadErr && rows.length === 0 && (
        <p className="dmn-admin__empty">
          No activities for this venue yet. Use <strong>Import from DesignMyNight</strong> to bring
          them in.
        </p>
      )}

      {hasVenues && showList && (
        <>
          <p className="dmn-admin__result-count" role="status">
            {isFiltered
              ? `Showing ${filtered.length} of ${countLabel(rows.length)}`
              : countLabel(rows.length)}
          </p>

          {filtered.length === 0 && (
            <div className="dmn-admin__empty">
              <p>No activities match your search or filter.</p>
              <button type="button" className="button button--secondary" onClick={clearFilters}>
                Clear search and filter
              </button>
            </div>
          )}

          <div className="dmn-admin__records">
            {filtered.map((r) => {
              const base = `dmn-activity-${r.id}`;
              const remaining = MAX - (r.description || '').length;
              const visible = r.visible ?? true;

              return (
                <article
                  className="dmn-admin__card dmn-admin__record"
                  key={r.id}
                  aria-labelledby={`${base}-title`}
                >
                  <header className="dmn-admin__record-header">
                    <div>
                      <h3 id={`${base}-title`} className="dmn-admin__record-title">
                        {r.name || 'Untitled activity'}
                      </h3>
                      <p className="dmn-admin__record-meta">
                        Type ID {r.dmn_type_id || 'not set'} · Duration{' '}
                        {formatDuration(r.duration_minutes)}
                      </p>
                    </div>
                    <div className="dmn-admin__chips">
                      <span className="dmn-admin__chip">
                        {visible ? (
                          <Eye className="dmn-admin__chip-icon--success" aria-hidden="true" />
                        ) : (
                          <EyeOff aria-hidden="true" />
                        )}
                        {visible ? 'Shown in widget' : 'Hidden from widget'}
                      </span>
                      {dirty.has(r.id) && (
                        <span className="dmn-admin__chip">
                          <CircleDot className="dmn-admin__chip-icon--warning" aria-hidden="true" />
                          Unsaved
                        </span>
                      )}
                    </div>
                  </header>

                  <div className="dmn-admin__record-body">
                    <div className="dmn-admin__record-fields">
                      <div className="dmn-admin__field">
                        <label htmlFor={`${base}-name`}>Name</label>
                        <input
                          id={`${base}-name`}
                          value={r.name || ''}
                          onChange={(e) => onCell(r.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="dmn-admin__field">
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
                      <div className="dmn-admin__field-row">
                        <div className="dmn-admin__field">
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
                      </div>
                    </div>

                    <div className="dmn-admin__record-side">
                      <div className="dmn-admin__field">
                        <span className="dmn-admin__label" id={`${base}-vis-label`}>
                          Visibility in the widget
                        </span>
                        <ToggleButtonGroup
                          value={visible ? 'enabled' : 'disabled'}
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

                      <div className="dmn-admin__field">
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

                      <div className="dmn-admin__field">
                        <span className="dmn-admin__label">Image</span>
                        {r.image_url ? (
                          <img
                            src={r.image_url}
                            alt={`Current image for ${r.name}`}
                            className="dmn-admin__image"
                          />
                        ) : (
                          <div className="dmn-admin__image dmn-admin__image--empty">No image</div>
                        )}
                        <div className="actions dmn-admin__image-actions">
                          <button
                            className="button button--secondary"
                            type="button"
                            onClick={() => openMedia(r.id)}
                            aria-label={`${r.image_id ? 'Change' : 'Choose'} image for ${r.name}`}
                          >
                            {r.image_id ? 'Change image' : 'Choose image'}
                          </button>
                          {r.image_id ? (
                            <button
                              className="button button--danger"
                              type="button"
                              onClick={() => clearImage(r.id)}
                              aria-label={`Remove image for ${r.name}`}
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
