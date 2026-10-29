import type { Metadata } from 'next';
import ClinicHome from './components/ClinicHome';
import { getAllColumns } from './lib/columns';
import { ensureQeegBrainmapImage } from './lib/syncImages';

export const metadata: Metadata = {
  title: {
    absolute: '오브한의원 마곡점 - 자율신경계·정량화뇌파·통증·다이어트',
  },
  description:
    '마곡 롯데캐슬 르웨스트 104동 오브한의원입니다. 정량화뇌파(QEEG) 검사, 자율신경실조증, 통증 추나, 맞춤 다이어트 진료 안내.',
  openGraph: {
    title: '오브한의원 마곡점 - 자율신경계·정량화뇌파·통증·다이어트',
    description:
      '마곡 롯데캐슬 르웨스트 104동 오브한의원입니다. 정량화뇌파(QEEG) 검사, 자율신경실조증, 통증 추나, 맞춤 다이어트 진료 안내.',
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
    content: '',
    category: col.category,
    author: col.author,
    date: col.date,
    tags: col.tags || [],
    thumbnail: col.thumbnail,
  }));
  return <ClinicHome locale="ko" latestColumns={allColumns} />;
}
