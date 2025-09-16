const { restUrl, nonce } = window.DMN_ADMIN_BOOT;
type FetchOpts = { method?: string; body?: any };
import type { AdminPackage } from '../frontend/app/types';

/**
 * Performs a fetch request to the WordPress REST API using the provided path and options.
 *
 * @param path - The API endpoint path to request.
 * @param opts - Optional fetch options including method and body.
 * @returns A promise resolving to the parsed JSON response.
 * @throws If the response is not OK, throws an error with the response message or HTTP status.
 */
async function wpFetch(path: string, opts: FetchOpts = {}) {
  const { restUrl, nonce } = window.DMN_ADMIN_BOOT;
  const base = restUrl.endsWith('/') ? restUrl : restUrl + '/';
  const url = path.startsWith('http') ? path : base + path.replace(/^\//, ''); // strip any leading slash on path
  const r = await fetch(url, {
    method: opts.method || 'GET',
    credentials: 'same-origin', // <-- ensure WP cookies are sent
    headers: {
      'X-WP-Nonce': nonce,
      'Content-Type': 'application/json',
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json?.message || `HTTP ${r.status}`);
  return await json;
}

/**
 * Performs a fetch request to the backend REST API and parses the JSON response.
 *
 * @template T - The expected response type.
 * @param path - The API endpoint path to request.
 * @param init - Optional fetch initialization options.
 * @returns A promise resolving to the parsed JSON response of type T.
 * @throws If the response is not OK, throws an error with the HTTP status.
 */
async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(restUrl + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce, ...(init?.headers || {}) },
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Retrieves the current plugin settings from the backend.
 *
 * @returns A promise resolving to an object containing:
 *   app_id, api_key_mask, environment, venue_group, debug_mode, and has_key.
 */
export function getSettings() {
  return json<{
    app_id: string;
    api_key_mask: string;
    environment: 'prod' | 'qa';
    venue_group: string;
    debug_mode: boolean;
    has_key: boolean;
  }>('settings');
}

/**
 * Saves the provided settings to the backend via a POST request.
 *
 * @param payload - An object containing optional settings fields to update:
 *   app_id, api_key, environment, venue_group, debug_mode.
 * @returns A promise resolving to the updated settings response from the backend.
 */
export function saveSettings(payload: {
  app_id?: string;
  api_key?: string;
  environment?: 'prod' | 'qa';
  venue_group?: string;
  debug_mode?: boolean;
}) {
  return json<{
    ok: boolean;
    environment: 'prod' | 'qa';
    debug_mode: boolean;
    venue_group?: string;
  }>('settings', { method: 'POST', body: JSON.stringify(payload) });
}

/**
 * Tests the API connection to the backend.
 * Optionally enables debug mode to receive additional debug information.
 *
 * @param debug - If true, includes debug information in the response.
 * @returns A promise resolving to the connection test result and optional debug details.
 */
export function testConnection(debug = false) {
  const path = debug ? 'test?debug=1' : 'test';
  return json<{
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
  }>(path);
}

/**
 * Represents a venue in the admin API.
 *
 * @property id - The unique identifier for the venue.
 * @property title - The display name of the venue.
 * @property dmn_id - The DMN system identifier for the venue.
 */
export type AdminVenue = { id: number; title: string; dmn_id: string };

/**
 * Represents an activity associated with a venue in the admin API.
 *
 * @property id - The unique identifier for the activity.
 * @property dmn_type_id - The DMN system type identifier for the activity.
 * @property name - The name of the activity.
 * @property description - Optional description of the activity.
 * @property priceText - Optional price information as text.
 * @property image_id - Optional image identifier.
 * @property image_url - Optional image URL.
 * @property gallery_ids - Optional array of gallery image IDs.
 */

export type AdminActivity = {
  id: number;
  dmn_type_id: string;
  name: string;
  description?: string;
  priceText?: string;
  image_id?: number | null;
  image_url?: string | null;
  gallery_ids?: number[];
};

/**
 * Retrieves the list of venues from the admin API.
 *
 * @returns A promise resolving to an object containing an array of venues.
 */
export async function adminListVenues(): Promise<{ venues: AdminVenue[] }> {
  return wpFetch('venues');
}

/**
 * Synchronizes venues with the backend and returns the count of updated venues.
 *
 * @returns A promise resolving to an object with ok status and count of venues.
 */
export async function adminSyncVenues(): Promise<{ ok: true; count: number }> {
  return wpFetch('sync/venues', { method: 'POST' });
}

/**
 * Synchronizes all activity types with the backend and returns the count of updated types.
 *
 * @returns A promise resolving to an object with ok status and count of types.
 */
export async function adminSyncTypesAll(): Promise<{ ok: true; count: number }> {
  return wpFetch('sync/types', { method: 'POST' });
}

/**
 * Retrieves the list of activities for a specific venue from the admin API.
 *
 * @param venuePostId - The unique identifier of the venue.
 * @returns A promise resolving to an object containing an array of activities.
 */
export async function adminListActivities(
  venuePostId: number,
): Promise<{ activities: AdminActivity[] }> {
  return wpFetch(`venues/${venuePostId}/activities`);
}

/**
 * Saves updates to a specific activity in the admin API.
 *
 * @param activityPostId - The unique identifier of the activity.
 * @param patch - Partial activity data to update.
 * @returns A promise resolving to an object with ok status.
 */
export async function adminSaveActivity(
  activityPostId: number,
  patch: Partial<AdminActivity>,
): Promise<{ ok: true }> {
  return wpFetch(`activities/${activityPostId}`, { method: 'POST', body: patch });
}

/**
 * Synchronizes all venues and activity types with the backend.
 *
 * @returns A promise resolving to an object containing:
 *   ok status, number of venues and types synchronized, duration in milliseconds, and a message.
 */
export async function adminSyncAll(): Promise<{
  ok: true;
  venues_count: number;
  types_count: number;
  duration_ms: number;
  message: string;
}> {
  return wpFetch('sync/all', { method: 'POST' });
}

/* -------------------------
 * Admin Packages endpoints
 * ------------------------- */

export async function adminGetPackages(params: { venueId?: string | number } = {}) {
  const qs = new URLSearchParams();
  if (params.venueId) qs.set('venue_id', String(params.venueId));
  const j = await wpFetch(`packages?${qs.toString()}`);
  return j.packages as AdminPackage[];
}

export async function adminBulkSavePackages(items: any[]) {
  const j = await wpFetch('packages', {
    method: 'POST',
    body: { packages: items },
  });
  return j.packages as AdminPackage[];
}

export async function adminDeletePackage(id: number) {
  await wpFetch(`packages/${id}`, { method: 'DELETE' });
  return true;
}
