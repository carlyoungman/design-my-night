// src/admin/components/SettingsPanel.tsx
// The Settings section: Connection, URL parameters, Shortcode and Appearance, each in its own tab.
// Every tab stays mounted and inactive ones are hidden, so unsaved edits survive switching tab.
import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { SETTINGS_TABS, type SettingsTab, useAdmin } from '@admin/AdminContext';
import SettingsCard from '@admin/components/SettingsCard';
import ImportDataCard from '@admin/components/ImportDataCard';
import RemoveDataCard from '@admin/components/RemoveDataCard';
import UrlParamsCard from '@admin/components/UrlParamsCard';
import ShortcodeCard from '@admin/components/ShortcodeCard';
import AppearanceCard from '@admin/components/AppearanceCard';

const settingsTabId = (id: SettingsTab) => `dmn-settings-tab-${id}`;
const settingsPanelId = (id: SettingsTab) => `dmn-settings-panel-${id}`;

function TabPanel({ id, children }: { id: SettingsTab; children: React.ReactNode }) {
  const { settingsTab } = useAdmin();
  return (
    <div
      id={settingsPanelId(id)}
      role="tabpanel"
      aria-labelledby={settingsTabId(id)}
      hidden={settingsTab !== id}
      className="dmn-admin__panel"
    >
      {children}
    </div>
  );
}

export default function SettingsPanel({
  unsaved,
  onConnectionDirty,
  onParamsDirty,
  onAppearanceDirty,
}: {
  unsaved: Partial<Record<SettingsTab, boolean>>;
  onConnectionDirty: (dirty: boolean) => void;
  onParamsDirty: (dirty: boolean) => void;
  onAppearanceDirty: (dirty: boolean) => void;
}) {
  const { settingsTab, openSettingsTab } = useAdmin();

  return (
    <section aria-labelledby="dmn-admin-settings-section-title">
      <div className="dmn-admin__section-header">
        <div>
          <h2 id="dmn-admin-settings-section-title">Settings</h2>
          <p className="dmn-admin__help">
            Connect to DesignMyNight, then set up how the booking widget links, embeds and looks.
          </p>
        </div>
      </div>

      <nav className="dmn-admin__nav dmn-admin__nav--secondary" aria-label="Settings">
        <Tabs
          value={settingsTab}
          onChange={(_, id: SettingsTab) => openSettingsTab(id)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {SETTINGS_TABS.map((t) => (
            <Tab
              key={t.id}
              value={t.id}
              id={settingsTabId(t.id)}
              aria-controls={settingsPanelId(t.id)}
              disableRipple
              icon={<t.icon className="dmn-admin__nav-icon" aria-hidden="true" />}
              iconPosition="start"
              label={
                <span className="dmn-admin__nav-label">
                  {t.label}
                  {unsaved[t.id] && (
                    <>
                      <span className="dmn-admin__nav-dot" aria-hidden="true" />
                      <span className="screen-reader-text"> (unsaved changes)</span>
                    </>
                  )}
                </span>
              }
            />
          ))}
        </Tabs>
      </nav>

      <TabPanel id="connection">
        <SettingsCard onDirty={onConnectionDirty} />
        <ImportDataCard />
        <RemoveDataCard />
      </TabPanel>
      <TabPanel id="url-params">
        <UrlParamsCard onDirty={onParamsDirty} />
      </TabPanel>
      <TabPanel id="shortcode">
        <ShortcodeCard />
      </TabPanel>
      <TabPanel id="appearance">
        <AppearanceCard onDirty={onAppearanceDirty} />
      </TabPanel>
    </section>
  );
}
