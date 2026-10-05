import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '오브한의원 마곡점 홈페이지 개인정보 및 분석 도구 안내.',
  alternates: { canonical: '/privacy', languages: { ko: '/privacy', en: '/en/privacy' } },
};

export default function PrivacyPage() {
  return (
    <main className="site-shell policy-page">
      <SiteHeader locale="ko" compact />
      <article className="policy-content">
        <p className="eyebrow">PRIVACY</p>
        <h1>개인정보처리방침</h1>
        <p className="policy-date">시행일 2026년 10월 2일</p>
        <section>
          <h2>홈페이지에서 수집하는 정보</h2>
          <p>이 홈페이지는 별도의 상담 폼이나 회원가입 기능을 운영하지 않습니다. 예약은 네이버 예약으로, 전화 문의는 이용자의 전화 앱으로 연결됩니다.</p>
        </section>
        <section>
          <h2>접속 통계</h2>
          <p>서비스 개선과 방문 현황 파악을 위해 Google Analytics 4를 사용합니다. 이 과정에서 접속 환경, 방문 페이지, 유입 경로와 같은 이용 정보가 Google의 정책에 따라 처리될 수 있습니다.</p>
        </section>
        <section>
          <h2>외부 서비스</h2>
          <p>네이버 예약과 네이버·카카오·구글 지도 링크를 선택하면 해당 서비스의 개인정보처리방침이 적용됩니다.</p>
        </section>
        <section>
          <h2>문의</h2>
          <p>홈페이지 개인정보 관련 문의는 오브한의원 마곡점 대표전화 02-6959-5982로 연락해 주세요.</p>
        </section>
        <Link className="back-link" href="/">← 홈페이지로 돌아가기</Link>
      </article>
    </main>
  );
}
