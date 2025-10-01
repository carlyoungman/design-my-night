// src/frontend/app/components/Faqs.tsx
import React, { useEffect, useState } from 'react';
import { useWidgetState } from '../../WidgetProvider';

type Faq = { question: string; answer: string };
type Props = { faqs?: Faq[]; title?: string };

export function Faqs({ faqs: initial, title = 'FAQs' }: Props) {
  const { venueId } = useWidgetState();
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
      } catch (e: any) {
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
      <h3 className="faqs__title">{title}</h3>
      <div className="faqs__list">
        {faqs.map((f, i) => (
          <details key={i} className="faq">
            <summary className="faq__q">{f.question}</summary>
            <div className="faq__a">{f.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
