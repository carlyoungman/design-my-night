// src/admin/index.tsx
import React from 'react';
import './styles/styles.scss';
import { createRoot } from 'react-dom/client';
import apiFetch from '@wordpress/api-fetch';
import { AdminProvider, type SectionId, useAdmin } from '@admin/AdminContext';
import PageHeader from '@admin/components/PageHeader';
import SectionTabs, { panelId, tabId } from '@admin/components/SectionTabs';
import VenuesPanel from '@admin/components/VenuesPanel';
import Dashboard from '@admin/components/Dashboard';
import AnalyticsPanel from '@admin/components/analytics/AnalyticsPanel';
import SettingsPanel from '@admin/components/SettingsPanel';
import { ToastsProvider } from '@admin/components/Toasts';
import { DataProvider } from '@admin/data';
import { shouldWarnOnUnload } from '@admin/unload';

declare global {
  interface Window {
    DMN_ADMIN_BOOT: { restUrl: string; nonce: string; today?: string };
  }
}

/**
 * Every panel stays mounted and inactive ones are hidden, so unsaved edits survive switching
 * section and each panel loads its data once.
 */
function Panel({ id, children }: { id: SectionId; children: React.ReactNode }) {
  const { section } = useAdmin();
  return (
    <div
      id={panelId(id)}
      role="tabpanel"
      aria-labelledby={tabId(id)}
      hidden={section !== id}
      className="dmn-admin__panel"
    >
      {children}
    </div>
  );
}

function App() {
  const [venuesDirty, setVenuesDirty] = React.useState(false);
  const [paramsDirty, setParamsDirty] = React.useState(false);
  const [appearanceDirty, setAppearanceDirty] = React.useState(false);
  const [analyticsDirty, setAnalyticsDirty] = React.useState(false);
  const dirty = venuesDirty || paramsDirty || appearanceDirty || analyticsDirty;

  // Warn on page unload if there are unsaved changes
  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty || !shouldWarnOnUnload()) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  return (
    <AdminProvider>
      <DataProvider>
        <ToastsProvider>
          <PageHeader />
          <SectionTabs
            unsaved={{
              venues: venuesDirty,
              analytics: analyticsDirty,
              settings: paramsDirty || appearanceDirty,
            }}
          />
          <Panel id="dashboard">
            <Dashboard />
          </Panel>
          <Panel id="analytics">
            <AnalyticsPanel onDirty={setAnalyticsDirty} />
          </Panel>
          <Panel id="venues">
            <VenuesPanel onDirty={setVenuesDirty} />
          </Panel>
          <Panel id="settings">
            <SettingsPanel
              unsaved={{ 'url-params': paramsDirty, appearance: appearanceDirty }}
              onParamsDirty={setParamsDirty}
              onAppearanceDirty={setAppearanceDirty}
            />
          </Panel>
        </ToastsProvider>
      </DataProvider>
    </AdminProvider>
  );
}

if (window.DMN_ADMIN_BOOT?.nonce) {
  apiFetch.use(apiFetch.createNonceMiddleware(window.DMN_ADMIN_BOOT.nonce));
}

const mount = document.getElementById('dmn-admin-root');
if (mount) createRoot(mount).render(<App />);
