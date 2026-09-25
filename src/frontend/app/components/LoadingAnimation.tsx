import React from 'react';

/** Skeleton shown while live data loads. The text is announced to screen readers. */
export default function LoadingAnimation({ text }: { text?: string }) {
  return (
    <div className="skeleton" role="status">
      <p className={text ? 'skeleton__text' : 'screen-reader-text'}>{text || 'Loading…'}</p>
      <div className="skeleton__line" aria-hidden="true" />
      <div className="skeleton__line skeleton__line--tall" aria-hidden="true" />
      <div className="skeleton__line skeleton__line--short" aria-hidden="true" />
    </div>
  );
}
