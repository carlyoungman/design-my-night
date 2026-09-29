import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import {
  ChartColumn,
  CodeXml,
  LayoutDashboard,
  Link2,
  MapPin,
  Palette,
  PlugZap,
  Settings,
  type LucideIcon,
} from 'lucide-react';

/** Top-level sections of the plugin screen, in navigation order. */
export const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: ChartColumn },
  { id: 'venues', label: 'Venues', icon: MapPin },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon }[];

export type SectionId = (typeof SECTIONS)[number]['id'];

/** Tabs inside the Settings section, in order; the first is the default. */
export const SETTINGS_TABS = [
  { id: 'connection', label: 'Connection', icon: PlugZap },
  { id: 'url-params', label: 'URL parameters', icon: Link2 },
  { id: 'shortcode', label: 'Shortcode', icon: CodeXml },
  { id: 'appearance', label: 'Appearance', icon: Palette },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon }[];

export type SettingsTab = (typeof SETTINGS_TABS)[number]['id'];

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
 * inside Analytics and Settings, the tab.
 */
type Route = {
  section: SectionId;
  venueId: number | null;
  analyticsTab: AnalyticsTab;
  settingsTab: SettingsTab;
};

/**
 * Asked before opening a different venue. Returns (or resolves to) false to stay put, for example
 * when the user doesn't want to discard unsaved edits; a promise lets it ask in a dialog first.
 */
export type VenueGuard = (nextVenueId: number) => boolean | Promise<boolean>;

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
  /** The open tab in the Settings section. */
  settingsTab: SettingsTab;
  openSettingsTab: (tab: SettingsTab) => void;
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

/**
 * Hash for a route: `#venues`, `#venues/12`, `#analytics/bookings`, `#settings/appearance` or
 * another section's id. A section's first tab is left out.
 */
export const venueHref = (id: number) => `#venues/${id}`;
const hashFor = (r: Route) =>
  r.section === 'venues' && r.venueId != null
    ? `venues/${r.venueId}`
    : r.section === 'analytics' && r.analyticsTab !== ANALYTICS_TABS[0].id
      ? `analytics/${r.analyticsTab}`
      : r.section === 'settings' && r.settingsTab !== SETTINGS_TABS[0].id
        ? `settings/${r.settingsTab}`
        : r.section;

function routeFromHash(): Route {
  let [head, sub] = window.location.hash.replace(/^#/, '').split('/');
  // `#activities` is the old name of the Venues section, and Connection, URL parameters, Shortcode
  // and Appearance were sections before they moved under Settings; keep existing links working.
  if (head === 'activities') head = 'venues';
  if (SETTINGS_TABS.some((t) => t.id === head)) [head, sub] = ['settings', head];
  const section = SECTIONS.find((s) => s.id === head)?.id ?? 'dashboard';
  const venueId = section === 'venues' && sub && /^\d+$/.test(sub) ? Number(sub) : null;
  const analyticsTab =
    (section === 'analytics' && ANALYTICS_TABS.find((t) => t.id === sub)?.id) ||
    ANALYTICS_TABS[0].id;
  const settingsTab =
    (section === 'settings' && SETTINGS_TABS.find((t) => t.id === sub)?.id) || SETTINGS_TABS[0].id;
  return { section, venueId, analyticsTab, settingsTab };
}

const sameRoute = (a: Route, b: Route) =>
  a.section === b.section &&
  a.venueId === b.venueId &&
  a.analyticsTab === b.analyticsTab &&
  a.settingsTab === b.settingsTab;

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

  const go = useCallback((next: Route) => {
    if (sameRoute(next, routeRef.current)) return;
    routeRef.current = next;
    setRoute(next);
    if (window.location.hash !== `#${hashFor(next)}`) window.location.hash = hashFor(next);
  }, []);

  /** Goes to `next` once the guard allows it: now, after its dialog is answered, or never. */
  const goWhenAllowed = useCallback(
    (next: Route) => {
      const ok = allowed(next);
      if (ok === true) go(next);
      else if (ok instanceof Promise) ok.then((yes) => yes && go(next));
    },
    [allowed, go],
  );

  const navigate = useCallback(
    (next: Route) => {
      if (!sameRoute(next, routeRef.current)) goWhenAllowed(next);
    },
    [goWhenAllowed],
  );

  // Links, and browser back and forward, move between sections and venues.
  useEffect(() => {
    const onHashChange = () => {
      const parsed = routeFromHash();
      // Outside Analytics and Settings the hash doesn't name their tab, so keep the one last open.
      const next = {
        ...parsed,
        analyticsTab:
          parsed.section === 'analytics' ? parsed.analyticsTab : routeRef.current.analyticsTab,
        settingsTab:
          parsed.section === 'settings' ? parsed.settingsTab : routeRef.current.settingsTab,
      };
      if (sameRoute(next, routeRef.current)) return;
      const ok = allowed(next);
      if (ok === true) {
        routeRef.current = next;
        setRoute(next);
        return;
      }
      // Put the address back without adding a history entry; if the guard's dialog then allows
      // it, go there as if a link had been followed.
      window.history.replaceState(null, '', `#${hashFor(routeRef.current)}`);
      if (ok instanceof Promise) ok.then((yes) => yes && go(next));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [allowed, go]);

  // Leaving Analytics or Settings and coming back returns to the same tab.
  const goToSection = useCallback(
    (id: SectionId) => navigate({ ...routeRef.current, section: id, venueId: null }),
    [navigate],
  );
  const openVenue = useCallback(
    (id: number | null) => navigate({ ...routeRef.current, section: 'venues', venueId: id }),
    [navigate],
  );
  const openAnalyticsTab = useCallback(
    (tab: AnalyticsTab) =>
      navigate({ ...routeRef.current, section: 'analytics', venueId: null, analyticsTab: tab }),
    [navigate],
  );
  const openSettingsTab = useCallback(
    (tab: SettingsTab) =>
      navigate({ ...routeRef.current, section: 'settings', venueId: null, settingsTab: tab }),
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
      settingsTab: route.settingsTab,
      openSettingsTab,
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
      openSettingsTab,
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
