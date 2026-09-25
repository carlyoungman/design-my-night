import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { CodeXml, LayoutDashboard, Link2, MapPin, PlugZap, type LucideIcon } from 'lucide-react';

/** Top-level sections of the plugin screen, in navigation order. */
export const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'venues', label: 'Venues', icon: MapPin },
  { id: 'connection', label: 'Connection', icon: PlugZap },
  { id: 'url-params', label: 'URL parameters', icon: Link2 },
  { id: 'shortcode', label: 'Shortcode', icon: CodeXml },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon }[];

export type SectionId = (typeof SECTIONS)[number]['id'];

/** Where the admin is: a section and, inside Venues, the venue being edited (null is the overview). */
type Route = { section: SectionId; venueId: number | null };

/**
 * Asked before opening a different venue. Returns false to stay put, for example when the user
 * doesn't want to discard unsaved edits.
 */
export type VenueGuard = (nextVenueId: number) => boolean;

type Ctx = {
  section: SectionId;
  /** The venue open in the Venues section, or null for the venues overview. */
  venueId: number | null;
  /** Switches section and records it in the URL hash, so it can be linked and survives reloads. */
  goToSection: (id: SectionId) => void;
  /** Opens a venue's activities, or the venues overview when given null. */
  openVenue: (id: number | null) => void;
  setVenueGuard: (guard: VenueGuard | null) => void;
  /** Increments after a data import so screens can reload imported data. */
  dataVersion: number;
  notifyDataChanged: () => void;
};

const AdminCtx = createContext<Ctx | null>(null);

/** Hash for a route: `#venues`, `#venues/12` or another section's id. */
export const venueHref = (id: number) => `#venues/${id}`;
const hashFor = (r: Route) =>
  r.section === 'venues' && r.venueId != null ? `venues/${r.venueId}` : r.section;

function routeFromHash(): Route {
  const [head, sub] = window.location.hash.replace(/^#/, '').split('/');
  // `#activities` is the old name of the Venues section; keep existing links working.
  const section =
    head === 'activities' ? 'venues' : (SECTIONS.find((s) => s.id === head)?.id ?? 'dashboard');
  const venueId = section === 'venues' && sub && /^\d+$/.test(sub) ? Number(sub) : null;
  return { section, venueId };
}

const sameRoute = (a: Route, b: Route) => a.section === b.section && a.venueId === b.venueId;

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = React.useState<Route>(routeFromHash);
  const [dataVersion, setDataVersion] = React.useState(0);
  // Kept in step synchronously, so the hashchange that follows our own navigation is a no-op.
  const routeRef = useRef(route);
  const guardRef = useRef<VenueGuard | null>(null);

  const allowed = useCallback(
    (next: Route) =>
      next.venueId == null ||
      next.venueId === routeRef.current.venueId ||
      !guardRef.current ||
      guardRef.current(next.venueId),
    [],
  );

  const navigate = useCallback(
    (next: Route) => {
      if (sameRoute(next, routeRef.current) || !allowed(next)) return;
      routeRef.current = next;
      setRoute(next);
      if (window.location.hash !== `#${hashFor(next)}`) window.location.hash = hashFor(next);
    },
    [allowed],
  );

  // Links, and browser back and forward, move between sections and venues.
  useEffect(() => {
    const onHashChange = () => {
      const next = routeFromHash();
      if (sameRoute(next, routeRef.current)) return;
      if (!allowed(next)) {
        // Put the address back without adding a history entry.
        window.history.replaceState(null, '', `#${hashFor(routeRef.current)}`);
        return;
      }
      routeRef.current = next;
      setRoute(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [allowed]);

  const goToSection = useCallback(
    (id: SectionId) => navigate({ section: id, venueId: null }),
    [navigate],
  );
  const openVenue = useCallback(
    (id: number | null) => navigate({ section: 'venues', venueId: id }),
    [navigate],
  );
  const setVenueGuard = useCallback((guard: VenueGuard | null) => {
    guardRef.current = guard;
  }, []);

  const notifyDataChanged = useCallback(() => setDataVersion((v) => v + 1), []);

  const value = useMemo(
    () => ({
      section: route.section,
      venueId: route.venueId,
      goToSection,
      openVenue,
      setVenueGuard,
      dataVersion,
      notifyDataChanged,
    }),
    [route, goToSection, openVenue, setVenueGuard, dataVersion, notifyDataChanged],
  );

  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error('useAdmin must be used within <AdminProvider>');
  return ctx;
}
