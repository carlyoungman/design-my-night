import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import {
  ChartColumn,
  CodeXml,
  LayoutDashboard,
  Link2,
  MapPin,
  Palette,
  PlugZap,
  type LucideIcon,
} from 'lucide-react';

/** Top-level sections of the plugin screen, in navigation order. */
export const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: ChartColumn },
  { id: 'venues', label: 'Venues', icon: MapPin },
  { id: 'connection', label: 'Connection', icon: PlugZap },
  { id: 'url-params', label: 'URL parameters', icon: Link2 },
  { id: 'shortcode', label: 'Shortcode', icon: CodeXml },
  { id: 'appearance', label: 'Appearance', icon: Palette },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon }[];

export type SectionId = (typeof SECTIONS)[number]['id'];

/** Tabs inside the Analytics section, in order; the first is the default. */
export const ANALYTICS_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'funnel', label: 'Widget funnel' },
  { id: 'breakdown', label: 'Breakdown' },
  { id: 'timing', label: 'Timing' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'settings', label: 'Settings' },
] as const;

export type AnalyticsTab = (typeof ANALYTICS_TABS)[number]['id'];

/**
 * Where the admin is: a section; inside Venues, the venue being edited (null is the overview);
 * inside Analytics, the tab.
 */
type Route = { section: SectionId; venueId: number | null; analyticsTab: AnalyticsTab };

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
  /** The open tab in the Analytics section. */
  analyticsTab: AnalyticsTab;
  openAnalyticsTab: (tab: AnalyticsTab) => void;
  setVenueGuard: (guard: VenueGuard | null) => void;
  /** Increments after a data import so screens can reload imported data. */
  dataVersion: number;
  notifyDataChanged: () => void;
  /**
   * Increments when the dashboard overview changes without the imported data changing: connection
   * settings saved, or an import that failed (only its record changed). For screens that show the
   * overview; separate from dataVersion so these never reload (and discard unsaved edits in) the
   * activity editor.
   */
  overviewVersion: number;
  notifyOverviewChanged: () => void;
};

const AdminCtx = createContext<Ctx | null>(null);

/** Hash for a route: `#venues`, `#venues/12`, `#analytics/bookings` or another section's id. */
export const venueHref = (id: number) => `#venues/${id}`;
const hashFor = (r: Route) =>
  r.section === 'venues' && r.venueId != null
    ? `venues/${r.venueId}`
    : r.section === 'analytics' && r.analyticsTab !== ANALYTICS_TABS[0].id
      ? `analytics/${r.analyticsTab}`
      : r.section;

function routeFromHash(): Route {
  const [head, sub] = window.location.hash.replace(/^#/, '').split('/');
  // `#activities` is the old name of the Venues section; keep existing links working.
  const section =
    head === 'activities' ? 'venues' : (SECTIONS.find((s) => s.id === head)?.id ?? 'dashboard');
  const venueId = section === 'venues' && sub && /^\d+$/.test(sub) ? Number(sub) : null;
  const analyticsTab =
    (section === 'analytics' && ANALYTICS_TABS.find((t) => t.id === sub)?.id) ||
    ANALYTICS_TABS[0].id;
  return { section, venueId, analyticsTab };
}

const sameRoute = (a: Route, b: Route) =>
  a.section === b.section && a.venueId === b.venueId && a.analyticsTab === b.analyticsTab;

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = React.useState<Route>(routeFromHash);
  const [dataVersion, setDataVersion] = React.useState(0);
  const [overviewVersion, setOverviewVersion] = React.useState(0);
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
      const parsed = routeFromHash();
      // Outside Analytics the hash doesn't name a tab, so keep the one last open.
      const next =
        parsed.section === 'analytics'
          ? parsed
          : { ...parsed, analyticsTab: routeRef.current.analyticsTab };
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

  // Leaving Analytics and coming back returns to the same tab.
  const goToSection = useCallback(
    (id: SectionId) =>
      navigate({ section: id, venueId: null, analyticsTab: routeRef.current.analyticsTab }),
    [navigate],
  );
  const openVenue = useCallback(
    (id: number | null) =>
      navigate({ section: 'venues', venueId: id, analyticsTab: routeRef.current.analyticsTab }),
    [navigate],
  );
  const openAnalyticsTab = useCallback(
    (tab: AnalyticsTab) => navigate({ section: 'analytics', venueId: null, analyticsTab: tab }),
    [navigate],
  );
  const setVenueGuard = useCallback((guard: VenueGuard | null) => {
    guardRef.current = guard;
  }, []);

  const notifyDataChanged = useCallback(() => setDataVersion((v) => v + 1), []);
  const notifyOverviewChanged = useCallback(() => setOverviewVersion((v) => v + 1), []);

  const value = useMemo(
    () => ({
      section: route.section,
      venueId: route.venueId,
      goToSection,
      openVenue,
      analyticsTab: route.analyticsTab,
      openAnalyticsTab,
      setVenueGuard,
      dataVersion,
      notifyDataChanged,
      overviewVersion,
      notifyOverviewChanged,
    }),
    [
      route,
      goToSection,
      openVenue,
      openAnalyticsTab,
      setVenueGuard,
      dataVersion,
      notifyDataChanged,
      overviewVersion,
      notifyOverviewChanged,
    ],
  );

  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error('useAdmin must be used within <AdminProvider>');
  return ctx;
}
