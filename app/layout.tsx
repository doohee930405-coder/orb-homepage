import type { Metadata } from 'next';
import FloatingCtaBar from './components/FloatingCtaBar';
import AdminShortcutListener from './components/AdminShortcutListener';
import './globals.css';

const googleAnalyticsId =
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim() || 'G-GQX6CVFZ7X';
const hasGoogleAnalyticsId = Boolean(
  googleAnalyticsId && /^G-[A-Z0-9]+$/.test(googleAnalyticsId),
);

export const metadata: Metadata = {
  metadataBase: new URL('https://www.orbmed.co.kr'),
  title: {
    default: '오브한의원 마곡점 | 마곡 오브한의원',
    template: '%s | 오브한의원 마곡점',
  },
  description:
    '마곡나루역 5번 출구 오브한의원 마곡점. 정량화 뇌파검사, 자율신경실조증, 브레인포그, 다이어트 등 근본 치료와 예약 안내.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: {
      ko: '/',
      en: '/en',
    },
  },
  openGraph: {
    title: '오브한의원 마곡점 | ORB Korean Medicine Clinic',
    description:
      '마곡나루역 5번 출구 오브한의원 마곡점 진료·공간·예약 안내.',
    url: '/',
    siteName: '오브한의원 마곡점',
    locale: 'ko_KR',
    type: 'website',
  },
};

const clinicJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: '오브한의원 마곡점',
  alternateName: 'ORBMED CLINIC',
  url: 'https://orbmed.co.kr',
  logo: 'https://orbmed.co.kr/logo.png',
  description:
    '마곡나루역 위치, 습식 정량화 뇌파(qEEG) 및 자율신경 검사 기반 뇌신경·자율신경·통증·다이어트 중점 한의원',
  telephone: '02-6959-5982',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '마곡중앙로 111 롯데캐슬 르웨스트 104동 2층 238호·239호',
    addressLocality: '강서구',
    addressRegion: '서울특별시',
    addressCountry: 'KR',
  },
  medicalSpecialty: ['TraditionalChineseMedicine', 'Neurology'],
  physician: {
    '@type': 'Physician',
    name: '전두희',
    jobTitle: '대표원장',
    description: '한의사, 대한뇌파한의학회 회원, 척추신경추나의학회 회원',
  },
  availableService: [
    {
      '@type': 'MedicalTherapy',
      name: '습식 정량화 뇌파 검사(qEEG)',
    },
    {
      '@type': 'MedicalTherapy',
      name: '자율신경계(HRV) 검사 및 치료',
    },
    {
      '@type': 'MedicalTherapy',
      name: '뇌신경 추나요법',
    },
    {
      '@type': 'MedicalTherapy',
      name: '적외선체열검사(DITI)',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Google tag (gtag.js) */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
        />
        <script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}');
            `,
          }}
        />
        <meta
          name="naver-site-verification"
          content="b19d9d8ee27b50ae5638467a973184ef2e7be5c0"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(clinicJsonLd),
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <FloatingCtaBar />
        <AdminShortcutListener />
      </body>
    </html>
  );
}
