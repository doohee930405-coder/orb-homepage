import type { Metadata } from 'next';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import MedicalJsonLd from '../components/MedicalJsonLd';
import { SITE_URL } from '../lib/clinic';

export const metadata: Metadata = {
  title: '전국에서 찾아오시는 길',
  description:
    '오브한의원 마곡점은 습식 정량화 뇌파(QEEG) 정밀 검사 및 자율신경 집중 진료를 위해 서울 외 전국의 다양한 지역에서 찾아주고 계십니다. 김포국제공항 5분, 서울역 KTX 15~20분 직결, 9호선 급행·공항철도 마곡나루역 5번 출구 도보 1분.',
  alternates: {
    canonical: `${SITE_URL}/location`,
  },
  openGraph: {
    title: '전국에서 찾아오시는 길 | 오브한의원 마곡점',
    description:
      '오브한의원 마곡점은 습식 정량화 뇌파(QEEG) 정밀 검사 및 자율신경 집중 진료를 위해 서울 외 전국의 다양한 지역에서 찾아주고 계십니다. 김포공항 5분, 서울역 KTX 15분 직결, 마곡나루역 1분.',
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
        pageTitle="전국에서 찾아오시는 길 | 오브한의원 마곡점"
        pageDescription="오브한의원 마곡점은 습식 정량화 뇌파(QEEG) 정밀 검사 및 자율신경 집중 진료를 위해 서울 외 전국의 다양한 지역에서 찾아주고 계십니다. 공항철도 및 9호선 급행 환승역(마곡나루역)과 인접하여 KTX, 고속버스, 항공편을 통한 내원이 편리합니다."
        breadcrumbs={[
          { name: '홈', url: SITE_URL },
          { name: '전국에서 찾아오시는 길', url: canonicalUrl },
        ]}
        locale="ko"
      />
      <SiteHeader locale="ko" compact />

      {/* Hero Header with Semantic H1 within Container Boundaries */}
      <section className="nationwide-hero-section">
        <div className="nationwide-hero-container">
          <div className="nationwide-hero-copy">
            <nav className="breadcrumbs" aria-label="현재 위치">
              <a href="/">홈</a>
              <span>/</span>
              <span>전국에서 찾아오시는 길</span>
            </nav>
            <p className="eyebrow">NATIONWIDE ACCESSIBILITY & DIRECTIONS</p>
            <h1>전국에서 찾아오시는 길</h1>
            <p className="nationwide-hero-lead">
              오브한의원 마곡점은 습식 정량화 뇌파(QEEG) 정밀 검사 및 자율신경 집중 진료를 위해 서울 외 전국의 다양한 지역에서 찾아주고 계십니다. 공항철도 및 9호선 급행 환승역(마곡나루역)과 인접하여 KTX, 고속버스, 항공편을 통한 내원이 편리합니다.
            </p>
          </div>

          {/* Right Column: 2x2 Square 4-Quadrant Widget */}
          <div className="nationwide-hero-visual">
            <div className="access-quad-square" role="region" aria-label="전국 접근성 핵심 요약">
              <div className="quad-item quad-top-left">
                <span className="badge-sub">항공편 직결</span>
                <strong className="badge-val">김포공항 5분</strong>
                <span className="badge-desc">공항철도/9호선 단 1정거장</span>
              </div>
              <div className="quad-item quad-top-right">
                <span className="badge-sub">KTX 열차</span>
                <strong className="badge-val">서울역 15~20분</strong>
                <span className="badge-desc">공항철도 다이렉트 연결</span>
              </div>
              <div className="quad-item quad-bottom-left">
                <span className="badge-sub">지하철 초역세권</span>
                <strong className="badge-val">마곡나루역 도보 1분</strong>
                <span className="badge-desc">5번 출구 지하 연결통로</span>
              </div>
              <div className="quad-item quad-bottom-right">
                <span className="badge-sub">운영 원칙</span>
                <strong className="badge-val">100% 사전 예약제</strong>
                <span className="badge-desc">원거리 맞춤 당일 정밀 검사</span>
              </div>
            </div>
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
        </div>
      </section>

      <SiteFooter isEnglish={false} />
    </main>
  );
}
