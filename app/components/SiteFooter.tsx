'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SiteFooterProps {
  isEnglish?: boolean;
}

export default function SiteFooter({ isEnglish = false }: SiteFooterProps) {
  const [nonCoveredOpen, setNonCoveredOpen] = useState(false);

  return (
    <footer className="site-footer">
      {/* [좌측] */}
      <div className="footer-brand">
        <Link href="/admin/columns" title="관리자 페이지" style={{ color: 'inherit', textDecoration: 'none' }}>
          <strong>ORB</strong>
        </Link>
        <span>{isEnglish ? 'ORB Korean Medicine Clinic' : '오브한의원 마곡점'}</span>
      </div>

      {/* [중앙] */}
      <address className="footer-center-info">
        <p className="footer-info-row">
          <span>대표자 : 전두희</span>
          <span className="footer-sep">|</span>
          <span>사업자등록번호 : 733-11-03011</span>
          <span className="footer-sep">|</span>
          <span>개인정보관리책임자 : 전두희</span>
        </p>
        <p className="footer-info-row">
          <span>서울 강서구 마곡중앙로 111, 롯데캐슬 르웨스트 104동 2층 238호·239호</span>
        </p>
        <p className="footer-info-row">
          <span>TEL : <a href="tel:02-6959-5982">02-6959-5982</a></span>
          <span className="footer-sep">|</span>
          <span>평일 10:30 ~ 20:20 · 토요일 13:00 ~ 18:00 (매주 일요일 휴진)</span>
        </p>
      </address>

      {/* [우측] */}
      <div className="footer-meta">
        <div className="footer-links-row">
          <Link href="/columns">{isEnglish ? 'Columns' : '원장 칼럼'}</Link>
          <span className="footer-sep">|</span>
          <button
            type="button"
            className="footer-text-btn"
            onClick={() => setNonCoveredOpen(true)}
          >
            {isEnglish ? 'Non-covered Services' : '비급여 안내'}
          </button>
          <span className="footer-sep">|</span>
          <Link href={isEnglish ? '/en/privacy' : '/privacy'}>
            {isEnglish ? 'Privacy Policy' : '개인정보처리방침'}
          </Link>
        </div>
        <p className="footer-copyright">
          © ORB Korean Medicine Clinic. All rights reserved.
        </p>
      </div>

      {/* 비급여 안내 팝업 모달 */}
      {nonCoveredOpen && (
        <div
          className="non-covered-backdrop"
          onClick={() => setNonCoveredOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="non-covered-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="non-covered-header">
              <h3>비급여 진료비 안내</h3>
              <button
                type="button"
                className="non-covered-close"
                onClick={() => setNonCoveredOpen(false)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="non-covered-body">
              <p>
                오브한의원은 의료법 제45조 및 동법 시행규칙 제42조의2에 따라 비급여 진료비용을 투명하게 고지하고 있습니다.
              </p>
              <p>
                정확한 비급여 항목별(맞춤 한약, 뇌신경 추나요법, 정밀 뇌파 검사, 약침 치료 등) 세부 비용은 원내 데스크 및 상담실에 상세히 비치되어 있으며, 진료 및 상담 시 자세히 안내해 드립니다.
              </p>
              <div className="non-covered-notice">
                ※ 환자분의 증상 및 처방 구성에 따라 비용이 상이할 수 있습니다.
              </div>
            </div>
            <div className="non-covered-footer">
              <button
                type="button"
                className="button button-solid"
                onClick={() => setNonCoveredOpen(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
