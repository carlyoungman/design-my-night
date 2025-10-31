import React, { useEffect, useState } from 'react';
import { useWidgetState } from '../../WidgetProvider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { ChevronDown } from 'lucide-react';
import { Notice } from '../Notice';

type Faq = { question: string; answer: string };
type Props = { faqs?: Faq[]; title?: string; venues: any[] };

export function Faqs({ faqs: initial, title = 'FAQs', venues = [] }: Props) {
  const { venueId } = useWidgetState();

  const venueName = React.useMemo(
    () =>
      venues.find((v: any) => v._id === venueId)?.name ??
      venues.find((v: any) => v._id === venueId)?.title ??
      '',
    [venues, venueId],
  );

  const [faqs, setFaqs] = useState<Faq[] | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (initial) return;
    if (!venueId) {
      setFaqs([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(
          `/wp-json/dmn/v1/public/faqs?venue_id=${encodeURIComponent(venueId)}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setFaqs(Array.isArray(json?.faqs) ? json.faqs : []);
      } catch {
        if (!cancelled) setErr('Failed to load FAQs.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [venueId, initial]);

  if (loading)
    return (
      <section className="faqs">
        <p>Loading FAQs…</p>
      </section>
    );
  if (err)
    return (
      <section className="faqs">
        <p className="err">{err}</p>
      </section>
    );
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className="faqs">
      <Notice
        message={`${title} for ${venueName} have loaded`}
        severity="success"
        inlineId="faqs-loaded"
        invalid={true}
      />
      <h4 className="faqs__title">
        {title} for {venueName}
      </h4>
      <div className="faqs__list">
        {faqs.map((f, i) => (
          <Accordion key={i} className="faq" disableGutters>
            <AccordionSummary
              className="faq__q"
              expandIcon={<ChevronDown color="var(--c-white)" />}
              aria-controls={`faq-panel-${i}-content`}
              id={`faq-panel-${i}-header`}
            >
              <Typography variant="h6" component="h6">
                {f.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className="faq__a">
              <div>{f.answer}</div>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </section>
  );
}
