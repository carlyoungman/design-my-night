const DEBUG = false; // flip to false to disable logging

/**
 * Join the REST base with a route that may carry a query string. Without pretty permalinks the
 * base is `…/?rest_route=/dmn/v1/`, so the route's own query must be appended with `&`, not `?`.
 */
export function restUrl(path: string): string {
  const base = window.DMN_PUBLIC_BOOT?.restUrl || '/wp-json/dmn/v1/';
  const [route, query] = path.split(/\?(.*)/s, 2);
  const url = base + route;
  if (!query) return url;
  return url + (base.includes('?') ? '&' : '?') + query;
}

export async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const url = restUrl(path);

  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });

  let data: any;
  try {
    data = await res.clone().json();
  } catch {
    data = await res.text();
  }

  if (DEBUG) {
    console.groupCollapsed(
      `%c[DMN]%c ${init?.method || 'GET'} ${path} %c${res.status}`,
      'color:#6DA8A6;font-weight:600',
      'color:inherit',
      `color:${res.ok ? '#16a34a' : '#dc2626'}`,
    );
  }

  if (!res.ok) {
    throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`);
  }

  return data as T;
}
