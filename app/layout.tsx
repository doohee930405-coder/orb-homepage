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
    default: '오브한의원 마곡점 | 자율신경실조증·신경정신·QEEG 뇌파정밀검사 중점한의원',
    template: '%s | 오브한의원 마곡점',
  },
  description:
    '서울 강서구 마곡역 롯데캐슬 르웨스트 위치. 자율신경실조증, 신경정신 질환, 만성피로 중점 진료. 다채널 습식 정량화뇌파(qEEG)와 심박변이도(HRV) 데이터를 기반으로 한 신경-구조 융합 근원 치료.',
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
    title: '오브한의원 마곡점 | 자율신경실조증·신경정신·QEEG 뇌파정밀검사 중점한의원',
    description:
    '서울 강서구 마곡역 롯데캐슬 르웨스트 위치. 자율신경실조증, 신경정신 질환, 만성피로 중점 진료. 다채널 습식 정량화뇌파(qEEG)와 심박변이도(HRV) 데이터를 기반으로 한 신경-구조 융합 근원 치료.',
    url: '/',
    siteName: '오브한의원 마곡점',
    locale: 'ko_KR',
    type: 'website',
  },
};

const integratedSchemaJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": [
        "MedicalOrganization",
        "MedicalClinic"
      ],
      "@id": "https://orbmed.co.kr/#organization",
      "name": "오브한의원 마곡점",
      "alternateName": [
        "오브한의원",
        "ORBMED"
      ],
      "url": "https://orbmed.co.kr",
      "telephone": "02-6959-5982",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "마곡중앙로 111, 롯데캐슬 르웨스트 104동 2층 238호·239호",
        "addressLocality": "강서구",
        "addressRegion": "서울특별시",
        "addressCountry": "KR"
      },
      "medicalSpecialty": [
        "자율신경실조증",
        "정량뇌파검사(qEEG)",
        "뇌신경추나",
        "만성피로·브레인포그"
      ],
      "sameAs": [
        "https://m.place.naver.com/hospital/2005324011/home",
        "https://blog.naver.com/orbmed"
      ],
      "physician": {
        "@id": "https://orbmed.co.kr/#physician"
      }
    },
    {
      "@type": "Physician",
      "@id": "https://orbmed.co.kr/#physician",
      "name": "전두희",
      "jobTitle": "대표원장 / 한의사",
      "worksFor": {
        "@id": "https://orbmed.co.kr/#organization"
      },
      "memberOf": [
        "대한한의사협회",
        "대한뇌파한의학회",
        "척추신경추나의학회",
        "대한한방비만학회",
        "대한통합암학회"
      ],
      "medicalSpecialty": [
        "자율신경실조증",
        "정량뇌파검사(qEEG)",
        "뇌신경추나",
        "만성피로·브레인포그"
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://orbmed.co.kr/#faq",
      "isPartOf": {
        "@id": "https://orbmed.co.kr/#organization"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "name": "대학병원 종합검진(CT·MRI·혈액검사)에서 '이상 없음'인데 왜 계속 아프고 힘든가요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CT, MRI, 일반 혈액검사는 뇌의 형태적 파괴나 뇌출혈, 종양 같은 기질적 병변을 진단하는 장비입니다. 반면 만성피로, 어지럼증, 가슴 두근거림, 브레인포그, 소화불량 등은 신경망의 기능적 과열 및 교감·부교감신경의 조절 불균형에서 시작됩니다. 오브한의원은 다채널 습식 정량화 뇌파검사(qEEG)와 심박변이도(HRV) 자율신경 검사를 통해 눈에 보이지 않던 신경계의 기능적 과부하를 객관적 Z-score 수치로 규명합니다."
          }
        },
        {
          "@type": "Question",
          "name": "오브한의원의 '다채널 습식 정량화 뇌파검사(qEEG)'는 일반 밴드형 검사와 어떻게 다른가요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "시중의 간이 건식 밴드는 이마 부위 2~4개 채널만 측정하여 두피 저항과 땀, 잡파 노이즈에 매우 취약합니다. 오브한의원의 다채널 습식 qEEG는 국제 10-20 표준 전극 시스템을 준수하여 전두엽, 측두엽, 두정엽, 후두엽 전뇌를 커버합니다. 의료용 전도성 겔(Gel)로 임피던스를 극소화하고, 수만 건의 건강인 표준 Normative DB와 비교 대조하여 뇌 피질 신경망 과열과 저하 상태를 3차원 입체 지도로 시각화합니다."
          }
        },
        {
          "@type": "Question",
          "name": "정신과 약(항불안제, 수면제, 항우울제)을 복용 중인데 한약이나 추나 치료를 함께 받을 수 있나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "네, 충분히 병행 치료가 가능합니다. 복용 중이신 신경정신과 약물을 임의로 갑자기 중단하면 반동 현상이나 금단 증상이 발생할 수 있으므로, 기존 약물을 안정적으로 유지하면서 병행 진료를 시작합니다. 뇌 중추 과열을 식히는 1:1 맞춤 한약과 두경부 긴장을 완화하는 상부경추 뇌신경 추나요법을 통해 뇌의 자율 회복력을 높여가며, 호전 경과에 따라 안전하게 감량 및 단약(Tapering)을 돕습니다."
          }
        },
        {
          "@type": "Question",
          "name": "자율신경실조증 치료 기간과 내원 주기는 보통 어떻게 되나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "증상의 유병 기간과 신경계 피로도에 따라 차이가 있으나, 초기 신체화 증상(두근거림, 불면, 두중감, 감각과민)이 심한 4~8주 동안은 주 1~2회 내원하여 뇌신경 추나요법과 약침 치료를 병행하고 1:1 맞춤 한약을 복용합니다. 신경계 항상성이 안정권에 접어들면 내원 주기를 점진적으로 넓혀 스스로 활력을 유지할 수 있도록 돕습니다."
          }
        }
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
            __html: JSON.stringify(integratedSchemaJsonLd),
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
