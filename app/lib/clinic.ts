export const SITE_URL = 'https://orbmed.co.kr';

export const clinic = {
  nameKo: '오브한의원 마곡점',
  nameEn: 'ORB Korean Medicine Clinic Magok',
  phoneDisplay: '02-6959-5982',
  phoneHref: 'tel:0269595982',
  addressKo: '서울 강서구 마곡중앙로 111, 롯데캐슬 르웨스트 104동 2층 238호·239호',
  addressEn:
    '111 Magokjungang-ro, Lotte Castle Le West, Building 104, 2F, Units 238–239, Gangseo-gu, Seoul',
  naverPlaceUrl: 'https://pcmap.place.naver.com/hospital/2005324011/home',
  naverBookingUrl:
    'https://m.booking.naver.com/booking/16/bizes/1731406?theme=place&lang=ko&area=ple',
  kakaoMapUrl:
    'https://map.kakao.com/link/search/%EC%98%A4%EB%B8%8C%ED%95%9C%EC%9D%98%EC%9B%90%20%EB%A7%88%EA%B3%A1%EC%A0%90',
  googleMapUrl:
    'https://www.google.com/maps/search/?api=1&query=%EC%98%A4%EB%B8%8C%ED%95%9C%EC%9D%98%EC%9B%90+%EB%A7%88%EA%B3%A1%EC%A0%90+%EC%84%9C%EC%9A%B8+%EA%B0%95%EC%84%9C%EA%B5%AC+%EB%A7%88%EA%B3%A1%EC%A4%91%EC%95%99%EB%A1%9C+111',
  googleMapEmbedUrl:
    'https://www.google.com/maps?q=%EC%84%9C%EC%9A%B8+%EA%B0%95%EC%84%9C%EA%B5%AC+%EB%A7%88%EA%B3%A1%EC%A4%91%EC%95%99%EB%A1%9C+111&output=embed',
} as const;

export type Locale = 'ko' | 'en';
export type TreatmentSlug =
  | 'pain-chuna'
  | 'autonomic-qeeg'
  | 'heat-metabolism'
  | 'diet'
  | 'stress-neurosis'
  | 'weight-metabolism';

type LocalizedText = {
  ko: string;
  en: string;
};

export type TreatmentMedicalInfo = {
  condition: {
    ko: {
      name: string;
      alternateName?: string;
      description: string;
      possibleTreatment: string[];
      associatedAnatomy: string[];
    };
    en: {
      name: string;
      alternateName?: string;
      description: string;
      possibleTreatment: string[];
      associatedAnatomy: string[];
    };
  };
  therapy: {
    ko: {
      name: string;
      alternateName?: string;
      description: string;
      procedureType: string;
      bodyLocation: string[];
    };
    en: {
      name: string;
      alternateName?: string;
      description: string;
      procedureType: string;
      bodyLocation: string[];
    };
  };
};

export type Treatment = {
  slug: TreatmentSlug;
  number: string;
  image: string;
  imagePosition?: string;
  imageFit?: 'cover' | 'contain';
  title: LocalizedText;
  shortTitle: LocalizedText;
  summary: LocalizedText;
  intro: LocalizedText;
  imageAlt: LocalizedText;
  concerns: { ko: string[]; en: string[] };
  care: { ko: string[]; en: string[] };
  medical?: TreatmentMedicalInfo;
};

