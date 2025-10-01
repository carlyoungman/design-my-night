import apiFetch from '@wordpress/api-fetch';

/**
 * Performs a fetch request to the WordPress REST API using the provided path and options.
 */
export async function wpFetch<T = any>(
  slug: string,
  opts: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: any } = {},
): Promise<T> {
  return (await apiFetch({
    path: `/dmn/v1/admin/${slug}`,
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
export async function adminListVenues(): Promise<{
  venues: { id: number; title: string; dmn_id: string }[];
}> {
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
    image_id?: number | null;
    image_url?: string | null;
    gallery_ids?: number[];
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
    menu_post_id?: number | null;
  },
): Promise<{ ok: boolean }> {
  return wpFetch(`activities/${id}`, { method: 'POST', body });
}

/** Sync */
export async function adminSyncAll(): Promise<{
  ok: boolean;
  venues_count: number;
  types_count: number;
  menus_count?: number;
  menu_items_count?: number;
  duration_ms?: number;
  message?: string;
}> {
  return wpFetch('sync/all', { method: 'POST' });
}

/** Menus */
export async function adminListMenus(): Promise<{
  menus: { id: number; title: string; fixed_price?: boolean }[];
}> {
  return wpFetch('menus', { method: 'GET' });
}

export async function adminListMenuItems(venueId: number): Promise<{
  menus: Array<{
    menu_post_id: number;
    menu_title: string;
    activities: Array<{ id: number; dmn_type_id: string; name: string }>;
    items: Array<{
      id: number;
      dmn_item_id: string;
      name: string;
      description: string;
      type: string;
      price_ro: number;
      image_id: number | null;
      image_url: string | null;
      menu_post_id: number;
    }>;
  }>;
}> {
  return wpFetch(`menu-items?venue=${venueId}`);
}

export async function adminSaveMenuItem(
  id: number,
  body: { name?: string; description?: string; image_id?: number | null },
): Promise<{ ok: true }> {
  return wpFetch<{ ok: true }>(`menu-items/${id}`, { method: 'POST', body });
}

/** FAQs */
export async function adminListFaqs(
  venue_id: number,
): Promise<{ faqs: { question: string; answer: string }[] }> {
  return wpFetch(`faqs?venue_id=${encodeURIComponent(venue_id)}`);
}

export async function adminSaveFaqs(
  venue_id: number,
  faqs: Array<{ question: string; answer: string }>,
): Promise<{ ok: true }> {
  return wpFetch<{ ok: true }>('faqs', { method: 'POST', body: { venue_id, faqs } });
}

/** Large Group Link */
export async function adminGetLargeGroupLink(
  venue_id: number,
): Promise<{ enabled: boolean; minSize: number; label: string; url: string }> {
  return wpFetch(`large-group-link?venue_id=${encodeURIComponent(venue_id)}`);
}

export async function adminSaveLargeGroupLink(
  venue_id: number,
  body: { enabled: boolean; minSize: number; label: string; url: string },
): Promise<{ ok: true }> {
  return wpFetch<{ ok: true }>('large-group-link', { method: 'POST', body: { venue_id, ...body } });
}
