import React, { useEffect, useId, useState } from 'react';
import { Accordion } from '@base-ui-components/react/accordion';
import { ChevronDown } from 'lucide-react';
import { useWidgetState } from '@app/WidgetProvider';
import { getFaqs } from '@api/public';
import LoadingAnimation from '@app/components/LoadingAnimation';
import { StateMessage } from '@app/components/StateMessage';

type Faq = { question: string; answer: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = { faqs?: Faq[]; title?: string; venues: any[] };

export function Faqs({ faqs: initial, title = 'FAQs', venues = [] }: Props) {
  const { venueId } = useWidgetState();
  const headingId = useId();

  const venueName = React.useMemo(() => {
    const v = venues.find((x) => x._id === venueId);
    return v?.name ?? v?.title ?? '';
  }, [venues, venueId]);

  const [faqs, setFaqs] = useState<Faq[] | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (initial) return;
    if (!venueId) {
      setFaqs([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(false);
      try {
        const json = await getFaqs(venueId);
        if (!cancelled) setFaqs(Array.isArray(json?.faqs) ? json.faqs : []);
      } catch {
        if (!cancelled) setErr(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [venueId, initial, attempt]);

  // FAQs are optional content: nothing to show until a venue with FAQs is chosen.
  if (!loading && !err && (!faqs || faqs.length === 0)) return null;

  return (
    <section className="faqs" aria-labelledby={headingId}>
      <h2 id={headingId} className="faqs__title">
        {title}
        {venueName ? ` for ${venueName}` : ''}
      </h2>
      {loading && <LoadingAnimation text="Loading FAQs…" />}
      {!loading && err && (
        <StateMessage kind="error" onAction={() => setAttempt((n) => n + 1)}>
          We couldn’t load the FAQs.
        </StateMessage>
      )}
      {!loading && !err && faqs && (
        <Accordion.Root className="faqs__list" openMultiple>
          {faqs.map((f, i) => (
            <Accordion.Item key={i} className="faqs__item">
              <Accordion.Header className="faqs__header">
                <Accordion.Trigger className="faqs__trigger">
                  <span>{f.question}</span>
                  <ChevronDown />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="faqs__panel">{f.answer}</Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      )}
    </section>
  );
}
