// src/admin/components/Toasts.tsx
// Toasts (Base UI Toast) for the outcome of an action the user started, such as a save or an
// import: errors, and confirmations that it worked. Problems that stop a screen from showing its
// content (load errors with Try again), field validation, state that lasts (such as "Unsaved
// changes") and results the user asked to see (the connection test) stay inline.
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Toast } from '@base-ui-components/react/toast';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { errorReason } from '@admin/components/ui';

export type ToastAction = { label: string; onClick: () => void };

/** Wraps the app: provides the toast manager and renders the toasts in the plugin's root. */
export function ToastsProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider limit={3}>
      {children}
      <Toast.Viewport className="dmn-admin__toasts">
        <ToastList />
      </Toast.Viewport>
    </Toast.Provider>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => (
    <Toast.Root key={toast.id} toast={toast} className="dmn-admin__toast">
      {toast.type === 'success' ? (
        <CheckCircle2 aria-hidden="true" className="dmn-admin__toast-icon" />
      ) : (
        <AlertCircle aria-hidden="true" className="dmn-admin__toast-icon" />
      )}
      <div className="dmn-admin__toast-body">
        <Toast.Title className="dmn-admin__toast-title" />
        <Toast.Description className="dmn-admin__toast-description" />
        {toast.actionProps && (
          <Toast.Action className="button button--secondary dmn-admin__toast-action" />
        )}
      </div>
      <Toast.Close className="button button--text button--icon" aria-label="Dismiss">
        <X aria-hidden="true" />
      </Toast.Close>
    </Toast.Root>
  ));
}

type ToastOptions = { description?: string; action?: ToastAction };

/**
 * One toast owned by the calling component: a new one replaces the previous, so a repeated failure
 * is announced again rather than stacking, and a success replaces an earlier error. `clear` closes
 * it, for example when the user retries or the context changes.
 *
 * - `error`: says what failed; the description is `description`, or else the server's reason taken
 *   from `error`. Errors stay until dismissed and are announced assertively.
 * - `success`: confirms an action near-silently. It is announced politely and closes after a few
 *   seconds (paused while hovered or focused), unless it has an action, which keeps it open.
 */
export function useToast() {
  const { add, close } = Toast.useToastManager();
  const idRef = useRef<string | null>(null);

  const clear = useCallback(() => {
    if (idRef.current) close(idRef.current);
    idRef.current = null;
  }, [close]);

  const open = useCallback(
    (type: 'error' | 'success', title: string, opts: ToastOptions) => {
      if (idRef.current) close(idRef.current);
      idRef.current = add({
        title,
        description: opts.description,
        type,
        priority: type === 'error' ? 'high' : 'low',
        timeout: type === 'error' || opts.action ? 0 : 5000,
        actionProps: opts.action
          ? { children: opts.action.label, onClick: opts.action.onClick }
          : undefined,
      });
    },
    [add, close],
  );

  const error = useCallback(
    (title: string, opts: ToastOptions & { error?: unknown } = {}) =>
      open('error', title, {
        ...opts,
        description: opts.description ?? (errorReason(opts.error) || undefined),
      }),
    [open],
  );

  const success = useCallback(
    (title: string, opts: ToastOptions = {}) => open('success', title, opts),
    [open],
  );

  // A toast about a screen that has gone away would have lost its context.
  useEffect(() => clear, [clear]);

  return useMemo(() => ({ error, success, clear }), [error, success, clear]);
}
