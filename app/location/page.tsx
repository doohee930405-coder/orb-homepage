import type { Metadata } from 'next';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import MedicalJsonLd from '../components/MedicalJsonLd';
import TrackedLink from '../components/TrackedLink';
import { SITE_URL, clinic } from '../lib/clinic';

export const metadata: Metadata = {
  title: '오시는 길 · 진료시간 · 주차 안내 | 오브한의원 마곡점',
  description: '마곡나루역 5번 출구 도보 1분 (136m). 서울 강서구 마곡중앙로 111, 롯데캐슬 르웨스트 104동 2층. 평일 야간진료(20:20까지), 토요일 진료, 건물 지하주차장 완비.',
  alternates: {
    canonical: `${SITE_URL}/location`,
  },
  openGraph: {
    title: '오시는 길 · 진료시간 · 주차 안내 | 오브한의원 마곡점',
    description: '마곡나루역 5번 출구 도보 136m, 롯데캐슬 르웨스트 104동 2층. 평일 20:20까지 야간진료, 주차 가능.',
    url: `${SITE_URL}/location`,
    siteName: '오브한의원 마곡점',
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
        pageTitle="오시는 길 · 진료시간 · 주차 안내 | 오브한의원 마곡점"
        pageDescription="마곡나루역 5번 출구 136m, 롯데캐슬 르웨스트 104동 2층 238호·239호. 평일 야간진료, 주차 완비."
        breadcrumbs={[
          { name: '홈', url: SITE_URL },
          { name: '오시는 길', url: canonicalUrl },
        ]}
        locale="ko"
      />
      <SiteHeader locale="ko" compact />

      <section className="detail-hero">
        <div className="detail-hero-copy">
          <nav className="breadcrumbs" aria-label="현재 위치">
            <a href="/">홈</a><span>/</span><span>오시는 길</span>
          </nav>
          <p className="eyebrow">LOCATION & HOURS</p>
          <h1>오시는 길 및 진료시간 안내</h1>
          <p>
            9호선·공항철도 마곡나루역 5번 출구에서 가볍게 걸어오실 수 있습니다.
            바쁜 직장인 분들을 위해 평일 매일 저녁 8시 20분까지 야간진료를 시행합니다.
          </p>
        </div>
      </section>

      <section className="visit-section" id="directions" style={{ paddingTop: '40px' }}>
        <div className="visit-layout">
          <div className="visit-details">
            <dl>
              <div>
                <dt>주소</dt>
                <dd>{clinic.addressKo}</dd>
              </div>
              <div>
                <dt>지하철</dt>
                <dd>9호선·공항철도 마곡나루역 5번 출구에서 도보 136m (도보 약 1분)</dd>
              </div>
              <div>
                <dt>건물 안에서</dt>
                <dd>지하 2층에서 상가용 엘리베이터를 이용해 104동 2층 238·239호로 올라오세요.</dd>
              </div>
              <div>
                <dt>주차 안내</dt>
                <dd>건물 지하주차장 이용 가능합니다. 상가용과 입주민용 엘리베이터 입구가 분리되어 있습니다.</dd>
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
              title="오브한의원 마곡점 위치 지도"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <nav className="map-links" aria-label="지도 바로가기 링크">
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

      <section className="contact-section detail-contact">
        <p className="contact-slogan">“다시 건강의 궤도(ORBit) 위로”</p>
        <p className="eyebrow">RESERVATION</p>
        <h2>진료 예약과 문의</h2>
        <p>네이버톡톡/ 카카오톡 으로 언제든 문의주세요</p>
        <a className="contact-phone" href={clinic.phoneHref}>
          {clinic.phoneDisplay}
        </a>
      </section>

      <SiteFooter isEnglish={false} />
    </main>
  );
}