export const treatments: Treatment[] = [
  {
    slug: 'pain-chuna',
    number: '01',
    image: 'naver-consultation',
    imagePosition: 'center center',
    title: { ko: '통증 · 추나', en: 'Pain · Chuna' },
    shortTitle: { ko: '통증과 움직임', en: 'Pain & movement' },
    summary: {
      ko: '목·허리·관절의 불편과 움직임 제한을 살피고, 현재 상태에 맞는 치료 방향을 안내합니다.',
      en: 'We assess pain, restricted movement, and functional discomfort to guide care for the current stage.',
    },
    intro: {
      ko: '통증의 위치만 보지 않고 발생 시점, 움직임, 일상 자세와 회복 경과를 함께 확인합니다. 진찰 결과에 따라 침, 약침, 추나와 생활 관리 방향을 조합해 안내합니다.',
      en: 'Care considers not only where pain is felt, but also onset, movement, daily posture, and recovery pattern. Acupuncture, pharmacopuncture, Chuna, and daily guidance may be discussed after assessment.',
    },
    imageAlt: {
      ko: '오브한의원 통증·추나 진료 및 상담 장면',
      en: 'Pain and Chuna consultation at ORB Korean Medicine Clinic',
    },
    concerns: {
      ko: ['목·어깨·허리 통증', '디스크·협착증 관련 불편', '관절 가동 범위 제한', '교통사고 후 지속되는 불편감'],
      en: ['Neck, shoulder, or lower-back pain', 'Disc- or stenosis-related discomfort', 'Restricted joint movement', 'Persistent discomfort after a traffic accident'],
    },
    care: {
      ko: ['문진과 움직임 평가', '현재 상태에 맞춘 치료 계획', '회복 단계에 따른 운동·생활 안내'],
      en: ['Consultation and movement assessment', 'A care plan matched to the current condition', 'Exercise and daily guidance for the recovery stage'],
    },
    medical: {
      condition: {
        ko: {
          name: '근골격계 척추·관절 통증 및 신경 포착 증후군',
          alternateName: '척추관 협착증, 목·허리 디스크, 만성 관절통',
          description: '목·어깨·허리 통증, 척추 디스크(추간판 탈출증), 척추관 협착증, 거북목, 관절 가동 범위 제한 및 교통사고 후유증',
          possibleTreatment: ['척추신경 추나요법', '소염진통 약침치료', '침구치료', '관절 가동성 회복 운동요법'],
          associatedAnatomy: ['Spine', 'Cervical vertebrae', 'Lumbar vertebrae', 'Joints'],
        },
        en: {
          name: 'Musculoskeletal Spinal Pain & Joint Dysfunction',
          alternateName: 'Spinal disc herniation, stenosis, chronic back and neck pain',
          description: 'Neck, shoulder, lower back pain, disc herniation, spinal stenosis, joint restriction, and post-accident trauma.',
          possibleTreatment: ['Chuna Manual Therapy', 'Pharmacopuncture', 'Acupuncture', 'Corrective exercise'],
          associatedAnatomy: ['Spine', 'Cervical vertebrae', 'Lumbar vertebrae', 'Joints'],
        },
      },
      therapy: {
        ko: {
          name: '척추신경 추나요법 및 심부 관절 가동 교정',
          alternateName: 'Chuna Manual Therapy',
          description: '한의사가 직접 손과 신체 부위, 추나 테이블을 활용하여 틀어진 척추와 관절의 정렬을 바로잡고 신경 압박과 근막 긴장을 정상화하는 한의 수기 치료',
          procedureType: 'NoninvasiveProcedure',
          bodyLocation: ['Spine', 'Neck', 'Lower Back', 'Pelvis'],
        },
        en: {
          name: 'Chuna Manual Therapy for Spine & Joint Mobilization',
          alternateName: 'Chuna Manual Therapy',
          description: 'Non-invasive manual manipulation by a licensed Korean medicine doctor to realign spinal structures and relieve neural tension.',
          procedureType: 'NoninvasiveProcedure',
          bodyLocation: ['Spine', 'Neck', 'Lower Back', 'Pelvis'],
        },
      },
    },
  },
  {
    slug: 'autonomic-qeeg',
    number: '02',
    image: 'naver-qeeg',
    imagePosition: 'center 38%',
    title: { ko: '자율신경 · 뇌파검사', en: 'Autonomic System · QEEG' },
    shortTitle: { ko: '자율신경과 뇌파', en: 'Autonomic system & QEEG' },
    summary: {
      ko: '문진과 진찰에 자율신경 검사와 정량뇌파 정보를 더해 현재의 피로와 긴장 상태를 진단합니다.',
      en: 'Consultation and examination are considered alongside autonomic and quantitative EEG data.',
    },
    intro: {
      ko: '검사 수치 하나만으로 상태를 단정하지 않습니다. 수면, 피로, 집중력, 신체 증상과 검사 결과를 함께 해석해 진료 방향을 설명합니다.',
      en: 'No single test result determines a diagnosis. Sleep, fatigue, concentration, physical symptoms, and test findings are reviewed together when discussing care.',
    },
    imageAlt: {
      ko: '오브한의원 정량뇌파검사 장면',
      en: 'Quantitative EEG assessment at ORB Korean Medicine Clinic',
    },
    concerns: {
      ko: ['쉽게 가라앉지 않는 긴장감', '만성피로와 브레인포그', '수면 리듬의 불편', '두근거림·열감·냉감 등 자율신경 관련 불편'],
      en: ['Persistent tension', 'Chronic fatigue and brain fog', 'Sleep rhythm concerns', 'Autonomic discomfort such as palpitations or temperature sensitivity'],
    },
    care: {
      ko: ['증상과 생활 리듬 문진', '필요 시 자율신경·QEEG 검사', '결과 설명과 개인별 진료 계획'],
      en: ['Review of symptoms and daily rhythm', 'Autonomic or QEEG assessment when appropriate', 'Results review and an individualized care plan'],
    },
    medical: {
      condition: {
        ko: {
          name: '자율신경실조증, 브레인포그 및 만성 신경계 과열',
          alternateName: '만성피로증후군, 신경쇠약, 공황성 두근거림',
          description: '각종 검사상 이상 없음에도 지속되는 만성 피로, 가슴 두근거림, 어지럼증, 수면장애, 머리가 멍하고 기억력이 떨어지는 브레인포그 증상',
          possibleTreatment: ['습식 정량화 뇌파검사(QEEG)', '심박변이도(HRV) 자율신경 평가', '중추 과열 진정 1:1 맞춤 한약', '상부경추 및 두개골 뇌신경 추나요법'],
          associatedAnatomy: ['Brain', 'Autonomic nervous system', 'Cervical spine'],
        },
        en: {
          name: 'Autonomic Dysregulation, Brain Fog & Chronic Neuro-Fatigue',
          alternateName: 'Dysautonomia, Chronic fatigue, Cognitive fog',
          description: 'Persistent chronic fatigue, sudden palpitations, dizziness, insomnia, and cognitive fuzziness despite normal standard labs.',
          possibleTreatment: ['Quantitative EEG (QEEG)', 'HRV autonomic testing', 'Customized neuro-fatigue herbal decoctions', 'Upper-cervical Chuna manual therapy'],
          associatedAnatomy: ['Brain', 'Autonomic nervous system', 'Cervical spine'],
        },
      },
      therapy: {
        ko: {
          name: '습식 정량화 뇌파검사(QEEG) 기반 뇌신경-자율신경 통합 치료',
          alternateName: 'Quantitative EEG Brain Mapping Therapy',
          description: '국제 10-20 시스템 19채널 습식 전극으로 두피 저항을 낮추고 뇌 피질 전위 및 심박변이도를 정밀 측정하여, 3차원 뇌기능 지형도(3D Brain Map)와 Z-score 편차를 분석한 후 맞춤 한약과 두개추나를 처방하는 치료법',
          procedureType: 'NoninvasiveProcedure',
          bodyLocation: ['Head', 'Brain', 'Cervical Spine', 'Autonomic Nervous System'],
        },
        en: {
          name: 'Quantitative EEG (QEEG) Multichannel Assessment & Integrative Care',
          alternateName: 'Quantitative EEG Brain Mapping Therapy',
          description: 'Multichannel wet-sensor QEEG mapping under international 10-20 system to pinpoint cortical hyperexcitability and guide herbal/Chuna restoration.',
          procedureType: 'NoninvasiveProcedure',
          bodyLocation: ['Head', 'Brain', 'Cervical Spine', 'Autonomic Nervous System'],
        },
      },
    },
  },
  {
    slug: 'heat-metabolism',
    number: '03',
    image: 'heat-metabolism-diti.png',
    imagePosition: 'center center',
    imageFit: 'contain',
    title: { ko: '열대사장애', en: 'Heat Metabolism' },
    shortTitle: { ko: '열대사장애', en: 'Heat Metabolism' },
    summary: {
      ko: '적외선체열검사(DITI)와 자율신경 평가를 통해 상열하한, 신경 순환 장애 및 국소 체열 불균형을 객관적으로 진단합니다.',
      en: 'Through DITI thermal imaging and autonomic evaluation, we objectively diagnose upper-body heat, lower-body cold, neural circulation disorders, and localized thermal imbalances.',
    },
    intro: {
      ko: '인체의 체열 분포는 자율신경계와 신경 순환의 상태를 직접적으로 반영합니다. 얼굴이나 상체로 열이 치솟는 상열감, 손발과 복부의 냉증, 원인 모를 감각 이상과 저림 등 체열 불균형의 원인을 적외선체열검사로 시각화하고, 순환을 회복시키는 맞춤 한약과 약침 치료를 시행합니다.',
      en: 'Body thermal distribution directly reflects the condition of the autonomic nervous system and neural circulation. We visualize imbalances such as facial flushing, cold extremities, and unexplained numbness with infrared thermography, guiding restorative herbal medicine and pharmacopuncture.',
    },
    imageAlt: {
      ko: '오브한의원 적외선체열검사(DITI)를 통한 열대사장애 및 신경 분절 체열 진단',
      en: 'DITI thermography diagnostic scan for heat metabolism and neural segment disorders at ORB Korean Medicine Clinic',
    },
    concerns: {
      ko: [
        '상열하한(얼굴·머리는 뜨겁고 손발·하체는 차가움)',
        '가슴 두근거림과 함께 동반되는 상열감 및 다한증',
        '목·허리 신경 분절에 따른 체열 저하 및 감각 이상',
        '원인 모를 수족냉증 및 만성 말초 순환 장애',
      ],
      en: [
        'Upper-body flushing with cold extremities',
        'Palpitations accompanied by facial heat or hyperhidrosis',
        'Segmental thermal deficits and paresthesia along cervical and lumbar nerves',
        'Unexplained cold extremities and chronic peripheral circulatory dysfunction',
      ],
    },
    care: {
      ko: [
        '적외선체열검사(DITI) 및 자율신경 평가',
        '체열 불균형 패턴 및 신경 분절 분석',
        '수승화강 맞춤 한약 및 신경 순환 약침 치료',
      ],
      en: [
        'Digital Infrared Thermal Imaging (DITI) and autonomic assessment',
        'Analysis of thermal patterns and neural segment deficits',
        'Customized circulatory herbal formulas and neural pharmacopuncture',
      ],
    },
    medical: {
      condition: {
        ko: {
          name: '열대사장애 및 상열하한증, 자율신경성 체열 불균형',
          alternateName: '갱년기 상열감, 수족냉증, 안면홍조',
          description: '얼굴과 머리로는 열이 치솟고 손발과 하체는 차가운 체열 불균형, 가슴 두근거림, 다한증, 신경 분절별 감각 저하 및 만성 말초 순환 장애',
          possibleTreatment: ['적외선체열검사(DITI)', '수승화강 순환 맞춤 한약', '신경 분절 순환 약침'],
          associatedAnatomy: ['Microcirculation', 'Peripheral nervous system', 'Sympathetic nervous system'],
        },
        en: {
          name: 'Heat Metabolism Dysregulation & Localized Thermal Imbalance',
          alternateName: 'Thermal dysregulation, Cold extremities syndrome',
          description: 'Upper-body flushing with cold extremities, palpitations, localized numbness, and autonomic peripheral circulatory disturbance.',
          possibleTreatment: ['DITI thermography', 'Circulatory herbal medicine', 'Segmental neural pharmacopuncture'],
          associatedAnatomy: ['Microcirculation', 'Peripheral nervous system', 'Sympathetic nervous system'],
        },
      },
      therapy: {
        ko: {
          name: '적외선체열검사(DITI) 진단 및 수승화강 체열 순환 치료',
          alternateName: 'DITI Infrared Thermography & Circulation Therapy',
          description: '인체 표면의 적외선 방출량을 감지하여 신경 분절별 체열 편차를 시각화하고 상체의 열을 내리고 하체를 따뜻하게 순환시키는 한약 및 약침 복합 치료',
          procedureType: 'NoninvasiveProcedure',
          bodyLocation: ['Whole body thermal distribution', 'Peripheral nerves'],
        },
        en: {
          name: 'Digital Infrared Thermal Imaging (DITI) & Thermal Regulation Care',
          alternateName: 'DITI Infrared Thermography & Circulation Therapy',
          description: 'Full-body infrared thermography visualization coupled with herbal and pharmacopuncture circulation therapy.',
          procedureType: 'NoninvasiveProcedure',
          bodyLocation: ['Whole body thermal distribution', 'Peripheral nerves'],
        },
      },
    },
  },
  {
    slug: 'diet',
    number: '04',
    image: 'diet-acurex-line.png',
    imagePosition: 'center center',
    title: { ko: '끝내는 다이어트', en: 'Diet' },
    shortTitle: { ko: '끝내는 다이어트', en: 'Diet' },
    summary: {
      ko: '단순한 체중 감량을 넘어 자율신경과 대사 균형을 바로잡고, 체질 맞춤 한약과 온다 리프팅 동일 기술 퀀텀핏, 아큐렉스 라인약침으로 지속 가능한 윤곽 변화를 돕습니다.',
      en: 'Beyond mere weight loss, we restore autonomic and metabolic balance through customized herbal formulas, Quantum Fit microwave lifting (same technology as ONDA), and Acurex Line pharmacopuncture.',
    },
    intro: {
      ko: '무리한 절식과 굶는 다이어트는 자율신경계를 무너뜨리고 요요를 유발합니다. 개인별 대사 효율과 신체 균형을 분석하여 식욕 안정 맞춤 한약, 온다 리프팅과 동일한 기술력의 퀀텀핏 리프팅, 고민 부위 지방 분해를 돕는 아큐렉스 라인 약침 치료를 결합해 건강하고 탄력 있는 체형 변화를 완성합니다.',
      en: 'Extreme calorie restriction disrupts autonomic homeostasis and triggers rebound weight gain. We integrate personalized metabolic herbs, Quantum Fit microwave lifting (sharing the same technology as ONDA lifting), and targeted Acurex Line pharmacopuncture to achieve sustainable, sculpted body contours.',
    },
    imageAlt: {
      ko: '오브한의원 퀀텀핏(온다 리프팅 동일 기술) 및 아큐렉스 라인약침 끝내는 다이어트 솔루션',
      en: 'Quantum Fit microwave lifting and Acurex Line pharmacopuncture at ORB Korean Medicine Clinic',
    },
    concerns: {
      ko: [
        '반복되는 요요와 정체기로 인한 다이어트 실패',
        '식욕 조절 곤란 및 스트레스성 폭식',
        '군살·복부·팔뚝·이중턱 등 특정 부위 라인 및 처짐 고민',
        '신진대사 저하와 부종을 동반한 체중 증가',
      ],
      en: [
        'Recurrent yo-yo cycles and weight loss plateaus',
        'Difficulty regulating appetite and stress eating',
        'Stubborn fat and sagging contours in double chin, abdomen, or arms',
        'Weight gain accompanied by sluggish metabolism and edema',
      ],
    },
    care: {
      ko: [
        '체성분 및 자율신경 대사 상태 정밀 분석',
        '개인별 체질 맞춤 끝내는 다이어트 한약 처방',
        '고민 부위 아큐렉스 라인약침 및 퀀텀핏(온다 동일 기술) 듀얼 윤곽 시술',
      ],
      en: [
        'Body composition and autonomic metabolic assessment',
        'Personalized herbal prescription for metabolic balance',
        'Dual contouring: Acurex Line pharmacopuncture & Quantum Fit (same technology as ONDA lifting)',
      ],
    },
    medical: {
      condition: {
        ko: {
          name: '대사저하형 비만 및 국소 체형 불균형 (이중턱, 복부, 팔뚝)',
          alternateName: '요요 증후군, 대사 저하, 국소 지방 축적',
          description: '무리한 절식 후 반복되는 요요현상, 스트레스성 식욕 항진, 부종 동반 체중 증가, 운동으로 빠지지 않는 국소 부위 군살 및 피부 처짐',
          possibleTreatment: ['체질 맞춤 끝내는 다이어트 한약', '퀀텀핏(온다 동일 기술) 극초단파 리프팅', '아큐렉스 라인약침'],
          associatedAnatomy: ['Subcutaneous adipose tissue', 'Facial contours', 'Lymphatic vessels'],
        },
        en: {
          name: 'Metabolic Obesity, Stubborn Localized Adiposity & Sagging Contours',
          alternateName: 'Yo-yo syndrome, Slow metabolic rate, Localized fat deposits',
          description: 'Yo-yo cycles from crash dieting, appetite dysregulation, sluggish metabolism, stubborn double chin, and body laxity.',
          possibleTreatment: ['Customized metabolic herbal medicine', 'Quantum Fit microwave lifting (same tech as ONDA)', 'Acurex Line pharmacopuncture'],
          associatedAnatomy: ['Subcutaneous adipose tissue', 'Facial contours', 'Lymphatic vessels'],
        },
      },
      therapy: {
        ko: {
          name: '퀀텀핏 마이크로웨이브 리프팅 & 아큐렉스 라인약침 듀얼 윤곽 시술',
          alternateName: 'Quantum Fit & Acurex Line Dual Contouring',
          description: '온다(ONDA) 리프팅과 동일한 2.45GHz 극초단파 에너지로 심부 지방세포 사멸과 콜라겐 수축을 유도하는 퀀텀핏과, 스테로이드·PPC 없는 순수 생약 성분으로 지방 림프 배출을 돕는 아큐렉스 라인약침의 듀얼 컨투어링 솔루션',
          procedureType: 'NoninvasiveProcedure',
          bodyLocation: ['Face', 'Double chin', 'Abdomen', 'Arms', 'Thighs'],
        },
        en: {
          name: 'Quantum Fit Microwave Lifting & Acurex Line Dual Contouring',
          alternateName: 'Quantum Fit & Acurex Line Dual Contouring',
          description: 'Painless 2.45GHz microwave lipolysis (ONDA technology) paired with natural herbal pharmacopuncture for non-invasive sculpting.',
          procedureType: 'NoninvasiveProcedure',
          bodyLocation: ['Face', 'Double chin', 'Abdomen', 'Arms', 'Thighs'],
        },
      },
    },
  },
];

