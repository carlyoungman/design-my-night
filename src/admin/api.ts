import apiFetch from '@wordpress/api-fetch';

/**
 * Performs a fetch request to the WordPress REST API using the provided path and options.
 */
export async function wpFetch<T = any>(
  slug: string,
  opts: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: any } = {},
): Promise<T> {
  const base = window.DMN_ADMIN_BOOT?.restUrl ?? '/wp-json/dmn/v1/admin/';
  // Without pretty permalinks the base is `…/?rest_route=/dmn/v1/admin/`, so a query on the
  // route must be joined with `&`.
  const [route, query] = slug.split(/\?(.*)/s, 2);
  const url = base + route + (query ? (base.includes('?') ? '&' : '?') + query : '');
  return (await apiFetch({
    url,
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

/** Dashboard */
export async function adminOverview(): Promise<{
  last_import: ImportRecord | null;
  connection: { has_credentials: boolean; environment: 'prod' | 'qa'; venue_group: string };
}> {
  return wpFetch('overview');
}

/** Analytics (see src/php/Services/Analytics.php). Reports read the plugin's own tables. */
export type AnalyticsFilters = {
  from: string;
  to: string;
  /** `created`: by the day bookings were made; `visit`: by the day they take place. */
  basis: 'created' | 'visit';
  venue: string;
  type: string;
};

export type AnalyticsTotals = {
  bookings: number;
  covers: number;
  value: number | null;
  deposits: number | null;
  average_party: number | null;
  /** Rejected, lost and deleted bookings, left out of the other figures. */
  inactive: number;
  /** Null while filtering by venue or activity: opening the widget isn't tied to either. */
  widget_views: number | null;
  widget_handoffs: number;
  conversion: number | null;
};

export type AnalyticsSummary = {
  period: { from: string; to: string; days: number; previous_from: string; previous_to: string };
  current: AnalyticsTotals;
  previous: AnalyticsTotals;
};

export type SyncState = {
  finished_at: number | null;
  last_success_at: number | null;
  ok: boolean | null;
  error: string | null;
  error_code:
    | 'no_permission'
    | 'rate_limited'
    | 'no_venues'
    | 'no_credentials'
    | 'bad_credentials'
    | 'request_failed'
    | null;
  count: number;
  complete: boolean;
  next_run_at: number | null;
};

export type AnalyticsDataStatus = {
  bookings_stored: number;
  events_stored: number;
  /** Whether any stored booking has a value; DMN doesn't document one, so deposits stand in. */
  has_value: boolean;
  tracking: boolean;
  retention_days: number;
  sync: SyncState;
};

export type BreakdownRow = {
  key: string;
  label: string;
  bookings: number;
  covers: number;
  value: number | null;
  inactive?: boolean;
};

export type FunnelStageKey =
  | 'view'
  | 'venue'
  | 'date'
  | 'experience'
  | 'time'
  | 'details'
  | 'handoff';

export type AnalyticsReport = {
  filters: AnalyticsFilters;
  summary: AnalyticsSummary;
  timeseries: {
    interval: 'day' | 'week';
    /** Days in the last week (7 unless the period isn't whole weeks). */
    last_days: number;
    points: { date: string; bookings: number; covers: number; value: number; handoffs: number }[];
  };
  funnel: {
    stages: { key: FunnelStageKey; count: number | null }[];
    checkout_errors: number;
  };
  breakdown: {
    venues: BreakdownRow[];
    types: BreakdownRow[];
    statuses: BreakdownRow[];
    sources: BreakdownRow[];
  };
  timing: {
    /** weekday: 0 is Monday. */
    heatmap: { weekday: number; hour: number; bookings: number }[];
    lead_time: { key: string; label: string; bookings: number }[];
    group_size: { key: string; label: string; bookings: number }[];
  };
  data: AnalyticsDataStatus;
  options: {
    venues: { id: string; name: string }[];
    types: { id: string; name: string; venue_id: string }[];
  };
};

export type AnalyticsBooking = {
  id: string;
  reference: string | null;
  venue_id: string;
  venue: string | null;
  type: string | null;
  date: string | null;
  time: string | null;
  num_people: number;
  status: string;
  status_label: string;
  source: string | null;
  value: number | null;
  deposit: number | null;
  /** ISO 8601, UTC. */
  created: string | null;
};

export type BookingSort =
  | 'booking_date'
  | 'created_date'
  | 'num_people'
  | 'value'
  | 'deposit'
  | 'status';

const analyticsQuery = (f: AnalyticsFilters, extra: Record<string, string | number> = {}) =>
  new URLSearchParams({
    ...f,
    ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])),
  }).toString();

export function analyticsReport(f: AnalyticsFilters) {
  return wpFetch<AnalyticsReport>(`analytics/report?${analyticsQuery(f)}`);
}

export function analyticsSummary(f: AnalyticsFilters) {
  return wpFetch<{ summary: AnalyticsSummary; data: AnalyticsDataStatus }>(
    `analytics/summary?${analyticsQuery(f)}`,
  );
}

export function analyticsBookings(
  f: AnalyticsFilters,
  q: { page: number; per_page: number; sort: BookingSort; order: 'asc' | 'desc' },
) {
  return wpFetch<{ total: number; page: number; per_page: number; items: AnalyticsBooking[] }>(
    `analytics/bookings?${analyticsQuery(f, q)}`,
  );
}

export function analyticsExport(f: AnalyticsFilters, kind: 'bookings' | 'timeseries') {
  return wpFetch<{ filename: string; csv: string; rows: number; total: number }>(
    `analytics/export?${analyticsQuery(f, { kind })}`,
  );
}

export function analyticsSync() {
  return wpFetch<SyncState>('analytics/sync', { method: 'POST' });
}

export type AnalyticsSettings = {
  tracking: boolean;
  retention_days: number;
  retention_max: number;
};

export function getAnalyticsSettings() {
  return wpFetch<AnalyticsSettings>('analytics/settings');
}

export function saveAnalyticsSettings(s: { tracking?: boolean; retention_days?: number }) {
  return wpFetch<AnalyticsSettings & { ok: boolean }>('analytics/settings', {
    method: 'POST',
    body: s,
  });
}

export function deleteAnalyticsEvents() {
  return wpFetch<{ ok: boolean; deleted: number }>('analytics/delete-events', { method: 'POST' });
}
