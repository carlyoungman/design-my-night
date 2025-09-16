import React, { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import SettingsCard from './components/SettingsCard';
import DataSyncCard from './components/DataSyncCard';
import ActivityManagerCard from './components/ActivityManagerCard';
import PackagesCard from './components/PackagesCard';
import VenuePickerCard from './components/VenuePickerCard';
import { AdminProvider } from './AdminContext';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

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
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

declare global {
  interface Window {
    DMN_ADMIN_BOOT: { restUrl: string; nonce: string };
  }
}

function App() {
  const [value, setValue] = React.useState(0);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => setValue(newValue);

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
                </Tabs>
              </Box>

              <CustomTabPanel value={value} index={0}>
                <ActivityManagerCard />
              </CustomTabPanel>

              <CustomTabPanel value={value} index={1}>
                <PackagesCard />
              </CustomTabPanel>
            </Box>
          </div>

          <div className="dmn-admin__side">
            <SettingsCard />
            <DataSyncCard />
          </div>
        </div>
      </div>
    </AdminProvider>
  );
}

const mount = document.getElementById('dmn-admin-root');
if (mount) createRoot(mount).render(<App />);
