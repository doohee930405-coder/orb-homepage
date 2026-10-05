import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TreatmentDetail from '../../../components/TreatmentDetail';
import { getTreatment, treatments } from '../../../lib/clinic';

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
    title: treatment.title.en,
    description: treatment.summary.en,
    alternates: {
      canonical: `/en/treatments/${treatment.slug}`,
      languages: { ko: `/treatments/${treatment.slug}`, en: `/en/treatments/${treatment.slug}` },
    },
    openGraph: {
      title: `${treatment.title.en} | ORB Korean Medicine Clinic`,
      description: treatment.summary.en,
      url: `/en/treatments/${treatment.slug}`,
      locale: 'en_US',
    },
  };
}

export default async function EnglishTreatmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const treatment = getTreatment(slug);
  if (!treatment) notFound();
  return <TreatmentDetail treatment={treatment} locale="en" />;
}
