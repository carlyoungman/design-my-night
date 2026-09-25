// src/admin/components/ui.tsx
// Small shared pieces for consistent status, loading and error feedback.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { AlertCircle, CheckCircle2, CircleDot, X } from 'lucide-react';

type Tone = 'success' | 'error' | 'warning';

const ICONS: Record<Tone, React.ReactNode> = {
  success: <CheckCircle2 />,
  error: <AlertCircle />,
  warning: <CircleDot />,
};

/**
 * Text status with an icon, so status is never conveyed by colour alone.
 * Errors are announced assertively; everything else politely.
 */
export function StatusMessage({
  tone,
  children,
  block = false,
}: {
  tone: Tone;
  children: React.ReactNode;
  block?: boolean;
}) {
  return (
    <p
      className={`dmn-admin__status dmn-admin__status--${tone}${
        block ? ' dmn-admin__status--block' : ''
      }`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {ICONS[tone]}
      <span>{children}</span>
    </p>
  );
}

export function Loading({ children = 'Loading…' }: { children?: React.ReactNode }) {
  return (
    <p className="dmn-admin__loading" role="status">
      <CircularProgress size={20} thickness={5} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** Error with a recovery action. */
export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="actions dmn-admin__spacer-top">
      <StatusMessage tone="error">{message}</StatusMessage>
      {onRetry && (
        <button type="button" className="button button--secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="dmn-admin__field-error">
      <AlertCircle aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** Shared "saved / unsaved" indicator for editor headers. */
export function SaveState({ dirty, ok }: { dirty: boolean; ok?: string | null }) {
  if (dirty) return <StatusMessage tone="warning">Unsaved changes</StatusMessage>;
  if (ok) return <StatusMessage tone="success">{ok}</StatusMessage>;
  return null;
}

export type ProgressState = 'running' | 'success' | 'error';

/**
 * Panel for an action that talks to DesignMyNight and can take a while. While running it shows a
 * moving progress bar (indeterminate: the server doesn't report progress), then the outcome.
 * `visual` is an optional illustration above the text, hidden from assistive technologies; the
 * text always says what is happening.
 */
export function ProgressPanel({
  state,
  visual,
  children,
  meta,
  actions,
  onDismiss,
}: {
  state: ProgressState;
  visual?: React.ReactNode;
  /** Running: what is happening. Finished: a StatusMessage with the outcome. */
  children: React.ReactNode;
  /** Short supporting text on the right, such as the time taken. */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  onDismiss?: () => void;
}) {
  return (
    <div className={`dmn-admin__progress dmn-admin__progress--${state}`}>
      {visual}
      <div className="dmn-admin__progress-body">
        <div className="dmn-admin__progress-text">
          {children}
          {actions && state !== 'running' && <div className="actions">{actions}</div>}
        </div>
        {meta && <span className="dmn-admin__progress-meta">{meta}</span>}
        {state !== 'running' && onDismiss && (
          <button
            type="button"
            className="button button--text button--icon"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <X aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="dmn-admin__progress-bar" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

/** Whole seconds since `running` turned true; resets each time it does. */
export function useElapsedSeconds(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const start = Date.now();
    setSeconds(0);
    const id = window.setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  return seconds;
}

/** Says what failed in plain words, then adds the server's reason when there is one. */
export const errorMessage = (e: unknown, context: string) => {
  const reason =
    e && typeof e === 'object' && 'message' in e && typeof e.message === 'string'
      ? e.message.trim()
      : '';
  return reason ? `${context} (${reason})` : context;
};

export const isValidUrl = (u: string) =>
  u === '' || u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/');

/**
 * Guards against out-of-order responses. Call the returned function at the start of each request;
 * it gives back `isCurrent()`, which turns false as soon as a newer request starts (for example
 * after the venue changes), so a late response can't overwrite newer data.
 */
export function useLatestRequest() {
  const latest = useRef(0);
  return useCallback(() => {
    const id = ++latest.current;
    return () => id === latest.current;
  }, []);
}
