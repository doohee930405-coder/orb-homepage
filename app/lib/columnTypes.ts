export const CLINIC_CATEGORIES = [
  '자율신경실조증',
  '브레인포그',
  '초민감자(HSP)',
  'ADHD',
  '다이어트',
  '위장관',
  '갑상선',
  '정량화뇌파검사',
] as const;

export type ClinicCategory = (typeof CLINIC_CATEGORIES)[number];

export interface ColumnFaq {
  question: string;
  answer: string;
}

export interface Column {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  date: string;
  tags: string[];
  thumbnail: string;
  updatedAt?: string;
  faqs?: ColumnFaq[];
  skipped?: boolean;
  skipReason?: string;
}

export type ColumnInput = Omit<Column, 'id'> & { id?: string };
