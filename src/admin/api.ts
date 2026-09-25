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
};

export async function adminListVenues(): Promise<{ venues: AdminVenue[] }> {
  return wpFetch('venues');
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
export async function adminSyncAll(): Promise<{
  ok: boolean;
  venues_count: number;
  types_count: number;
  duration_ms?: number;
  message?: string;
}> {
  return wpFetch('sync/all', { method: 'POST' });
}
