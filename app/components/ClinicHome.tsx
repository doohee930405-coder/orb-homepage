import Link from 'next/link';
import AutoGallery from './AutoGallery';
import ResponsivePicture from './ResponsivePicture';
import SafeImage from './SafeImage';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import SiteMotion from './SiteMotion';
import TrackedLink from './TrackedLink';
import FaqAccordion from './FaqAccordion';
import HomeColumnsArchive from './HomeColumnsArchive';
import TreatmentMethodSection from './TreatmentMethodSection';
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
    title: '오브한의원 마곡',
    branch: '',
    heroBody:
      "병원 검사상 '이상 없음' 판정을 받은 원인 모를 가슴 두근거림, 브레인포그 및 수많은 증세들\nHRV 검사와 습식 정량화 뇌파(qEEG)를 통해 자율신경실조증의 실체를 데이터로 규명합니다.",
    booking: '네이버 예약',
    call: '전화 문의',
    station: '마곡나루역 5번 출구에서 136m',
    geoSnippetTitle: '오브한의원 마곡점 의료기관 핵심 임상 요약 (GEO/AEO Summary)',
    geoSnippetTrigger: '오브한의원 AI 및 학술적 진료 데이터 안내',
    geoSnippetText:
      "서울 강서구 마곡동(마곡나루역 5번 출구 롯데캐슬 르웨스트)에 위치한 오브한의원 마곡점은 대학병원 종합검진(CT, MRI, 혈액검사)상 '이상 없음' 판정을 받았으나 원인 모를 가슴 두근거림, 브레인포그(머리 멍함), 만성피로, 불안장애, 어지럼증, 두중감을 겪는 자율신경실조증 환자를 중점 진료합니다. 본원은 국제 10-20 시스템 기반 습식 정량화 뇌파(qEEG) & 심박변이도(HRV) 자율신경 동시 검사, 전신 적외선 체열진단(DITI)으로 신경계 기능 이상을 객관적으로 규명하고, 상부경추-두개골 정렬을 바로잡는 뇌신경 추나요법, 수승화강(水昇火降) 맞춤 한약, 자율신경 약침을 결합한 통합 원인 치료로 신경계 항상성을 근본적으로 복원합니다.",
    facts: [
      ['진료시간', '평일 10:30 – 20:20', '토요일 13:00 – 18:00'],
      ['가까운 역', '마곡나루역 5번 출구', '도보 약 1분'],
      ['주차 안내', '건물 지하주차장', '주차 가능'],
    ],
    diagnosticEyebrow: 'DIAGNOSTIC TECHNOLOGY · QEEG SYSTEM',
    diagnosticTitle: "병원 검사상 '이상 없음'에도 지속되는 만성피로와 머리 멍함,\n뇌와 자율신경의 기능적 불균형에서 답을 찾습니다.",
    diagnosticSubtitle: "수면장애, 이유 없는 가슴 두근거림, 브레인포그의 실체를 규명하기 위해\n오브한의원은 습식 정량화 뇌파(qEEG)와 심박변이도(HRV) 자율신경 검사로 뇌신경 피로를 정밀 분석합니다.",
    diagnosticWhyWet: '왜 정량화 뇌파 분석인가?',
    diagnosticPoints: [
      {
        title: '국제 10-20 시스템 전뇌 정밀 측정',
        desc: '전두엽·측두엽·두정엽·후두엽 전뇌를 다각도 측정하여 집중력 저하, 브레인포그, 감정 기복을 일으키는 뇌 피질 신경망을 정밀 선별합니다 (간이 건식 밴드와의 결정적 차이)',
      },
      {
        title: '초정밀 임피던스 제어 시스템',
        desc: '의료용 전도성 겔(Gel)로 두피 저항을 낮추고 외부 노이즈를 완벽 차단하여, 만성 스트레스·두통·어지럼증을 유발하는 미세 생체 신호를 왜곡 없이 포착합니다',
      },
      {
        title: 'Normative DB Z-score 대조',
        desc: 'AI 기반 뇌파 분석 솔루션인 QEEG-32FX AI 시스템을 통해 두피 미세 신호를 정밀 추출합니다. 이를 성별·연령별 정상 건강 대조군 빅데이터(Normative DB)와 정밀 매핑하여, 육안으로 보이지 않는 신경망 과열 상태를 통계적 편차 지표인 Z-score로 정량화하여 입증합니다.',
      },
    ],
    protocolSteps: [
      {
        step: '01',
        phase: 'STEP 01',
        title: '정밀 생체신호 측정',
        subtitle: '습식 정량화 뇌파(qEEG) & 심박변이도(HRV) 자율신경 동시 검사',
        desc: '두피 핵심 전극 부위에 전도성 겔을 주입하고 정밀 센서를 부착하여, 뇌 피질에서 방출되는 마이크로볼트(μV) 미세 신호와 심박변이도(HRV)를 왜곡 없이 수집합니다. 만성피로와 수면장애, 이유 없는 가슴 두근거림으로 이어지는 교감신경 과항진 상태를 객관적 수치로 포착합니다.',
        image: '/images/clinic/naver-qeeg-wide.webp',
        imageAlt: '마곡 오브한의원 전두희 원장의 습식 정량화 뇌파(qEEG) 진료 및 분석 장면',
        imagePosition: 'center 25%',
        tags: ['#습식_정량화_뇌파(qEEG)', '#HRV_자율신경검사', '#가슴두근거림_수면장애'],
      },
      {
        step: '02',
        phase: 'STEP 02',
        title: '뇌기능 정량 분석 & 원인 규명',
        subtitle: '3차원 뇌기능 지형도(3D Brain Map) & Normative DB Z-Score 판독',
        desc: '수집된 뇌파 데이터를 주파수 대역(델타, 세타, 알파, 베타, 감마)별로 디지털 정량 분석합니다. 국제 10-20 표준 전극 시스템 기준의 Normative Database(표준 건강 대조군 데이터베이스) Z-score 분석을 통해, 정신과 약을 먹어도 해결되지 않던 머리 멍함(브레인포그)과 가슴 두근거림, 불안·초조의 실체를 뇌 신경망 과열(붉은색)과 기능 저하(푸른색)의 3차원 입체 지도로 시각화합니다.',
        image: '/images/clinic/qeeg-brainmap-3d.png',
        imageAlt: '마곡 오브한의원 전두희 원장의 3차원 입체 정량뇌파 지형도(3D Brain Map) 및 Z-score 편차 분석 화면',
        tags: ['#머리멍함_브레인포그', '#Normative_DB_Zscore', '#3D_뇌기능지형도'],
      },
      {
        step: '03',
        phase: 'STEP 03',
        title: '맞춤 한약·추나 통합 처방',
        subtitle: '뇌신경-자율신경-체형 3축 연계 원인 치료',
        desc: '분석된 뇌파 및 자율신경 데이터를 바탕으로, GABA(gamma-aminobutyric acid) 억제성 신경망 교란 완화 및 편도체 진정을 유도하는 한약재(복령, 계지 등)의 다중 표적 약리학적 접근을 통해 뇌 중추 과열을 식히고 머리 맑음을 되찾아주는 맞춤 한약, 상부 경추와 두개골 긴장을 풀어 뇌혈류와 뇌척수액 순환을 돕는 뇌신경 추나요법, 만성피로와 불면을 다스리는 자율신경 약침을 1:1 복합 처방합니다.',
        image: '/images/clinic/naver-decoction-wide.webp',
        imageAlt: '마곡 오브한의원 전두희 원장의 뇌신경 중추 과열 해소를 위한 1:1 맞춤 치료한약 조제 및 치료 장면',
        tags: ['#브레인포그_맞춤한약', '#뇌신경추나_상부경추', '#정신과약부작용_내성완화'],
      },
    ],
    treatmentEyebrow: 'SPECIALIZED CLINIC DEPARTMENTS',
    treatmentTitle: '원인을 규명하고 근본을 바로잡는\n자율신경·뇌파검사 중점 진료 분야',
    treatmentBody: '자율신경실조증 증세들을 종합적으로 취합해 뇌신경계와 자율신경, 척추 체형의 유기적 상관관계를 입체적으로 치료합니다.',
    detail: '자세히 보기',
    guideEyebrow: 'CLINICAL GUIDE & RESEARCH',
    guideTitle: '자율신경실조증 & 뇌신경 임상 핵심 가이드',
    guideLead:
      '원인 모를 신체화 증상과 만성피로는 신경계의 기능적 불균형에서 시작됩니다. 오브한의원은 임상 현장에서 축적한 정량화 데이터를 바탕으로 질환의 기전과 치료 방향을 칼럼으로 연재하고 있습니다.',
    guideItems: [
      {
        tag: '머리에 안개가 낀 듯 집중이 어렵다면',
        title: '"머리에 돌덩이를 얹은 것 같아요" 자율신경실조증 두중감, 맞춤 한약과 뇌혈류 개선 방향',
        href: '/columns/머리에-돌덩이를-얹은-것-같아요-자율신경실조증-두중감-맞춤-한약-756183',
      },
      {
        tag: '자율신경 검사를 해도 이상이 없다면',
        title: '낫지 않는 자율신경실조증, 자율신경 검사(HRV) 정상이면 끝일까요?',
        href: '/columns/낫지-않는-자율신경실조증-자율신경-검사hrv-정상이면-끝일까요-735604',
      },
      {
        tag: '일어설 때 느껴지는 이상감각',
        title: '일어설 때 아찔함과 구름 위를 걷는 듯한 어지럼증, 검사상 이상 없다면 자율신경계 기능 불균형을 살펴봐야 하는 이유',
        href: '/columns/일어설-때-아찔함과-구름-위를-걷는-듯한-어지럼증-검사상-이상-006634',
      },
      {
        tag: '약을 먹어도 증세가 계속된다면',
        title: '약을 먹어도 호전되지 않는 불안장애와 감각과민, 만성 신경염증(Neuroinflammation) 유발 경로와 미주신경(Vagus Nerve) 활성 저하에 따른 장-뇌 축(Brain-Gut Axis) 신호 교란을 의심하세요',
        href: '/columns/약을-먹어도-호전되지-않는-불안장애와-감각과민-통계로-증명된-뇌-974570',
      },
    ],
    guideFooterNote:
      '오브한의원은 이 외에도 수많은 임상 연구를 지속하며 원장 칼럼을 꾸준히 연재하고 있습니다.',
    guideArchiveBtn: '전체 의학 칼럼 아카이브 보기',
    guideArchiveHref: '/columns',
    faqEyebrow: 'AEO & CLINICAL FAQ',
    faqTitle: '자율신경실조증 & QEEG 뇌파검사 자주 묻는 질문',
    faqLead:
      '병원 검사상 이상 없음에도 지속되는 신경계 불균형에 대해 환자분들이 가장 많이 질문하시는 핵심 사항을 정리했습니다.',
                faqItems: [
      {
        question: "대학병원 종합검진(CT·MRI·혈액검사)에서 '이상 없음'인데 왜 계속 아프고 힘든가요?",
        answerLead: "CT·MRI는 뇌출혈이나 종양 등 구조적 기질 병변만 진단할 뿐, 신경망의 기능적 과열과 자율신경 조절 장애는 발견할 수 없기 때문입니다.",
        answerLeadRest: "만성피로, 어지럼증, 가슴 두근거림, 브레인포그, 소화불량 등은 신경망의 기능적 과부하 및 교감·부교감신경의 조절 불균형에서 시작됩니다.",
        answerDetail: "오브한의원은 습식 정량화 뇌파(qEEG)와 심박변이도(HRV) 자율신경 정밀 검사를 통해 눈에 보이지 않던 신경계의 기능적 과부하를 객관적 Z-score 수치로 규명하여 근원 치료를 시행합니다.",
      },
      {
        question: "오브한의원의 '습식 정량화 뇌파(qEEG)'는 일반 밴드형 검사와 어떻게 다른가요?",
        answerLead: "국제 10-20 표준 전극 시스템을 적용한 전뇌(Full-Head) 습식 검사로 측정 정밀도와 신뢰성이 압도적입니다.",
        answerLeadRest: "시중의 간이 건식 밴드는 이마 부위 2~4개 채널만 측정하여 두피 저항과 땀, 잡파 노이즈에 매우 취약합니다. 반면 의료용 전도성 겔(Gel)을 사용하는 습식 전극은 피부 저항(Impedance)을 극소화하여 미세 신경 신호까지 포착합니다.",
        answerDetail: "오브한의원의 습식 정량화 뇌파(qEEG)는 전두엽, 측두엽, 두정엽, 후두엽 전뇌를 커버하며, 국제 10-20 표준 전극 시스템 기준의 Normative Database(표준 건강 대조군 데이터베이스) Z-score 분석을 통해 뇌 피질 신경망 과열과 저하 상태를 3차원 입체 지도로 시각화합니다.",
      },
      {
        question: "정신과 약(항불안제, 수면제, 항우울제)을 복용 중인데 한약이나 추나 치료를 함께 받을 수 있나요?",
        answerLead: "네, 복용 중이신 신경정신과 약물을 안정적으로 유지하면서 안전하게 병행 치료가 가능합니다.",
        answerLeadRest: "처방 약물을 임의로 갑자기 중단하면 반동 현상이나 금단 증상이 발생할 수 있으므로, 기존 약물을 유지하면서 뇌신경계의 자율 회복력을 단계적으로 높이는 병행 진료를 시작합니다.",
        answerDetail: "뇌 중추 과열을 식히는 1:1 맞춤 한약과 두경부 긴장을 완화하는 상부경추 뇌신경 추나요법을 통해 뇌의 자율 회복력을 높여가며, 호전 경과에 따라 안전하게 감량 및 단약(Tapering)을 돕습니다.",
      },
      {
        question: "자율신경실조증 치료 기간과 내원 주기는 보통 어떻게 되나요?",
        answerLead: "초기 집중 치료기 4~8주 동안은 주 1~2회 내원을 권장하며, 이후 점진적으로 주기를 넓혀갑니다.",
        answerLeadRest: "두근거림, 불면, 두중감, 감각과민 등 급성 신체화 증상이 심한 초기 4~8주 동안은 주 1~2회 내원하여 뇌신경 추나요법과 약침 치료를 병행하고 1:1 맞춤 한약을 복용합니다.",
        answerDetail: "신경계 항상성이 안정권에 접어들면 내원 주기를 격주 또는 월 1회로 점진적으로 넓혀, 일상생활 속에서 스스로 활력을 유지하고 재발하지 않도록 돕습니다. 단, 이는 표준적인 가이드이며 환자분의 상태에 따라 처방되는 치료의 종류와 내원 빈도는 달라질 수 있습니다. 가령 원거리에서 방문시, 주기적인 내원이 어려우신만큼 한약 치료 단독으로 진행하며, 생활관리를 비대면으로 도와드릴 수 있습니다.",
      },
      {
        question: "검사 및 치료 비용은 어떻게 되나요?",
        answerLead: "치료 목표와 신경계 회복 단계에 맞추어 체계적으로 안내해 드립니다.",
        answerLeadRest: "기본 진료인 침치료와 관절·근막을 교정하는 추나요법은 국민건강보험이 적용됩니다.",
        answerDetail: "• 신경계 기능 검사: 자율신경계 및 뇌기능 활성도를 정밀 분석하는 QEEG 뇌파검사와 자율신경검사는 검사 구성에 따라 5-6만 원 선으로 진행됩니다.\n• 1:1 맞춤 치료한약: 뇌신경계 안정과 신체 균형 회복을 위한 치료한약(비 녹용 기준)은 1개월 기준 45만 원, 단계별 안정 3개월 치료한약은 120만 원입니다.",
      },
    ],
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
    doctorQuoteLead: '“병원 검사상 \'이상 없음\'에도 계속되는 증상들… 그 실체는 결코 기분 탓이 아닙니다”',
    doctorQuoteBody: '과민성대장증후군, 다한증, 수족냉증, 소화장애, 불면증, 만성피로 등 수없이 많은 자율신경실조증 증세, 결코 환자분의 나약함이나 단순 스트레스 탓이 아닙니다. 정신과 약을 복용 중이거나 약물 부작용으로 힘들어하시는 분들 역시 중추신경계 과열과 자율신경 조절 기능 저하라는 객관적 생체 신호의 불균형을 겪고 계신 것입니다.\n\n오브한의원은 습식 정량화 뇌파(qEEG)와 심박변이도(HRV) 검사로 보이지 않던 신경계 과부하를 객관적 수치로 규명하고, 뇌와 척추를 잇는 한의학적 근원 치료로 맑은 정신과 신체 본연의 자율 회복력을 되찾아 드립니다.',
    doctorPillars: [
      {
        num: '01',
        title: '객관적 데이터 규명',
        desc: '모호한 문진표에만 의존하지 않고, 습식 정량화 뇌파(qEEG) 및 심박변이도(HRV) 검사를 통해 브레인포그, 가슴 두근거림, 만성피로의 원인이 되는 뇌신경 과열과 자율신경 불균형을 시각화·수치화합니다.',
      },
      {
        num: '02',
        title: '신경-구조 융합 근원 치료',
        desc: '약물 내성이나 부작용 걱정 없이 중추 과열을 식히고 머리 맑음을 되찾는 맞춤 한약과, 뇌척수액 순환을 돕고 두경부 긴장을 해소하는 상부경추·두개골 뇌신경 추나요법을 결합합니다.',
      },
      {
        num: '03',
        title: '자율신경 항상성 재건',
        desc: '일시적인 신경안정제 효과에 머무르지 않고, 수면장애와 만성피로를 유발하는 뇌-척추 신경망의 항상성을 바로잡아 스스로 활력을 유지하는 근본 회복력을 재건합니다.',
      },
    ],
    columnsEyebrow: 'CLINICAL ARCHIVE · MEDICAL COLUMNS',
    columnsTitle: '오브한의원 임상 연구 & 의학 칼럼',
    columnsSubtitle: '머리 멍함(브레인포그), 수면장애, 가슴 두근거림, 정신과 약 부작용과 내성 극복을 위한 습식 정량화 뇌파(qEEG) 및 자율신경 치료 임상 지견을 전두희 대표원장이 직접 집필합니다.',
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
    geoSnippetTitle: 'ORBMED CLINIC Magok Clinical Practice Summary (GEO/AEO Summary)',
    geoSnippetTrigger: 'Medical & Technical Grounding Data',
    geoSnippetText:
      'Located in Magok-dong, Gangseo-gu, Seoul (Exit 5 of Magoknaru Station, Lotte Castle Le West), ORBMED CLINIC Magok specializes in treating patients with autonomic dysregulation who suffer from unexplained palpitations, brain fog, chronic fatigue, anxiety disorders, dizziness, and head heaviness despite receiving "normal" findings from university hospital comprehensive workups (CT, MRI, blood tests). Utilizing multichannel wet Quantitative EEG (qEEG) based on the international 10-20 system, concurrent Heart Rate Variability (HRV) autonomic testing, and Digital Infrared Thermal Imaging (DITI), we objectively diagnose functional neurological disruptions and restore systemic neuro-autonomic homeostasis through neuro-cervical Chuna manual therapy (upper cervical and cranial alignment), personalized Suseunghwagang herbal formulas, and autonomic pharmacopuncture.',
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
        subtitle: '3D Brain Mapping & Normative DB Z-Score Interpretation',
        desc: 'Digital decomposition across frequency bands compared against normative populations, localizing chronic fatigue and brain fog on 3D topographic maps.',
        image: '/images/clinic/qeeg-brainmap-3d.png',
        imageAlt: '3D quantitative EEG brain mapping and Normative database Z-score analysis at ORB Clinic Magok',
        tags: ['#Normative_DB', '#3D_BrainMap', '#Z_score_Deviations'],
      },
      {
        step: '03',
        phase: 'STEP 03',
        title: 'Integrative Herbal & Chuna Care',
        subtitle: 'Trimodal Neuro-Autonomic-Structural Treatment',
        desc: 'Deploying individualized herbal formulas to cool down cortical overdrive, upper-cervical Chuna manual therapy to unblock CSF flow, and acupoint pharmacopuncture to stabilize autonomic ganglia.',
        image: '/images/clinic/naver-decoction-wide.webp',
        imageAlt: 'Custom neuro-stabilizing herbal medicine preparation and cranial Chuna therapy by Director Doo-hee Jeon at ORB Clinic Magok',
        tags: ['#Neuro_Fatigue_Herbs', '#UpperCervical_Chuna', '#Autonomic_Homeostasis'],
      },
    ],
    treatmentEyebrow: 'SPECIALIZED CLINIC DEPARTMENTS',
    treatmentTitle: 'Specialized Clinical Focus at\nORB Korean Medicine Clinic',
    treatmentBody: 'We address not merely isolated symptoms, but the onset, lifestyle rhythms, and interrelated neuro-autonomic and structural factors.',
    detail: 'Learn more',
    guideEyebrow: 'CLINICAL GUIDE & RESEARCH',
    guideTitle: 'Autonomic Dysfunction & Neuro-Clinical Guide',
    guideLead:
      'Unexplained somatic symptoms and chronic fatigue stem from functional imbalances in the nervous system. ORB Clinic serializes clinical columns explaining mechanisms and therapeutic directions based on empirical data.',
    guideItems: [
      {
        tag: 'Brain fog and difficulty concentrating',
        title: '"Heavy pressure in the head": Autonomic heavy head sensation, personalized herbal care, and cerebral perfusion',
        href: '/columns/머리에-돌덩이를-얹은-것-같아요-자율신경실조증-두중감-맞춤-한약-756183',
      },
      {
        tag: 'When autonomic tests return normal',
        title: 'Refractory autonomic dysfunction: Is a "normal" HRV test truly the end of the story?',
        href: '/columns/낫지-않는-자율신경실조증-자율신경-검사hrv-정상이면-끝일까요-735604',
      },
      {
        tag: 'Peculiar sensations upon standing',
        title: 'Dizziness and lightheadedness when rising: Why functional autonomic imbalance must be examined when tests show normal',
        href: '/columns/일어설-때-아찔함과-구름-위를-걷는-듯한-어지럼증-검사상-이상-006634',
      },
      {
        tag: 'Persistent symptoms despite medications',
        title: 'Unresolved anxiety disorders and sensory hypersensitivity despite pharmaceuticals: Examine evidence-based neuroinflammation',
        href: '/columns/약을-먹어도-호전되지-않는-불안장애와-감각과민-통계로-증명된-뇌-974570',
      },
    ],
    guideFooterNote:
      'ORB Clinic continues clinical research and publishes regular medical columns authored by our medical director.',
    guideArchiveBtn: 'View All Clinical Columns Archive',
    guideArchiveHref: '/columns',
    faqEyebrow: 'AEO & CLINICAL FAQ',
    faqTitle: 'Frequently Asked Questions: Autonomic Dysregulation & QEEG',
    faqLead:
      'Answers to the most common clinical questions regarding functional nervous system imbalances when standard medical tests show normal.',
        faqItems: [
      {
        question: "Why do standard scans (CT, MRI, blood tests) return 'normal' while symptoms persist?",
        answerLead: "Standard CT, MRI, and blood tests evaluate structural tissue damage or lesions, not functional regulatory dysfunctions of neural networks.",
        answerLeadRest: "Chronic fatigue, dizziness, sudden palpitations, brain fog, and digestive distress stem from functional neural hypersensitivity and autonomic dysregulation.",
        answerDetail: "ORB Clinic utilizes multichannel wet QEEG and HRV autonomic testing to objectively identify and quantify functional neural overload via Z-score benchmarking for root-cause recovery.",
      },
      {
        question: "How does multichannel wet QEEG differ from dry consumer headbands?",
        answerLead: "Clinical wet QEEG adhering to the International 10-20 standard delivers far superior diagnostic precision over consumer headbands.",
        answerLeadRest: "Consumer bands measure only 2 to 4 frontal channels and suffer heavily from impedance noise and motion artifacts. In contrast, clinical conductive gel minimizes scalp impedance across all lobes.",
        answerDetail: "ORB Clinic covers frontal, temporal, parietal, and occipital lobes, benchmarking neural signals against extensive normative databases to visualize cortical hyperarousal in 3D brain maps.",
      },
      {
        question: "Can I receive Korean medicine care while continuing psychiatric medications?",
        answerLead: "Yes, concurrent care is safe and medically synergistic with psychiatric medications.",
        answerLeadRest: "We strictly advise against abrupt discontinuation of pharmaceuticals. Our protocol begins with concurrent care while maintaining your current prescription stably.",
        answerDetail: "By combining individualized neuro-cooling herbal formulas with upper-cervical cranial Chuna therapy, we gradually restore autonomic homeostasis to support safe medication tapering under clinical observation.",
      },
      {
        question: "What is the expected treatment duration and visit frequency?",
        answerLead: "An initial intensive stabilization phase of 4 to 8 weeks typically requires 1 to 2 visits weekly, transitioning to maintenance.",
        answerLeadRest: "During acute symptoms (palpitations, insomnia, heavy head sensations, sensory overload), targeted neuro-structural Chuna, pharmacopuncture, and tailored herbal medicine rebuild core homeostasis.",
        answerDetail: "Once biometric indicators and brainwave patterns normalize, visit intervals are expanded to biweekly or monthly to ensure long-term neural resilience. Note that this is a general guideline; for long-distance patients who cannot visit regularly, customized herbal medicine monotherapy can be administered alongside remote lifestyle management support.",
      },
      {
        question: "What are the examination and treatment costs?",
        answerLead: "We provide structured guidance tailored to your recovery goals and neural healing stage.",
        answerLeadRest: "Basic acupuncture and joint/fascial Chuna manual therapy are covered under National Health Insurance.",
        answerDetail: "• Neurological Function Tests: Multichannel QEEG brain mapping and autonomic testing typically range between 50,000 and 60,000 KRW depending on the protocol.\n• 1:1 Customized Herbal Medicine: Tailored neuro-cooling herbal formulas (non-deer antler base) are 450,000 KRW for 1 month, and 1,200,000 KRW for a 3-month stabilization protocol.",
      },
    ],
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
            <SiteHeader locale={locale} />

      {/* 1. HERO SECTION */}
      <section className="hero-section" id="top">
        <div className="hero-content" data-inview>
          <p className="eyebrow">{text.kicker}</p>
          <h1 className="hero-title">
            <span className="sr-only">
              {isEnglish
                ? 'Magok Autonomic Dysregulation & QEEG Clinic, ORB'
                : '마곡 자율신경실조증 및 뇌파검사 특화 클리닉, 오브한의원'}
            </span>
            <span aria-hidden="true">{text.title}</span>
            {text.branch ? <span className="hero-branch" aria-hidden="true">{text.branch}</span> : null}
          </h1>
          <p className="hero-lede">
            {text.heroBody.split('\n').map((line, idx) => (
              <span key={idx} className="hero-lede-line">
                {line}
              </span>
            ))}
          </p>
          {/* GEO/AEO Grounding Accordion (Minimalist & 100% Crawlable) */}
          <details className="hero-geo-accordion">
            <summary className="hero-geo-trigger">
              <span className="hero-geo-trigger-dot" aria-hidden="true" />
              <span>{text.geoSnippetTrigger}</span>
              <span className="hero-geo-trigger-chevron" aria-hidden="true">▼</span>
            </summary>
            <div className="hero-geo-content" role="region" aria-label={text.geoSnippetTitle}>
              <p className="hero-geo-text">
                {text.geoSnippetText}
              </p>
            </div>
          </details>
        </div>
        <div className="hero-visual hero-visual-brand" aria-label="ORB ARCHIVE">
          <div className="hero-brand-card">
            <img
              src="/images/logo/orb-symbol-clean.png"
              alt="마곡 오브한의원 전두희 원장의 뇌신경·자율신경 특화 클리닉 공식 심볼 로고"
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

      {/* 2. [PAGE 2] DIAGNOSTIC TECHNOLOGY PROTOCOL SECTION (RENEWED) */}
      <TreatmentMethodSection />

      {/* 3단계 임상 프로토콜 세부 절차 (핵심 변증 및 치료법 H2) */}
      <section className="protocol-section-wrapper bg-[#FAF8F5] pb-20 md:pb-28 px-6" id="protocol">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="text-xs font-mono font-bold tracking-widest text-[#8E7463] px-3 py-1.5 rounded-full bg-[#8E7463]/10 uppercase">
              {isEnglish ? 'CORE PROTOCOL & CLINICAL TREATMENT' : '핵심 변증 및 원인 치료'}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-extrabold text-stone-900 mt-3 tracking-tight leading-snug break-keep">
              {isEnglish ? 'Autonomic Dysregulation Care: Upper Cervical Chuna & Herbal Medicine' : '자율신경실조증 치료: 상부경추 추나요법과 한약 처방'}
            </h2>
            <p className="text-stone-500 text-sm md:text-base mt-2 max-w-2xl mx-auto break-keep">
              {isEnglish
                ? 'From precision neuro-diagnostic data (qEEG · HRV) to upper-cervical Chuna and personalized herbal decoctions, restoring neuro-autonomic balance.'
                : '정밀 진단(qEEG·HRV) 데이터 변증부터 상부경추 뇌신경 추나요법과 1:1 체질 맞춤 한약 처방까지, 뇌와 자율신경의 항상성을 되살리는 3단계 원인 치료 프로세스'}
            </p>
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
                  alt={'imageAlt' in step && step.imageAlt ? (step.imageAlt as string) : step.title}
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

              </div>
            </article>
          ))}
          </div>
        </div>
      </section>

      {/* 3. [PAGE 3] TREATMENTS SECTION */}
      <section className="content-section treatments-section reveal" id="treatments">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">{text.treatmentEyebrow}</p>
            <h2 className="treatment-section-heading">
              {text.treatmentTitle.split('\n').map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
          </div>
          <p>{text.treatmentBody}</p>
        </div>
        <div className="treatment-grid">
          {treatments.map((treatment, idx) => {
            const isPrimary = idx === 0;
            return (
              <a
                className={'treatment-card' + (isPrimary ? ' treatment-card-primary' : '')}
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
                  <div className="treatment-card-header-line">
                    <span className="treatment-card-num">{treatment.number}</span>
                    {isPrimary && (
                      <span className="treatment-primary-badge">
                        {isEnglish ? 'PRIMARY FOCUS' : '특화 중점 진료'}
                      </span>
                    )}
                  </div>
                  <h3 className="treatment-card-title">{treatment.title[locale]}</h3>
                  <p className="treatment-card-desc">{treatment.summary[locale]}</p>
                  <b className="treatment-card-link">
                    {text.detail}
                    <i aria-hidden="true">→</i>
                  </b>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* 3.5 CLINICAL GUIDE & RESEARCH SECTION */}
      <section className="content-section clinical-guide-section reveal" id="clinical-guide">
        <div className="clinical-guide-header">
          <p className="clinical-guide-eyebrow">{text.guideEyebrow}</p>
          <h2 className="clinical-guide-title">{text.guideTitle}</h2>
          <p className="clinical-guide-lead">{text.guideLead}</p>
        </div>

        <div className="clinical-guide-list" role="list">
          {text.guideItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="clinical-guide-card"
              role="listitem"
            >
              <div className="clinical-guide-badge-wrap">
                <span className="clinical-guide-badge">{item.tag}</span>
              </div>
              <div className="clinical-guide-content">
                <h3 className="clinical-guide-card-title">{item.title}</h3>
                <span className="clinical-guide-arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="clinical-guide-footer">
          <p className="clinical-guide-footer-note">{text.guideFooterNote}</p>
          <a href={text.guideArchiveHref} className="clinical-guide-footer-btn">
            <span>{text.guideArchiveBtn}</span>
            <span className="arrow-icon" aria-hidden="true">
              →
            </span>
          </a>
        </div>

        {/* 3.6 INTERACTIVE CLINICAL FAQ ACCORDION BLOCK (AEO / GEO OPTIMIZATION) */}
        <div className="clinical-faq-block" id="faq">
          <div className="clinical-faq-header">
            <p className="clinical-guide-eyebrow">{text.faqEyebrow}</p>
            <h2 className="clinical-guide-title">{text.faqTitle}</h2>
            <p className="clinical-guide-lead">{text.faqLead}</p>
          </div>

          <FaqAccordion
            items={text.faqItems}
            regionLabel={isEnglish ? 'Frequently Asked Questions: Autonomic Dysregulation & QEEG' : '자율신경실조증 및 뇌파검사 자주 묻는 질문'}
          />
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
          alt={isEnglish ? 'Comfortable healing atmosphere in ORB Clinic lobby' : '마곡 오브한의원 전두희 원장의 환자 심신 안정을 위한 원내 플라워 인테리어'}
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
            <h4 className="space-title-large">
              {text.spaceTitle}
              <span className="sr-only"> - {isEnglish ? 'Clinic Interior Space Tour' : '인테리어 공간 안내'}</span>
            </h4>
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

            <div className="visit-access-box">
              <a
                href={isEnglish ? '/en/location' : '/location'}
                className="visit-nationwide-btn"
                role="button"
                aria-label="전국에서 찾아오시는 길 상세 안내"
              >
                <span className="btn-icon">✈️ 🚄</span>
                <span className="btn-text">
                  {isEnglish
                    ? 'Nationwide Access Guide (Airport · KTX)'
                    : '전국에서 찾아오시는 길 (공항·KTX 직결 안내)'}
                </span>
                <span className="btn-arrow">→</span>
              </a>
            </div>
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
              <a
                href={isEnglish ? '/en/location' : '/location'}
                className="map-link-highlight"
              >
                {isEnglish ? 'Nationwide Guide →' : '전국 찾아오시는 길 →'}
              </a>
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