export const gallery = [
  { image: 'reception', label: { ko: '안내 데스크', en: 'Reception' }, alt: { ko: '오브한의원 안내 데스크 전경', en: 'Reception desk at ORB Korean Medicine Clinic' } },
  { image: 'hero-lobby', label: { ko: '로비와 대기 공간', en: 'Lobby & waiting' }, alt: { ko: '오브한의원 로비와 대기 공간', en: 'Lobby and waiting area at ORB Korean Medicine Clinic' } },
  { image: 'media-wall', label: { ko: '대기 공간', en: 'Waiting area' }, alt: { ko: '오브한의원 대기 공간과 안내 화면', en: 'Waiting area and information display at ORB Korean Medicine Clinic' } },
  { image: 'logo-reception', label: { ko: '브랜드 월', en: 'Brand wall' }, alt: { ko: '오브한의원 로고가 있는 접수 공간', en: 'ORB logo wall and reception area' } },
  { image: 'corridor', label: { ko: '진료실 복도', en: 'Care corridor' }, alt: { ko: '오브한의원 독립 진료실로 이어지는 복도', en: 'Corridor leading to private care rooms' } },
  { image: 'consult-room', label: { ko: '진료실', en: 'Consultation room' }, alt: { ko: '오브한의원 진료 및 검사실', en: 'Consultation and examination room' } },
  { image: 'treatment-room', label: { ko: '치료 공간', en: 'Treatment rooms' }, alt: { ko: '오브한의원 독립 치료 공간', en: 'Private treatment rooms at ORB' } },
] as const;

export function getTreatment(slug: string) {
  if (slug === 'stress-neurosis') return treatments.find((t) => t.slug === 'heat-metabolism');
  if (slug === 'weight-metabolism') return treatments.find((t) => t.slug === 'diet');
  return treatments.find((treatment) => treatment.slug === slug);
}

export function treatmentPath(locale: Locale, slug: TreatmentSlug) {
  return `${locale === 'en' ? '/en' : ''}/treatments/${slug}`;
}
