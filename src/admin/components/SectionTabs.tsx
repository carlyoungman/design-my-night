// src/admin/components/SectionTabs.tsx
// Navigation between the plugin's sections. Panels stay mounted (see index.tsx), so switching
// section never loses unsaved edits; sections with unsaved edits are marked in their tab.
import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { SECTIONS, type SectionId, useAdmin } from '@admin/AdminContext';

export const tabId = (id: SectionId) => `dmn-admin-tab-${id}`;
export const panelId = (id: SectionId) => `dmn-admin-panel-${id}`;

export default function SectionTabs({ unsaved }: { unsaved: Partial<Record<SectionId, boolean>> }) {
  const { section, goToSection } = useAdmin();

  return (
    <nav className="dmn-admin__nav" aria-label="Plugin sections">
      <Tabs
        value={section}
        onChange={(_, id: SectionId) => goToSection(id)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {SECTIONS.map((s) => (
          <Tab
            key={s.id}
            value={s.id}
            id={tabId(s.id)}
            aria-controls={panelId(s.id)}
            disableRipple
            icon={<s.icon className="dmn-admin__nav-icon" aria-hidden="true" />}
            iconPosition="start"
            label={
              <span className="dmn-admin__nav-label">
                {s.label}
                {unsaved[s.id] && (
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
  );
}
