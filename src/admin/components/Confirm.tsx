// src/admin/components/Confirm.tsx
// One confirmation dialog for the whole admin, in place of the browser's confirm(): a modal
// <dialog> in the plugin's own style, opened with `await confirm({...})`. It lives at the app's
// root, so it is visible from every section. Start over keeps its own dialog, which has an option
// and shows progress while it runs.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { RotateCcw } from 'lucide-react';

export type ConfirmOptions = {
  title: string;
  message: React.ReactNode;
  /** Says what happens, for example "Discard changes". */
  confirmLabel: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive. */
  danger?: boolean;
};

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmCtx = createContext<Confirm | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((yes: boolean) => void) | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const messageId = useId();

  const confirm = useCallback<Confirm>(
    (next) =>
      new Promise<boolean>((resolve) => {
        // A newer question answers the one still open with "no".
        resolveRef.current?.(false);
        resolveRef.current = resolve;
        if (!dialogRef.current?.open) {
          returnFocusRef.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }
        setOptions(next);
      }),
    [],
  );

  // Open once the content is rendered, starting on the safe choice.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!options || !dialog) return;
    if (!dialog.open) dialog.showModal();
    cancelRef.current?.focus();
  }, [options]);

  const finish = (yes: boolean) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    dialogRef.current?.close();
    setOptions(null);
    // Focus goes back first; if the answer navigates, the new view can then move it.
    returnFocusRef.current?.focus();
    resolve?.(yes);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <dialog
        ref={dialogRef}
        className="dmn-admin__dialog"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onCancel={(e) => {
          // Escape: close through finish() so the question gets its answer.
          e.preventDefault();
          finish(false);
        }}
      >
        {options && (
          <>
            <h3 id={titleId}>{options.title}</h3>
            <div id={messageId} className="dmn-admin__dialog-message">
              {typeof options.message === 'string' ? <p>{options.message}</p> : options.message}
            </div>
            <div className="actions dmn-admin__dialog-actions">
              <button
                ref={cancelRef}
                type="button"
                className="button button--secondary"
                onClick={() => finish(false)}
              >
                {options.cancelLabel ?? 'Cancel'}
              </button>
              <button
                type="button"
                className={options.danger ? 'button button--danger' : 'button'}
                onClick={() => finish(true)}
              >
                {options.confirmLabel}
              </button>
            </div>
          </>
        )}
      </dialog>
    </ConfirmCtx.Provider>
  );
}

/** Asks a question in the confirmation dialog; resolves true when the user confirms. */
export function useConfirm() {
  const confirm = useContext(ConfirmCtx);
  if (!confirm) throw new Error('useConfirm must be used within <ConfirmProvider>');
  return confirm;
}

/**
 * "Discard changes" for an editor: shown only while there are unsaved edits, and asks before
 * throwing them away. `what` names the edits, for example "these URL parameters".
 */
/**
 * After a discard the button that had focus is gone, so move focus to the heading of the form
 * or section it was in, rather than letting it fall to the page.
 */
function focusHeading(section: Element | null) {
  const heading = section?.querySelector<HTMLElement>('h2, h3');
  if (!heading) return;
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  heading.focus();
}

export function DiscardButton({
  dirty,
  disabled,
  what,
  onDiscard,
}: {
  dirty: boolean;
  disabled?: boolean;
  what: string;
  onDiscard: () => void;
}) {
  const confirm = useConfirm();
  if (!dirty) return null;
  return (
    <button
      type="button"
      className="button button--text"
      disabled={disabled}
      onClick={async (e) => {
        const button = e.currentTarget;
        const section = button.closest('section');
        const yes = await confirm({
          title: 'Discard unsaved changes?',
          message: `Your unsaved changes to ${what} will be lost, and the saved version shown again.`,
          confirmLabel: 'Discard changes',
          danger: true,
        });
        if (!yes) return;
        onDiscard();
        // The button disappears once the edits are gone; wait for that render.
        requestAnimationFrame(() => {
          if (!button.isConnected || document.activeElement === document.body)
            focusHeading(section);
        });
      }}
    >
      <RotateCcw aria-hidden="true" />
      Discard changes
    </button>
  );
}
