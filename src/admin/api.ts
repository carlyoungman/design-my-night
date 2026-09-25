import apiFetch from '@wordpress/api-fetch';

/**
 * Performs a fetch request to the WordPress REST API using the provided path and options.
 */
export async function wpFetch<T = any>(
  slug: string,
  opts: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: any } = {},
): Promise<T> {
  const base = window.DMN_ADMIN_BOOT?.restUrl ?? '/wp-json/dmn/v1/admin/';
  return (await apiFetch({
    url: base + slug,
    method: opts.method || 'GET',
    data: opts.body,
  })) as Promise<T>;
}

/** Settings */
export function getSettings() {
  return wpFetch<{
    app_id: string;
    api_key_mask: string;
    environment: 'prod' | 'qa';
    venue_group: string;
    debug_mode: boolean;
    has_key: boolean;
  }>('settings');
}

export function saveSettings(payload: {
  app_id?: string;
  api_key?: string;
  environment?: 'prod' | 'qa';
  venue_group?: string;
  debug_mode?: boolean;
}) {
  return wpFetch<{
    ok: boolean;
    environment: 'prod' | 'qa';
    debug_mode: boolean;
    venue_group?: string;
  }>('settings', { method: 'POST', body: payload });
}

/** Appearance */
export type ColourMode = 'light' | 'dark' | 'system';

export type Appearance = {
  theme_colour: string;
  default_theme_colour: string;
  admin_mode: ColourMode;
  widget_mode: ColourMode;
  /** Whether the widget's stylesheet is loaded on the site. */
  widget_styles: boolean;
  /** `--theme-*` custom properties for the saved colour, shaded for each mode. */
  css_vars: Record<string, string>;
};

export function getAppearance() {
  return wpFetch<Appearance>('appearance');
}

export function saveAppearance(payload: {
  theme_colour?: string;
  admin_mode?: ColourMode;
  widget_mode?: ColourMode;
  widget_styles?: boolean;
}) {
  return wpFetch<Appearance & { ok: boolean }>('appearance', { method: 'POST', body: payload });
}

/** URL Parameters */

export type UrlParamRow = {
  name: string;
  value: string;
};

export function getUrlParams() {
  return wpFetch<{ items: UrlParamRow[] }>('url-params');
}

export function saveUrlParams(items: UrlParamRow[]) {
  return wpFetch<{ ok: boolean; items: UrlParamRow[] }>('url-params', {
    method: 'POST',
    body: { items },
  });
}

export function testConnection(debug = false) {
  return wpFetch<{
    ok: boolean;
    status: number;
    error?: string;
    headers?: Record<string, string | null>;
    sample?: Array<{ _id: string; path: string }>;
    debug?: {
      base_url?: string;
      path?: string;
      query?: any;
      auth_format?: string;
      auth_mask?: string;
      auth_lengths?: { app_id: number; api_key: number };
      duration_ms?: number;
      response_headers?: Record<string, string>;
      request_id?: string | null;
      dmn_message?: string | null;
      dmn_raw_body?: string | null;
      sample_count?: number;
    };
  }>(debug ? 'test?debug=1' : 'test');
}

/** Venues */
export type AdminVenue = {
  id: number;
  title: string;
  dmn_id: string;
  /** Imported activities, how many are shown in the widget, and how many have no image. */
  activities_count: number;
  visible_count: number;
  without_image_count: number;
  /** Leave activities DesignMyNight reports as unavailable out of the widget, instead of showing them disabled. */
  hide_unavailable: boolean;
};

export async function adminListVenues(): Promise<{ venues: AdminVenue[] }> {
  return wpFetch('venues');
}

export async function adminSaveVenue(
  id: number,
  body: { hide_unavailable?: boolean },
): Promise<{ ok: boolean; hide_unavailable: boolean }> {
  return wpFetch(`venues/${id}`, { method: 'POST', body });
}

/** Activities */
export async function adminListActivities(venuePostId: number): Promise<{
  activities: {
    id: number;
    dmn_type_id: string;
    name: string;
    description?: string;
    priceText?: string;
    duration_minutes?: number | null;
    image_id?: number | null;
    image_url?: string | null;
    gallery_ids?: number[];
    visible?: boolean;
    price_mode?: 'per_person' | 'per_room' | 'display';
  }[];
}> {
  return wpFetch(`venues/${venuePostId}/activities`);
}

export async function adminSaveActivity(
  id: number,
  body: {
    name?: string;
    description?: string;
    priceText?: string;
    image_id?: number | null;
    gallery_ids?: number[];
    visible?: boolean;
    price_mode?: 'per_person' | 'per_room' | 'display';
  },
): Promise<{ ok: boolean }> {
  return wpFetch(`activities/${id}`, { method: 'POST', body });
}

/** Sync */
export type ImportRecord = {
  /** Unix timestamps (seconds). */
  finished_at: number;
  last_success_at: number | null;
  ok: boolean;
  /** Environment this import used. */
  environment: 'prod' | 'qa';
  /** Environment the stored venues came from: the last successful import's. */
  data_environment?: 'prod' | 'qa' | null;
  venues_count: number;
  types_count: number;
  duration_ms: number;
  error: string | null;
  /** Problems that didn't stop the import, such as a venue whose activities couldn't be read. */
  issues: string[];
  issues_count: number;
};

export async function adminSyncAll(): Promise<ImportRecord & { message: string }> {
  return wpFetch('sync/all', { method: 'POST' });
}

/** Deletes every imported venue and activity and the import record; optionally every setting too. */
export async function adminRemoveData(includeSettings: boolean): Promise<{
  ok: boolean;
  venues_removed: number;
  activities_removed: number;
  settings_removed: boolean;
}> {
  // In the body, not the query: with plain permalinks the REST base already has a query string.
  return wpFetch('data', { method: 'DELETE', body: { include_settings: includeSettings } });
}

/** Dashboard */
export async function adminOverview(): Promise<{
  last_import: ImportRecord | null;
  connection: { has_credentials: boolean; environment: 'prod' | 'qa'; venue_group: string };
}> {
  return wpFetch('overview');
}
