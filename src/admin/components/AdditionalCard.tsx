import React, { useEffect, useState } from 'react';
import { useAdmin } from '@admin/AdminContext';
import FaqEditor from './FaqEditor';
import LinkEditor from './LinkEditor';

type Props = { onDirty?: (d: boolean) => void };

export default function AdditionalCard({ onDirty }: Props) {
  const { selectedVenueId } = useAdmin();

  const [faqDirty, setFaqDirty] = useState(false);
  const [linkDirty, setLinkDirty] = useState(false);

  useEffect(() => {
    onDirty?.(faqDirty || linkDirty);
  }, [faqDirty, linkDirty, onDirty]);

  return (
    <div>
      <h2 className="screen-reader-text">Links and FAQs</h2>
      {!selectedVenueId && (
        <p className="dmn-admin__empty">Choose a venue above to edit its links and FAQs.</p>
      )}
      {selectedVenueId && (
        <div className="dmn-admin__sections">
          <LinkEditor onDirty={setLinkDirty} />
          <FaqEditor onDirty={setFaqDirty} />
        </div>
      )}
    </div>
  );
}
