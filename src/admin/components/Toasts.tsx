// src/admin/components/Toasts.tsx
// Error toasts (Base UI Toast) for actions that fail, such as a save or an import. Problems that
// stop a screen from showing its content (load errors with Try again) and field validation stay
// inline, next to what they are about.
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Toast } from '@base-ui-components/react/toast';
import { AlertCircle, X } from 'lucide-react';
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
      <AlertCircle aria-hidden="true" className="dmn-admin__toast-icon" />
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

/**
 * One error toast owned by the calling component. `show` replaces the previous one, so a repeated
 * failure is announced again rather than stacking; `clear` closes it, for example when the user
 * retries or the context changes. The title says what failed; the description is `description`,
 * or else the server's reason taken from `error`. Errors stay until dismissed (no timeout) and are
 * announced assertively.
 */
export function useErrorToast() {
  const { add, close } = Toast.useToastManager();
  const idRef = useRef<string | null>(null);

  const clear = useCallback(() => {
    if (idRef.current) close(idRef.current);
    idRef.current = null;
  }, [close]);

  const show = useCallback(
    (title: string, opts: { error?: unknown; description?: string; action?: ToastAction } = {}) => {
      if (idRef.current) close(idRef.current);
      idRef.current = add({
        title,
        description: opts.description ?? (errorReason(opts.error) || undefined),
        type: 'error',
        priority: 'high',
        timeout: 0,
        actionProps: opts.action
          ? {
              children: opts.action.label,
              onClick: opts.action.onClick,
            }
          : undefined,
      });
    },
    [add, close],
  );

  // A toast about a screen that has gone away would have lost its context.
  useEffect(() => clear, [clear]);

  return useMemo(() => ({ show, clear }), [show, clear]);
}
