import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TreatmentDetail from '../../components/TreatmentDetail';
import { SITE_URL, getTreatment, treatments } from '../../lib/clinic';

export function generateStaticParams() {
  return [
    ...treatments.map(({ slug }) => ({ slug })),
    { slug: 'stress-neurosis' },
    { slug: 'weight-metabolism' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const treatment = getTreatment(slug);
  if (!treatment) return {};

  const pageUrl = `${SITE_URL}/treatments/${treatment.slug}`;
  const imageUrl = `${SITE_URL}/images/clinic/${treatment.image.includes('.') ? treatment.image : `${treatment.image}.webp`}`;

  if (slug === 'autonomic-qeeg') {
    return {
      title: {
        absolute: '마곡 자율신경실조증 치료·뇌파검사 클리닉 - 오브한의원',
      },
      description:
        '오브한의원의 정량화뇌파(QEEG) 및 자율신경 진단 시스템. 만성피로, 수면장애, 브레인포그, 가슴 두근거림 등 자율신경실조증의 근본 원인을 파악하고 맞춤 한약과 추나로 치료합니다.',
      alternates: {
        canonical: pageUrl,
        languages: { ko: pageUrl, en: `${SITE_URL}/en/treatments/${treatment.slug}` },
      },
      openGraph: {
        title: '마곡 자율신경실조증 치료·뇌파검사 클리닉 - 오브한의원',
        description:
          '오브한의원의 정량화뇌파(QEEG) 및 자율신경 진단 시스템. 만성피로, 수면장애, 브레인포그, 가슴 두근거림 등 자율신경실조증의 근본 원인을 파악하고 맞춤 한약과 추나로 치료합니다.',
        url: pageUrl,
        siteName: '오브한의원 마곡점',
        locale: 'ko_KR',
        type: 'website',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: '자율신경실조증 · QEEG 뇌파검사',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: '마곡 자율신경실조증 치료·뇌파검사 클리닉 - 오브한의원',
        description:
          '오브한의원의 정량화뇌파(QEEG) 및 자율신경 진단 시스템. 만성피로, 수면장애, 브레인포그, 가슴 두근거림 등 자율신경실조증의 근본 원인을 파악하고 맞춤 한약과 추나로 치료합니다.',
        images: [imageUrl],
      },
    };
  }

  return {
    title: treatment.title.ko,
    description: treatment.summary.ko,
    alternates: {
      canonical: pageUrl,
      languages: { ko: pageUrl, en: `${SITE_URL}/en/treatments/${treatment.slug}` },
    },
    openGraph: {
      title: `${treatment.title.ko} | 오브한의원 마곡점`,
      description: treatment.summary.ko,
      url: pageUrl,
      siteName: '오브한의원 마곡점',
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: treatment.title.ko,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${treatment.title.ko} | 오브한의원 마곡점`,
      description: treatment.summary.ko,
      images: [imageUrl],
    },
  };
}

export default async function KoreanTreatmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const treatment = getTreatment(slug);
  if (!treatment) notFound();
  return <TreatmentDetail treatment={treatment} locale="ko" />;
}
