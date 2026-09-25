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
import SettingsCard from '@admin/components/SettingsCard';
import ImportDataCard from '@admin/components/ImportDataCard';
import RemoveDataCard from '@admin/components/RemoveDataCard';
import UrlParamsCard from '@admin/components/UrlParamsCard';
import ShortcodeCard from '@admin/components/ShortcodeCard';
import AppearanceCard from '@admin/components/AppearanceCard';
import { ToastsProvider } from '@admin/components/Toasts';

declare global {
  interface Window {
    DMN_ADMIN_BOOT: { restUrl: string; nonce: string };
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
  const dirty = venuesDirty || paramsDirty || appearanceDirty;

  // Warn on page unload if there are unsaved changes
  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  return (
    <AdminProvider>
      <ToastsProvider>
        <PageHeader />
        <SectionTabs
          unsaved={{
            venues: venuesDirty,
            'url-params': paramsDirty,
            appearance: appearanceDirty,
          }}
        />
        <Panel id="dashboard">
          <Dashboard />
        </Panel>
        <Panel id="venues">
          <VenuesPanel onDirty={setVenuesDirty} />
        </Panel>
        <Panel id="connection">
          <SettingsCard />
          <ImportDataCard />
          <RemoveDataCard />
        </Panel>
        <Panel id="url-params">
          <UrlParamsCard onDirty={setParamsDirty} />
        </Panel>
        <Panel id="shortcode">
          <ShortcodeCard />
        </Panel>
        <Panel id="appearance">
          <AppearanceCard onDirty={setAppearanceDirty} />
        </Panel>
      </ToastsProvider>
    </AdminProvider>
  );
}

if (window.DMN_ADMIN_BOOT?.nonce) {
  apiFetch.use(apiFetch.createNonceMiddleware(window.DMN_ADMIN_BOOT.nonce));
}

const mount = document.getElementById('dmn-admin-root');
if (mount) createRoot(mount).render(<App />);
