'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MarkdownView from './components/MarkdownView';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import SafeImage from './components/SafeImage';
import type { Column } from './lib/columnTypes';

export default function NotFound() {
  const [pendingColumn, setPendingColumn] = useState<Column | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname;
    if (pathname.includes('/columns/')) {
      const match = pathname.match(/\/columns\/([^/?#]+)/);
      if (match) {
        let slug = match[1];
        try {
          slug = decodeURIComponent(slug);
        } catch {}

        try {
          const pendingRaw = localStorage.getItem('orb_pending_columns');
          if (pendingRaw) {
            const pendingList: Column[] = JSON.parse(pendingRaw);
            const found = pendingList.find(
              (c) =>
                c.slug === slug ||
                c.id === slug ||
                c.id === `col-${slug}` ||
                encodeURIComponent(c.slug) === match[1]
            );
            if (found) {
              setPendingColumn(found);
            }
          }
        } catch (e) {
          console.error('Error reading pending columns:', e);
        }
      }
    }
    setIsChecking(false);
  }, []);

  // Poll in background if a pending column is shown until Cloudflare deployment is complete
  useEffect(() => {
    if (!pendingColumn || typeof window === 'undefined') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(window.location.pathname, { method: 'HEAD', cache: 'no-store' });
        if (res.ok) {
          try {
            const pendingRaw = localStorage.getItem('orb_pending_columns');
            if (pendingRaw) {
              const pendingList: Column[] = JSON.parse(pendingRaw);
              const updated = pendingList.filter((c) => c.slug !== pendingColumn.slug);
              localStorage.setItem('orb_pending_columns', JSON.stringify(updated));
            }
          } catch {}
          window.location.reload();
        }
      } catch {}
    }, 10000);

    return () => clearInterval(interval);
  }, [pendingColumn]);

  // If a pending column is detected, render it seamlessly!
  if (pendingColumn) {
    return (
      <main className="site-shell column-detail-page">
        <SiteHeader locale="ko" compact />
        <div
          style={{
            background: '#FEF3C7',
            borderBottom: '1px solid #F59E0B',
            padding: '12px 20px',
            color: '#92400E',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: 600,
            position: 'sticky',
            top: '0px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>
            ⏳ <strong>실시간 클라우드 배포 진행 중</strong>: 방금 등록/마이그레이션된 칼럼입니다.
            현재 Cloudflare에서 정식 웹페이지를 생성 중이며 (보통 3~4분 소요), 완료 즉시 자동
            새로고침됩니다. 본문은 아래에서 바로 확인하실 수 있습니다.
          </span>
        </div>

        <article className="article-container" style={{ marginTop: '24px' }}>
          <header className="article-header">
            <div className="article-header-meta">
              <span className="column-badge">{pendingColumn.category}</span>
              <time dateTime={pendingColumn.date}>{pendingColumn.date}</time>
            </div>
            <h1 className="article-title">{pendingColumn.title}</h1>
          </header>

          {pendingColumn.summary && (
            <section className="geo-summary-box" aria-label="Summary">
              <div className="geo-summary-title">
                <strong>Summary</strong>
              </div>
              <p>{pendingColumn.summary}</p>
            </section>
          )}

          {pendingColumn.thumbnail && (
            <figure className="article-figure">
              <SafeImage src={pendingColumn.thumbnail} alt={pendingColumn.title} />
            </figure>
          )}

          <section className="article-content-wrapper">
            <MarkdownView content={pendingColumn.content} summary={pendingColumn.summary} />
          </section>

          <div className="article-back-bar">
            <a href="/columns" className="button button-ghost">
              ← 전체 칼럼 목록으로 돌아가기
            </a>
          </div>
        </article>
        <SiteFooter />
      </main>
    );
  }

  // Normal 404 page
  return (
    <main
      className="site-shell not-found-page"
      style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}
    >
      <SiteHeader locale="ko" compact />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#B45309',
            background: '#FEF3C7',
            padding: '4px 12px',
            borderRadius: '20px',
            marginBottom: '16px',
          }}
        >
          PAGE NOT FOUND
        </span>
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#4B5563',
            marginBottom: '16px',
          }}
        >
          요청하신 페이지를 찾을 수 없습니다.
        </h2>
        <p
          style={{
            color: '#6B7280',
            maxWidth: '520px',
            marginBottom: '32px',
            lineHeight: 1.6,
            fontSize: '15px',
          }}
        >
          존재하지 않거나 삭제된 페이지 주소입니다.
          <br />
          방금 관리자에서 마이그레이션한 칼럼의 경우, 클라우드 서버(Cloudflare)의 자동 정적 빌드가
          완료되는 데 <strong>약 3~4분</strong>이 소요될 수 있습니다.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/columns"
            className="button button-solid"
            style={{ padding: '12px 28px', fontSize: '15px' }}
          >
            칼럼 아카이브 보기
          </Link>
          <Link
            href="/"
            className="button button-ghost"
            style={{ padding: '12px 28px', fontSize: '15px' }}
          >
            홈으로 이동
          </Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
