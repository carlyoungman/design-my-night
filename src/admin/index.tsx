// src/admin/index.tsx
import React, { ReactNode } from 'react';
import './styles/styles.scss';
import { createRoot } from 'react-dom/client';
import apiFetch from '@wordpress/api-fetch';
import SettingsCard from '@admin/components/SettingsCard';
import DataSyncCard from '@admin/components/DataSyncCard';
import ActivityManagerCard from '@admin/components/ActivityManagerCard';
import VenuePickerCard from '@admin/components/VenuePickerCard';
import AdditionalCard from '@admin/components/AdditionalCard';
import VenueDisplayCard from '@admin/components/VenueDisplayCard';
import InfoCard from '@admin/components/InfoCard';
import { AdminProvider } from '@admin/AdminContext';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
// import PreorderMenusCard from '@admin/components/PreorderMenusCard';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import UrlParamsCard from '@admin/components/UrlParamsCard';

type CustomTabPanelProps = { children?: ReactNode; index: number; value: number };

function CustomTabPanel({ children, value, index }: CustomTabPanelProps) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const open = value === index;
  return (
    <Fade in={open} timeout={reduceMotion ? 0 : 200} mountOnEnter unmountOnExit>
      <div role="tabpanel" id={`admin-tabpanel-${index}`} aria-labelledby={`admin-tab-${index}`}>
        {children}
      </div>
    </Fade>
  );
}

function a11yProps(index: number) {
  return { id: `admin-tab-${index}`, 'aria-controls': `admin-tabpanel-${index}` };
}

declare global {
  interface Window {
    DMN_ADMIN_BOOT: { restUrl: string; nonce: string };
  }
}

function App() {
  const [value, setValue] = React.useState(0);

  const [dirty, setDirty] = React.useState<Record<number, boolean>>({});
  const setTabDirty = React.useMemo(
    () =>
      [0, 1, 2].map(
        (i) => (d: boolean) => setDirty((s) => (s[i] === d ? s : { ...s, [i]: d })),
      ),
    [],
  );

  // Tab the user tried to open while the current tab had unsaved changes.
  const [pendingTab, setPendingTab] = React.useState<number | null>(null);

  const switchTo = (next: number) => {
    // The panel unmounts on switch, so its unsaved edits are discarded.
    setDirty((s) => ({ ...s, [value]: false }));
    setPendingTab(null);
    setValue(next);
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (dirty[value]) {
      setPendingTab(newValue);
      return;
    }
    switchTo(newValue);
  };

  // Warn on page unload if any tab is dirty
  React.useEffect(() => {
    const anyDirty = Object.values(dirty).some(Boolean);
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!anyDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  return (
    <AdminProvider>
      <div className="dmn-admin__grid">
        <div className="dmn-admin__main">
          <VenuePickerCard />
          <section className="dmn-admin__card" aria-label="Venue settings">
            <div className="dmn-admin__tabs-border">
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="Venue settings"
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab label="Activities" {...a11yProps(0)} />
                <Tab label="Venue display" {...a11yProps(1)} />
                {/* <Tab label="Add-on Packages" {...a11yProps(2)} /> */}
                <Tab label="Links & FAQs" {...a11yProps(2)} />
              </Tabs>
            </div>

            <CustomTabPanel value={value} index={0}>
              <ActivityManagerCard onDirty={setTabDirty[0]} />
            </CustomTabPanel>

            <CustomTabPanel value={value} index={1}>
              <VenueDisplayCard onDirty={setTabDirty[1]} />
            </CustomTabPanel>

            {/* <CustomTabPanel value={value} index={2}>
              <PreorderMenusCard onDirty={setTabDirty(2)} />
            </CustomTabPanel> */}

            <CustomTabPanel value={value} index={2}>
              <AdditionalCard onDirty={setTabDirty[2]} />
            </CustomTabPanel>
          </section>
        </div>

        <div className="dmn-admin__side">
          <SettingsCard />
          <DataSyncCard />
          <UrlParamsCard />
          <InfoCard />
        </div>
      </div>

      <Snackbar
        open={pendingTab != null}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') setPendingTab(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="warning"
          variant="filled"
          onClose={() => setPendingTab(null)}
          action={
            <button
              type="button"
              className="button button--secondary"
              onClick={() => pendingTab != null && switchTo(pendingTab)}
            >
              Discard and switch
            </button>
          }
        >
          This tab has unsaved changes. Save them first, or discard them and switch tabs.
        </Alert>
      </Snackbar>
    </AdminProvider>
  );
}

if (window.DMN_ADMIN_BOOT?.nonce) {
  apiFetch.use(apiFetch.createNonceMiddleware(window.DMN_ADMIN_BOOT.nonce));
}

const mount = document.getElementById('dmn-admin-root');
if (mount) createRoot(mount).render(<App />);
