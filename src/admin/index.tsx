// src/admin/index.tsx
import React, { ReactNode } from 'react';
import './styles/styles.scss';
import { createRoot } from 'react-dom/client';
import SettingsCard from './components/SettingsCard';
import DataSyncCard from './components/DataSyncCard';
import ActivityManagerCard from './components/ActivityManagerCard';
import VenuePickerCard from './components/VenuePickerCard';
import AdditionalCard from './components/AdditionalCard';
import InfoCard from './components/InfoCard';
import { AdminProvider } from './AdminContext';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import PreorderMenusCard from './components/PreorderMenusCard';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import UrlParamsCard from './components/UrlParamsCard';

type CustomTabPanelProps = { children?: ReactNode; index: number; value: number };

function CustomTabPanel({ children, value, index }: CustomTabPanelProps) {
  const open = value === index;
  return (
    <Fade in={open} timeout={200} mountOnEnter unmountOnExit>
      <div role="tabpanel" id={`admin-tabpanel-${index}`} aria-labelledby={`admin-tab-${index}`}>
        <Box sx={{ p: 3 }}>{children}</Box>
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
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  sx={{
                    '.MuiTabs-indicator': { backgroundColor: 'var(--c-blue)' },
                    '.MuiTab-root': { color: 'var(--c-black)' },
                    '.MuiTab-root.Mui-selected': { color: 'var(--c-blue)' },
                  }}
                  aria-label="Admin tabs"
                >
                  <Tab label="Activity Manager" {...a11yProps(0)} />
                  <Tab label="Add-on Packages" {...a11yProps(1)} />
                  <Tab label="Additional" {...a11yProps(2)} />
                </Tabs>
              </Box>

              <CustomTabPanel value={value} index={0}>
                <ActivityManagerCard onDirty={setTabDirty(0)} />
              </CustomTabPanel>

              <CustomTabPanel value={value} index={1}>
                <PreorderMenusCard onDirty={setTabDirty(1)} />
              </CustomTabPanel>

              <CustomTabPanel value={value} index={2}>
                <AdditionalCard onDirty={setTabDirty(2)} />
              </CustomTabPanel>
            </Box>
          </div>

          <div className="dmn-admin__side">
            <SettingsCard />
            <UrlParamsCard />
            <DataSyncCard />
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

const mount = document.getElementById('dmn-admin-root');
if (mount) createRoot(mount).render(<App />);
