import React from 'react';
import { SITE_URL, clinic, type Locale } from '../lib/clinic';

export interface MedicalConditionInfo {
  name: string;
  alternateName?: string;
  description: string;
  possibleTreatment?: string[];
  associatedAnatomy?: string[];
}

export interface MedicalTherapyInfo {
  name: string;
  alternateName?: string;
  description: string;
  procedureType?: string;
  bodyLocation?: string[];
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface MedicalJsonLdProps {
  pageUrl?: string;
  pageTitle?: string;
  pageDescription?: string;
  condition?: MedicalConditionInfo;
  therapy?: MedicalTherapyInfo;
  breadcrumbs?: BreadcrumbItem[];
  locale?: Locale;
}

export default function MedicalJsonLd({
  pageUrl = SITE_URL,
  pageTitle,
  pageDescription,
  condition,
  therapy,
  breadcrumbs,
  locale = 'ko',
}: MedicalJsonLdProps) {
  const isEn = locale === 'en';

  // 1. Core MedicalClinic Schema
  const clinicSchema = {
    '@type': 'MedicalClinic',
    '@id': `${SITE_URL}/#clinic`,
    name: isEn ? clinic.nameEn : clinic.nameKo,
    alternateName: isEn ? clinic.nameKo : '오브한의원',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo/orb-symbol-clean.png`,
    image: `${SITE_URL}/images/clinic/hero-lobby-wide.webp`,
    telephone: clinic.phoneDisplay,
    priceRange: '₩₩',
    currenciesAccepted: 'KRW',
    paymentAccepted: 'Cash, Credit Card, Naver Pay',
    medicalSpecialty: [
      'https://schema.org/TraditionalChineseMedicine',
      'https://schema.org/Neurologic',
      'https://schema.org/Musculoskeletal',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: isEn ? clinic.addressEn : '마곡중앙로 111, 롯데캐슬 르웨스트 104동 2층 238호·239호',
      addressLocality: isEn ? 'Gangseo-gu' : '강서구',
      addressRegion: isEn ? 'Seoul' : '서울',
      postalCode: '07593',
      addressCountry: 'KR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.5667,
      longitude: 126.8273,
    },
    hasMap: clinic.googleMapUrl,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:30',
        closes: '20:20',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '13:00',
        closes: '18:00',
      },
    ],
    availableService: [
      {
        '@type': 'MedicalTherapy',
        name: isEn ? 'Quantitative EEG (QEEG) Brain Function Analysis' : '습식 정량화 뇌파검사(QEEG) 및 뇌신경 맞춤 탕약',
      },
      {
        '@type': 'MedicalTherapy',
        name: isEn ? 'Chuna Manual Therapy for Spine & Cranial Nerves' : '척추·두개골 뇌신경 추나요법',
      },
      {
        '@type': 'MedicalTherapy',
        name: isEn ? 'Quantum Fit Microwave & Acurex Line Contouring' : '퀀텀핏(온다 동일 기술) & 아큐렉스 라인약침 다이어트',
      },
      {
        '@type': 'MedicalTherapy',
        name: isEn ? 'Digital Infrared Thermal Imaging (DITI)' : '적외선체열검사(DITI) 및 열대사 순환 치료',
      },
    ],
  };

  // 2. Build graph elements
  const graph: any[] = [clinicSchema];

  // 3. WebSite / WebPage Schema
  const webPageSchema: any = {
    '@type': 'MedicalWebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: pageTitle || (isEn ? clinic.nameEn : clinic.nameKo),
    description: pageDescription || (isEn ? 'Specialized clinic for autonomic, neurocognitive, and pain disorders.' : '자율신경 · 뇌신경 · 통증 중점 의료기관, 오브한의원입니다.'),
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: isEn ? clinic.nameEn : clinic.nameKo,
    },
    about: {
      '@id': `${SITE_URL}/#clinic`,
    },
  };
  graph.push(webPageSchema);

  // 4. Optional MedicalCondition Schema
  if (condition) {
    const conditionSchema: any = {
      '@type': 'MedicalCondition',
      '@id': `${pageUrl}#condition`,
      name: condition.name,
      description: condition.description,
      ...(condition.alternateName ? { alternateName: condition.alternateName } : {}),
      ...(condition.associatedAnatomy
        ? {
            associatedAnatomy: condition.associatedAnatomy.map((anatomy) => ({
              '@type': 'AnatomicalStructure',
              name: anatomy,
            })),
          }
        : {}),
      ...(condition.possibleTreatment
        ? {
            possibleTreatment: condition.possibleTreatment.map((treatmentName) => ({
              '@type': 'MedicalTherapy',
              name: treatmentName,
            })),
          }
        : {}),
    };
    graph.push(conditionSchema);
  }

  // 5. Optional MedicalTherapy Schema
  if (therapy) {
    const therapySchema: any = {
      '@type': 'MedicalTherapy',
      '@id': `${pageUrl}#therapy`,
      name: therapy.name,
      description: therapy.description,
      ...(therapy.alternateName ? { alternateName: therapy.alternateName } : {}),
      ...(therapy.procedureType ? { procedureType: therapy.procedureType } : {}),
      ...(therapy.bodyLocation
        ? {
            bodyLocation: therapy.bodyLocation.map((loc) => ({
              '@type': 'AnatomicalStructure',
              name: loc,
            })),
          }
        : {}),
    };
    graph.push(therapySchema);
  }

  // 6. Optional BreadcrumbList Schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbSchema = {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    };
    graph.push(breadcrumbSchema);
  }

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
    />
  );
}
