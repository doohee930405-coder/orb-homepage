import Link from 'next/link';
import AutoGallery from './AutoGallery';
import ResponsivePicture from './ResponsivePicture';
import SafeImage from './SafeImage';
import SiteHeader from './SiteHeader';
import SiteMotion from './SiteMotion';
import TrackedLink from './TrackedLink';
import { Column } from '../lib/columns';
import {
  SITE_URL,
  clinic,
  gallery,
  treatmentPath,
  treatments,
  type Locale,
} from '../lib/clinic';

const copy = {
  ko: {
    kicker: 'ORBMED CLINIC',
    title: '오브한의원 마곡점',
    heroBody: '자율신경 · 뇌신경 · 통증 중점 의료기관, 오브한의원입니다',
    booking: '네이버 예약',
    call: '전화 문의',
    station: '마곡나루역 5번 출구에서 136m',
    facts: [
      ['진료시간', '평일 10:30 – 20:20', '토요일 13:00 – 18:00'],
      ['가까운 역', '마곡나루역 5번 출구', '도보 약 1분'],
      ['주차 안내', '건물 지하주차장', '2시간 무료 주차'],
    ],
    diagnosticEyebrow: 'DIAGNOSTIC TECHNOLOGY · QEEG SYSTEM',
    diagnosticTitle: "각종 검사상 '이상 없음'에도 지속되는 고통,\n뇌와 자율신경의 기능적 불균형에서 답을 찾습니다.",
    diagnosticSubtitle: '오브한의원은 습식 정량화 뇌파(QEEG)와 정밀 자율신경 검사를 통해 뇌신경계 피로와 체형 불균형을 객관적 데이터로 진단합니다.',
    diagnosticWhyWet: '왜 정량화 뇌파 분석인가?',
    diagnosticPoints: [
      {
        title: '국제 10-20 시스템',
        desc: '전두엽·측두엽·두정엽·후두엽 전뇌 다각도 정밀 측정 (간이 건식 밴드와의 결정적 차이)',
      },
      {
        title: '초정밀 임피던스 제어 시스템',
        desc: '전도성 겔(Gel)을 도포해 두피 저항을 낮추고 외부 노이즈를 완벽 차단하여 순수 뇌파 포착',
      },
      {
        title: 'Normative DB Z-score 대조',
        desc: '수만 건의 빅데이터 정규분포 대조로 신경 과각성(과열) 및 기능 저하(서파 정체) 정밀 규명',
      },
    ],
    protocolSteps: [
      {
        step: '01',
        phase: 'STEP 01',
        title: '정밀 생체신호 측정',
        subtitle: '다채널 습식 뇌파(qEEG) & 자율신경계(HRV) 동시 측정',
        desc: '두피 핵심 전극 부위에 전도성 겔을 주입하고 정밀 센서를 부착하여, 뇌 피질에서 방출되는 마이크로볼트(μV) 단위의 미세 전기 신호와 심박변이도 생체 신호를 왜곡 없이 정밀 수집합니다.',
        image: '/images/clinic/naver-qeeg-wide.webp',
        tags: ['#국제10_20시스템', '#정밀센서_노이즈차단', '#HRV자율신경평가'],
      },
      {
        step: '02',
        phase: 'STEP 02',
        title: '뇌기능 정량 분석',
        subtitle: '3차원 뇌기능 지형도(3D Brain Map) & Z-Score 판독',
        desc: '수집된 뇌파 데이터를 주파수 대역(델타, 세타, 알파, 베타, 감마)별로 디지털 정량 분석합니다. 수만 건의 데이터베이스와 대조하여 뇌 신경망의 과열(붉은색)과 기능 저하(푸른색)를 3차원 입체 지도로 시각화합니다.',
        image: '/images/clinic/qeeg-brainmap-3d.png',
        tags: ['#빅데이터_DB', '#3D_브레인맵', '#Z_score편차분석'],
      },
      {
        step: '03',
        phase: 'STEP 03',
        title: '맞춤 한약·추나 통합 처방',
        subtitle: '뇌신경-자율신경-체형 3축 연계 근원 치료',
        desc: '분석된 뇌신경 피로도와 자율신경 불균형 데이터를 바탕으로, 중추 과열을 식히는 맞춤 탕약, 상부 경추와 두개골의 긴장을 해소하는 뇌신경 추나요법, 척추 자율신경절을 안정시키는 약침 치료를 1:1 복합 처방합니다.',
        image: '/images/clinic/naver-chuna-wide.webp',
        tags: ['#뇌신경피로_맞춤탕약', '#상부경추_두개추나', '#자율신경_항상성재건'],
      },
    ],
    treatmentEyebrow: 'SPECIALIZED CLINIC DEPARTMENTS',
    treatmentTitle: '원인을 규명하고 근본을 바로잡는\n오브한의원 4대 중점 진료 분야',
    treatmentBody: '단편적인 증상 완화에 그치지 않고 발생 시점, 생활 흐름, 뇌신경계와 자율신경, 척추 체형의 유기적 상관관계를 함께 살핍니다.',
    detail: '자세히 보기',
    philosophyEyebrow: 'OUR APPROACH',
    philosophyTitle: '원인을 살피고,\n회복의 방향을 맞춥니다.',
    philosophyBody: '오브한의원은 설명할 수 있는 진료를 지향합니다. 필요한 검사를 선택하고 결과를 함께 확인하며, 현재 상태에 맞는 다음 단계를 안내합니다.',
    principles: [
      ['Origin', '불편이 시작된 배경과 반복되는 패턴을 확인합니다.'],
      ['Reset', '긴장된 신경계와 움직임의 균형을 다시 살핍니다.'],
      ['Balance', '회복이 일상으로 이어질 수 있도록 관리 방향을 조정합니다.'],
    ],
    spaceEyebrow: 'SPACE',
    spaceTitle: '차분하게 머물 수 있는 공간',
    spaceBody: '상담부터 치료까지 편안하게 이어질 수 있도록 독립된 진료 공간을 마련했습니다.',
    galleryLabel: '오브한의원 내부 공간 사진',
    previous: '이전 공간 사진',
    next: '다음 공간 사진',
    doctorEyebrow: 'DIRECTOR & PHILOSOPHY · E-E-A-T',
    doctorTitle: '보이지 않는 고통을 객관적인 데이터로 규명합니다',
    doctorSubtitle: '주관적 호소에만 의존하지 않고, 신경인지과학과 한의학적 근원 치료를 결합하여 환자의 자율 회복력을 되살립니다.',
    doctorName: '전두희 원장',
    doctorClinic: '오브한의원 마곡점 대표원장',
    doctorQuoteLead: '“각종 정밀 검사에서 \'이상 없음\'이라는 소견을 듣고도 일상이 무너져 계신 분들을 매일 진료실에서 마주합니다.”',
    doctorQuoteBody: '보이지 않는 만성 피로, 이유 없는 가슴 두근거림, 머릿속 안개(브레인포그)는 결코 환자분의 나약함이나 기분 탓이 아닙니다. 뇌 신경망의 기능적 과부하와 자율신경계의 조절 붕괴는 측정 가능한 생체 신호의 객관적 불균형입니다.\n\n오브한의원은 첨단 습식 정량화 뇌파(qEEG)와 자율신경 검사로 보이지 않는 신경 피로를 수치화하고, 뇌와 척추를 잇는 신경계 통합 치료로 신체 본연의 자율 회복력을 반드시 되찾아 드립니다.',
    doctorPillars: [
      {
        num: '01',
        title: '객관적 데이터 규명',
        desc: '모호한 문진표에만 의존하지 않고, 다채널 습식 QEEG 및 심박변이도(HRV) 검사를 통해 뇌신경 피로도와 자율신경 긴장도를 시각화·수치화합니다.',
      },
      {
        num: '02',
        title: '신경-구조 융합 근원 치료',
        desc: '중추신경계 과열을 식히는 뇌 피로 회복 맞춤 한약과 뇌척수액 순환을 정상화하는 상부경추·두개골 추나요법을 결합하여 근본적 원인을 다스립니다.',
      },
      {
        num: '03',
        title: '자율신경 항상성 재건',
        desc: '일시적인 신경안정제 효과가 아닌, 뇌와 척추 신경망이 스스로 균형과 활력을 유지할 수 있도록 환자 고유의 자율 회복력을 재건합니다.',
      },
    ],
    columnsEyebrow: 'CLINICAL ARCHIVE · MEDICAL COLUMNS',
    columnsTitle: '오브한의원 임상 연구 & 의학 칼럼',
    columnsSubtitle: '습식 정량뇌파(qEEG), 자율신경실조증, 브레인포그 등 난치성 신경 질환의 병리기전과 최신 치료 지견을 전두희 대표원장이 직접 집필합니다.',
    columnsViewAll: '전체 의학 칼럼 아카이브 보기',
    columnsReadMore: '칼럼 읽기',
    locationEyebrow: 'VISIT',
    locationTitle: '마곡나루역에서\n가볍게 걸어오세요.',
    addressTitle: '주소',
    transitTitle: '지하철',
    transit: '9호선·공항철도 마곡나루역 5번 출구에서 도보 136m',
    buildingTitle: '건물 안에서',
    building: '지하 2층에서 상가용 엘리베이터를 이용해 104동 2층으로 올라오세요.',
    parkingTitle: '주차',
    parking: '지하주차장 이용 시 2시간 무료입니다. 상가용과 입주민용 엘리베이터 입구가 구분되어 있습니다.',
    hoursTitle: '진료시간',
    weekday: '평일 10:30 – 20:20',
    breakTime: '휴게시간 14:10 – 15:00 · 접수마감 19:40',
    saturday: '토요일 13:00 – 18:00',
    sunday: '매주 일요일 휴진',
    mapTitle: '지도에서 보기',
    naverMap: '네이버 지도',
    kakaoMap: '카카오맵',
    googleMap: '구글 지도',
    contactEyebrow: 'RESERVATION',
    contactTitle: '진료 예약과 문의',
    contactBody: '네이버 예약에서 가능한 시간을 확인하거나 전화로 문의해 주세요.',
    privacy: '개인정보처리방침',
    rights: '© ORB Korean Medicine Clinic.',
  },
  en: {
    kicker: 'ORBMED CLINIC',
    title: 'ORB Korean Medicine Clinic',
    heroBody: 'Specialized clinic for autonomic, neurocognitive, and pain disorders.',
    booking: 'Book on Naver',
    call: 'Call the clinic',
    station: '136m from Magongnaru Station Exit 5',
    facts: [
      ['Clinic hours', 'Weekday 10:30 – 20:20', 'Saturday 13:00 – 18:00'],
      ['Nearest station', 'Magongnaru Exit 5', 'About a one-minute walk'],
      ['Parking', 'Underground parking', '2 hours free parking'],
    ],
    diagnosticEyebrow: 'DIAGNOSTIC TECHNOLOGY · QEEG SYSTEM',
    diagnosticTitle: 'Persistent suffering despite "normal" lab results —\nFinding answers in brain and autonomic imbalances.',
    diagnosticSubtitle: 'ORB Korean Medicine Clinic utilizes quantitative EEG (QEEG) and precise autonomic testing to diagnose nervous system fatigue and postural imbalance through objective data.',
    diagnosticWhyWet: 'Why Quantitative EEG Analysis?',
    diagnosticPoints: [
      {
        title: 'International 10-20 System',
        desc: 'Whole-cortex precision mapping (the decisive distinction from simple dry band sensors)',
      },
      {
        title: 'Precision Impedance Control',
        desc: 'Conductive gel lowers scalp resistance and completely blocks external artifacts to acquire pure biosignals',
      },
      {
        title: 'Normative DB Z-score Comparison',
        desc: 'Statistical Z-score benchmarking against normative population databases to pinpoint hyperexcitability and sluggish slowing',
      },
    ],
    protocolSteps: [
      {
        step: '01',
        phase: 'STEP 01',
        title: 'Precision Biosignal Measurement',
        subtitle: 'Multichannel QEEG & Autonomic Testing',
        desc: 'Applying conductive gel across standardized cortical landmarks to accurately acquire microvolt (μV) electrical potentials and heart rate variability (HRV) with minimal impedance.',
        image: '/images/clinic/naver-qeeg-wide.webp',
        tags: ['#Standard10_20System', '#PrecisionSensor_NoiseFree', '#HRV_Assessment'],
      },
      {
        step: '02',
        phase: 'STEP 02',
        title: 'Quantitative Brain Function Analysis',
        subtitle: '3D Brain Mapping & Z-Score Analysis',
        desc: 'Digitally decomposing raw signals into frequency bands (Delta, Theta, Alpha, Beta) and comparing against a vast normative database to visualize hyperexcitability (red) and slowing (blue).',
        image: '/images/clinic/qeeg-brainmap-3d.png',
        tags: ['#Normative_DB', '#3D_BrainMap', '#Z_score_Deviations'],
      },
      {
        step: '03',
        phase: 'STEP 03',
        title: 'Integrative Herbal & Chuna Care',
        subtitle: 'Trimodal Neuro-Autonomic-Structural Treatment',
        desc: 'Deploying individualized herbal formulas to cool down cortical overdrive, upper-cervical Chuna manual therapy to unblock CSF flow, and acupoint pharmacopuncture to stabilize autonomic ganglia.',
        image: '/images/clinic/naver-chuna-wide.webp',
        tags: ['#Neuro_Fatigue_Herbs', '#UpperCervical_Chuna', '#Autonomic_Homeostasis'],
      },
    ],
    treatmentEyebrow: 'SPECIALIZED CLINIC DEPARTMENTS',
    treatmentTitle: 'Specialized Clinical Focus at\nORB Korean Medicine Clinic',
    treatmentBody: 'We address not merely isolated symptoms, but the onset, lifestyle rhythms, and interrelated neuro-autonomic and structural factors.',
    detail: 'Learn more',
    philosophyEyebrow: 'OUR APPROACH',
    philosophyTitle: 'Understand the origin.\nFind the direction of recovery.',
    philosophyBody: 'ORB aims for care that can be clearly explained. We select relevant assessments, review findings with you, and discuss the next step for your current condition.',
    principles: [
      ['Origin', 'We review the background and recurring pattern of your concerns.'],
      ['Reset', 'We reassess nervous-system tension and movement balance.'],
      ['Balance', 'We adjust care so recovery can continue in daily life.'],
    ],
    spaceEyebrow: 'SPACE',
    spaceTitle: 'A calm setting for your visit',
    spaceBody: 'Private consultation and treatment rooms support a comfortable flow throughout your appointment.',
    galleryLabel: 'Interior photos of ORB Korean Medicine Clinic',
    previous: 'Previous clinic photo',
    next: 'Next clinic photo',
    doctorEyebrow: 'DIRECTOR & PHILOSOPHY · E-E-A-T',
    doctorTitle: 'Elucidating invisible suffering through objective data',
    doctorSubtitle: 'Moving beyond subjective complaints, we combine neurocognitive science and root-cause Korean medicine to restore innate autonomic resilience.',
    doctorName: 'Doo-hee Jeon, KMD',
    doctorClinic: 'Representative Medical Director, ORB Clinic',
    doctorQuoteLead: '“Every day, I meet patients who are told \'everything is normal\' on standard scans, yet their daily lives remain shattered.”',
    doctorQuoteBody: 'Chronic fatigue, sudden palpitations, and brain fog are neither weaknesses nor in your imagination. Functional overload in neural networks and autonomic breakdown are measurable physiological imbalances.\n\nAt ORB Clinic, we visualize invisible neural fatigue with precision QEEG and restore your innate homeostasis through neuro-structural integrative care.',
    doctorPillars: [
      {
        num: '01',
        title: 'Objective Data Diagnostics',
        desc: 'Precision assessment through multichannel QEEG and HRV rather than subjective questionnaires.',
      },
      {
        num: '02',
        title: 'Neuro-Structural Synergy',
        desc: 'Combining neuro-fatigue herbal medicine with upper-cervical cranial Chuna therapy to address root causes.',
      },
      {
        num: '03',
        title: 'Restoration of Autonomic Resilience',
        desc: 'Root-cause treatment empowering the body and neural pathways to self-regulate homeostasis.',
      },
    ],
    columnsEyebrow: 'CLINICAL ARCHIVE · MEDICAL COLUMNS',
    columnsTitle: 'Clinical Insights & Medical Columns',
    columnsSubtitle: 'Articles on quantitative EEG, autonomic dysregulation, and brain fog written directly by Medical Director Doo-hee Jeon.',
    columnsViewAll: 'View all medical columns',
    columnsReadMore: 'Read column',
    locationEyebrow: 'VISIT',
    locationTitle: 'A short walk from\nMagongnaru Station',
    addressTitle: 'Address',
    transitTitle: 'Subway',
    transit: '136m from Exit 5 of Magongnaru Station on Line 9 and the Airport Railroad',
    buildingTitle: 'Inside the building',
    building: 'From B2, take the commercial elevator to the second floor of Building 104.',
    parkingTitle: 'Parking',
    parking: 'Two hours of underground parking are provided. Commercial and residential elevator entrances are separate.',
    hoursTitle: 'Hours',
    weekday: 'Mon–Fri 10:30 – 20:20',
    breakTime: 'Break 14:10 – 15:00 · Last reception 19:40',
    saturday: 'Saturday 13:00 – 18:00',
    sunday: 'Closed every Sunday',
    mapTitle: 'Open in maps',
    naverMap: 'Naver Map',
    kakaoMap: 'Kakao Map',
    googleMap: 'Google Maps',
    contactEyebrow: 'RESERVATION',
    contactTitle: 'Appointments and inquiries',
    contactBody: 'Check available appointments on Naver or call the clinic.',
    privacy: 'Privacy',
    rights: '© ORB Korean Medicine Clinic.',
  },
} as const;

function clinicJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: locale === 'ko' ? clinic.nameKo : clinic.nameEn,
    alternateName: locale === 'ko' ? clinic.nameEn : clinic.nameKo,
    url: `${SITE_URL}${locale === 'en' ? '/en' : ''}`,
    telephone: clinic.phoneDisplay,
    image: `${SITE_URL}/images/clinic/hero-lobby-wide.webp`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      addressRegion: locale === 'ko' ? '서울' : 'Seoul',
      addressLocality: locale === 'ko' ? '강서구' : 'Gangseo-gu',
      streetAddress:
        locale === 'ko'
          ? '마곡중앙로 111 104동 2층 238호, 239호'
          : '111 Magokjungang-ro, Building 104, 2F, Units 238-239',
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
    sameAs: [clinic.naverPlaceUrl, 'https://blog.naver.com/orbmed'],
    availableService: treatments.map((treatment) => treatment.title[locale]),
  };
}

export default function ClinicHome({
  locale,
  latestColumns = [],
}: {
  locale: Locale;
  latestColumns?: Column[];
}) {
  const text = copy[locale];
  const isEnglish = locale === 'en';
  const localizedGallery = gallery.map((item) => ({
    image: item.image,
    label: item.label[locale],
    alt: item.alt[locale],
  }));

  return (
    <main className={`site-shell locale-${locale}`} lang={locale}>
      <SiteMotion />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicJsonLd(locale)) }}
      />
      <SiteHeader locale={locale} />

      {/* 1. HERO SECTION */}
      <section className="hero-section" id="top">
        <div className="hero-content reveal" data-inview>
          <p className="eyebrow">{text.kicker}</p>
          <h1>{text.title}</h1>
          <p className="hero-lede">{text.heroBody}</p>
          <div className="primary-actions">
            <TrackedLink
              className="button button-solid"
              href={clinic.naverBookingUrl}
              target="_blank"
              rel="noreferrer"
              eventName="booking_click"
              eventLabel={text.booking}
            >
              {text.booking}<span aria-hidden="true">↗</span>
            </TrackedLink>
            <TrackedLink
              className="button button-ghost"
              href={clinic.phoneHref}
              eventName="phone_click"
              eventLabel={text.call}
            >
              {text.call}
            </TrackedLink>
          </div>
        </div>
        <div className="hero-visual hero-visual-brand" aria-label="ORB ARCHIVE">
          <div className="hero-brand-card">
            <img
              src="/images/logo/orb-symbol-clean.png"
              alt="ORB Logo"
              className="hero-brand-logo"
            />
            <h2 className="hero-brand-title">ORB ARCHIVE</h2>
            <p className="hero-brand-desc">
              {isEnglish ? (
                <>
                  Articles and clinical insights on neuropsychiatry<br />
                  and integrative medicine from ORB Clinic.
                </>
              ) : (
                <>
                  본 사이트에서는 본원에서 다루는<br />
                  신경정신과 아티클들을 수록합니다.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* FACT STRIP */}
      <section className="fact-strip" aria-label={isEnglish ? 'Clinic information' : '주요 진료 정보'}>
        {text.facts.map(([label, value, note]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            {note ? <small>{note}</small> : null}
          </div>
        ))}
      </section>

      {/* 2. [PAGE 2] DIAGNOSTIC TECHNOLOGY PROTOCOL SECTION */}
      <section className="diagnostic-section reveal" id="diagnostic">
        <div className="diagnostic-header">
          <div className="diagnostic-badge-pill">
            <span className="pulse-dot" aria-hidden="true" />
            {text.diagnosticEyebrow}
          </div>
          <h2 className="diagnostic-main-title">
            {text.diagnosticTitle.split('\n').map((line, idx) => (
              <span key={idx}>{line}</span>
            ))}
          </h2>
          <p className="diagnostic-sub-lede">{text.diagnosticSubtitle}</p>

          <div className="qeeg-spec-strip">
            <div className="qeeg-spec-badge">
              <strong>{text.diagnosticWhyWet}</strong>
            </div>
            <div className="qeeg-spec-items">
              {text.diagnosticPoints.map((pt, idx) => (
                <div key={idx} className="qeeg-spec-item">
                  <span className="spec-check">✓</span>
                  <div>
                    <strong>{pt.title}</strong>
                    <p>{pt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="protocol-grid">
          {text.protocolSteps.map((step) => (
            <article className="protocol-card" key={step.step}>
              <div className="protocol-card-head">
                <span className="protocol-step-badge">{step.phase}</span>
                <span className="protocol-step-num">{step.step}</span>
              </div>
              <div className="protocol-image-wrap">
                <img
                  src={step.image}
                  alt={step.title}
                  className="protocol-image"
                  loading="lazy"
                />
                <div className="protocol-image-overlay" />
              </div>
              <div className="protocol-card-body">
                <h3 className="protocol-card-title">{step.title}</h3>
                <h4 className="protocol-card-sub">{step.subtitle}</h4>
                <p className="protocol-card-desc">{step.desc}</p>
                <div className="protocol-tags">
                  {step.tags.map((tag) => (
                    <span key={tag} className="protocol-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. [PAGE 3] TREATMENTS SECTION */}
      <section className="content-section treatments-section reveal" id="treatments">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">{text.treatmentEyebrow}</p>
            <h2>
              {text.treatmentTitle.split('\n').map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
          </div>
          <p>{text.treatmentBody}</p>
        </div>
        <div className="treatment-grid">
          {treatments.map((treatment) => (
            <a
              className="treatment-card"
              href={treatmentPath(locale, treatment.slug)}
              key={treatment.slug}
            >
              <ResponsivePicture
                image={treatment.image}
                alt={treatment.imageAlt[locale]}
                position={treatment.imagePosition}
                fit={treatment.imageFit}
              />
              <div className="treatment-card-copy">
                <span>{treatment.number}</span>
                <h3>{treatment.title[locale]}</h3>
                <p>{treatment.summary[locale]}</p>
                <b>
                  {text.detail}
                  <i aria-hidden="true">→</i>
                </b>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 4. PHILOSOPHY SECTION */}
      <section className="philosophy-section reveal">
        <div className="philosophy-lead">
          <p className="eyebrow">{text.philosophyEyebrow}</p>
          <h2>
            {text.philosophyTitle.split('\n').map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
          <p>{text.philosophyBody}</p>
        </div>
        <ResponsivePicture
          className="philosophy-image"
          image="detail-flower"
          alt={isEnglish ? 'Floral detail in the ORB lobby' : '오브한의원 로비의 플라워 디테일'}
          position="center center"
        />
        <ol className="principle-list">
          {text.principles.map(([title, body], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. SPACE SECTION */}
      <section className="space-section reveal" id="space">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">{text.spaceEyebrow}</p>
            <h2>{text.spaceTitle}</h2>
          </div>
          <p>{text.spaceBody}</p>
        </div>
        <AutoGallery
          images={localizedGallery}
          ariaLabel={text.galleryLabel}
          previousLabel={text.previous}
          nextLabel={text.next}
        />
      </section>

      {/* 6. [E-E-A-T SECTION BEFORE VISIT] REPRESENTATIVE DIRECTOR JEON DOO-HEE PHILOSOPHY */}
      <section className="doctor-section reveal" id="doctor">
        <div className="doctor-container">
          <div className="doctor-header-group">
            <p className="eyebrow">{text.doctorEyebrow}</p>
            <h2 className="doctor-headline">“{text.doctorTitle}”</h2>
            <p className="doctor-subhead">{text.doctorSubtitle}</p>
          </div>

          <div className="doctor-main-card">
            <div className="doctor-profile-sidebar">
              <div className="doctor-avatar-wrap">
                <img
                  src="/images/clinic/consulting-room-wide.webp"
                  alt={text.doctorName}
                  className="doctor-avatar-img"
                />
              </div>
              <div className="doctor-identity">
                <strong className="doctor-name">{text.doctorName}</strong>
                <span className="doctor-title-badge">{text.doctorClinic}</span>
              </div>
            </div>

            <div className="doctor-content-pane">
              <blockquote className="doctor-quote">
                <p className="doctor-quote-lead">{text.doctorQuoteLead}</p>
                {text.doctorQuoteBody.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="doctor-quote-p">
                    {paragraph}
                  </p>
                ))}
              </blockquote>

              <div className="doctor-pillars-grid">
                {text.doctorPillars.map((pillar) => (
                  <div key={pillar.num} className="doctor-pillar-card">
                    <span className="pillar-num">{pillar.num}</span>
                    <strong className="pillar-title">{pillar.title}</strong>
                    <p className="pillar-desc">{pillar.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. VISIT SECTION */}
      <section className="visit-section reveal" id="directions">
        <div className="visit-intro">
          <p className="eyebrow">{text.locationEyebrow}</p>
          <h2>
            {text.locationTitle.split('\n').map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
        </div>
        <div className="visit-layout">
          <div className="visit-details">
            <dl>
              <div>
                <dt>{text.addressTitle}</dt>
                <dd>{isEnglish ? clinic.addressEn : clinic.addressKo}</dd>
              </div>
              <div>
                <dt>{text.transitTitle}</dt>
                <dd>{text.transit}</dd>
              </div>
              <div>
                <dt>{text.buildingTitle}</dt>
                <dd>{text.building}</dd>
              </div>
              <div>
                <dt>{text.parkingTitle}</dt>
                <dd>{text.parking}</dd>
              </div>
            </dl>
            <div className="hours-card">
              <span>{text.hoursTitle}</span>
              <strong>{text.weekday}</strong>
              <strong>{text.saturday}</strong>
              <p>{text.breakTime}</p>
              <p>{text.sunday}</p>
            </div>
          </div>
          <div className="map-column">
            <iframe
              src={clinic.googleMapEmbedUrl}
              title={
                isEnglish
                  ? 'Map showing ORB Korean Medicine Clinic'
                  : '오브한의원 마곡점 위치 지도'
              }
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="map-links" aria-label={text.mapTitle}>
              <TrackedLink
                href={clinic.naverPlaceUrl}
                target="_blank"
                rel="noreferrer"
                eventName="map_click"
                eventLabel={text.naverMap}
              >
                {text.naverMap}
                <span>↗</span>
              </TrackedLink>
              <TrackedLink
                href={clinic.kakaoMapUrl}
                target="_blank"
                rel="noreferrer"
                eventName="map_click"
                eventLabel={text.kakaoMap}
              >
                {text.kakaoMap}
                <span>↗</span>
              </TrackedLink>
              <TrackedLink
                href={clinic.googleMapUrl}
                target="_blank"
                rel="noreferrer"
                eventName="map_click"
                eventLabel={text.googleMap}
              >
                {text.googleMap}
                <span>↗</span>
              </TrackedLink>
            </div>
          </div>
        </div>
      </section>

      {/* 8. [BOTTOM COLUMNS ARCHIVE SECTION] */}
      {latestColumns && latestColumns.length > 0 && (
        <section className="home-columns-section reveal" id="columns">
          <div className="home-columns-header">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">{text.columnsEyebrow}</p>
                <h2>{text.columnsTitle}</h2>
              </div>
              <p>{text.columnsSubtitle}</p>
            </div>
          </div>

          <div className="home-columns-grid">
            {latestColumns.map((col) => (
              <article key={col.id} className="home-column-card">
                <Link href={`/columns/${col.slug}`} className="home-column-card-link">
                  <div className="home-column-thumb-wrap">
                    <SafeImage
                      src={col.thumbnail || ''}
                      alt={col.title}
                      className="home-column-thumb"
                      loading="lazy"
                    />
                    <span className="home-column-cat-pill">{col.category}</span>
                  </div>
                  <div className="home-column-content">
                    <div className="home-column-meta">
                      <time dateTime={col.date}>{col.date}</time>
                      <span className="meta-divider">·</span>
                      <span className="meta-author">{col.author || '전두희 원장'}</span>
                    </div>
                    <h3 className="home-column-title">{col.title}</h3>
                    <p className="home-column-summary">{col.summary}</p>
                    <div className="home-column-footer">
                      <span className="read-more-text">
                        {text.columnsReadMore}
                        <i aria-hidden="true">→</i>
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          <div className="home-columns-action">
            <Link href="/columns" className="button button-outline-dark">
              {text.columnsViewAll}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      )}

      {/* 9. CONTACT SECTION */}
      <section className="contact-section reveal" id="contact">
        <p className="eyebrow">{text.contactEyebrow}</p>
        <h2>{text.contactTitle}</h2>
        <p>{text.contactBody}</p>
        <a className="contact-phone" href={clinic.phoneHref}>
          {clinic.phoneDisplay}
        </a>
        <div className="primary-actions primary-actions-centered">
          <TrackedLink
            className="button button-light"
            href={clinic.naverBookingUrl}
            target="_blank"
            rel="noreferrer"
            eventName="booking_click"
            eventLabel={text.booking}
          >
            {text.booking}
            <span>↗</span>
          </TrackedLink>
          <TrackedLink
            className="button button-outline-light"
            href={clinic.phoneHref}
            eventName="phone_click"
            eventLabel={text.call}
          >
            {text.call}
          </TrackedLink>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="site-footer">
        <div>
          <strong>ORB</strong>
          <span>{isEnglish ? clinic.nameEn : clinic.nameKo}</span>
        </div>
        <address>
          {isEnglish ? clinic.addressEn : clinic.addressKo}
          <br />
          {clinic.phoneDisplay} · {text.weekday} · {text.saturday} ({text.sunday})
        </address>
        <div className="footer-meta">
          <Link href="/columns">{isEnglish ? 'Columns' : '원장 칼럼'}</Link>
          <Link href={isEnglish ? '/en/privacy' : '/privacy'}>{text.privacy}</Link>
          <span>{text.rights}</span>
        </div>
      </footer>

      <aside className="mobile-cta" aria-label={isEnglish ? 'Appointment actions' : '예약 바로가기'}>
        <TrackedLink
          href={clinic.naverBookingUrl}
          target="_blank"
          rel="noreferrer"
          eventName="booking_click"
          eventLabel={text.booking}
        >
          {text.booking}
        </TrackedLink>
        <TrackedLink href={clinic.phoneHref} eventName="phone_click" eventLabel={text.call}>
          {text.call}
        </TrackedLink>
      </aside>
    </main>
  );
}
