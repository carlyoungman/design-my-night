import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';

/** Top-level sections of the plugin screen, in navigation order. */
export const SECTIONS = [
  { id: 'activities', label: 'Activities' },
  { id: 'connection', label: 'Connection' },
  { id: 'url-params', label: 'URL parameters' },
  { id: 'shortcode', label: 'Shortcode' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

type Ctx = {
  selectedVenueId: number | null;
  setSelectedVenueId: (id: number | null) => void;
  /** Increments after a data import so screens can reload imported data. */
  dataVersion: number;
  notifyDataChanged: () => void;
  section: SectionId;
  /** Switches section and records it in the URL hash, so it can be linked and survives reloads. */
  goToSection: (id: SectionId) => void;
};

const AdminCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = 'dmn.admin.selectedVenueId';

function readStoredVenue(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

function sectionFromHash(): SectionId {
  const hash = window.location.hash.replace(/^#/, '');
  return SECTIONS.find((s) => s.id === hash)?.id ?? 'activities';
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [selectedVenueId, setSelectedVenueId] = React.useState<number | null>(readStoredVenue);
  const [dataVersion, setDataVersion] = React.useState(0);
  const [section, setSection] = React.useState<SectionId>(sectionFromHash);

  useEffect(() => {
    try {
      if (selectedVenueId != null)
        window.localStorage.setItem(STORAGE_KEY, String(selectedVenueId));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable (private mode or blocked); the selection just won't persist.
    }
  }, [selectedVenueId]);

  // Browser back and forward move between sections.
  useEffect(() => {
    const onHashChange = () => setSection(sectionFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const goToSection = useCallback((id: SectionId) => {
    setSection(id);
    if (window.location.hash !== `#${id}`) window.location.hash = id;
  }, []);

  const notifyDataChanged = useCallback(() => setDataVersion((v) => v + 1), []);

  const value = useMemo(
    () => ({
      selectedVenueId,
      setSelectedVenueId,
      dataVersion,
      notifyDataChanged,
      section,
      goToSection,
    }),
    [selectedVenueId, dataVersion, notifyDataChanged, section, goToSection],
  );

  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error('useAdmin must be used within <AdminProvider>');
  return ctx;
}
