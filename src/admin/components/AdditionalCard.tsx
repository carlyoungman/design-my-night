import React, { useEffect, useState } from 'react';
import { useAdmin } from '@admin/AdminContext';
import FaqEditor from './FaqEditor';
import LinkEditor from './LinkEditor';
import VenueDisplayCard from './VenueDisplayCard';

type Props = { onDirty?: (d: boolean) => void };

export default function AdditionalCard({ onDirty }: Props) {
  const { selectedVenueId } = useAdmin();

  const [faqDirty, setFaqDirty] = useState(false);
  const [linkDirty, setLinkDirty] = useState(false);
  const [displayDirty, setDisplayDirty] = useState(false);

  useEffect(() => {
    onDirty?.(faqDirty || linkDirty || displayDirty);
  }, [faqDirty, linkDirty, displayDirty, onDirty]);

  useEffect(() => {
    setFaqDirty(false);
    setDisplayDirty(false);
  }, [selectedVenueId]);

  return (
    <section className="dmn-admin__card">
      <div className="dmn-admin__header">
        <h2 className="dmn-admin__header__headline">Additional</h2>
        <span className="dmn-admin__header__inner">
          {(faqDirty || linkDirty || displayDirty) && (
            <p className="dmn-admin__header__dirty">Unsaved changes</p>
          )}
        </span>
      </div>
      {!selectedVenueId && (
        <p className="dmn-admin__help">Pick a venue above to manage Additional content.</p>
      )}
      {selectedVenueId && (
        <div className="dmn-admin__sections">
          <VenueDisplayCard onDirty={setDisplayDirty} />
          <LinkEditor onDirty={setLinkDirty} />
          <FaqEditor onDirty={setFaqDirty} />
        </div>
      )}
    </section>
  );
}
