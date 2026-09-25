// src/admin/components/VenuesPanel.tsx
// The Venues section: the venues overview, and one venue's activities once the user opens it
// (`#venues/<id>`). The activity editor stays mounted behind the overview, so going back to the
// overview never loses unsaved edits; opening a different venue asks first.
import React, { useEffect, useRef, useState } from 'react';
import { useAdmin } from '@admin/AdminContext';
import { useVenues } from '@admin/components/useVenues';
import ActivityManagerCard from '@admin/components/ActivityManagerCard';
import VenuesOverview from '@admin/components/VenuesOverview';
import { LoadError, Loading } from '@admin/components/ui';

export default function VenuesPanel({ onDirty }: { onDirty: (d: boolean) => void }) {
  const { venueId, openVenue, setVenueGuard } = useAdmin();
  const { venues, loading, error, retry, refresh } = useVenues();
  // The venue loaded in the editor: the open venue, or the last one opened while the overview shows.
  // Derived during render so the editor and the route change together (focus relies on it).
  const [lastOpened, setLastOpened] = useState<number | null>(venueId);
  if (venueId != null && venueId !== lastOpened) setLastOpened(venueId);
  const editorId = venueId ?? lastOpened;
  const [dirty, setDirty] = useState(false);

  const editorVenue = venues.find((v) => v.id === editorId) ?? null;

  // A venue link can outlive its venue (removed in DesignMyNight, then imported again).
  const missing = venueId != null && !loading && !error && !venues.some((v) => v.id === venueId);

  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);

  // Opening another venue replaces the editor's contents, so confirm before discarding edits.
  useEffect(() => {
    setVenueGuard((next) => {
      if (!dirty || next === editorId) return true;
      return window.confirm(
        `You have unsaved changes to ${
          editorVenue?.title || 'this venue'
        }'s activities. Discard them and open another venue?`,
      );
    });
    return () => setVenueGuard(null);
  }, [dirty, editorId, editorVenue, setVenueGuard]);

  // Move focus with the view: to the venue's heading when it opens, and back to its card on return.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const links = useRef(new Map<number, HTMLAnchorElement>());
  const previous = useRef(venueId);
  useEffect(() => {
    const from = previous.current;
    previous.current = venueId;
    if (from === venueId) return;
    if (venueId != null) headingRef.current?.focus();
    else if (from != null) links.current.get(from)?.focus();
  }, [venueId]);

  const linkRef = (id: number, el: HTMLAnchorElement | null) => {
    if (el) links.current.set(id, el);
    else links.current.delete(id);
  };

  return (
    <>
      <VenuesOverview
        hidden={venueId != null}
        venues={venues}
        loading={loading}
        error={error}
        onRetry={retry}
        unsavedVenueId={dirty ? editorId : null}
        linkRef={linkRef}
      />

      {venueId != null && loading && !editorVenue && <Loading>Loading venue…</Loading>}
      {venueId != null && !loading && error && !editorVenue && (
        <LoadError message={error} onRetry={retry} />
      )}
      {missing && (
        <div className="dmn-admin__empty">
          <p>This venue is no longer in the plugin. Import from DesignMyNight to refresh it.</p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => openVenue(null)}
          >
            Back to venues
          </button>
        </div>
      )}

      {editorVenue && (
        <ActivityManagerCard
          key={editorVenue.id}
          venue={editorVenue}
          hidden={venueId == null || missing}
          headingRef={headingRef}
          onDirty={setDirty}
          onSaved={refresh}
        />
      )}
    </>
  );
}
