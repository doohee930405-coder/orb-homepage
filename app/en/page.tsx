import type { Metadata } from 'next';
import ClinicHome from '../components/ClinicHome';
import { getAllColumns } from '../lib/columns';
import { ensureQeegBrainmapImage } from '../lib/syncImages';

export const metadata: Metadata = {
  title: 'ORB Korean Medicine Clinic Magok',
  description:
    'English guide to ORB Korean Medicine Clinic near Magongnaru Station Exit 5. Pain and Chuna care, autonomic and QEEG assessment, heat metabolism care, and medical diet management.',
  alternates: {
    canonical: '/en',
    languages: { ko: '/', en: '/en' },
  },
  openGraph: {
    title: 'ORB Korean Medicine Clinic Magok',
    description: 'Clinic and appointment information near Magongnaru Station Exit 5 in Seoul.',
    url: '/en',
    locale: 'en_US',
  },
};

export default function EnglishHome() {
  ensureQeegBrainmapImage();
  const latestColumns = getAllColumns().slice(0, 3);
  return <ClinicHome locale="en" latestColumns={latestColumns} />;
}
