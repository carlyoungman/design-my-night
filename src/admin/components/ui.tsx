// src/admin/components/ui.tsx
// Small shared pieces for consistent status, loading and error feedback.
import React, { useCallback, useRef } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { AlertCircle, CheckCircle2, CircleDot } from 'lucide-react';

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
