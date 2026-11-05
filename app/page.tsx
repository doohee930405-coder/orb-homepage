import type { Metadata } from 'next';
import ClinicHome from './components/ClinicHome';
import { getAllColumns } from './lib/columns';
import { ensureQeegBrainmapImage } from './lib/syncImages';

export const metadata: Metadata = {
  title: {
    absolute: '오브한의원 마곡점 | 자율신경실조증·신경정신·QEEG 뇌파정밀검사 중점한의원',
  },
  description:
    '서울 강서구 마곡역 롯데캐슬 르웨스트 위치. 자율신경실조증, 신경정신 질환, 만성피로 중점 진료. 다채널 습식 정량화뇌파(qEEG)와 심박변이도(HRV) 데이터를 기반으로 한 신경-구조 융합 근원 치료.',
  openGraph: {
    title: '오브한의원 마곡점 | 자율신경실조증·신경정신·QEEG 뇌파정밀검사 중점한의원',
    description:
      '서울 강서구 마곡역 롯데캐슬 르웨스트 위치. 자율신경실조증, 신경정신 질환, 만성피로 중점 진료. 다채널 습식 정량화뇌파(qEEG)와 심박변이도(HRV) 데이터를 기반으로 한 신경-구조 융합 근원 치료.',
    url: '/',
    siteName: '오브한의원 마곡점',
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
