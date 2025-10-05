import React, { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import FaqEditor from './FaqEditor';
import LinkEditor from './LinkEditor';

type Props = { onDirty?: (d: boolean) => void };

export default function AdditionalCard({ onDirty }: Props) {
  const { selectedVenueId } = useAdmin();

  // Track per-section dirty. Add more sections later.
  const [faqDirty, setFaqDirty] = useState(false);
  const [linkDirty, setLinkDirty] = useState(false);

  // Bubble up combined dirty state.
  useEffect(() => {
    onDirty?.(faqDirty);
  }, [faqDirty, onDirty]);

  // Reset when venue changes.
  useEffect(() => {
    setFaqDirty(false);
  }, [selectedVenueId]);

  return (
    <section className="dmn-admin__card">
      <div className="dmn-admin__header">
        <h2 className="dmn-admin__header__headline">Additional</h2>
        <span className="dmn-admin__header__inner">
          {faqDirty || (linkDirty && <p className="dmn-admin__header__dirty">Unsaved changes</p>)}
        </span>
      </div>
      {!selectedVenueId && (
        <p className="dmn-admin__help">Pick a venue above to manage Additional content.</p>
      )}
      {selectedVenueId && (
        <div className="dmn-admin__sections">
          <LinkEditor onDirty={setLinkDirty} />
          <FaqEditor onDirty={setFaqDirty} />
        </div>
      )}
    </section>
  );
}
