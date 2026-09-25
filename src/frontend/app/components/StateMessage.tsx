import React from 'react';
import { AlertCircle, CalendarX2, Info, Lock } from 'lucide-react';

type Kind = 'prerequisite' | 'empty' | 'error' | 'info';

const ICONS: Record<Kind, React.ReactNode> = {
  prerequisite: <Lock />,
  empty: <CalendarX2 />,
  error: <AlertCircle />,
  info: <Info />,
};

/**
 * Message for a step that can't show its content yet: waiting on an earlier step,
 * nothing available, or a failed request. Errors offer a retry when one is possible.
 */
export function StateMessage({
  kind,
  children,
  actionLabel,
  onAction,
}: {
  kind: Kind;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className={`state state--${kind}`} role={kind === 'error' ? 'alert' : undefined}>
      {ICONS[kind]}
      <p className="state__text">{children}</p>
      {onAction && (
        <button type="button" className="state__action" onClick={onAction}>
          {actionLabel || 'Try again'}
        </button>
      )}
    </div>
  );
}
