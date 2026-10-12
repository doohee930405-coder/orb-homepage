import type { Metadata } from 'next';
import TreatmentDetail from '../components/TreatmentDetail';
import { SITE_URL, getTreatment } from '../lib/clinic';

export const metadata: Metadata = {
  title: '자율신경 · 정량화 뇌파검사(QEEG) | 오브한의원 마곡점',
  description: '각종 검사상 이상 없음에도 지속되는 만성 피로와 브레인포그. 다채널 습식 정량화 뇌파(QEEG) 및 자율신경 검사 기반 1:1 맞춤 근원 치료.',
  alternates: {
    canonical: `${SITE_URL}/treatments/autonomic-qeeg`,
  },
  openGraph: {
    title: '자율신경 · 정량화 뇌파검사(QEEG) | 오브한의원 마곡점',
    description: '각종 검사상 이상 없음에도 지속되는 만성 피로와 브레인포그. 다채널 습식 정량화 뇌파(QEEG) 기반 근원 치료.',
    url: `${SITE_URL}/treatments/autonomic-qeeg`,
    siteName: '오브한의원 마곡점',
    locale: 'ko_KR',
    type: 'website',
    images: [`${SITE_URL}/images/clinic/naver-qeeg.webp`],
  },
};

export default function QeegAliasPage() {
  const treatment = getTreatment('autonomic-qeeg');
  if (!treatment) return null;
  return <TreatmentDetail treatment={treatment} locale="ko" />;
}
