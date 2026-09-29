// src/admin/components/VenuesOverview.tsx
// The plugin's landing view: every imported venue with a summary of its activities. Opening a venue
// shows its activities (see VenuesPanel).
import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  CircleDot,
  ImageOff,
  Search,
} from 'lucide-react';
import { type AdminVenue } from '@admin/api';
import { useAdmin, venueHref } from '@admin/AdminContext';
import { LoadError, useMediaQuery, Skeleton } from '@admin/components/ui';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Search only helps once there are more venues than fit on screen at a glance. */
const SEARCH_FROM = 7;

/**
 * From as many venues as need search, a table compares them better than cards: one row each, with
 * numbers in columns that can be sorted. Below tablet width the cards stay, as a table would
 * scroll sideways.
 */
const TABLE_FROM = SEARCH_FROM;

type SortKey = 'title' | 'activities' | 'shown' | 'hidden' | 'noImage';

const SORT_LABELS: Record<SortKey, string> = {
  title: 'Venue',
  activities: 'Activities',
  shown: 'Shown',
  hidden: 'Hidden',
  noImage: 'Without an image',
};

const COLUMNS: { key: SortKey; numeric: boolean }[] = [
  { key: 'title', numeric: false },
  { key: 'activities', numeric: true },
  { key: 'shown', numeric: true },
  { key: 'hidden', numeric: true },
  { key: 'noImage', numeric: true },
];

const sortValue = (v: AdminVenue, key: SortKey): number | string => {
  switch (key) {
    case 'title':
      return (v.title || '').toLowerCase();
    case 'activities':
      return v.activities_count;
    case 'shown':
      return v.visible_count;
    case 'hidden':
      return v.activities_count - v.visible_count;
    case 'noImage':
      return v.without_image_count;
  }
};

