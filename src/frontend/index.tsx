// src/frontend/index.tsx
import * as React from 'react';
import './styles/index.scss';
import { createRoot } from 'react-dom/client';
import WidgetRoot from './app/WidgetRoot';

function boot(el: HTMLElement) {
  const rawUrlParams = el.dataset.urlParams;
  let urlParams: Record<string, string> | undefined;

  if (rawUrlParams) {
    try {
      urlParams = JSON.parse(rawUrlParams);
    } catch {
      const sp = new URLSearchParams(rawUrlParams);
      const obj: Record<string, string> = {};
      sp.forEach((value, key) => {
        obj[key] = value;
      });
      urlParams = obj;
    }
  }

  const props = {
    venueGroup: el.dataset.venueGroup || undefined,
    defaultVenueId: el.dataset.venueId || undefined,
    defaultTypeId: el.dataset.typeId || undefined,
    allowedDays: el.dataset.allowedDays || undefined,
    urlParams, // now a proper object
  };

  createRoot(el).render(<WidgetRoot {...(props as any)} />);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll<HTMLElement>('.dmn-widget-root').forEach(boot);
});
