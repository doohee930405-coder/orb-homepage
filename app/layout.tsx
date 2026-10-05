import type { Metadata } from 'next';
import FloatingCtaBar from './components/FloatingCtaBar';
import './globals.css';

const googleAnalyticsId =
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim() || 'G-J9Z8BXQGKQ';
const hasGoogleAnalyticsId = Boolean(
  googleAnalyticsId && /^G-[A-Z0-9]+$/.test(googleAnalyticsId),
);

export const metadata: Metadata = {
  metadataBase: new URL('https://orbclinic.pages.dev'),
  title: {
    default: '오브한의원 마곡점 | 마곡 오브한의원',
    template: '%s | 오브한의원 마곡점',
  },
  description:
    '마곡나루역 5번 출구 오브한의원 마곡점. 정량화 뇌파검사, 자율신경실조증, 브레인포그, 다이어트 등 근본 치료와 예약 안내.',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta
          name="naver-site-verification"
          content="26b999aab138fd17209f1024cf45bdf683c32961"
        />
        {hasGoogleAnalyticsId && googleAnalyticsId ? (
          <>
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
          </>
        ) : null}
      </head>
      <body className="antialiased">
        {children}
        <FloatingCtaBar />
      </body>
    </html>
  );
}
