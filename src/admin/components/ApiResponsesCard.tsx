// src/admin/components/ApiResponsesCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  adminListVenues,
  getApiResponse,
  getSettings,
  saveSettings,
  type ApiResponseEndpoint,
} from '@admin/api';

type Venue = { id: number; title: string; dmn_id: string };

type ResponseResult = {
  ok: boolean;
  status: number;
  endpoint: string;
  venue_id: string | null;
  duration_ms: number;
  data: any;
  raw_body: string | null;
  error: string | null;
};

const ENDPOINTS: { value: ApiResponseEndpoint; label: string; needsVenue: boolean }[] = [
  { value: 'venues', label: 'Venues', needsVenue: false },
  { value: 'booking-availability', label: 'Booking Availability', needsVenue: true },
  { value: 'booking-types', label: 'Booking Types', needsVenue: true },
];

export default function ApiResponsesCard() {
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueDmnId, setSelectedVenueDmnId] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiResponseEndpoint>('venues');

  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<ResponseResult | null>(null);
  const [fetchErr, setFetchErr] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  // Load current setting and venues
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, v] = await Promise.all([getSettings(), adminListVenues()]);
        setEnabled(!!s.show_api_responses);
        setVenues(v.venues);
        if (v.venues.length > 0) setSelectedVenueDmnId(v.venues[0].dmn_id);
      } catch {
        // ignore load errors
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleEnabled = async (next: boolean) => {
    setSaving(true);
    try {
      await saveSettings({ show_api_responses: next });
      setEnabled(next);
    } finally {
      setSaving(false);
    }
  };

  const currentEndpoint = ENDPOINTS.find((e) => e.value === selectedEndpoint)!;

  const fetchResponse = async () => {
    setFetching(true);
    setResult(null);
    setFetchErr(null);
    setShowRaw(false);
    try {
      const venueId = currentEndpoint.needsVenue ? selectedVenueDmnId : undefined;
      const r = await getApiResponse(selectedEndpoint, venueId);
      setResult(r);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (e: any) {
      setFetchErr(e.message || 'Request failed');
    } finally {
      setFetching(false);
    }
  };

  if (loading) return null;

  return (
    <section className="dmn-admin__card">
      <h2>API Response Inspector</h2>

      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={enabled}
          disabled={saving}
          onChange={(e) => toggleEnabled(e.target.checked)}
        />
        {saving ? 'Saving…' : 'Enable API response inspector'}
      </label>

      {enabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label className="grid" style={{ gap: 6 }}>
            <span>Endpoint</span>
            <select
              value={selectedEndpoint}
              onChange={(e) => {
                setSelectedEndpoint(e.target.value as ApiResponseEndpoint);
                setResult(null);
                setFetchErr(null);
              }}
            >
              {ENDPOINTS.map((ep) => (
                <option key={ep.value} value={ep.value}>
                  {ep.label}
                </option>
              ))}
            </select>
          </label>

          {currentEndpoint.needsVenue && (
            <label className="grid" style={{ gap: 6 }}>
              <span>Venue</span>
              {venues.length > 0 ? (
                <select
                  value={selectedVenueDmnId}
                  onChange={(e) => setSelectedVenueDmnId(e.target.value)}
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.dmn_id}>
                      {v.title} ({v.dmn_id})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="dmn-admin__help" style={{ margin: 0 }}>
                  No venues found. Run a data sync first.
                </p>
              )}
            </label>
          )}

          <div className="actions">
            <button
              className="button button--action"
              type="button"
              onClick={fetchResponse}
              disabled={fetching || (currentEndpoint.needsVenue && !selectedVenueDmnId)}
            >
              {fetching ? 'Fetching…' : 'Fetch Response'}
            </button>
          </div>

          {fetchErr && <p className="err">{fetchErr}</p>}

          {result && (
            <div ref={resultRef}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                  flexWrap: 'wrap',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 13 }}>
                  <strong
                    style={{ color: result.ok ? 'var(--c-green, #2e7d32)' : 'var(--c-red, #d32f2f)' }}
                  >
                    {result.ok ? 'OK' : 'Error'}
                  </strong>{' '}
                  · HTTP {result.status} · {result.duration_ms}ms
                  {result.venue_id && <> · venue: {result.venue_id}</>}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={showRaw}
                      onChange={(e) => setShowRaw(e.target.checked)}
                    />
                    Raw body
                  </label>
                  <button
                    className="button button--sub"
                    type="button"
                    style={{ fontSize: 12, padding: '2px 8px' }}
                    onClick={() => {
                      const text = showRaw
                        ? (result.raw_body ?? '')
                        : JSON.stringify(result.data, null, 2);
                      navigator.clipboard?.writeText(text);
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <pre
                style={{
                  background: '#f6f7f7',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  padding: 12,
                  overflow: 'auto',
                  maxHeight: 480,
                  fontSize: 12,
                  lineHeight: 1.5,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {showRaw
                  ? (result.raw_body ?? '(no raw body)')
                  : JSON.stringify(result.data, null, 2)}
              </pre>
              {result.error && (
                <p className="err" style={{ marginTop: 6 }}>
                  {result.error}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <p className="dmn-admin__help" style={{ marginTop: 10 }}>
        Fetch the raw DMN API response for any endpoint. Uses saved credentials and current date.
      </p>
    </section>
  );
}
