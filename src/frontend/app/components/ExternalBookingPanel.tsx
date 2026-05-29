import React from 'react';

export type ExternalBookingPanelProps = {
  title?: string;
  imageUrl?: string;
  content?: string;
  buttonText?: string;
  buttonUrl?: string;
};

export function ExternalBookingPanel({
  title,
  imageUrl,
  content,
  buttonText,
  buttonUrl,
}: ExternalBookingPanelProps) {
  return (
    <div className="dmn-ext-panel">
      {title && (
        <div className="dmn-ext-panel__header">
          <span className="dmn-ext-panel__title">{title}</span>
        </div>
      )}
      <div className="dmn-ext-panel__body">
        {imageUrl && (
          <div className="dmn-ext-panel__image-wrapper">
            <img src={imageUrl} alt={title || ''} />
          </div>
        )}
        <div className="dmn-ext-panel__content">
          {content && (
            <div
              className="dmn-ext-panel__copy"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
          {buttonText && buttonUrl && (
            <a
              className="dmn-ext-panel__button"
              href={buttonUrl}
              target={buttonUrl.startsWith('http') ? '_blank' : undefined}
              rel={buttonUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {buttonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
