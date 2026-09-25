import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { ChevronDown, ChevronLeft, CircleDot, Eye, EyeOff, Search } from 'lucide-react';
import {
  type AdminVenue,
  adminListActivities,
  adminSaveActivity,
  adminSaveVenue,
} from '@admin/api';
import { useAdmin } from '@admin/AdminContext';
import {
  LoadError,
  Loading,
  SaveState,
  StatusMessage,
  errorMessage,
  errorReason,
  useLatestRequest,
} from '@admin/components/ui';
import { useErrorToast } from '@admin/components/Toasts';

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

type Props = {
  venue: AdminVenue;
  /** Hidden while the venues overview is showing; stays mounted so unsaved edits survive. */
  hidden?: boolean;
  headingRef?: React.Ref<HTMLHeadingElement>;
  onDirty?: (d: boolean) => void;
  /** Called after activities are saved, so the overview's counts can be refreshed. */
  onSaved?: () => void;
};

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

/** One venue's activities: how each appears in the booking widget. Opened from the venues overview. */
export default function ActivityManagerCard({
  venue,
  hidden,
  headingRef,
  onDirty,
  onSaved,
}: Props) {
  const { dataVersion, openVenue } = useAdmin();
  const venueId = venue.id;
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState<VisibilityFilter>('all');
  const [loading, setLoading] = useState(false);
  const beginRequest = useLatestRequest();
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminActivity[]>([]);
  const [orig, setOrig] = useState<AdminActivity[]>([]);
  const saveError = useErrorToast();
  const [ok, setOk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Activities whose editor is open. All start closed, except when a venue has only one activity.
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  // Venue setting, saved as soon as it changes (separately from the activities).
  const [hideUnavailable, setHideUnavailable] = useState(venue.hide_unavailable);
  const [venueSaving, setVenueSaving] = useState(false);
  const venueError = useErrorToast();
  const [venueOk, setVenueOk] = useState<string | null>(null);

  useEffect(() => {
    setHideUnavailable(venue.hide_unavailable);
  }, [venue.hide_unavailable]);

  // Toasts about the previous venue no longer apply.
  useEffect(() => {
    venueError.clear();
    saveError.clear();
    setVenueOk(null);
  }, [venueId, venueError, saveError]);

  const saveHideUnavailable = async (next: boolean) => {
    const previous = hideUnavailable;
    setHideUnavailable(next);
    setVenueSaving(true);
    venueError.clear();
    setVenueOk(null);
    try {
      const r = await adminSaveVenue(venueId, { hide_unavailable: next });
      setHideUnavailable(r.hide_unavailable);
      setVenueOk('Saved.');
      onSaved?.();
    } catch (e) {
      setHideUnavailable(previous);
      venueError.show('The unavailable activities setting could not be saved. Try again.', {
        error: e,
      });
    } finally {
      setVenueSaving(false);
    }
  };

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
    setLoading(true);
    setLoadErr(null);
    saveError.clear();
    setOk(null);
    try {
      const r = await adminListActivities(venueId);
      if (!isCurrent()) return;
      const list = r.activities.map(withDefaults);
      setRows(list);
      setOrig(list);
      setQuery('');
      setVisibility('all');
      setOpen(new Set(list.length === 1 ? [list[0].id] : []));
    } catch (e) {
      if (!isCurrent()) return;
      setLoadErr(errorMessage(e, 'Activities could not be loaded.'));
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [venueId, beginRequest, saveError]);

  useEffect(() => {
    load();
  }, [load, dataVersion]);

  const toggleOpen = (id: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onCell = <K extends keyof AdminActivity>(id: number, key: K, value: AdminActivity[K]) => {
    setOk(null);
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  };

  const openMedia = (id: number) => {
    if (!wp?.media) {
      saveError.show('The WordPress media library is not available on this page.', {
        description: 'Reload the page and try again.',
      });
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

  // The toast's Try again saves the edits as they are then, not as they were when it failed.
  const saveAllRef = useRef<() => void>(() => {});
  const saveAll = async () => {
    const changed = rows.filter((r) => dirty.has(r.id));
    if (saving || changed.length === 0) return;
    setSaving(true);
    saveError.clear();
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
        // Open the activities that failed so their changes are visible.
        setOpen((prev) => new Set([...prev, ...failed.map((r) => r.id)]));
        const firstReason = (results.find((x) => x.status === 'rejected') as PromiseRejectedResult)
          ?.reason;
        const names = failed.map((r) => r.name || `#${r.id}`).join(', ');
        const reason = errorReason(firstReason);
        saveError.show(
          `${failed.length} of ${changed.length} ${
            changed.length === 1 ? 'activity' : 'activities'
          } could not be saved.`,
          {
            description: `${names}${reason ? ` (${reason})` : ''}. Your changes are still here; try saving again.`,
            action: { label: 'Try again', onClick: () => saveAllRef.current() },
          },
        );
      } else {
        setOk(`Saved ${changed.length} ${changed.length === 1 ? 'activity' : 'activities'}.`);
      }
      if (savedIds.size) onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  saveAllRef.current = saveAll;

  const showList = !loading && !loadErr && rows.length > 0;

  return (
    <section className="dmn-admin__section" aria-labelledby="dmn-admin-venue-title" hidden={hidden}>
      <nav className="dmn-admin__breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <a
              href="#venues"
              onClick={(e) => {
                e.preventDefault();
                openVenue(null);
              }}
            >
              <ChevronLeft aria-hidden="true" />
              Venues
            </a>
          </li>
          <li aria-current="page">{venue.title || 'Untitled venue'}</li>
        </ol>
      </nav>
      <div className="dmn-admin__section-header dmn-admin__section-header--sticky">
        <div>
          <h2 id="dmn-admin-venue-title" ref={headingRef} tabIndex={-1}>
            {venue.title || 'Untitled venue'}
          </h2>
          <p className="dmn-admin__help">
            {venue.dmn_id ? `DMN venue ID ${venue.dmn_id}. ` : ''}Edit how each of this venue&apos;s
            activities appears in the booking widget.
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

      <div
        className={`dmn-admin__venue-layout${showList ? ' dmn-admin__venue-layout--with-options' : ''}`}
      >
        {showList && (
          <aside
            className="dmn-admin__card dmn-admin__venue-options"
            aria-labelledby="dmn-admin-venue-options-title"
          >
            <h3 id="dmn-admin-venue-options-title">Venue options</h3>
            <div className="dmn-admin__field">
              <span className="dmn-admin__label" id="dmn-admin-venue-unavailable-label">
                Unavailable activities
              </span>
              <ToggleButtonGroup
                value={hideUnavailable ? 'hide' : 'show'}
                exclusive
                disabled={venueSaving}
                onChange={(_, newValue) => {
                  if (!newValue) return; // one option must stay selected
                  saveHideUnavailable(newValue === 'hide');
                }}
                aria-labelledby="dmn-admin-venue-unavailable-label"
                aria-describedby="dmn-admin-venue-unavailable-help"
              >
                <ToggleButton value="show">Show as unavailable</ToggleButton>
                <ToggleButton value="hide">Hide</ToggleButton>
              </ToggleButtonGroup>
              <p id="dmn-admin-venue-unavailable-help" className="dmn-admin__help">
                When DesignMyNight can&apos;t take an activity for the chosen date or group size,
                either show it in the booking widget with its reason or leave it out. Saved straight
                away.
              </p>
            </div>
            {venueSaving && (
              <p className="dmn-admin__help" role="status">
                Saving…
              </p>
            )}
            {!venueSaving && venueOk && <StatusMessage tone="success">{venueOk}</StatusMessage>}
          </aside>
        )}

        <div className="dmn-admin__venue-main">
          {showList && (
            <div className="dmn-admin__toolbar dmn-admin__toolbar--two">
              <div className="dmn-admin__field dmn-admin__toolbar-search">
                <label htmlFor="dmn-admin-activity-search">Search activities</label>
                <div className="dmn-admin__search">
                  <Search aria-hidden="true" />
                  <input
                    id="dmn-admin-activity-search"
                    type="search"
                    value={query}
                    placeholder="Name or type ID"
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="dmn-admin__field dmn-admin__toolbar-filter">
                <label htmlFor="dmn-admin-activity-filter">Show</label>
                <select
                  id="dmn-admin-activity-filter"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as VisibilityFilter)}
                >
                  <option value="all">All activities</option>
                  <option value="shown">Shown in widget</option>
                  <option value="hidden">Hidden from widget</option>
                </select>
              </div>
            </div>
          )}

          {loading && <Loading>Loading activities…</Loading>}
          {!loading && loadErr && <LoadError message={loadErr} onRetry={load} />}
          {!loading && !loadErr && rows.length === 0 && (
            <div className="dmn-admin__empty">
              <p>
                No activities for this venue yet. Use <strong>Import from DesignMyNight</strong> to
                bring them in.
              </p>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => openVenue(null)}
              >
                Back to venues
              </button>
            </div>
          )}

          {showList && (
            <>
              <div className="dmn-admin__list-bar">
                <p className="dmn-admin__result-count" role="status">
                  {isFiltered
                    ? `Showing ${filtered.length} of ${countLabel(rows.length)}`
                    : countLabel(rows.length)}
                </p>
                {filtered.length > 1 && (
                  <div className="actions dmn-admin__list-bar-actions">
                    <button
                      type="button"
                      className="button button--text"
                      disabled={filtered.every((r) => open.has(r.id))}
                      onClick={() =>
                        setOpen((prev) => new Set([...prev, ...filtered.map((r) => r.id)]))
                      }
                    >
                      Expand all
                    </button>
                    <button
                      type="button"
                      className="button button--text"
                      disabled={filtered.every((r) => !open.has(r.id))}
                      onClick={() => setOpen(new Set())}
                    >
                      Collapse all
                    </button>
                  </div>
                )}
              </div>

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
                  const isOpen = open.has(r.id);

                  return (
                    <article
                      className={`dmn-admin__card dmn-admin__record${
                        isOpen ? ' dmn-admin__record--open' : ''
                      }`}
                      key={r.id}
                      aria-labelledby={`${base}-title`}
                    >
                      <header className="dmn-admin__record-header">
                        <ChevronDown className="dmn-admin__record-chevron" aria-hidden="true" />
                        <div>
                          <h3 className="dmn-admin__record-title">
                            {/* The button covers the whole header (see _records.scss), so the header is the click target. */}
                            <button
                              type="button"
                              id={`${base}-title`}
                              className="dmn-admin__record-toggle"
                              aria-expanded={isOpen}
                              aria-controls={`${base}-body`}
                              onClick={() => toggleOpen(r.id)}
                            >
                              {r.name || 'Untitled activity'}
                            </button>
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
                              <CircleDot
                                className="dmn-admin__chip-icon--warning"
                                aria-hidden="true"
                              />
                              Unsaved
                            </span>
                          )}
                        </div>
                      </header>

                      <div id={`${base}-body`} className="dmn-admin__record-body" hidden={!isOpen}>
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
                              <div className="dmn-admin__image dmn-admin__image--empty">
                                No image
                              </div>
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
        </div>
      </div>
    </section>
  );
}
