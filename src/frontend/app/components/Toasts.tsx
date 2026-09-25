// Error toasts (Base UI Toast) for requests the customer started that fail, such as continuing to
// checkout. Problems that stop a step from showing its content (with Try again) and field
// validation stay inline in the step.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toast } from '@base-ui-components/react/toast';
import { AlertCircle, X } from 'lucide-react';

export type ToastAction = { label: string; onClick: () => void };

/**
 * The toasts are fixed to the window, so they are portalled to the end of `<body>`: inside the
 * widget, a host theme's transform or overflow on an ancestor would trap or clip them. The portal
 * target is a second `.dmn-widget-root` (with `display: contents`) that copies the widget root's
 * mode and theme colour, so the toasts keep the widget's scoped reset, tokens and site overrides.
 */
function usePortalContainer(anchor: React.RefObject<HTMLElement | null>) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>('.dmn-widget-root');
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'dmn-widget-root dmn-widget-root--toasts';
    if (root.dataset.mode) el.dataset.mode = root.dataset.mode;
    const style = root.getAttribute('style');
    if (style) el.setAttribute('style', style);
    document.body.appendChild(el);
    setContainer(el);
    return () => {
      el.remove();
      setContainer(null);
    };
  }, [anchor]);

  return container;
}

/** Provides the toast manager to the widget and renders its toasts. */
export function ToastsProvider({
  anchor,
  children,
}: {
  /** An element inside the widget root, used to find it. */
  anchor: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) {
  const container = usePortalContainer(anchor);
  return (
    <Toast.Provider limit={3}>
      {children}
      {container && (
        <Toast.Portal container={container}>
          <Toast.Viewport className="toasts">
            <ToastList />
          </Toast.Viewport>
        </Toast.Portal>
      )}
    </Toast.Provider>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => (
    <Toast.Root key={toast.id} toast={toast} className="toast">
      <AlertCircle aria-hidden="true" className="toast__icon" />
      <div className="toast__body">
        <Toast.Title className="toast__title" />
        <Toast.Description className="toast__description" />
        {toast.actionProps && <Toast.Action className="toast__action" />}
      </div>
      <Toast.Close className="toast__close" aria-label="Dismiss">
        <X aria-hidden="true" />
      </Toast.Close>
    </Toast.Root>
  ));
}

/**
 * One error toast owned by the calling component. `show` replaces the previous one, so a repeated
 * failure is announced again rather than stacking; `clear` closes it, for example when the
 * customer tries again. Errors stay until dismissed (no timeout) and are announced assertively.
 */
export function useErrorToast() {
  const { add, close } = Toast.useToastManager();
  const idRef = useRef<string | null>(null);

  const clear = useCallback(() => {
    if (idRef.current) close(idRef.current);
    idRef.current = null;
  }, [close]);

  const show = useCallback(
    (title: string, opts: { description?: string; action?: ToastAction } = {}) => {
      if (idRef.current) close(idRef.current);
      idRef.current = add({
        title,
        description: opts.description,
        type: 'error',
        priority: 'high',
        timeout: 0,
        actionProps: opts.action
          ? { children: opts.action.label, onClick: opts.action.onClick }
          : undefined,
      });
    },
    [add, close],
  );

  useEffect(() => clear, [clear]);

  return useMemo(() => ({ show, clear }), [show, clear]);
}
