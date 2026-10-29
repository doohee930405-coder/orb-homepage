'use client';

import React, { useState } from 'react';

export const HSP_CHECKLIST_ITEMS = [
  '소리, 빛, 냄새, 시각적 자극 등 일상적인 감각 자극에 극도로 예민하여 쉽게 피로해진다.',
  '특별한 이유나 기저 질환 없이 가슴이 자주 두근거리거나 호흡이 얕고 답답해진다.',
  '주변 사람들의 기분, 표정, 미묘한 분위기 변화를 지나치게 감지하여 에너지가 빠르게 소진된다.',
  '작은 소음이나 스트레스에도 쉽게 잠들지 못하고, 자는 도중 자주 깨어 수면의 질이 낮다.',
  '머리에 안개가 낀 듯 멍하고 집중력과 기억력이 떨어지는 브레인포그 증상을 자주 경험한다.',
  '스트레스를 받거나 긴장하면 소화불량, 잦은 체기, 복부 팽만감 등 위장 장애가 즉각 동반된다.',
  '병원 정밀 검사상 아무런 이상이 없다고 하지만 원인 모를 만성 피로와 어지럼증이 지속된다.',
];

interface HspSelfChecklistProps {
  headingLevel?: 'h3' | 'h4';
  isArchive?: boolean;
}

export default function HspSelfChecklist({
  headingLevel = 'h3',
  isArchive = false,
}: HspSelfChecklistProps) {
  const [checkedIndices, setCheckedIndices] = useState<number[]>([]);

  const toggleItem = (idx: number) => {
    setCheckedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const HeadingTag = headingLevel;

  return (
    <section
      className={`hsp-self-check-card ${isArchive ? 'is-archive-view' : ''}`}
      aria-label="HSP 자율신경실조증 자가진단"
    >
      <div className="hsp-check-header">
        <div className="hsp-check-badge-row">
          <span className="hsp-check-badge">HSP CLINICAL SELF-CHECK</span>
          {checkedIndices.length > 0 && (
            <span className="hsp-check-counter">
              <strong>{checkedIndices.length}</strong> / {HSP_CHECKLIST_ITEMS.length}개 선택
            </span>
          )}
        </div>
        <HeadingTag className="hsp-check-title">
          HSP 자율신경실조증 자가진단
        </HeadingTag>
        <p className="hsp-check-desc">
          초민감자(Highly Sensitive Person, HSP)의 감각처리민감성(SPS)과 자율신경계 과흥분 및 알로스타틱 부하가 발생했을 때 나타나는 대표적인 신체·신경학적 지표입니다.
        </p>
      </div>

      <ul className="hsp-check-list" role="list">
        {HSP_CHECKLIST_ITEMS.map((item, idx) => {
          const isChecked = checkedIndices.includes(idx);
          return (
            <li
              key={idx}
              className={`hsp-check-item ${isChecked ? 'is-checked' : ''}`}
              onClick={() => toggleItem(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleItem(idx);
                }
              }}
              aria-pressed={isChecked}
            >
              <span className="hsp-check-bullet" aria-hidden="true">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="hsp-check-text">{item}</span>
            </li>
          );
        })}
      </ul>

      <div className="hsp-check-footer">
        <p>
          ※ 위 항목 중 <strong>3개 이상</strong>에 해당한다면 단순 심리적 피로가 아닌{' '}
          <strong>외부 자극을 걸러내는 뇌의 필터 기능 저하 및 자율신경실조증</strong> 상태일 가능성이 높습니다.
          오브한의원 마곡점에서는 정량화뇌파(QEEG) 및 자율신경 검사를 통해 신경계 과흥분 원인을 정밀 분석합니다.
        </p>
        {checkedIndices.length >= 3 && (
          <div className="hsp-check-alert">
            <span className="hsp-check-alert-icon">⚡</span>
            <span>
              현재 <strong>{checkedIndices.length}개</strong> 항목이 선택되었습니다. 뇌신경계 조절 기능 및 자율신경 불균형에 대한 정밀 검사가 권장됩니다.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
