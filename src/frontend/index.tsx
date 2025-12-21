import * as React from 'react';
import './styles/index.scss';
import { createRoot } from 'react-dom/client';
import WidgetRoot from './app/WidgetRoot';
import { parseCsvIds } from './app/utils/helpers';

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

  const defaultTypeIds = parseCsvIds(el.dataset.typeId);

  const props = {
    venueGroup: el.dataset.venueGroup || undefined,
    defaultVenueId: el.dataset.venueId || undefined,
    defaultTypeIds,
    defaultTypeId: defaultTypeIds?.length === 1 ? defaultTypeIds[0] : undefined,
    allowedDays: el.dataset.allowedDays || undefined,
    urlParams,
  };

  createRoot(el).render(<WidgetRoot {...(props as any)} />);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll<HTMLElement>('.dmn-widget-root').forEach(boot);
});
