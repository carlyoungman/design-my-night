const { restUrl, nonce } = window.DMN_ADMIN_BOOT;

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(restUrl + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce, ...(init?.headers || {}) },
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

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
