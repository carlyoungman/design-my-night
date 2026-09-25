// src/admin/components/FaqEditor.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAdmin } from '@admin/AdminContext';
import { adminListFaqs, adminSaveFaqs } from '@admin/api';
import {
  LoadError,
  Loading,
  SaveState,
  StatusMessage,
  errorMessage,
  useLatestRequest,
} from '@admin/components/ui';

type Faq = { question: string; answer: string };
type Props = { onDirty?: (d: boolean) => void };

const MAX_Q = 100;
const MAX_A = 300;

export default function FaqEditor({ onDirty }: Props) {
  const { selectedVenueId } = useAdmin();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [orig, setOrig] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(false);
  const beginRequest = useLatestRequest();
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const focusIndex = useRef<number | null>(null);

  const dirty = useMemo(() => JSON.stringify(faqs) !== JSON.stringify(orig), [faqs, orig]);
  const incomplete = useMemo(
    () => faqs.some((f) => !f.question.trim() || !f.answer.trim()),
    [faqs],
  );

  useEffect(() => onDirty?.(dirty), [dirty, onDirty]);

  const load = useCallback(async () => {
    const isCurrent = beginRequest();
    if (!selectedVenueId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadErr(null);
    setErr(null);
    setOk(null);
    try {
      const r = await adminListFaqs(Number(selectedVenueId));
      if (!isCurrent()) return;
      const list = Array.isArray(r.faqs) ? r.faqs : [];
      setFaqs(list);
      setOrig(list);
    } catch (e) {
      if (!isCurrent()) return;
      setLoadErr(errorMessage(e, 'FAQs could not be loaded.'));
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [selectedVenueId, beginRequest]);

  useEffect(() => {
    load();
  }, [load]);

  // Move focus to a newly added question.
  useEffect(() => {
    if (focusIndex.current == null) return;
    document.getElementById(`dmn-faq-q-${focusIndex.current}`)?.focus();
    focusIndex.current = null;
  }, [faqs.length]);

  const update = (i: number, patch: Partial<Faq>) => {
    setOk(null);
    setFaqs((fs) => fs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  };

  const addRow = () => {
    setOk(null);
    focusIndex.current = faqs.length;
    setFaqs((fs) => [...fs, { question: '', answer: '' }]);
  };
  const delRow = (i: number) => {
    setOk(null);
    setFaqs((fs) => fs.filter((_, idx) => idx !== i));
  };

  const saveAll = async () => {
    if (!selectedVenueId || incomplete) return;
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      await adminSaveFaqs(Number(selectedVenueId), faqs);
      setOk('FAQs saved.');
      setOrig(faqs);
    } catch (e) {
      setErr(errorMessage(e, 'FAQs could not be saved. Try again.'));
    } finally {
      setSaving(false);
    }
  };

  if (!selectedVenueId) return null;

  return (
    <section className="dmn-admin__subsection" aria-labelledby="dmn-faqs-title">
      <div className="dmn-admin__header">
        <h3 id="dmn-faqs-title" className="dmn-admin__header__headline">
          FAQs
        </h3>
        <div className="dmn-admin__header__inner">
          <SaveState dirty={dirty} ok={ok} />
          {!loading && !loadErr && (
            <button
              type="button"
              className="button"
              onClick={saveAll}
              disabled={saving || !dirty || incomplete}
              aria-busy={saving}
              aria-describedby={incomplete ? 'dmn-faqs-incomplete' : undefined}
            >
              {saving ? 'Saving…' : 'Save FAQs'}
            </button>
          )}
        </div>
      </div>
      <p className="dmn-admin__help">Shown under the booking widget for this venue.</p>

      {loading && <Loading>Loading FAQs…</Loading>}
      {!loading && loadErr && <LoadError message={loadErr} onRetry={load} />}
      {err && (
        <StatusMessage tone="error" block>
          {err}
        </StatusMessage>
      )}

      {!loading && !loadErr && (
        <>
          {faqs.length === 0 && (
            <p className="dmn-admin__empty dmn-admin__spacer-top">
              No FAQs yet. Add a question to show an FAQ section under the widget.
            </p>
          )}

          <div className="table dmn-admin__spacer-top">
            {faqs.map((f, i) => (
              <fieldset key={i} className="table__row">
                <legend className="screen-reader-text">FAQ {i + 1}</legend>
                <div className="table__left">
                  <div className="table__cell">
                    <label htmlFor={`dmn-faq-q-${i}`}>Question</label>
                    <textarea
                      id={`dmn-faq-q-${i}`}
                      rows={2}
                      value={f.question}
                      onChange={(e) => update(i, { question: e.target.value.slice(0, MAX_Q) })}
                      maxLength={MAX_Q}
                      aria-describedby={`dmn-faq-q-${i}-count`}
                    />
                    <p id={`dmn-faq-q-${i}-count`} className="dmn-admin__help">
                      {f.question.length} of {MAX_Q} characters
                    </p>
                  </div>
                  <div className="table__cell">
                    <label htmlFor={`dmn-faq-a-${i}`}>Answer</label>
                    <textarea
                      id={`dmn-faq-a-${i}`}
                      rows={4}
                      value={f.answer}
                      onChange={(e) => update(i, { answer: e.target.value.slice(0, MAX_A) })}
                      maxLength={MAX_A}
                      aria-describedby={`dmn-faq-a-${i}-count`}
                    />
                    <p id={`dmn-faq-a-${i}-count`} className="dmn-admin__help">
                      {f.answer.length} of {MAX_A} characters
                    </p>
                  </div>
                </div>
                <div className="table__right">
                  <button
                    className="button button--danger"
                    type="button"
                    onClick={() => delRow(i)}
                    aria-label={`Remove FAQ ${i + 1}${f.question ? `: ${f.question}` : ''}`}
                  >
                    Remove
                  </button>
                </div>
              </fieldset>
            ))}
          </div>

          {incomplete && (
            <p id="dmn-faqs-incomplete" className="dmn-admin__help dmn-admin__spacer-top">
              Every FAQ needs a question and an answer before you can save.
            </p>
          )}

          <div className="actions dmn-admin__spacer-top">
            <button className="button button--secondary" type="button" onClick={addRow}>
              Add FAQ
            </button>
          </div>
        </>
      )}
    </section>
  );
}
