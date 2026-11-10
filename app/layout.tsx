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
        "name": "오브한의원 습식 QEEG 정밀 검사 및 비급여 진료 항목",
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
        {"@type": "Organization", "name": "대한뇌파한의학회"},
        {"@type": "Organization", "name": "척추신경추나의학회"}
      ]
    }
  ]
};

const officialFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://orbmed.co.kr/#faq",
  "isPartOf": {
    "@id": "https://orbmed.co.kr/#organization"
  },
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Q. 대학병원 종합검진(CT·MRI·혈액검사)에서 '이상 없음'인데 왜 계속 아프고 힘든가요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CT나 MRI는 뇌출혈이나 종양 같은 구조적 기질 병변만 확인할 뿐, 신경망의 미세 과열이나 교감·부교감신경의 기능적 조절 장애는 감지할 수 없기 때문입니다.\n\n• 구조와 기능의 차이: 컴퓨터 부품(하드웨어)에 이상이 없어도 시스템 프로그램(소프트웨어)이 꼬이면 렉이 걸리듯, 뇌세포의 기질적 파괴가 없더라도 신경망 신호 교란으로 심한 신체화 증상이 발생합니다.\n• 객관적 기능 지표 측정: 오브한의원은 보이지 않는 신경계 기능 이상을 습식 정량화 뇌파(QEEG)와 심박변이도(HRV)로 측정하여, 표준 건강 대조군 대비 신경망 과열 상태(Z-score)를 시각화합니다.\n• 신경계 항상성 복원: 검사 결과에 기반하여 뇌 과열을 식히는 표적 한약과 척추 긴장을 감압하는 추나요법으로 무너진 자율신경의 자율 회복을 돕습니다."
      }
    },
    {
      "@type": "Question",
      "name": "Q. 오브한의원의 '습식 정량화 뇌파(QEEG)'는 일반 밴드형 검사기기와 어떻게 다른가요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "의료용 전도성 겔을 사용하여 두피 저항을 5kΩ(킬로옴) 이하로 낮추고, 국제 10-20 표준 전극 시스템으로 전뇌(Full-Head)를 정밀 분석하는 병원급 정밀 진단 시스템입니다.\n\n• 피부 저항 및 잡파 극소화: 시중의 건식 이마 밴드는 땀과 피지, 근육 움직임(잡파)에 취약한 반면, 의료용 습식 전극은 피부 접촉 저항을 극소화하여 대뇌 피질의 미세 마이크로볼트(μV) 신호까지 정밀 포착합니다.\n• 전뇌 3차원 활성도 맵핑: 전두엽·측두엽·두정엽·후두엽 전뇌를 커버하며, 국제 공인 표준 데이터베이스(Normative DB) 대조를 통해 델타·세타·알파·베타파의 불균형을 3차원 입체 지도로 확인합니다.\n• 치료 전후 객관적 검증: 주관적 설문지에만 의존하지 않고, 치료 경과에 따른 뇌신경망 과각성 완화를 수치화된 데이터로 입증합니다."
      }
    },
    {
      "@type": "Question",
      "name": "Q. 정신과 약(항불안제, 신경안정제, 수면제)을 복용 중인데 한약이나 추나 치료를 병행해도 안전한가요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "네, 기존에 처방받아 복용 중이신 신경정신과 약물을 임의로 중단하지 않고 안전하게 병행 치료를 진행할 수 있습니다.\n\n• 치료 표적의 분리: 정신과 약물이 대뇌 시냅스 수용체를 진정시키는 동안, 맞춤 한약은 장-뇌 축(Brain-Gut Axis) 신경염증을 다스리고 척추 추나 치료는 몸에서 뇌로 올라가는 물리적 과부하를 감압합니다.\n• 단계적 감량(Tapering) 협력: 뇌파(QEEG) 및 자율신경(HRV) 지표 호전이 확인되면, 환자분의 경과에 맞춰 기존 처방의와 상의하며 단계적으로 약물 의존도를 낮출 수 있도록 돕습니다."
      }
    },
    {
      "@type": "Question",
      "name": "Q. 자율신경실조증 치료 기간과 권장 내원 주기는 어떻게 되나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "증상이 심한 초기 4~8주는 주 1~2회 집중 내원 치료를 권장하며, 신경계가 안정권에 접어들면 주기를 2~4주로 점진적으로 넓혀갑니다.\n\n• 초기 집중 치료기 (4~8주): 급성 두근거림, 불면, 브레인포그 등 신체화 증상을 조절하기 위해 1:1 맞춤 한약과 주 1~2회 뇌신경 추나요법·약침 치료를 병행합니다.\n• 항상성 안정기 (2~3개월 이후): 신경망 과열이 가라앉으면 내원 주기를 격주 또는 월 1회로 넓혀, 신체 스스로 균형을 유지할 수 있도록 돕습니다.\n• 원거리 환자 맞춤 프로그램: 지방이나 해외 등 정기 내원이 어려운 경우, 정밀 검사 후 맞춤 한약 처방 중심과 비대면 생활지도 관리 프로토콜로 전환하여 진행할 수 있습니다."
      }
    },
    {
      "@type": "Question",
      "name": "Q. 검사 및 치료 비용은 어떻게 책정되어 있나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "기본 침구치료와 추나요법은 국민건강보험이 적용되며, 정밀 기능 검사 및 비급여 맞춤 한약은 신경계 회복 단계에 따라 정찰제로 투명하게 운영됩니다.\n\n• 건강보험 적용 항목: 척추 정렬과 근막 긴장을 이완하는 뇌신경 추나요법 및 침구 치료는 국민건강보험이 적용됩니다.\n• 신경계 정밀 기능 검사: 자율신경과 뇌기능 활성도를 교차 분석하는 습식 QEEG 뇌파검사 및 HRV 검사는 검사 구성에 따라 5~6만 원 선으로 진행됩니다.\n• 1:1 맞춤 치료한약: 중추 신경염증 완화와 뇌신경망 조절을 위한 맞춤 한약(비녹용 기준)은 1개월 45만 원, 단계별 3개월 치료 과정은 120만 원으로 구성되어 있습니다."
      }
    },
    {
      "@type": "Question",
      "name": "Q. 신경안정제를 먹어도 약 기운이 떨어지면 증상이 왜 자꾸 되살아나나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "고통의 발화점이 뇌의 문제(하행성)뿐만 아니라, 굳은 등과 비정상적인 복압(IAP) 등 몸에서 뇌로 끊임없이 치고 올라오는 '상향식 기계적 스트레스'에 있기 때문입니다.\n\n• 미주신경의 80%는 상향식 경로: 장기와 뇌를 잇는 핵심 부교감신경인 미주신경 섬유의 약 80%는 신체 말초에서 뇌로 올라가는 구심성 신경입니다. 굽은 흉추와 복압 상승은 뇌로 지속적인 비상 신호를 쏘아 올립니다.\n• 화재 경보기와 발화점의 비유: 화재 경보기가 울릴 때 귀마개(신경안정제)를 낀다고 불이 꺼지지 않듯, 신체 말초의 물리적 장력을 풀지 않으면 약효가 끝난 후 뇌는 다시 비상사태로 인식합니다.\n• 상향식·하향식 통합 치료: 상부경추 추나요법으로 물리적 압박을 먼저 감압(상향식)하고 맞춤 한약으로 뇌의 신경염증을 식혀야(하향식) 신경계의 자율 회복을 기대할 수 있습니다."
      }
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(officialFaqJsonLd, null, 2),
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
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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
