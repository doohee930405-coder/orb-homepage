import type { Metadata } from 'next';
import ClinicHome from './components/ClinicHome';
import { getAllColumns } from './lib/columns';
import { ensureQeegBrainmapImage } from './lib/syncImages';

export const metadata: Metadata = {
  title: {
    absolute: '오브한의원 마곡점 | 뇌파검사·자율신경·신경정신 클리닉 (마곡나루역)',
  },
  description:
    '마곡나루역 5번 출구, 전국 각지에서 찾는 습식 정량화 뇌파(QEEG) 기반 자율신경실조증·신경정신 중점 오브한의원 마곡점. 뇌 기능과 자율신경계 불균형을 정밀 분석하여 개인별 맞춤 한의학 치료를 제시합니다.',
  openGraph: {
    title: '오브한의원 마곡점 | 뇌파검사·자율신경·신경정신 클리닉 (마곡나루역)',
    description:
      '습식 정량화 뇌파(QEEG)로 뇌와 자율신경의 연결고리를 정밀 진단하는 오브한의원 마곡점입니다.',
    url: '/',
    siteName: '오브한의원 마곡점',
    locale: 'ko_KR',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
