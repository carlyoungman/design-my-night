import React, { useId } from 'react';

export type ExternalBookingPanelProps = {
  title?: string;
  imageUrl?: string;
  content?: string;
  buttonText?: string;
  buttonUrl?: string;
};

/** Shown instead of the widget when the shortcode preselects a venue that books elsewhere. */
export function ExternalBookingPanel({
  title,
  imageUrl,
  content,
  buttonText,
  buttonUrl,
}: ExternalBookingPanelProps) {
  const headingId = useId();
  const external = !!buttonUrl && /^https?:\/\//.test(buttonUrl);

  return (
    <section className="dmn-ext-panel" aria-labelledby={title ? headingId : undefined}>
      <div className="dmn-ext-panel__body">
        {imageUrl && (
          <div className="dmn-ext-panel__image-wrapper">
            <img src={imageUrl} alt="" />
          </div>
        )}
        <div className="dmn-ext-panel__content">
          {title && (
            <h2 id={headingId} className="dmn-ext-panel__title">
              {title}
            </h2>
          )}
          {content && (
            <div className="dmn-ext-panel__copy" dangerouslySetInnerHTML={{ __html: content }} />
          )}
          {buttonText && buttonUrl && (
            <a
              className="dmn-ext-panel__button"
              href={buttonUrl}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
            >
              {buttonText}
              {external && <span className="screen-reader-text"> (opens in a new tab)</span>}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
