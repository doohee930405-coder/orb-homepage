import type { Metadata } from 'next';
import TreatmentDetail from '../components/TreatmentDetail';
import { SITE_URL, getTreatment } from '../lib/clinic';

export const metadata: Metadata = {
  title: '끝내는 다이어트 | 퀀텀핏(온다 동일 기술) & 아큐렉스 라인약침 | 오브한의원 마곡점',
  description: '요요 없는 대사 균형 회복. 온다(ONDA) 리프팅과 동일한 2.45GHz 극초단파 기술력의 퀀텀핏 리프팅과 고농축 천연 아큐렉스 라인약침 듀얼 윤곽 솔루션.',
  alternates: {
    canonical: `${SITE_URL}/treatments/diet`,
  },
  openGraph: {
    title: '끝내는 다이어트 | 퀀텀핏 & 아큐렉스 라인약침 | 오브한의원 마곡점',
    description: '온다(ONDA) 리프팅 동일 기술 퀀텀핏 & 아큐렉스 라인약침 듀얼 컨투어링.',
    url: `${SITE_URL}/treatments/diet`,
    siteName: '오브한의원 마곡점',
    locale: 'ko_KR',
    type: 'website',
    images: [`${SITE_URL}/images/clinic/diet-acurex-line.png`],
  },
};

export default function DietAliasPage() {
  const treatment = getTreatment('diet');
  if (!treatment) return null;
  return <TreatmentDetail treatment={treatment} locale="ko" />;
}
