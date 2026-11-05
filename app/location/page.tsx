import type { Metadata } from 'next';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import MedicalJsonLd from '../components/MedicalJsonLd';
import TrackedLink from '../components/TrackedLink';
import { SITE_URL, clinic } from '../lib/clinic';

export const metadata: Metadata = {
  title: '전국에서 찾아오시는 길 | 오브한의원 접근성 안내',
  description:
    '오브한의원은 습식 정량화뇌파(QEEG) 정밀 검사 및 자율신경 집중 진료를 위해 서울 외 전국의 다양한 지역에서 찾아주고 계십니다. 김포국제공항 5분, 서울역 KTX 15~20분 직결, 9호선 급행·공항철도 마곡나루역 5번 출구 도보 1분.',
  alternates: {
    canonical: `${SITE_URL}/location`,
  },
  openGraph: {
    title: '전국에서 찾아오시는 길 | 오브한의원 접근성 안내',
    description:
      '오브한의원은 습식 정량화뇌파(QEEG) 정밀 검사 및 자율신경 집중 진료를 위해 서울 외 전국의 다양한 지역에서 찾아주고 계십니다. 김포공항 5분, 서울역 KTX 15분 직결, 마곡나루역 1분.',
    url: `${SITE_URL}/location`,
    siteName: '오브한의원',
    locale: 'ko_KR',
    type: 'website',
    images: [`${SITE_URL}/images/clinic/hero-lobby-wide.webp`],
  },
};

