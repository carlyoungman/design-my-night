import * as React from 'react';
import './styles/index.scss';
import { createRoot } from 'react-dom/client';
import WidgetRoot from './app/WidgetRoot';

function boot(el: HTMLElement) {
  const props = {
    venueGroup: el.dataset.venueGroup || undefined,
    defaultVenueId: el.dataset.venueId || undefined,
    defaultTypeId: el.dataset.typeId || undefined,
    allowedDays: el.dataset.allowedDays || undefined,
  };
  createRoot(el).render(<WidgetRoot {...(props as any)} />);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll<HTMLElement>('.dmn-widget-root').forEach(boot);
});
