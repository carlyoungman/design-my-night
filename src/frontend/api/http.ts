const DEBUG = false; // flip to false to disable logging

function getHeadersAsRecord(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

export async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const url = window.DMN_PUBLIC_BOOT.restUrl + path;

  const started = performance.now();
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
    console.log('Request:', { url, init });
    console.log('Response headers:', getHeadersAsRecord(res.headers));
    console.log('Response body:', data);
    console.log('Duration:', Math.round(performance.now() - started) + 'ms');
    console.groupEnd();
  }

  if (!res.ok) {
    throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`);
  }

  return data as T;
}