type Props = {
  venues: AdminVenue[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** The venue with unsaved activity edits, if any. */
  unsavedVenueId: number | null;
  /** Called with each card link, so focus can return to the venue the user came back from. */
  linkRef: (id: number, el: HTMLAnchorElement | null) => void;
  hidden?: boolean;
};

export default function VenuesOverview({
  venues,
  loading,
  error,
  onRetry,
  unsavedVenueId,
  linkRef,
  hidden,
}: Props) {
  const { openSettingsTab, openVenue } = useAdmin();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = q
    ? venues.filter(
        (v) => v.title.toLowerCase().includes(q) || (v.dmn_id || '').toLowerCase().includes(q),
      )
    : venues;

  const wide = useMediaQuery('(min-width: 768px)');
  const asTable = wide && venues.length >= TABLE_FROM;
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'title',
    dir: 'asc',
  });
  const sorted = useMemo(() => {
    const out = [...filtered];
    out.sort((a, b) => {
      const x = sortValue(a, sort.key);
      const y = sortValue(b, sort.key);
      const c =
        typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      // Ties stay in name order (A to Z) either way, so rows don't jump about.
      return (sort.dir === 'asc' ? c : -c) || (a.title || '').localeCompare(b.title || '');
    });
    return out;
  }, [filtered, sort]);

  return (
    <section
      className="dmn-admin__section"
      aria-labelledby="dmn-admin-venues-title"
      hidden={hidden}
    >
      <div className="dmn-admin__section-header">
        <div>
          <h2 id="dmn-admin-venues-title">Venues</h2>
          <p className="dmn-admin__help">
            Open a venue to choose how its activities appear in the booking widget.
          </p>
        </div>
      </div>

      {loading && <Skeleton layout="cards" label="Loading venues…" />}
      {!loading && error && <LoadError message={error} onRetry={onRetry} />}
      {!loading && !error && venues.length === 0 && (
        <div className="dmn-admin__empty">
          <p>
            No venues yet. Save your API credentials under Settings &gt; Connection, then use{' '}
            <strong>Import from DesignMyNight</strong> to bring in your venues and activities.
          </p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => openSettingsTab('connection')}
          >
            Go to Connection
          </button>
        </div>
      )}

      {!loading && venues.length > 0 && (
        <>
          {venues.length >= SEARCH_FROM && (
            <div className="dmn-admin__toolbar dmn-admin__toolbar--one">
              <div className="dmn-admin__field">
                <label htmlFor="dmn-admin-venue-search">Search venues</label>
                <div className="dmn-admin__search">
                  <Search aria-hidden="true" />
                  <input
                    id="dmn-admin-venue-search"
                    type="search"
                    value={query}
                    placeholder="Venue name or DMN ID"
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {q && (
            <p className="dmn-admin__result-count" role="status">
              Showing {filtered.length} of {plural(venues.length, 'venue', 'venues')}
            </p>
          )}

          {filtered.length === 0 && (
            <div className="dmn-admin__empty">
              <p>No venues match your search.</p>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setQuery('')}
              >
                Clear search
              </button>
            </div>
          )}

          {asTable && sorted.length > 0 && (
            <div className="dmn-admin__table-wrap">
              <table className="dmn-admin__table dmn-admin__venue-table">
                <caption className="screen-reader-text">
                  Venues, sorted by {SORT_LABELS[sort.key].toLowerCase()} (
                  {sort.dir === 'asc' ? 'ascending' : 'descending'})
                </caption>
                <thead>
                  <tr>
                    {COLUMNS.map((c) => (
                      <th
                        key={c.key}
                        scope="col"
                        className={c.numeric ? 'dmn-admin__num' : undefined}
                        aria-sort={
                          sort.key === c.key
                            ? sort.dir === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : undefined
                        }
                      >
                        <button
                          type="button"
                          className="dmn-admin__sort"
                          onClick={() =>
                            setSort((s) =>
                              s.key === c.key
                                ? { key: c.key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
                                : { key: c.key, dir: c.numeric ? 'desc' : 'asc' },
                            )
                          }
                        >
                          {SORT_LABELS[c.key]}
                          {sort.key === c.key ? (
                            sort.dir === 'asc' ? (
                              <ArrowUp aria-hidden="true" />
                            ) : (
                              <ArrowDown aria-hidden="true" />
                            )
                          ) : (
                            <ArrowUpDown aria-hidden="true" />
                          )}
                        </button>
                      </th>
                    ))}
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((v) => (
                    <tr key={v.id}>
                      <th scope="row">
                        <a
                          href={venueHref(v.id)}
                          ref={(el) => linkRef(v.id, el)}
                          className="dmn-admin__venue-row-link"
                          onClick={(e) => {
                            e.preventDefault();
                            openVenue(v.id);
                          }}
                        >
                          {v.title || 'Untitled venue'}
                        </a>
                        {v.dmn_id && (
                          <span className="dmn-admin__record-meta">DMN venue ID {v.dmn_id}</span>
                        )}
                      </th>
                      <td className="dmn-admin__num">{v.activities_count}</td>
                      <td className="dmn-admin__num">{v.visible_count}</td>
                      <td className="dmn-admin__num">{v.activities_count - v.visible_count}</td>
                      <td className="dmn-admin__num">{v.without_image_count}</td>
                      <td>
                        {unsavedVenueId === v.id ? (
                          <span className="dmn-admin__chip">
                            <CircleDot
                              className="dmn-admin__chip-icon--warning"
                              aria-hidden="true"
                            />
                            Unsaved changes
                          </span>
                        ) : v.activities_count === 0 ? (
                          'No activities imported'
                        ) : v.visible_count === 0 ? (
                          'All hidden'
                        ) : (
                          ''
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!asTable && (
            <ul className="dmn-admin__venues">
              {filtered.map((v) => {
                const hiddenCount = v.activities_count - v.visible_count;
                return (
                  <li key={v.id} className="dmn-admin__card dmn-admin__venue">
                    <div className="dmn-admin__venue-head">
                      <h3 className="dmn-admin__venue-title">
                        {/* The link covers the whole card (see _venues.scss), so the card is the click target. */}
                        <a
                          href={venueHref(v.id)}
                          ref={(el) => linkRef(v.id, el)}
                          className="dmn-admin__venue-link"
                          onClick={(e) => {
                            e.preventDefault();
                            openVenue(v.id);
                          }}
                        >
                          {v.title || 'Untitled venue'}
                        </a>
                      </h3>
                      <ChevronRight className="dmn-admin__venue-chevron" aria-hidden="true" />
                    </div>
                    {v.dmn_id && <p className="dmn-admin__record-meta">DMN venue ID {v.dmn_id}</p>}

                    {v.activities_count > 0 ? (
                      <p className="dmn-admin__venue-summary">
                        {plural(v.activities_count, 'activity', 'activities')}: {v.visible_count}{' '}
                        shown, {hiddenCount} hidden
                      </p>
                    ) : (
                      <p className="dmn-admin__venue-summary">No activities imported</p>
                    )}

                    {(v.without_image_count > 0 || unsavedVenueId === v.id) && (
                      <div className="dmn-admin__chips">
                        {unsavedVenueId === v.id && (
                          <span className="dmn-admin__chip">
                            <CircleDot
                              className="dmn-admin__chip-icon--warning"
                              aria-hidden="true"
                            />
                            Unsaved changes
                          </span>
                        )}
                        {v.without_image_count > 0 && (
                          <span className="dmn-admin__chip">
                            <ImageOff aria-hidden="true" />
                            {v.without_image_count} without an image
                          </span>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
