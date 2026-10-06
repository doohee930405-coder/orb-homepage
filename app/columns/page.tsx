import type { Metadata } from 'next';
import Link from 'next/link';
import ColumnListClient from '../components/ColumnListClient';
import SiteHeader from '../components/SiteHeader';
import TrackedLink from '../components/TrackedLink';
import { clinic, SITE_URL } from '../lib/clinic';
import { getAllCategories, getAllColumns } from '../lib/columns';

export const metadata: Metadata = {
  title: '원장 칼럼 | 오브한의원 마곡점 - 전문 한의학 건강 정보',
  description:
    '마곡나루역 5번 출구 오브한의원 대표원장이 직접 집필하는 자율신경실조증, 브레인포그, 초민감자(HSP), ADHD, 다이어트, 위장관, 갑상선, 정량화뇌파검사 전문 의료 칼럼 모음입니다.',
  alternates: {
    canonical: `${SITE_URL}/columns`,
    languages: {
      ko: `${SITE_URL}/columns`,
    },
  },
  openGraph: {
    title: '원장 칼럼 | 오브한의원 마곡점',
    description:
      '마곡나루역 5번 출구 오브한의원 대표원장이 직접 집필하는 자율신경실조증, 브레인포그, 초민감자(HSP), ADHD, 다이어트, 위장관, 갑상선, 정량화뇌파검사 전문 의료 칼럼입니다.',
    url: `${SITE_URL}/columns`,
    siteName: '오브한의원 마곡점',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/images/clinic/hero-lobby-wide.webp`,
        width: 1200,
        height: 630,
        alt: '오브한의원 마곡점 원장 칼럼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '원장 칼럼 | 오브한의원 마곡점',
    description:
      '마곡나루역 5번 출구 오브한의원 대표원장이 직접 집필하는 전문 의료 칼럼 모음.',
    images: [`${SITE_URL}/images/clinic/hero-lobby-wide.webp`],
  },
};

export default function ColumnsPage() {
  const columns = getAllColumns();
  const categories = getAllCategories();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/columns`,
        url: `${SITE_URL}/columns`,
        name: '오브한의원 마곡점 원장 칼럼',
        description:
          '마곡나루역 5번 출구 오브한의원 대표원장이 직접 집필하는 자율신경실조증, 브레인포그, 정량화뇌파검사, 다이어트 전문 의료 칼럼입니다.',
        publisher: {
          '@type': 'MedicalClinic',
          name: clinic.nameKo,
          url: SITE_URL,
          telephone: clinic.phoneDisplay,
          address: {
            '@type': 'PostalAddress',
            streetAddress: clinic.addressKo,
            addressLocality: '강서구',
            addressRegion: '서울',
            addressCountry: 'KR',
          },
        },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: columns.map((col, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/columns/${col.slug}`,
            name: col.title,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '홈',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: '원장 칼럼',
            item: `${SITE_URL}/columns`,
          },
        ],
      },
    ],
  };

  return (
    <main className="site-shell column-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader locale="ko" compact />

      {/* Hero Header */}
      <section className="column-hero-banner">
        <div className="column-hero-inner">
          <nav className="breadcrumbs" aria-label="현재 위치">
            <Link href="/">홈</Link>
            <span>/</span>
            <span>칼럼</span>
          </nav>
          <p className="eyebrow">CLINICAL COLUMNS · 건강 칼럼</p>
          <h1>원장 칼럼</h1>
          <p className="column-hero-lede">
            몸이 보내는 신호를 면밀히 이해하고, 신경계와 체형의 근본적인 회복 방향을 함께 모색합니다.
            오브한의원 대표원장이 직접 임상 경험과 의학적 근거를 바탕으로 집필합니다.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="column-content-section">
        <ColumnListClient initialColumns={columns} categories={categories} />
      </section>

      {/* Reservation CTA Section */}
      <section className="column-cta-section">
        <div className="column-cta-inner">
          <p className="eyebrow">CONSULTATION & RESERVATION</p>
          <h2>현재 겪고 계신 불편을 이야기해 주세요</h2>
          <p>
            증상의 원인을 면밀히 진찰하고, 자율신경·뇌파 검사 및 신경계 기능 평가를 통해 개인별 맞춤 치료 계획을 수립합니다.
          </p>
          <div className="primary-actions primary-actions-centered">
            <TrackedLink
              className="button button-solid"
              href={clinic.naverBookingUrl}
              target="_blank"
              rel="noreferrer"
              eventName="booking_click"
              eventLabel="칼럼목록_네이버예약"
            >
              네이버 예약<span>↗</span>
            </TrackedLink>
            <TrackedLink
              className="button button-ghost"
              href={clinic.phoneHref}
              eventName="phone_click"
              eventLabel="칼럼목록_전화문의"
            >
              전화 문의 ({clinic.phoneDisplay})
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div>
          <strong>ORB</strong>
          <span>오브한의원 마곡점</span>
        </div>
        <address>
          {clinic.addressKo}
          <br />
          {clinic.phoneDisplay}
        </address>
        <div className="footer-meta">
          <Link href="/columns">원장 칼럼</Link>
          <Link href="/privacy">개인정보처리방침</Link>
          <span>© ORB Korean Medicine Clinic.</span>
        </div>
      </footer>
    </main>
  );
}
