import Link from 'next/link';
import AutoGallery from './AutoGallery';
import ResponsivePicture from './ResponsivePicture';
import SafeImage from './SafeImage';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import SiteMotion from './SiteMotion';
import TrackedLink from './TrackedLink';
import MedicalJsonLd from './MedicalJsonLd';
import HomeColumnsArchive from './HomeColumnsArchive';
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
    title: '오브한의원',
    branch: '마곡점',
    heroBody: '자율신경 · 뇌신경 · 통증 중점 의료기관, 오브한의원입니다',
    booking: '네이버 예약',
    call: '전화 문의',
    station: '마곡나루역 5번 출구에서 136m',
    facts: [
      ['진료시간', '평일 10:30 – 20:20', '토요일 13:00 – 18:00'],
      ['가까운 역', '마곡나루역 5번 출구', '도보 약 1분'],
      ['주차 안내', '건물 지하주차장', '주차 가능'],
    ],
    diagnosticEyebrow: 'DIAGNOSTIC TECHNOLOGY · QEEG SYSTEM',
    diagnosticTitle: "각종 검사상 '이상 없음'에도 지속되는 고통,\n뇌와 자율신경의 불균형에서 답을 찾습니다.",
    diagnosticSubtitle: "오브한의원은 습식 정량화 뇌파(QEEG)와 자율신경 검사를 통해\n뇌신경계 피로와 체형 불균형을 객관적 데이터로 진단합니다.",
    diagnosticWhyWet: '왜 정량화 뇌파 분석인가?',
    diagnosticPoints: [
      {
        title: '국제 10-20 시스템',
        desc: '전두엽·측두엽·두정엽·후두엽 전뇌 다각도 정밀 측정 (간이 건식 밴드와의 결정적 차이)',
      },
      {
        title: '초정밀 임피던스 제어 시스템',
        desc: '전도성 겔(Gel)을 소량 사용하여 두피 저항을 낮추고 외부 노이즈를 완벽 차단하여 순수 뇌파 포착',
      },
      {
        title: 'Normative DB Z-score 대조',
        desc: '수만 건의 빅데이터 정규분포 대조로 신경 과열 및 기능 저하 정밀 규명',
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
        imagePosition: 'center 25%',
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
        image: '/images/clinic/naver-decoction-wide.webp',
        tags: ['#뇌신경피로_맞춤탕약', '#상부경추_두개추나', '#자율신경_항상성재건'],
      },
    ],
    treatmentEyebrow: 'SPECIALIZED CLINIC DEPARTMENTS',
    treatmentTitle: '원인을 규명하고 근본을 바로잡는\n오브한의원 4대 중점 진료 분야',
    treatmentBody: '단편적인 증상 완화에 그치지 않고 발생 시점, 생활 흐름, 뇌신경계와 자율신경, 척추 체형의 유기적 상관관계를 함께 살핍니다.',
    detail: '자세히 보기',
    philosophyEyebrow: 'OUR APPROACH',
    philosophyTitle: '정확하게 진단하고\n바르게 치료하겠습니다',
    philosophyBody: 'ORB한의원의 접근',
    principles: [
      ['Origin', '불편이 시작된 배경과 반복되는 패턴을 확인합니다.'],
      ['Reset', '과긴장된 신경계와 굳어진 몸의 흐름을 본래대로 되돌립니다.'],
      ['Balance', '뇌와 신체의 무너진 균형을 바로잡아 온전한 일상을 지킵니다.'],
    ],
    spaceEyebrow: '',
    spaceTitle: 'SPACE',
    spaceBody: '상담부터 치료까지',
    galleryLabel: '오브한의원 내부 공간 사진',
    previous: '이전 공간 사진',
    next: '다음 공간 사진',
    doctorEyebrow: '',
    doctorTitle: '보이지 않는 고통을\n객관적인 데이터로 규명합니다',
    doctorSubtitle: '주관적 호소에만 의존하지 않고, 신경인지과학과 한의학적 근원 치료를 결합하여 환자의 자율 회복력을 되살립니다.',
    doctorName: '한의사 전두희',
    doctorClinic: '오브한의원 마곡점 대표원장',
    doctorQuoteLead: '“각종 정밀 검사에서 \'이상 없음\' 소견을 받았지만,\n여전히 고통받는 분들을 매일 진료실에서 마주합니다”',
    doctorQuoteBody: '만성 피로, 이유 없는 가슴 두근거림, 브레인포그는 결코 환자분의 나약함이나 기분 탓이 아닙니다. 뇌 신경망의 기능적 과부하와 자율신경계의 조절 이상은 측정 가능한 생체 신호의 객관적 불균형입니다.\n\n오브한의원은 첨단 습식 정량화 뇌파(qEEG)와 자율신경 검사로 보이지 않는 신경 피로를 수치화하고, 뇌와 척추를 잇는 신경계 통합 치료로 신체 본연의 자율 회복력을 반드시 되찾아 드립니다.',
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
    parking: '지하주차장 이용 가능합니다. 상가용과 입주민용 엘리베이터 입구가 구분되어 있습니다.',
    hoursTitle: '진료시간',
    weekday: '평일 10:30 – 20:20',
    breakTime: '휴게시간 14:10 – 15:00 · 접수마감 19:40',
    saturday: '토요일 13:00 – 18:00',
    sunday: '매주 일요일 휴진',
    mapTitle: '지도에서 보기',
    naverMap: '네이버 지도',
    kakaoMap: '카카오맵',
    googleMap: '구글 지도',
    contactSlogan: '“다시 건강의 궤도(ORBit) 위로”',
    contactEyebrow: 'RESERVATION',
    contactTitle: '진료 예약과 문의',
    contactBody: '네이버톡톡/ 카카오톡 으로 언제든 문의주세요',
    privacy: '개인정보처리방침',
    rights: '© ORB Korean Medicine Clinic.',
  },
  en: {
    kicker: 'ORBMED CLINIC',
    title: 'ORB Korean Medicine Clinic',
    branch: 'Magok',
    heroBody: 'Specialized clinic for autonomic, neurocognitive, and pain disorders.',
    booking: 'Book on Naver',
    call: 'Call the clinic',
    station: '136m from Magongnaru Station Exit 5',
    facts: [
      ['Clinic hours', 'Weekday 10:30 – 20:20', 'Saturday 13:00 – 18:00'],
      ['Nearest station', 'Magongnaru Exit 5', 'About a one-minute walk'],
      ['Parking', 'Underground parking', 'Parking available'],
    ],
    diagnosticEyebrow: 'DIAGNOSTIC TECHNOLOGY · QEEG SYSTEM',
    diagnosticTitle: 'Persistent suffering despite "normal" lab results —\nFinding answers in brain and autonomic imbalances.',
    diagnosticSubtitle: 'ORB Korean Medicine Clinic utilizes quantitative EEG (QEEG) and autonomic testing\nto diagnose nervous system fatigue and postural imbalance through objective data.',
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
        imagePosition: 'center 25%',
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
        image: '/images/clinic/naver-decoction-wide.webp',
        tags: ['#Neuro_Fatigue_Herbs', '#UpperCervical_Chuna', '#Autonomic_Homeostasis'],
      },
    ],
    treatmentEyebrow: 'SPECIALIZED CLINIC DEPARTMENTS',
    treatmentTitle: 'Specialized Clinical Focus at\nORB Korean Medicine Clinic',
    treatmentBody: 'We address not merely isolated symptoms, but the onset, lifestyle rhythms, and interrelated neuro-autonomic and structural factors.',
    detail: 'Learn more',
    philosophyEyebrow: 'OUR APPROACH',
    philosophyTitle: 'Accurate Diagnosis,\nProper Treatment',
    philosophyBody: 'ORB Clinic’s Approach',
    principles: [
      ['Origin', 'We review the background and recurring pattern of your concerns.'],
      ['Reset', 'We reassess nervous-system tension and movement balance.'],
      ['Balance', 'We adjust care so recovery can continue in daily life.'],
    ],
    spaceEyebrow: '',
    spaceTitle: 'SPACE',
    spaceBody: 'Private consultation and treatment rooms support a comfortable flow throughout your appointment.',
    galleryLabel: 'Interior photos of ORB Korean Medicine Clinic',
    previous: 'Previous clinic photo',
    next: 'Next clinic photo',
    doctorEyebrow: '',
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
    parking: 'Underground parking is available. Commercial and residential elevator entrances are separate.',
    hoursTitle: 'Hours',
    weekday: 'Mon–Fri 10:30 – 20:20',
    breakTime: 'Break 14:10 – 15:00 · Last reception 19:40',
    saturday: 'Saturday 13:00 – 18:00',
    sunday: 'Closed every Sunday',
    mapTitle: 'Open in maps',
    naverMap: 'Naver Map',
    kakaoMap: 'Kakao Map',
    googleMap: 'Google Maps',
    contactSlogan: '“Back onto the orbit of health (ORBit)”',
    contactEyebrow: 'RESERVATION',
    contactTitle: 'Appointments and inquiries',
    contactBody: 'Feel free to inquire anytime via Naver TalkTalk or KakaoTalk.',
    privacy: 'Privacy',
    rights: '© ORB Korean Medicine Clinic.',
  },
} as const;

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
      <MedicalJsonLd
        locale={locale}
        pageUrl={`${SITE_URL}${isEnglish ? '/en' : ''}`}
        pageTitle={`${text.title} ${text.branch} | ${isEnglish ? 'Specialized Neuro-Autonomic Clinic' : '자율신경·뇌신경·통증 중점 한의원'}`}
        pageDescription={text.heroBody}
      />
      <SiteHeader locale={locale} />

      {/* 1. HERO SECTION */}
      <section className="hero-section" id="top">
        <div className="hero-content" data-inview>
          <p className="eyebrow">{text.kicker}</p>
          <h1>
            <span>{text.title}</span>
            {text.branch ? <span className="hero-branch">{text.branch}</span> : null}
          </h1>
          <p className="hero-lede">{text.heroBody}</p>
        </div>
        <div className="hero-visual hero-visual-brand" aria-label="ORB ARCHIVE">
          <div className="hero-brand-card">
            <img
              src="/images/logo/orb-symbol-clean.png"
              alt="ORB Logo"
              className="hero-brand-logo"
            />
            <strong className="hero-brand-title">ORB ARCHIVE</strong>
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
          <p className="diagnostic-sub-lede">
            {text.diagnosticSubtitle.split('\n').map((line, idx) => (
              <span key={idx}>{line}</span>
            ))}
          </p>

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
                  style={'imagePosition' in step && step.imagePosition ? { objectPosition: step.imagePosition } : undefined}
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
          <div className="philosophy-lead-top">
            <p className="eyebrow">{text.philosophyEyebrow}</p>
            <h2>
              {text.philosophyTitle.split('\n').map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
          </div>
          {text.philosophyBody ? (
            <p className="philosophy-body">
              <span className="philosophy-highlight-orb">ORB</span>
              <span className="philosophy-sub-text">{text.philosophyBody.replace(/^ORB/, '')}</span>
            </p>
          ) : null}
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
                <strong>
                  <span className="principle-highlight-letter">{title.charAt(0)}</span>
                  {title.slice(1)}
                </strong>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. SPACE SECTION */}
      <section className="space-section reveal" id="space">
        <div className="section-heading split-heading space-split-heading">
          <div>
            <h2 className="space-title-large">{text.spaceTitle}</h2>
          </div>
          <p className="space-body-text">{text.spaceBody}</p>
        </div>
        <AutoGallery
          images={localizedGallery}
          ariaLabel={text.galleryLabel}
          previousLabel={text.previous}
          nextLabel={text.next}
        />
      </section>

      {/* 6. REPRESENTATIVE DIRECTOR JEON DOO-HEE PHILOSOPHY */}
      <section className="doctor-section reveal" id="doctor">
        <div className="doctor-container">
          <div className="doctor-header-group">
            {text.doctorEyebrow ? <p className="eyebrow">{text.doctorEyebrow}</p> : null}
            <h2 className="doctor-headline">
              {text.doctorTitle.includes('\n') ? (
                <>
                  <span className="block">“{text.doctorTitle.split('\n')[0]}</span>
                  <span className="block">{text.doctorTitle.split('\n')[1]}”</span>
                </>
              ) : (
                `“${text.doctorTitle}”`
              )}
            </h2>
            <p className="doctor-subhead">{text.doctorSubtitle}</p>
          </div>

          <div className="doctor-main-card">
            <div className="doctor-profile-sidebar">
              <div className="doctor-identity">
                <strong className="doctor-name">{text.doctorName}</strong>
                <span className="doctor-title-badge">{text.doctorClinic}</span>
              </div>

              <div className="doctor-credentials-card">
                <ul className="doctor-credentials-list">
                  <li>대한한의사협회 회원</li>
                  <li>척추신경추나의학회 회원</li>
                  <li>대한뇌파한의학회 회원</li>
                  <li>대한통합암학회 회원</li>
                  <li>대한한방비만학회 회원</li>
                  <li>대한한의학회 회원</li>
                  <li>한의정보협동조합 조합원</li>
                </ul>
              </div>
            </div>

            <div className="doctor-content-pane">
              <blockquote className="doctor-quote">
                <p className="doctor-quote-lead">
                  {text.doctorQuoteLead.split('\n').map((line, idx) => (
                    <span key={idx} className="block">
                      {line}
                    </span>
                  ))}
                </p>
                {text.doctorQuoteBody.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="doctor-quote-p">
                    {paragraph}
                  </p>
                ))}
              </blockquote>

              <div className="doctor-pillars-grid">
                {text.doctorPillars.map((pillar) => (
                  <article key={pillar.num} className="doctor-pillar-card">
                    <span className="pillar-num">{pillar.num}</span>
                    <h3 className="pillar-title">{pillar.title}</h3>
                    <p className="pillar-desc">{pillar.desc}</p>
                  </article>
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
        <HomeColumnsArchive
          columns={latestColumns}
          eyebrow={text.columnsEyebrow}
          title={text.columnsTitle}
          subtitle={text.columnsSubtitle}
          readMoreText={text.columnsReadMore}
          viewAllText={text.columnsViewAll}
        />
      )}

      {/* 9. CONTACT SECTION */}
      <section className="contact-section reveal" id="contact">
        <p className="contact-slogan">{text.contactSlogan}</p>
        <p className="eyebrow">{text.contactEyebrow}</p>
        <h2>{text.contactTitle}</h2>
        <p>{text.contactBody}</p>
        <a className="contact-phone" href={clinic.phoneHref}>
          {clinic.phoneDisplay}
        </a>
      </section>

      {/* 10. FOOTER */}
      <SiteFooter isEnglish={isEnglish} />
    </main>
  );
}
