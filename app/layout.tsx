import type { Metadata } from 'next';
import FloatingCtaBar from './components/FloatingCtaBar';
import AdminShortcutListener from './components/AdminShortcutListener';
import SitePageViewTracker from './components/SitePageViewTracker';
import './globals.css';

const googleAnalyticsId =
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim() || 'G-GQX6CVFZ7X';
const hasGoogleAnalyticsId = Boolean(
  googleAnalyticsId && /^G-[A-Z0-9]+$/.test(googleAnalyticsId),
);

export const metadata: Metadata = {
  metadataBase: new URL('https://orbmed.co.kr'),
  title: {
    default: '오브한의원 마곡점 | 뇌파검사·자율신경·신경정신 클리닉 (마곡나루역)',
    template: '%s | 오브한의원 마곡점',
  },
  description:
    '마곡나루역 5번 출구, 전국 각지에서 찾는 습식 정량화 뇌파(QEEG) 기반 자율신경실조증·신경정신 중점 오브한의원 마곡점. 뇌 기능과 자율신경계 불균형을 정밀 분석하여 개인별 맞춤 한의학 치료를 제시합니다.',
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
    title: '오브한의원 마곡점 | 뇌파검사·자율신경·신경정신 클리닉 (마곡나루역)',
    description:
      '습식 정량화 뇌파(QEEG)로 뇌와 자율신경의 연결고리를 정밀 진단하는 오브한의원 마곡점입니다.',
    url: '/',
    siteName: '오브한의원 마곡점',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/images/clinic/naver-qeeg-wide.webp',
        width: 1200,
        height: 630,
        alt: '오브한의원 마곡점 습식 정량화 뇌파(QEEG) 및 자율신경 검사',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '오브한의원 마곡점 | 뇌파검사·자율신경·신경정신 클리닉 (마곡나루역)',
    description:
      '습식 정량화 뇌파(QEEG)로 뇌와 자율신경의 연결고리를 정밀 진단하는 오브한의원 마곡점입니다.',
    images: ['/images/clinic/naver-qeeg-wide.webp'],
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

const exactOfficialOrgAndPhysicianJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["MedicalClinic", "MedicalOrganization"],
      "@id": "https://orbmed.co.kr/#organization",
      "name": "오브한의원 마곡점",
      "alternateName": ["오브한의원", "ORB Korean Medicine Clinic"],
      "description": "마곡나루역 5번 출구, 전국 각지에서 찾는 습식 정량화 뇌파(QEEG) 기반 자율신경실조증·신경정신 중점 오브한의원 마곡점. 습식 정량화 뇌파(Wet QEEG) 및 심박변이도(HRV) 정밀 진단과 개인별 맞춤 한의학 치료.",
      "url": "https://orbmed.co.kr",
      "telephone": "+82-2-6959-5982",
      "priceRange": "₩₩",
      "currenciesAccepted": "KRW",
      "paymentAccepted": "Cash, Credit Card, Naver Pay",
      "areaServed": [
        "전국",
        "대한민국",
        "서울특별시",
        "강서구",
        "마곡"
      ],
      "medicalSpecialty": [
        "자율신경실조증",
        "신경정신",
        "뇌파검사",
        "정량화뇌파검사(qEEG)",
        "습식 뇌파검사(Wet QEEG)",
        "뇌신경추나",
        "Neurology",
        "Psychiatry",
        "TraditionalChineseMedicine"
      ],
      "knowsAbout": [
        "https://en.wikipedia.org/wiki/Quantitative_electroencephalography",
        "https://en.wikipedia.org/wiki/Dysautonomia",
        "https://en.wikipedia.org/wiki/Brain_fog",
        "자율신경실조증",
        "습식 정량화뇌파",
        "Wet QEEG",
        "19-Channel Wet QEEG",
        "신경정신",
        "브레인포그",
        "뇌신경추나"
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "마곡중앙로 111, 롯데캐슬 르웨스트 104동 2층 238호·239호",
        "addressLocality": "강서구",
        "addressRegion": "서울특별시",
        "postalCode": "07789",
        "addressCountry": "KR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 37.5667,
        "longitude": 126.8273
      },
      "hasMap": "https://maps.google.com/?cid=12644243679883584852",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "10:30",
          "closes": "20:20"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Saturday"],
          "opens": "13:00",
          "closes": "18:00"
        }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "오브한의원 마곡점 습식 QEEG 정밀 검사 및 비급여 진료 항목",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "MedicalTest",
              "name": "습식 정량화 뇌파(Wet QEEG) & 심박변이도(HRV) 자율신경 동시 검사"
            },
            "price": "50000-60000",
            "priceCurrency": "KRW",
            "description": "Wet QEEG 국제 10-20 표준 전극 시스템 기준 Normative DB Z-score 정밀 분석 (50,000 ~ 60,000 KRW)"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "MedicalTherapy",
              "name": "1:1 체질 맞춤 뇌신경 치료한약 (1개월)"
            },
            "price": "450000",
            "priceCurrency": "KRW",
            "description": "GABA 억제성 신경망 교란 완화 및 자율신경 항상성 회복 1:1 맞춤 치료한약 (1개월 기준 450,000 KRW)"
          }
        ]
      },
      "availableService": [
        {
          "@type": "MedicalTherapy",
          "name": "습식 정량화 뇌파(Wet QEEG) 및 뇌신경 맞춤 한약"
        },
        {
          "@type": "MedicalTherapy",
          "name": "자율신경 회복을 위한 뇌신경 상부경추 추나요법"
        }
      ],
      "sameAs": [
        "https://m.place.naver.com/hospital/2005324011", 
        "https://blog.naver.com/orbmed"
      ]
    },
    {
      "@type": "Physician",
      "@id": "https://orbmed.co.kr/#physician",
      "name": "전두희",
      "jobTitle": "대표원장",
      "medicalSpecialty": [
        "자율신경실조증",
        "신경정신",
        "정량화뇌파검사(qEEG)",
        "습식 뇌파검사(Wet QEEG)",
        "뇌신경추나"
      ],
      "worksFor": {"@id": "https://orbmed.co.kr/#organization"},
      "memberOf": [
        {"@type": "Organization", "name": "대한한의사협회"},
        {"@type": "Organization", "name": "척추신경추나의학회"},
        {"@type": "Organization", "name": "대한뇌파한의학회"},
        {"@type": "Organization", "name": "대한통합암학회"},
        {"@type": "Organization", "name": "대한한방비만학회"},
        {"@type": "Organization", "name": "대한한의학회"},
        {"@type": "Organization", "name": "한의정보협동조합"}
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(exactOfficialOrgAndPhysicianJsonLd, null, 2),
          }}
        />
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
      </head>
      <body className="antialiased">
        <SitePageViewTracker />
        {children}
        <FloatingCtaBar />
        <AdminShortcutListener />
      </body>
    </html>
  );
}
