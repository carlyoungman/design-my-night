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
// import PreorderMenusCard from '@admin/components/PreorderMenusCard';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import UrlParamsCard from '@admin/components/UrlParamsCard';

type CustomTabPanelProps = { children?: ReactNode; index: number; value: number };

function CustomTabPanel({ children, value, index }: CustomTabPanelProps) {
  const open = value === index;
  return (
    <Fade in={open} timeout={200} mountOnEnter unmountOnExit>
      <div role="tabpanel" id={`admin-tabpanel-${index}`} aria-labelledby={`admin-tab-${index}`}>
        <div className="dmn-admin__tab-panel">{children}</div>
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
  const setTabDirty = (i: number) => (d: boolean) =>
    setDirty((s) => (s[i] === d ? s : { ...s, [i]: d }));

  const [warned, setWarned] = React.useState(false);
  const [snackOpen, setSnackOpen] = React.useState(false);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (dirty[value] && !warned) {
      setWarned(true);
      setSnackOpen(true);
      return;
    }
    setWarned(false);
    setSnackOpen(false);
    setValue(newValue);
  };

  // Optional: warn on page unload if any tab is dirty
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
      <div className="dmn-admin">
        <div className="dmn-admin__grid">
          <div className="dmn-admin__main">
            <VenuePickerCard />
            <div className="dmn-admin__tabs-wrapper">
              <div className="dmn-admin__tabs-border">
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label="Admin tabs"
                >
                  <Tab label="Activity Manager" {...a11yProps(0)} />
                  <Tab label="Venue Display" {...a11yProps(1)} />
                  {/* <Tab label="Add-on Packages" {...a11yProps(2)} /> */}
                  <Tab label="Additional" {...a11yProps(2)} />
                </Tabs>
              </div>

              <CustomTabPanel value={value} index={0}>
                <ActivityManagerCard onDirty={setTabDirty(0)} />
              </CustomTabPanel>

              <CustomTabPanel value={value} index={1}>
                <VenueDisplayCard onDirty={setTabDirty(1)} />
              </CustomTabPanel>

              {/* <CustomTabPanel value={value} index={2}>
                <PreorderMenusCard onDirty={setTabDirty(2)} />
              </CustomTabPanel> */}

              <CustomTabPanel value={value} index={2}>
                <AdditionalCard onDirty={setTabDirty(2)} />
              </CustomTabPanel>
            </div>
          </div>

          <div className="dmn-admin__side">
            <SettingsCard />
            <DataSyncCard />
            <UrlParamsCard />
            <InfoCard />
          </div>
        </div>

        <Snackbar
          open={snackOpen}
          onClose={() => setSnackOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackOpen(false)} severity="warning" variant="filled">
            You have unsaved changes. Click the tab again to switch.
          </Alert>
        </Snackbar>
      </div>
    </AdminProvider>
  );
}

if (window.DMN_ADMIN_BOOT?.nonce) {
  apiFetch.use(apiFetch.createNonceMiddleware(window.DMN_ADMIN_BOOT.nonce));
}

const mount = document.getElementById('dmn-admin-root');
if (mount) createRoot(mount).render(<App />);
