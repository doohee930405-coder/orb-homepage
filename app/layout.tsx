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
  metadataBase: new URL('https://orbmed.co.kr'),
  title: {
    default: '오브한의원 마곡점 - 자율신경계·정량화뇌파·통증·다이어트',
    template: '%s | 오브한의원 마곡점',
  },
  description:
    '마곡 롯데캐슬 르웨스트 104동 오브한의원입니다. 8채널 정량화뇌파(QEEG) 검사, 자율신경실조증, 통증 추나, 맞춤 다이어트 진료 안내.',
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
    title: '오브한의원 마곡점 - 자율신경계·정량화뇌파·통증·다이어트',
    description:
      '마곡 롯데캐슬 르웨스트 104동 오브한의원입니다. 8채널 정량화뇌파(QEEG) 검사, 자율신경실조증, 통증 추나, 맞춤 다이어트 진료 안내.',
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
  alternateName: ['오브한의원', '마곡 오브한의원'],
  url: 'https://orbmed.co.kr',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '마곡 롯데캐슬 르웨스트 104동',
    addressLocality: '강서구',
    addressRegion: '서울특별시',
    addressCountry: 'KR',
  },
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