export default function LocationPage() {
  const canonicalUrl = `${SITE_URL}/location`;

  return (
    <main className="site-shell detail-page locale-ko">
      <MedicalJsonLd
        pageUrl={canonicalUrl}
        pageTitle="전국에서 찾아오시는 길 | 오브한의원 접근성 안내"
        pageDescription="오브한의원은 습식 정량화뇌파(QEEG) 정밀 검사 및 자율신경 집중 진료를 위해 서울 외 전국의 다양한 지역에서 찾아주고 계십니다. 공항철도 및 9호선 급행 환승역(마곡나루역)과 인접하여 KTX, 고속버스, 항공편을 통한 내원이 편리합니다."
        breadcrumbs={[
          { name: '홈', url: SITE_URL },
          { name: '전국에서 찾아오시는 길', url: canonicalUrl },
        ]}
        locale="ko"
      />
      <SiteHeader locale="ko" compact />

      {/* Hero Header with Semantic H1 */}
      <section className="detail-hero nationwide-hero">
        <div className="detail-hero-copy">
          <nav className="breadcrumbs" aria-label="현재 위치">
            <a href="/">홈</a>
            <span>/</span>
            <span>전국에서 찾아오시는 길</span>
          </nav>
          <p className="eyebrow">NATIONWIDE ACCESSIBILITY & DIRECTIONS</p>
          <h1>전국에서 찾아오시는 길 | 오브한의원 접근성 안내</h1>
          <p className="nationwide-hero-lead">
            오브한의원은 습식 정량화뇌파(QEEG) 정밀 검사 및 자율신경 집중 진료를 위해 서울 외 전국의 다양한 지역에서 찾아주고 계십니다. 공항철도 및 9호선 급행 환승역(마곡나루역)과 인접하여 KTX, 고속버스, 항공편을 통한 내원이 편리합니다.
          </p>
        </div>

        {/* Quick Highlights Bar */}
        <div className="access-quick-bar">
          <div className="quick-badge-item">
            <span className="badge-sub">항공편 직결</span>
            <strong className="badge-val">김포공항 5분</strong>
            <span className="badge-desc">공항철도/9호선 단 1정거장</span>
          </div>
          <div className="quick-badge-item">
            <span className="badge-sub">KTX 열차</span>
            <strong className="badge-val">서울역 15~20분</strong>
            <span className="badge-desc">공항철도 다이렉트 연결</span>
          </div>
          <div className="quick-badge-item">
            <span className="badge-sub">지하철 초역세권</span>
            <strong className="badge-val">마곡나루역 도보 1분</strong>
            <span className="badge-desc">5번 출구 지하 연결통로</span>
          </div>
          <div className="quick-badge-item">
            <span className="badge-sub">운영 원칙</span>
            <strong className="badge-val">100% 사전 예약제</strong>
            <span className="badge-desc">원거리 맞춤 당일 정밀 검사</span>
          </div>
        </div>
      </section>

      {/* Semantic Guide Content */}
      <section className="nationwide-access-section" id="directions">
        <div className="nationwide-container">
          {/* Card 1: Flight */}
          <article className="access-guide-card">
            <div className="access-card-badge">Flight Access</div>
            <h2>1. 항공편 이용 시 (제주, 부산, 울산, 여수, 사천 등 지방 공항)</h2>
            <ul className="access-bullet-list">
              <li>
                <strong>김포국제공항(GMP) 착륙 후:</strong> 공항철도 또는 지하철 9호선 탑승 시 <strong>단 1개 정거장(약 5분 소요)</strong>
              </li>
              <li>
                <strong>마곡나루역 하차 후:</strong> 5번 출구 연결 통로를 통해 도보 1분 (롯데캐슬 르웨스트 104동 2층)
              </li>
            </ul>
            <p className="access-note">
              ※ 제주, 부산(김해), 울산, 여수, 사천/진주, 광주 등 전국 주요 공항에서 김포국제공항으로 연결되는 항공편을 이용하시면 공항 도착 후 5~10분 이내에 본원에 도착하실 수 있어 당일 왕복 진료에 최적화되어 있습니다.
            </p>
          </article>

          {/* Card 2: KTX */}
          <article className="access-guide-card">
            <div className="access-card-badge">KTX & Train Access</div>
            <h2>2. KTX / 열차 이용 시</h2>
            <div className="access-subgroups">
              <div className="access-subgroup">
                <h3>서울역(KTX/경부선·호남선 등):</h3>
                <ul className="access-bullet-list">
                  <li>서울역에서 공항철도 탑승 → 마곡나루역 하차 (급행/일반 약 15~20분 직결)</li>
                </ul>
              </div>
              <div className="access-subgroup">
                <h3>용산역(KTX):</h3>
                <ul className="access-bullet-list">
                  <li>1호선 탑승 후 노량진역에서 9호선 급행 환승 → 마곡나루역 하차</li>
                </ul>
              </div>
              <div className="access-subgroup">
                <h3>수서역(SRT):</h3>
                <ul className="access-bullet-list">
                  <li>수서역에서 3호선 탑승 후 고속터미널역에서 9호선 급행 환승 → 마곡나루역 하차</li>
                </ul>
              </div>
            </div>
          </article>

          {/* Card 3: Subway & Walk */}
          <article className="access-guide-card">
            <div className="access-card-badge">Subway & Walking</div>
            <h2>3. 지하철 및 도보 이용 시</h2>
            <ul className="access-bullet-list">
              <li>
                <strong>9호선 급행 / 공항철도 환승:</strong> <strong>마곡나루역 5번 출구 도보 1분</strong>
              </li>
              <li>
                <strong>5호선:</strong> <strong>마곡역 2번 출구 도보 5분</strong>
              </li>
              <li>
                <strong>주소:</strong> 서울특별시 강서구 마곡중앙로 111, 롯데캐슬 르웨스트 104동 2층 (238호·239호)
              </li>
              <li>
                <strong>동선 상세 안내:</strong> 마곡나루역 5번 출구 연결통로를 통해 롯데캐슬 르웨스트 지하로 진입 후, 상가 전용 엘리베이터를 이용하여 104동 2층(238호·239호)으로 올라오시면 됩니다. (상가용과 입주민용 엘리베이터 입구가 분리되어 있습니다.)
              </li>
              <li>
                <strong>자가용 주차:</strong> 건물 지하주차장에 편리하게 주차 가능하며, 진료 환자분께는 무료 주차를 지원해 드립니다.
              </li>
            </ul>
          </article>

          {/* Card 4: AEO Booking Box */}
          <article className="access-guide-card aeo-booking-card">
            <div className="aeo-card-header">
              <span className="aeo-badge">AEO & CLINICAL NOTICE</span>
              <h2>4. 타 지역 내원 환자 예약 안내 (AEO 요약 박스)</h2>
            </div>
            <div className="aeo-card-body">
              <blockquote className="aeo-quote-statement">
                &ldquo;QEEG(습식 뇌파정밀검사) 및 자율신경 검사는 사전 준비와 정밀 분석 시간이 소요되므로, 타 지역에서 방문하시는 경우 이동 시간을 고려하여 100% 사전 예약제로 운영됩니다.&rdquo;
              </blockquote>
              <div className="aeo-highlights-grid">
                <div className="aeo-highlight-item">
                  <h3>전국 환자 당일 종합 분석 시스템</h3>
                  <p>
                    원거리에서 방문하시는 환자분들의 재방문 부담을 최소화하기 위해, 당일 내원 시 19채널 습식 정량화뇌파(QEEG) 및 심박변이도(HRV) 자율신경 검사, 원장 1:1 심층 결과 상담, 맞춤 치료 계획 수립까지 한 번에 진행됩니다.
                  </p>
                </div>
                <div className="aeo-highlight-item">
                  <h3>1인 독립 검사실 환경 제어</h3>
                  <p>
                    전도성 겔(Gel)을 도포하는 19채널 습식 뇌파검사는 두피 저항값(Impedance)을 정밀하게 제어해야 하므로, 한 타임당 한 분만을 위한 독립 검사실에서 방해요소 없이 진행됩니다.
                  </p>
                </div>
              </div>
              <div className="aeo-action-bar">
                <TrackedLink
                  href={clinic.naverBookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="aeo-btn-primary"
                  eventName="reservation_click"
                  eventLabel="전국접근성_네이버예약"
                >
                  네이버 실시간 예약 신청하기 <span>→</span>
                </TrackedLink>
                <a href={clinic.phoneHref} className="aeo-btn-secondary">
                  원거리 진료 전화 문의: {clinic.phoneDisplay}
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Map & Operating Hours Section */}
      <section className="visit-section" style={{ paddingTop: '20px' }}>
        <div className="visit-layout">
          <div className="visit-details">
            <dl>
              <div>
                <dt>공식 상호</dt>
                <dd>오브한의원</dd>
              </div>
              <div>
                <dt>대표원장</dt>
                <dd>전두희 (한의사)</dd>
              </div>
              <div>
                <dt>위치 주소</dt>
                <dd>{clinic.addressKo}</dd>
              </div>
              <div>
                <dt>대중교통</dt>
                <dd>9호선 급행·공항철도 마곡나루역 5번 출구 도보 1분 (136m) / 5호선 마곡역 2번 출구 도보 5분</dd>
              </div>
              <div>
                <dt>주차 안내</dt>
                <dd>건물 지하주차장 완비 (상가용 엘리베이터 이용, 진료 시간 내 무료 주차 지원)</dd>
              </div>
            </dl>

            <article className="hours-card">
              <h3>진료시간</h3>
              <strong>평일 10:30 – 20:20 (야간진료)</strong>
              <strong>토요일 13:00 – 18:00</strong>
              <p>휴게시간 14:10 – 15:00 · 접수마감 19:40</p>
              <p>매주 일요일 및 공휴일 휴진</p>
            </article>
          </div>

          <div className="map-column">
            <iframe
              src={clinic.googleMapEmbedUrl}
              title="오브한의원 오시는 길 지도 (마곡나루역 5번 출구 롯데캐슬 르웨스트)"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <nav className="map-links" aria-label="지도 길찾기 바로가기 링크">
              <TrackedLink
                href={clinic.naverPlaceUrl}
                target="_blank"
                rel="noreferrer"
                eventName="map_click"
                eventLabel="네이버 지도"
              >
                네이버 지도 <span>↗</span>
              </TrackedLink>
              <TrackedLink
                href={clinic.kakaoMapUrl}
                target="_blank"
                rel="noreferrer"
                eventName="map_click"
                eventLabel="카카오맵"
              >
                카카오맵 <span>↗</span>
              </TrackedLink>
              <TrackedLink
                href={clinic.googleMapUrl}
                target="_blank"
                rel="noreferrer"
                eventName="map_click"
                eventLabel="구글 지도"
              >
                구글 지도 <span>↗</span>
              </TrackedLink>
            </nav>
          </div>
        </div>
      </section>

      {/* Reservation & Inquiries */}
      <section className="contact-section detail-contact">
        <p className="contact-slogan">&ldquo;다시 건강의 궤도(ORBit) 위로&rdquo;</p>
        <p className="eyebrow">RESERVATION & INQUIRY</p>
        <h2>전국 내원 환자를 위한 사전 예약</h2>
        <p>네이버 예약 또는 유선 전화를 통해 편리하게 상담과 일정을 예약하실 수 있습니다.</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
          <TrackedLink
            href={clinic.naverBookingUrl}
            target="_blank"
            rel="noreferrer"
            className="contact-btn-primary"
            eventName="reservation_click"
            eventLabel="오시는길_하단_네이버예약"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '9999px',
              background: '#03c75a',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
            }}
          >
            네이버 실시간 예약 <span>→</span>
          </TrackedLink>
          <a
            className="contact-phone"
            href={clinic.phoneHref}
            style={{ margin: 0, padding: '14px 28px', fontSize: '1.05rem' }}
          >
            전화 문의 {clinic.phoneDisplay}
          </a>
        </div>
      </section>

      <SiteFooter isEnglish={false} />
    </main>
  );
}
