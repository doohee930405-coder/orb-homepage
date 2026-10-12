import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TreatmentDetail from '../../../components/TreatmentDetail';
import { SITE_URL, clinic, getTreatment, treatments } from '../../../lib/clinic';

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

  const pageUrl = `${SITE_URL}/en/treatments/${treatment.slug}`;
  const imageUrl = `${SITE_URL}/images/clinic/${treatment.image.includes('.') ? treatment.image : `${treatment.image}.webp`}`;

  return {
    title: treatment.title.en,
    description: treatment.summary.en,
    alternates: {
      canonical: pageUrl,
      languages: { ko: `${SITE_URL}/treatments/${treatment.slug}`, en: pageUrl },
    },
    openGraph: {
      title: `${treatment.title.en} | ${clinic.nameEn}`,
      description: treatment.summary.en,
      url: pageUrl,
      siteName: clinic.nameEn,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: treatment.title.en,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${treatment.title.en} | ${clinic.nameEn}`,
      description: treatment.summary.en,
      images: [imageUrl],
    },
  };
}

export default async function EnglishTreatmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const treatment = getTreatment(slug);
  if (!treatment) notFound();
  return <TreatmentDetail treatment={treatment} locale="en" />;
}
