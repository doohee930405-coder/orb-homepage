import type { Metadata } from 'next';
import TreatmentDetail from '../components/TreatmentDetail';
import { SITE_URL, getTreatment } from '../lib/clinic';

export const metadata: Metadata = {
  title: {
    absolute: '마곡 자율신경실조증 치료·뇌파검사 클리닉 - 오브한의원',
  },
  description:
    '오브한의원의 정량화뇌파(QEEG) 및 자율신경 진단 시스템. 만성피로, 수면장애, 브레인포그, 가슴 두근거림 등 자율신경실조증의 근본 원인을 파악하고 맞춤 한약과 추나로 치료합니다.',
  alternates: {
    canonical: `${SITE_URL}/treatments/autonomic-qeeg`,
  },
  openGraph: {
    title: '마곡 자율신경실조증 치료·뇌파검사 클리닉 - 오브한의원',
    description:
      '오브한의원의 정량화뇌파(QEEG) 및 자율신경 진단 시스템. 만성피로, 수면장애, 브레인포그, 가슴 두근거림 등 자율신경실조증의 근본 원인을 파악하고 맞춤 한약과 추나로 치료합니다.',
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
