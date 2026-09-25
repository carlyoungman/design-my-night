// Error toasts (Base UI Toast) for requests the customer started that fail, such as continuing to
// checkout. Problems that stop a step from showing its content (with Try again) and field
// validation stay inline in the step.
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Toast } from '@base-ui-components/react/toast';
import { AlertCircle, X } from 'lucide-react';

export type ToastAction = { label: string; onClick: () => void };

/**
 * One toast area for the whole page, shared by every widget on it, so the toasts of two
 * `[dmn_booking]` shortcodes stack instead of covering each other. Widgets talk to it through this
 * manager.
 */
const manager = Toast.createToastManager();
let container: HTMLElement | null = null;

/**
 * Mounts the page's toast area the first time a widget asks for it. It is fixed to the window, so
 * it lives at the end of `<body>`: inside a widget, a host theme's transform or overflow on an
 * ancestor would trap or clip it. Its root is a second `.dmn-widget-root` (with `display: contents`)
 * that copies the widget root's mode and theme colour, so the toasts keep the widget's scoped
 * reset, tokens and site overrides.
 */
function mountToasts(widgetRoot: HTMLElement) {
  if (container) return;
  container = document.createElement('div');
  container.className = 'dmn-widget-root dmn-widget-root--toasts';
  if (widgetRoot.dataset.mode) container.dataset.mode = widgetRoot.dataset.mode;
  const style = widgetRoot.getAttribute('style');
  if (style) container.setAttribute('style', style);
  document.body.appendChild(container);
  createRoot(container).render(
    <Toast.Provider toastManager={manager} limit={3}>
      <Toast.Viewport className="dmn-toasts">
        <ToastList />
      </Toast.Viewport>
    </Toast.Provider>,
  );
}

/** Makes sure the page's toast area exists. `anchor` is an element inside the widget root. */
export function useToasts(anchor: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>('.dmn-widget-root');
    if (root) mountToasts(root);
  }, [anchor]);
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => (
    <Toast.Root key={toast.id} toast={toast} className="dmn-toast">
      <AlertCircle aria-hidden="true" className="dmn-toast__icon" />
      <div className="dmn-toast__body">
        <Toast.Title className="dmn-toast__title" />
        <Toast.Description className="dmn-toast__description" />
        {toast.actionProps && <Toast.Action className="dmn-toast__action" />}
      </div>
      <Toast.Close className="dmn-toast__close" aria-label="Dismiss">
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
  const idRef = useRef<string | null>(null);

  const clear = useCallback(() => {
    if (idRef.current) manager.close(idRef.current);
    idRef.current = null;
  }, []);

  const show = useCallback(
    (title: string, opts: { description?: string; action?: ToastAction } = {}) => {
      if (idRef.current) manager.close(idRef.current);
      idRef.current = manager.add({
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
    [],
  );

  useEffect(() => clear, [clear]);

  return useMemo(() => ({ show, clear }), [show, clear]);
}
