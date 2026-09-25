// src/admin/components/VenuesOverview.tsx
// The plugin's landing view: every imported venue with a summary of its activities. Opening a venue
// shows its activities (see VenuesPanel).
import React, { useState } from 'react';
import { ChevronRight, CircleDot, ImageOff, Search } from 'lucide-react';
import { type AdminVenue } from '@admin/api';
import { useAdmin, venueHref } from '@admin/AdminContext';
import { LoadError, Loading } from '@admin/components/ui';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Search only helps once there are more venues than fit on screen at a glance. */
const SEARCH_FROM = 7;

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
  const { goToSection, openVenue } = useAdmin();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = q
    ? venues.filter(
        (v) => v.title.toLowerCase().includes(q) || (v.dmn_id || '').toLowerCase().includes(q),
      )
    : venues;

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

      {loading && <Loading>Loading venues…</Loading>}
      {!loading && error && <LoadError message={error} onRetry={onRetry} />}
      {!loading && !error && venues.length === 0 && (
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
                          <CircleDot className="dmn-admin__chip-icon--warning" aria-hidden="true" />
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
        </>
      )}
    </section>
  );
}
