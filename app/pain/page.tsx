import type { Metadata } from 'next';
import TreatmentDetail from '../components/TreatmentDetail';
import { SITE_URL, getTreatment } from '../lib/clinic';

export const metadata: Metadata = {
  title: '통증 · 척추신경 추나요법 | 오브한의원 마곡점',
  description: '목·허리 디스크, 척추관 협착증, 만성 관절통 및 신경 포착 질환. 한의사 1:1 수기 척추신경 추나요법과 소염진통 약침치료.',
  alternates: {
    canonical: `${SITE_URL}/treatments/pain-chuna`,
  },
  openGraph: {
    title: '통증 · 척추신경 추나요법 | 오브한의원 마곡점',
    description: '목·허리 디스크, 협착증, 신경 포착 질환 한의사 1:1 수기 추나요법.',
    url: `${SITE_URL}/treatments/pain-chuna`,
    siteName: '오브한의원 마곡점',
    locale: 'ko_KR',
    type: 'website',
    images: [`${SITE_URL}/images/clinic/naver-consultation.webp`],
  },
};

export default function PainAliasPage() {
  const treatment = getTreatment('pain-chuna');
  if (!treatment) return null;
  return <TreatmentDetail treatment={treatment} locale="ko" />;
}
