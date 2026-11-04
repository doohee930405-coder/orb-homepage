'use client';

import React, { useState } from 'react';

export interface FaqItem {
  question: string;
  answerLead: string;
  answerLeadRest: string;
  answerDetail: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  regionLabel?: string;
}

export default function FaqAccordion({
  items,
  regionLabel = '자율신경실조증 및 뇌파검사 자주 묻는 질문',
}: FaqAccordionProps) {
  // First FAQ open by default for immediate preview & search indexing
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="faq-accordion-list" role="region" aria-label={regionLabel}>
      {items.map((faq, idx) => {
        const isOpen = openIndex === idx;
        const qId = `faq-q-${idx}`;
        const aId = `faq-ans-${idx}`;

        return (
          <div
            key={idx}
            className={`faq-accordion-item ${isOpen ? 'is-open' : 'is-collapsed'}`}
            data-open={isOpen ? 'true' : 'false'}
          >
            <button
              type="button"
              className="faq-accordion-summary"
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              aria-controls={aId}
              id={`faq-btn-${idx}`}
            >
              <h2 className="faq-question-text" id={qId}>
                Q. {faq.question.replace(/^Q\.\s*/i, '')}
              </h2>
              <span className="faq-arrow" aria-hidden="true">
                ▼
              </span>
            </button>
            <div
              id={aId}
              className={`faq-accordion-content ${isOpen ? 'is-expanded' : 'is-collapsed'}`}
              role="region"
              aria-labelledby={qId}
            >
              <p className="faq-answer-lead">
                <strong>{faq.answerLead}</strong> {faq.answerLeadRest}
              </p>
              <p className="faq-answer-detail">{faq.answerDetail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
