import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TreatmentDetail from '../../components/TreatmentDetail';
import { getTreatment, treatments } from '../../lib/clinic';

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

  return {
    title: treatment.title.ko,
    description: treatment.summary.ko,
    alternates: {
      canonical: `/treatments/${treatment.slug}`,
      languages: { ko: `/treatments/${treatment.slug}`, en: `/en/treatments/${treatment.slug}` },
    },
    openGraph: {
      title: `${treatment.title.ko} | 오브한의원 마곡점`,
      description: treatment.summary.ko,
      url: `/treatments/${treatment.slug}`,
      locale: 'ko_KR',
    },
  };
}

export default async function KoreanTreatmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const treatment = getTreatment(slug);
  if (!treatment) notFound();
  return <TreatmentDetail treatment={treatment} locale="ko" />;
}
