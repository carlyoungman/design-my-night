// src/admin/components/FaqEditor.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { adminListFaqs, adminSaveFaqs } from '../api';

type Faq = { question: string; answer: string };
type Props = { onDirty?: (d: boolean) => void };

const MAX_Q = 100;
const MAX_A = 300;

export default function FaqEditor({ onDirty }: Props) {
  const { selectedVenueId } = useAdmin();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [orig, setOrig] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(faqs) !== JSON.stringify(orig), [faqs, orig]);
  const invalid = useMemo(
    () => faqs.some((f) => f.question.length > MAX_Q || f.answer.length > MAX_A),
    [faqs],
  );

  useEffect(() => onDirty?.(dirty), [dirty, onDirty]);

  useEffect(() => {
    if (!selectedVenueId) {
      setFaqs([]);
      setOrig([]);
      return;
    }
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);
      try {
        const r = await adminListFaqs(Number(selectedVenueId));
        const list = Array.isArray(r.faqs) ? r.faqs : [];
        setFaqs(list);
        setOrig(list);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load FAQs.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedVenueId]);

  const onQ = (i: number, v: string) =>
    setFaqs((fs) => fs.map((f, idx) => (idx === i ? { ...f, question: v.slice(0, MAX_Q) } : f)));
  const onA = (i: number, v: string) =>
    setFaqs((fs) => fs.map((f, idx) => (idx === i ? { ...f, answer: v.slice(0, MAX_A) } : f)));

  const addRow = () => setFaqs((fs) => [...fs, { question: '', answer: '' }]);
  const delRow = (i: number) => setFaqs((fs) => fs.filter((_, idx) => idx !== i));

  const saveAll = async () => {
    if (!selectedVenueId || invalid) return;
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      await adminSaveFaqs(Number(selectedVenueId), faqs);
      setOk('FAQs saved.');
      setOrig(faqs);
    } catch (e: any) {
      setErr(e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="faqs">
      <div className="dmn-admin__header">
        <h4 id="additional-faqs-title" className="dmn-admin__header__headline">
          FAQs
        </h4>
        <div className="dmn-admin__header__inner">
          {dirty && <p className="dmn-admin__header__dirty">Unsaved changes</p>}
          {ok && !dirty && <p className="dmn-admin__header__ok">{ok}</p>}
          <button
            className="button button--action"
            onClick={saveAll}
            disabled={saving || !dirty || !selectedVenueId || invalid}
            aria-disabled={saving || !dirty || !selectedVenueId || invalid}
          >
            {saving ? 'Saving…' : 'Save FAQs'}
          </button>
        </div>
      </div>
      {!selectedVenueId && <p className="dmn-admin__help">Pick a venue above to manage FAQs.</p>}
      {loading && <p>Loading FAQs…</p>}
      {err && <p className="err">{err}</p>}

      {!loading && selectedVenueId && (
        <>
          {faqs.length === 0 && (
            <p className="dmn-admin__help">No FAQs yet. Add your first question below.</p>
          )}

          <div className="table">
            {faqs.map((f, i) => {
              const qLen = f.question.length;
              const aLen = f.answer.length;
              const qOver = qLen > MAX_Q;
              const aOver = aLen > MAX_A;
              return (
                <div key={i} className="table__row">
                  <div className="table__left">
                    <div className="table__cell">
                      <div className="table__label">
                        Question{' '}
                        <span className={`charcount${qOver ? ' err' : ''}`}>
                          {qLen}/{MAX_Q}
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={f.question}
                        onChange={(e) => onQ(i, e.target.value)}
                        maxLength={MAX_Q}
                        aria-invalid={qOver || undefined}
                      />
                    </div>
                    <div className="table__cell">
                      <div className="table__label">
                        Answer{' '}
                        <span className={`charcount${aOver ? ' err' : ''}`}>
                          {aLen}/{MAX_A}
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={f.answer}
                        onChange={(e) => onA(i, e.target.value)}
                        maxLength={MAX_A}
                        aria-invalid={aOver || undefined}
                      />
                    </div>
                  </div>
                  <div className="table__right">
                    <button className="button button--sub" type="button" onClick={() => delRow(i)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="actions" style={{ marginTop: 12 }}>
            <button className="button" type="button" onClick={addRow}>
              Add FAQ
            </button>
          </div>
        </>
      )}
    </section>
  );
}
