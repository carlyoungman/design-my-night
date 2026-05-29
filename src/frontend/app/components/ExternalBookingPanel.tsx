import React from 'react';

export type ExternalBookingPanelProps = {
  title?: string;
  imageUrl?: string;
  content?: string;
  buttonText?: string;
  buttonUrl?: string;
  themeColor?: string;
};

export function ExternalBookingPanel({
  title,
  imageUrl,
  content,
  buttonText,
  buttonUrl,
  themeColor = '',
}: ExternalBookingPanelProps) {
  const tc = themeColor ? `${themeColor}-border ${themeColor}-glow-inner` : '';

  return (
    <section className="location-games games-viewer uk-padding-large uk-padding-remove-horizontal uk-margin-top">
      <div className="wrapper uk-margin-large-bottom">
        <div className={`games-viewer_wrapper uk-padding ${tc} br-48 uk-position-relative`.trim()}>
          {title && (
            <div className={`games-viewer_title ${tc} uk-padding-small uk-text-center txt-white uk-width-2-5@m uk-width-2-3@s uk-width-3-4`.trim()}>
              <p className="font-pi txt-40 uk-margin-remove">{title}</p>
            </div>
          )}
          <div className="uk-grid uk-margin-medium-top" uk-grid="">
            {imageUrl && (
              <div className="uk-width-1-2@m">
                <div>
                  <img src={imageUrl} alt={title || ''} className="br-8" />
                </div>
              </div>
            )}
            <div className="uk-width-1-2@m uk-flex uk-flex-middle">
              <div className="uk-text-center uk-text-left@s">
                {content && (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                )}
                {buttonText && buttonUrl && (
                  <a
                    className="uk-button uk-button-default btn-pink arw-btn btn-yellow-hover uk-margin uk-margin-remove-bottom"
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
        </div>
      </div>
    </section>
  );
}
