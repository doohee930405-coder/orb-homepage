import type { Metadata } from 'next';
import ClinicHome from './components/ClinicHome';
import { getAllColumns } from './lib/columns';
import { ensureQeegBrainmapImage } from './lib/syncImages';

export const metadata: Metadata = {
  title: {
    absolute: '오브한의원 | 습식 정량화뇌파 QEEG 기반 자율신경·신경정신 중점 진료',
  },
  description: '전국 각지에서 찾는 습식 정량화뇌파(QEEG) 기반 자율신경실조증·신경정신 중점 오브한의원. 뇌 기능과 자율신경계 불균형을 정밀 분석하여 개인별 맞춤 한의학 치료를 제시합니다.',
  openGraph: {
    title: '오브한의원 | 습식 정량화뇌파 QEEG 기반 자율신경·신경정신 중점 진료',
    description: '전국 각지에서 찾는 습식 정량화뇌파(QEEG) 기반 자율신경실조증·신경정신 중점 오브한의원. 뇌 기능과 자율신경계 불균형을 정밀 분석하여 개인별 맞춤 한의학 치료를 제시합니다.',
    url: '/',
    siteName: '오브한의원',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function Home() {
  ensureQeegBrainmapImage();
  const allColumns = getAllColumns().map((col) => ({
    id: col.id,
    slug: col.slug,
    title: col.title,
    summary: col.summary,
    snippet: col.snippet || col.summary,
    content: '',
    category: col.category,
    author: col.author,
    date: col.date,
    tags: col.tags || [],
    thumbnail: col.thumbnail,
    views: col.views || 0,
    uv: col.uv || 0,
  }));
  return <ClinicHome locale="ko" latestColumns={allColumns} />;
}
