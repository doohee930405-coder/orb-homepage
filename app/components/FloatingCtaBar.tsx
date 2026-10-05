'use client';

import React, { useState } from 'react';

interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'booking',
    title: '진료 예약',
    subtitle: '네이버 예약',
    url: 'https://booking.naver.com/booking/16/bizes/1731406',
    color: '#03C75A',
    bgColor: 'rgba(3, 199, 90, 0.1)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'place',
    title: '오시는 길',
    subtitle: '네이버 지도',
    url: 'https://map.naver.com/p/entry/place/2005324011',
    color: '#03C75A',
    bgColor: 'rgba(3, 199, 90, 0.1)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'talktalk',
    title: '톡톡 상담',
    subtitle: '네이버 톡톡',
    url: 'http://talk.naver.com/w6v6hxc',
    color: '#03C75A',
    bgColor: 'rgba(3, 199, 90, 0.1)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    id: 'kakao',
    title: '카톡 문의',
    subtitle: '카카오 채널',
    url: 'https://pf.kakao.com/_nXGxaX/chat',
    color: '#3A1D1D',
    bgColor: '#FEE500',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 3C6.48 3 2 6.58 2 11c0 2.87 1.88 5.39 4.72 6.74-.21.77-.76 2.78-.87 3.21-.14.54.2.53.42.39.29-.19 3.99-2.71 4.62-3.14.7.1 1.4.15 2.11.15 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
      </svg>
    ),
  },
];

export default function FloatingCtaBar() {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <aside aria-label="오브한의원 빠른 문의 및 예약" className="floating-cta-container">
      {/* Desktop Fixed Right Vertical Dock */}
      <div className="floating-cta-desktop" role="region" aria-label="퀵 액션 메뉴">
        <div className="floating-dock-badge">
          <span>QUICK</span>
        </div>

        <div className="floating-dock-list">
          {QUICK_ACTIONS.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`floating-dock-item item-${item.id}`}
              title={`${item.subtitle} 바로가기`}
            >
              <div
                className="floating-icon-wrap"
                style={{
                  backgroundColor: item.id === 'kakao' ? '#FEE500' : 'rgba(3, 199, 90, 0.12)',
                  color: item.color,
                }}
              >
                {item.icon}
              </div>
              <span className="floating-item-title">{item.title}</span>
              <span className="floating-item-sub">{item.subtitle}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Mobile Floating Action Button & Popup Dock */}
      <div className="floating-cta-mobile">
        {/* Backdrop overlay when open on mobile */}
        {mobileExpanded && (
          <div
            className="floating-mobile-backdrop"
            onClick={() => setMobileExpanded(false)}
            aria-hidden="true"
          />
        )}

        {/* Expanded Menu Sheet */}
        {mobileExpanded && (
          <div className="floating-mobile-sheet" role="dialog" aria-modal="true" aria-label="빠른 문의 및 예약 메뉴">
            <div className="floating-sheet-header">
              <div className="sheet-title-group">
                <span className="sheet-eyebrow">ORB CLINIC</span>
                <strong>빠른 예약 및 상담 채널</strong>
              </div>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={() => setMobileExpanded(false)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="floating-sheet-grid">
              {QUICK_ACTIONS.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`sheet-action-card card-${item.id}`}
                  onClick={() => setMobileExpanded(false)}
                >
                  <div
                    className="sheet-icon-wrap"
                    style={{
                      backgroundColor: item.id === 'kakao' ? '#FEE500' : 'rgba(3, 199, 90, 0.12)',
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div className="sheet-card-info">
                    <strong className="sheet-card-title">{item.title}</strong>
                    <span className="sheet-card-sub">{item.subtitle}</span>
                  </div>
                  <span className="sheet-card-arrow" aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed Trigger Pill Button */}
        <button
          type="button"
          className={`floating-mobile-trigger ${mobileExpanded ? 'active' : ''}`}
          onClick={() => setMobileExpanded((prev) => !prev)}
          aria-expanded={mobileExpanded}
          aria-label={mobileExpanded ? '빠른 문의 메뉴 닫기' : '빠른 예약 및 상담 열기'}
        >
          {mobileExpanded ? (
            <span className="trigger-label">✕ 닫기</span>
          ) : (
            <>
              <span className="trigger-pulse-dot" aria-hidden="true" />
              <span className="trigger-label">예약 · 상담 퀵바</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
