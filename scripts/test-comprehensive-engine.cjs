const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'content', 'columns');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

// Refined topic detection
function getTopicKey(category, title, content) {
  const normCat = (category || '').trim();
  const cTitle = (title || '').toLowerCase();
  const cBody = (content || '').toLowerCase();

  if (cTitle.includes('복압') || cTitle.includes('호흡') || cTitle.includes('횡격막')) return '복압호흡';
  if (normCat === 'ADHD' || cTitle.includes('adhd') || cTitle.includes('콘서타')) return 'ADHD';
  if (normCat === '초민감자(HSP)' || cTitle.includes('초민감자') || cTitle.includes('hsp')) return '초민감자(HSP)';
  if (normCat === '브레인포그' || cTitle.includes('브레인포그') || cTitle.includes('브레인 포그')) return '브레인포그';
  if (normCat === '갑상선' || cTitle.includes('갑상선') || cTitle.includes('씬지로이드')) return '갑상선';
  if (normCat === '다이어트' || cTitle.includes('다이어트') || cTitle.includes('요요') || cTitle.includes('위고비') || cTitle.includes('마운자로')) return '다이어트';
  if (normCat === '위장관' || cTitle.includes('위장') || cTitle.includes('소화') || cTitle.includes('장누수') || cTitle.includes('담적') || cTitle.includes('식도')) return '위장관';
  if (cTitle.includes('두통') || cTitle.includes('후두신경') || cTitle.includes('경추성')) return '두통';
  if (cTitle.includes('불면') || cTitle.includes('불안') || cTitle.includes('수면') || cTitle.includes('공황')) return '불면/불안';
  if (normCat === '자율신경실조증' || cTitle.includes('자율신경')) return '자율신경실조증';

  if (cBody.includes('복압') || cBody.includes('횡격막')) return '복압호흡';
  if (cBody.includes('adhd')) return 'ADHD';
  if (cBody.includes('초민감자') || cBody.includes('hsp')) return '초민감자(HSP)';
  if (cBody.includes('브레인포그')) return '브레인포그';
  if (cBody.includes('갑상선')) return '갑상선';
  if (cBody.includes('다이어트')) return '다이어트';
  if (cBody.includes('위장') || cBody.includes('소화')) return '위장관';
  
  return '자율신경실조증';
}

// Variation banks
const QEEG_CONNECTIVE_BANKS = {
  '복압호흡': [
    '횡격막 운동성과 심폐 순환 연동을 정밀 파악하는 다채널 습식 정량화 뇌파(QEEG) 스펙트럼과 심박변이도(HRV) 자율신경 지표를 유기적으로 대조 분석하여,',
    '호흡 불균형으로 인한 피질 과각성을 측정하는 고해상도 습식 뇌파(QEEG)와 미주신경 활성도를 대변하는 심박 간격 변이(HRV)를 상호 교차 검증함으로써,',
    '뇌-심장-내장 축의 기능적 동기화를 평가하는 습식 QEEG 뇌파 프로파일과 자율신경계(HRV) 항상성 계측치를 종합적으로 연계하여,',
    '과호흡성 뇌혈류 저하와 중추성 긴장도를 계측하는 정량화 뇌파(QEEG) 및 심박 자율조절능(HRV) 지표를 면밀히 대조 판독하여,'
  ],
  '자율신경실조증': [
    '다채널 습식 정량화 뇌파(QEEG) 스펙트럼 측정치와 심박변이도(HRV) 자율신경 지표를 유기적으로 대조 분석하여,',
    '두피 전극을 통한 고해상도 습식 뇌파(QEEG) 분석과 심박 간격의 미세 변이(HRV) 측정을 상호 교차 검증함으로써,',
    '대뇌 피질의 주파수별 파워 스펙트럼(QEEG)과 교감·부교감신경의 역동성을 보여주는 자율신경(HRV) 데이터를 정밀 평가하여,',
    '중앙자율신경망(CAN)의 통제력을 가늠하는 고감도 습식 QEEG 계측치와 심혈관계 신경 조절능(HRV)을 복합적으로 연계하여,',
    '뇌신경망의 미세 활성도를 반영하는 습식 뇌파(QEEG) 계측과 심박 자율조절(HRV) 추이를 체계적으로 종합 판독하여,'
  ],
  'ADHD': [
    '전두엽 세타/베타 비율(TBR)과 감각운동리듬을 계측하는 습식 정량화 뇌파(QEEG) 판독과 자율신경계 반응성(HRV) 지표를 유기적으로 대조하여,',
    '대뇌 피질의 기능적 각성도(QEEG)와 스트레스 회복 탄력성을 대변하는 심박변이도(HRV) 생체 데이터를 입체적으로 비교·분석하여,',
    '주의 집중 네트워크의 동기화 상태를 추적하는 습식 뇌파(QEEG)와 자율신경 항상성(HRV) 지표를 정밀하게 상호 교차하여,',
    '고밀도 습식 전극 기반의 정량화 뇌파(QEEG) 스펙트럼과 심박 조절 역동성(HRV)을 종합적인 임상 판단의 객관적 근거로 삼아,'
  ],
  '초민감자(HSP)': [
    '외부 자극 게이팅 결손 및 피질 과각성 추이를 포착하는 고해상도 습식 뇌파(QEEG)와 교감-부교감 밸런스를 측정하는 HRV 지표를 정밀 연계하여,',
    '신경계의 역치 저하와 알로스타틱 부하를 객관화하는 다채널 습식 뇌파(QEEG) 프로파일 및 심박변이도(HRV) 반응성을 다각도로 대조 판독하여,',
    '뇌섬엽-편도체 신경망의 미세 활성을 관찰하는 습식 정량뇌파(QEEG)와 자율신경 피로도를 나타내는 HRV 스펙트럼을 체계적으로 감안하여,'
  ],
  '브레인포그': [
    '대뇌 피질 전반의 서파(Delta/Theta) 정체와 신경 신호 지연을 확인하는 습식 QEEG 데이터와 심혈관계 신경 적응도(HRV)를 종합 평가하여,',
    '뇌신경망의 연결성(Coherence) 이상과 자율신경 활성 저하를 계측하는 습식 정량화 뇌파(QEEG) 및 심박변이도(HRV) 분석을 면밀히 대조하여,',
    '피질 억제 상태와 미세순환 저하 소견을 가늠하는 고감도 습식 뇌파(QEEG)와 심박 자율조절능(HRV)을 유기적으로 연계 판독하여,'
  ],
  '갑상선': [
    '대뇌 대사 저하 및 신경계 조절 불균형을 추적하는 습식 정량뇌파(QEEG) 분석과 자율신경계(HRV) 항상성 지표를 종합적으로 검토하여,',
    '중추신경계 피로도와 말초 자율신경 긴장도를 평가하는 다채널 습식 뇌파(QEEG) 계측 및 심박변이도(HRV) 데이터를 정밀 상호 대조하여,'
  ],
  '다이어트': [
    '시상하부 식욕 조절 회로의 과흥분도 및 대사 스트레스를 확인하기 위해 습식 뇌파(QEEG)와 자율신경 심박변이도(HRV)를 체계적인 참고 지표로 삼아,',
    '뇌 보상회로의 민감도와 교감신경 항진 추이를 관찰하는 습식 정량뇌파(QEEG) 및 심박 자율조절(HRV) 데이터를 다각도로 교차 검증하여,'
  ],
  '위장관': [
    '뇌-장 축(Gut-Brain Axis)의 신경 신호 전달 상태를 파악하고자 다채널 습식 정량뇌파(QEEG)와 미주신경 활성도를 가늠하는 HRV 검사 소견을 복합적으로 고려하여,',
    '중추 신경 피로와 장신경계(ENS) 조절 상태를 대변하는 고해상도 습식 뇌파(QEEG) 및 자율신경 심박변이도(HRV) 지표를 유기적으로 연계 판독하여,'
  ],
  '두통': [
    '뇌혈관의 미세 경련 및 피질 과흥분성을 추적하는 습식 뇌파(QEEG)와 심혈관 자율 조절력(HRV)을 다각도로 상호 대조하여,',
    '삼차신경-혈관 신경망의 과감작 여부를 평가하는 정량뇌파(QEEG) 지표와 자율신경 심박변이도(HRV) 데이터를 정밀 비교하여,'
  ],
  '불면/불안': [
    '시상하부-청반핵 각성 축의 과긴장 상태를 계측하는 습식 정량뇌파(QEEG)와 교감신경 흥분도를 대변하는 HRV 데이터를 심층 판독하여,',
    '대뇌 피질의 고주파 베타파 항진과 부교감신경 이완 결손(HRV)을 상호 연계 평가하는 방식을 취하여,'
  ]
};

const QEEG_DECLARATIVE_BANKS = {
  '복압호흡': [
    '오브한의원에서는 횡격막 운동성과 심폐 순환 연동을 다채널 습식 정량화 뇌파(QEEG) 스펙트럼과 심박변이도(HRV) 자율신경 지표를 통해 정밀하게 대조 분석하고 있습니다.',
    '오브한의원에서는 호흡 불균형에 따른 피질 과각성을 측정하는 고해상도 습식 뇌파(QEEG)와 미주신경 톤(HRV)을 상호 교차 검증하여 신경계 불균형을 평가합니다.'
  ],
  '자율신경실조증': [
    '오브한의원에서는 다채널 습식 정량화 뇌파(QEEG) 스펙트럼 측정치와 심박변이도(HRV) 자율신경 지표를 유기적으로 대조 분석하고 있습니다.',
    '오브한의원에서는 두피 전극을 통한 고해상도 습식 뇌파(QEEG) 분석과 심박 간격의 미세 변이(HRV) 측정을 상호 교차 검증하여 신경계의 기능적 상태를 진단합니다.',
    '오브한의원에서는 대뇌 피질의 주파수별 파워 스펙트럼(QEEG)과 교감·부교감신경의 역동성을 보여주는 자율신경(HRV) 데이터를 정밀하게 종합 평가합니다.',
    '오브한의원에서는 중앙자율신경망(CAN)의 조절력을 가늠하는 고감도 습식 QEEG 계측치와 심혈관계 신경 조절능(HRV)을 복합적으로 연계하여 신경계의 기능적 편차를 감별 진단합니다.'
  ],
  'ADHD': [
    '오브한의원에서는 전두엽 세타/베타 비율(TBR)을 계측하는 습식 정량화 뇌파(QEEG) 판독과 자율신경계 반응성(HRV) 지표를 유기적으로 대조 분석하고 있습니다.',
    '오브한의원에서는 대뇌 피질의 기능적 각성도(QEEG)와 스트레스 회복 탄력성(HRV) 생체 데이터를 입체적으로 비교·분석하여 평가합니다.'
  ],
  '초민감자(HSP)': [
    '오브한의원에서는 외부 자극 게이팅 결손 및 피질 과각성 추이를 포착하는 고해상도 습식 뇌파(QEEG)와 교감-부교감 밸런스(HRV) 지표를 정밀하게 연계하여 평가합니다.',
    '오브한의원에서는 신경계의 역치 저하와 알로스타틱 부하를 객관화하는 다채널 습식 뇌파(QEEG) 프로파일 및 심박변이도(HRV) 반응성을 다각도로 대조 판독하고 있습니다.',
    '오브한의원에서는 고해상도 습식 QEEG-32FX 정량뇌파 분석을 통해 감각 과민과 피질 과각성 추이를 입체적으로 진단하고 있습니다.'
  ],
  '브레인포그': [
    '오브한의원에서는 대뇌 피질 전반의 서파 정체와 신경 신호 지연을 확인하는 습식 QEEG 데이터와 심혈관계 신경 적응도(HRV)를 종합 평가하고 있습니다.',
    '오브한의원에서는 뇌신경망의 연결성(Coherence) 이상과 자율신경 활성 저하를 계측하는 습식 정량화 뇌파(QEEG) 및 심박변이도(HRV) 분석을 면밀히 대조합니다.',
    '오브한의원에서는 습식 정량화 뇌파 검사로 신경 자극에 따른 뇌파 과각성을 측정하여 기능적 신경망의 정상화 추이를 체계적으로 평가합니다.'
  ],
  '갑상선': [
    '오브한의원에서는 대뇌 대사 저하 및 신경계 조절 불균형을 추적하는 습식 정량뇌파(QEEG) 분석과 자율신경계(HRV) 항상성 지표를 종합적으로 검토하고 있습니다.'
  ],
  '다이어트': [
    '마곡 오브한의원에서는 시상하부 식욕 조절 회로의 과흥분도 및 대사 스트레스를 확인하기 위해 습식 뇌파(QEEG)와 자율신경 심박변이도(HRV)를 체계적인 참고 지표로 삼고 있습니다.',
    '마곡 오브한의원에서는 뇌 보상회로의 민감도와 교감신경 항진 추이를 관찰하는 습식 정량뇌파(QEEG) 및 심박 자율조절(HRV) 데이터를 다각도로 교차 검증합니다.'
  ],
  '위장관': [
    '오브한의원에서는 뇌-장 축(Gut-Brain Axis)의 신경 신호 전달 상태를 파악하고자 다채널 습식 정량뇌파(QEEG)와 미주신경 활성도(HRV) 검사 소견을 복합적으로 고려합니다.'
  ],
  '두통': [
    '오브한의원에서는 뇌혈관의 미세 경련 및 피질 과흥분성을 추적하는 습식 뇌파(QEEG)와 심혈관 자율 조절력(HRV)을 다각도로 상호 대조하여 평가합니다.'
  ],
  '불면/불안': [
    '오브한의원에서는 시상하부-청반핵 각성 축의 과긴장 상태를 계측하는 습식 정량뇌파(QEEG)와 교감신경 흥분도를 대변하는 HRV 데이터를 심층 판독하고 있습니다.'
  ]
};

const KYUNGHYANG_LIST = [
  '병리적 연관성이 깊은 것으로 관찰됩니다.',
  '임상적으로 빈번하게 동반되는 특성을 띱니다.',
  '신경생리학적 양상이 두드러지게 확인됩니다.',
  '상당한 상관관계를 나타내는 것으로 해석됩니다.',
  '기능적 조절 장애와 밀접하게 맞물려 있는 것으로 보고됩니다.',
  '신경계의 비정상적 과흥분 상태를 시사하는 소견으로 풀이됩니다.',
  '환자군에서 일관되게 확인되는 병태생리학적 특징입니다.',
  '기전과 궤를 같이하는 것으로 파악됩니다.',
  '생체 신호 및 신경망 수준에서 뚜렷한 차이로 드러납니다.',
  '주요한 기능적 이상 요인으로 지목되고 있습니다.'
];

const DOUM_LIST = [
  '기능적 안정과 회복을 촉진하는 데 기여합니다.',
  '항상성을 재건하고 증상 경감을 도모하는 핵심적인 임상적 의의를 지닙니다.',
  '신경계 자율 조절력을 되살리는 데 유의미한 임상적 작용을 나타냅니다.',
  '생리학적 불균형을 바로잡는 긍정적인 치료적 전기를 마련합니다.',
  '병리적 과부하를 단계적으로 완화시키는 치료 전략으로 작용합니다.',
  '뇌-신체 연결 고리의 정상화를 유도하는 데 실질적인 효용성을 발휘합니다.',
  '증상의 만성화를 차단하고 신경계 탄력성을 복원하는 데 조력합니다.',
  '가역적 회복 환경을 조성하는 데 중요한 임상적 역할을 수행합니다.',
  '신경 미세환경의 자생적 회복을 유도하는 데 실질적인 보탬이 됩니다.'
];

let kIdx = 0;
let dIdx = 0;
let qConnIdx = 0;
let qDeclIdx = 0;

function rewriteEngine(text, topicKey, fileChangeLog) {
  let res = text;
  const connList = QEEG_CONNECTIVE_BANKS[topicKey] || QEEG_CONNECTIVE_BANKS['자율신경실조증'];
  const declList = QEEG_DECLARATIVE_BANKS[topicKey] || QEEG_DECLARATIVE_BANKS['자율신경실조증'];

  function recordChange(rule, before, after) {
    if (before.trim() !== after.trim()) {
      fileChangeLog.push({ rule, before: before.trim().slice(0, 100), after: after.trim().slice(0, 100) });
    }
  }

  // 1. QEEG/HRV Connective Patterns
  const qeegConnective = [
    /(?:오브한의원에서는\s+)?두피의\s*전기적\s*신호를\s*기록하는\s*습식\s*정량화\s*뇌파\(QEEG\)\s*검사와\s*자율신경\s*심박변이도\(HRV\)\s*검사를\s*참고\s*자료로\s*활용하여[,\s]*/g,
    /(?:오브한의원에서는\s+)?두피에서\s*측정되는\s*전기적\s*생체\s*신호를\s*기록하는\s*습식\s*정량화\s*뇌파\(QEEG\)\s*검사와\s*자율신경\(HRV\)\s*검사를\s*참고\s*자료로\s*활용하여[,\s]*/g,
    /(?:오브한의원에서는\s+)?습식\s*정량화\s*뇌파\(QEEG\)\s*(?:및|와)\s*자율신경\(HRV\)\s*검사\s*등\s*생체\s*신호\s*데이터를\s*참고\s*자료로\s*활용하여[,\s]*/g,
    /(?:오브한의원에서는\s+)?습식\s*정량화\s*뇌파\(QEEG\)\s*검사와\s*자율신경\s*심박변이도\(HRV\)\s*검사를\s*참고\s*자료로\s*활용하여[,\s]*/g,
    /(?:오브한의원은\s+)?습식\s*정량화\s*뇌파와\s*자율신경\s*HRV\s*데이터를\s*기반으로[,\s]*/g
  ];

  qeegConnective.forEach(regex => {
    res = res.replace(regex, (match) => {
      const rep = connList[(qConnIdx++) % connList.length] + ' ';
      recordChange('Rule 1&2 (QEEG/HRV 연결형 다변화)', match, rep);
      return rep;
    });
  });

  // 2. QEEG/HRV Declarative Patterns
  const qeegDeclarative = [
    /(?:마곡\s*오브한의원에서는\s+)?대학병원급\s*습식\s*정량화\s*뇌파\s*검사와\s*자율신경\(HRV\)\s*검사를\s*통해\s*눈에\s*보이지\s*않는\s*뇌신경계\s*기능적\s*과부하를\s*객관적인\s*수치로\s*증명합니다[.\s]*/g,
    /(?:오브한의원에서는\s+)?습식\s*정량화\s*뇌파\(QEEG\)와\s*심박변이도\(HRV\)를\s*통해\s*보이지\s*않는\s*신경계의\s*과항진\s*상태를\s*수치화하여\s*객관적으로\s*진단합니다[.\s]*/g,
    /(?:오브한의원에서는\s+)?이러한\s*보이지\s*않는\s*신경계의\s*불균형을\s*습식\s*정량화\s*뇌파\(QEEG\)와\s*심박변이도\(HRV\)\s*검사를\s*통해\s*객관적인\s*수치로\s*짚어냅니다[.\s]*/g,
    /(?:오브한의원은\s+)?뇌신경계의\s*활성도를\s*보여주는\s*습식\s*정량화\s*뇌파\s*검사와\s*교감신경의\s*과항진을\s*수치화하는\s*자율신경\s*HRV\s*검사를\s*통해\s*눈에\s*보이지\s*않는\s*신경계의\s*불균형을\s*객관적으로\s*진단합니다[.\s]*/g,
    /(?:마곡\s*오브한의원은\s+)?뇌의\s*기능적\s*이상을\s*확인하는\s*습식\s*정량화\s*뇌파\(QEEG\)와\s*자율신경\(HRV\)\s*검사를\s*통해\s*폭식을\s*유발하는\s*신경계\s*불균형을\s*객관적으로\s*진단합니다[.\s]*/g,
    /(?:오브한의원에서는\s+)?습식\s*정량화\s*뇌파\(qEEG\)와\s*자율신경\s*HRV\s*검사로\s*신경계\s*활성도를\s*면밀히\s*관찰하고\s*신체\s*구조적\s*긴장을\s*다각도로\s*평가합니다[.\s]*/g,
    /(?:오브한의원은\s+)?습식\s*정량화\s*뇌파\s*검사와\s*자율신경\s*HRV\s*검사로\s*보이지\s*않는\s*신경계\s*불균형을\s*정량적으로\s*시각화합니다[.\s]*/g,
    /(?:오브한의원에서는\s+)?습식\s*정량화\s*뇌파\(QEEG\)\s*검사와\s*자율신경\(HRV\)\s*검사를\s*참고\s*지표로\s*활용하고\s*있습니다[.\s]*/g,
    /(?:오브한의원은\s+)?습식\s*QEEG-32FX\s*정량뇌파\s*검사를\s*통해\s*과도한\s*인지적\s*반추와\s*전두엽\s*기능\s*저하\s*상태를\s*객관적으로\s*진단합니다[.\s]*/g,
    /(?:오브한의원은\s+)?습식\s*QEEG-32FX\s*정량뇌파\s*검사를\s*통해\s*중추신경계의\s*과도한\s*흥분성과\s*감각\s*증폭\s*상태를\s*객관적으로\s*진단합니다[.\s]*/g,
    /(?:오브한의원은\s+)?척추의\s*긴장도가\s*뇌신경에\s*미치는\s*영향을\s*습식\s*정량화\s*뇌파로\s*파악하고,\s*자율신경\s*HRV\s*검사로\s*심혈관계의\s*교감신경\s*과항진\s*상태를\s*명확한\s*수치로\s*진단합니다[.\s]*/g,
    /(?:오브한의원은\s+)?습식\s*QEEG-32FX\s*정량뇌파\s*검사를\s*통해\s*남녀별로\s*다르게\s*나타나는\s*교감·부교감신경의\s*실조\s*패턴을\s*진단합니다[.\s]*/g,
    /(?:오브한의원에서는\s+)?19채널\s*습식\s*정량화\s*뇌파\(QEEG\)와\s*심박변이도\(HRV\)\s*검사를\s*통해\s*비정상적으로\s*뇌의\s*감각\s*수용\s*역치가\s*낮아진\s*상태와\s*자율신경\s*교란\s*여부를\s*시각적·정량적\s*수치로\s*객관화하여\s*감별\s*진단합니다[.\s]*/g,
    /(?:오브한의원에서는\s+)?\*\*19채널\s*습식\s*정량화\s*뇌파\(QEEG\)와\s*심박변이도\(HRV\)\s*검사\*\*\s*를\s*통해\s*비정상적으로\s*뇌의\s*감각\s*수용\s*역치가\s*낮아진\s*상태와\s*자율신경\s*교란\s*여부를\s*시각적·정량적\s*수치로\s*객관화하여\s*감별\s*진단합니다[.\s]*/g,
    /(?:오브한의원은\s+)?습식\s*QEEG-32FX\s*정량뇌파\s*검사를\s*통해\s*자율신경계\s*통제력을\s*잃고\s*해리\s*상태로\s*빠지는\s*신경계의\s*임계점을\s*객관적으로\s*진단합니다[.\s]*/g,
    /(?:오브한의원에서는\s+)?19채널\s*습식\s*정량화\s*뇌파\(QEEG\)와\s*심박변이도\(HRV\)\s*검사를\s*통해\s*과각성된\s*뇌\s*주파수와\s*자율신경\s*불균형\s*상태를\s*객관적인\s*수치와\s*시각적\s*데이터로\s*정밀\s*진단합니다[.\s]*/g,
    /(?:오브한의원에서는\s+)?\*\*19채널\s*습식\s*정량화\s*뇌파\(QEEG\)와\s*심박변이도\(HRV\)\s*검사\*\*\s*를\s*통해\s*과각성된\s*뇌\s*주파수와\s*자율신경\s*불균형\s*상태를\s*객관적인\s*수치와\s*시각적\s*데이터로\s*정밀\s*진단합니다[.\s]*/g,
    /(?:오브한의원에서는\s+)?19채널\s*습식\s*정량화\s*뇌파\(QEEG\)와\s*심박변이도\(HRV\)\s*검사를\s*통해,\s*위장관\s*평활근을\s*굳게\s*만드는\s*중추\s*뇌파의\s*과각성과\s*미주신경\s*마비\s*상태를\s*객관적인\s*수치로\s*감별\s*진단합니다[.\s]*/g,
    /(?:오브한의원에서는\s+)?\*\*19채널\s*습식\s*정량화\s*뇌파\(QEEG\)와\s*심박변이도\(HRV\)\*\*\s*검사를\s*통해,\s*위장관\s*평활근을\s*굳게\s*만드는\s*중추\s*뇌파의\s*과각성과\s*미주신경\s*마비\s*상태를\s*객관적인\s*수치로\s*감별\s*진단합니다[.\s]*/g,
    /(?:오브한의원에서는\s+)?첨단\s*습식\s*정량화\s*뇌파\s*기계와\s*심박변이도\(HRV\)\s*자율신경\s*검사를\s*통해\s*환자의\s*신경계\s*불균형\s*상태를\s*엄밀한\s*수치와\s*데이터로\s*시각화합니다[.\s]*/g,
    /(?:마곡\s*오브한의원에서는\s+)?19채널\s*습식\s*정량화\s*뇌파\(QEEG\)와\s*심박변이도\(HRV\)\s*검사를\s*통해\s*눈에\s*보이지\s*않던\s*뇌\s*주파수\s*불균형과\s*자율신경\s*교감\s*항진\s*상태를\s*객관적\s*수치로\s*감별\s*진단합니다[.\s]*/g,
    /(?:마곡\s*오브한의원에서는\s+)?\*\*19채널\s*습식\s*정량화\s*뇌파\(QEEG\)와\s*심박변이도\(HRV\)\s*검사\*\*\s*를\s*통해\s*눈에\s*보이지\s*않던\s*뇌\s*주파수\s*불균형과\s*자율신경\s*교감\s*항진\s*상태를\s*객관적\s*수치로\s*감별\s*진단합니다[.\s]*/g,
    /(?:오브한의원은\s+)?습식\s*QEEG-32FX\s*정량뇌파\s*검사를\s*통해\s*초민감자\(HSP\)\s*특유의\s*뇌\s*기능적\s*연결성\s*이상과\s*신경\s*에너지\s*고갈\s*상태를\s*객관적으로\s*진단합니다[.\s]*/g,
    /(?:오브한의원은\s+)?QEEG-32FX\s*정량뇌파\s*기기를\s*통해\s*뇌의\s*과각성\s*부위\s*객관적으로\s*진단합니다[.\s]*/g,
    /(?:오브한의원은\s+)?습식\s*정량화\s*뇌파\s*검사로\s*신경\s*자극에\s*의한\s*뇌파\s*과각성을\s*측정하여\s*기능적\s*정상화\s*추이를\s*객관적으로\s*증명합니다[.\s]*/g
  ];

  qeegDeclarative.forEach(regex => {
    res = res.replace(regex, (match) => {
      const rep = declList[(qDeclIdx++) % declList.length] + ' ';
      recordChange('Rule 1&2 (QEEG/HRV 서술형 다변화)', match, rep);
      return rep;
    });
  });

  // 3. Rule 3: Endings (경향)
  res = res.replace(/경향을\s*보입니다[.]?/g, (match) => {
    const rep = KYUNGHYANG_LIST[(kIdx++) % KYUNGHYANG_LIST.length];
    recordChange('Rule 3 (어미 다변화: 경향)', match, rep);
    return rep;
  });
  res = res.replace(/경향이\s*있습니다[.]?/g, (match) => {
    const rep = KYUNGHYANG_LIST[(kIdx++) % KYUNGHYANG_LIST.length];
    recordChange('Rule 3 (어미 다변화: 경향)', match, rep);
    return rep;
  });

  // 4. Rule 3: Endings (도움)
  res = res.replace(/도움을\s*줄\s*수\s*있습니다[.]?/g, (match) => {
    const rep = DOUM_LIST[(dIdx++) % DOUM_LIST.length];
    recordChange('Rule 3 (어미 다변화: 도움)', match, rep);
    return rep;
  });
  res = res.replace(/도움이\s*될\s*수\s*있습니다[.]?/g, (match) => {
    const rep = DOUM_LIST[(dIdx++) % DOUM_LIST.length];
    recordChange('Rule 3 (어미 다변화: 도움)', match, rep);
    return rep;
  });

  // 5. Rule 4: Therapy pattern breakdown
  const therapyReplacements = [
    {
      regex: /개인별\s*상태에\s*맞춘\s*한약[·,\s]+추나[·,\s]+침구\s*치료를\s*병행하는\s*것은/g,
      replacer: () => {
        if (topicKey === '복압호흡') return '흉곽 압박을 해소하는 정밀 추나요법과 미세순환 부전을 개선하는 체질 맞춤 한약 치료를 유기적으로 병행하는 것은';
        return '신경계의 비정상적 과흥분을 안정시키는 체질 맞춤 한약 처방과 척추 분절을 바로잡는 정밀 추나요법을 유기적으로 병행하는 것은';
      }
    },
    {
      regex: /한약[·,\s]+추나[·,\s]+침구\s*등\s*개인별\s*맞춤\s*한의학적\s*치료를\s*통해/g,
      replacer: () => {
        return '성상신경절 및 횡격신경 주변을 이완하는 정밀 추나요법과 뇌 미세혈류 순환을 촉진하는 체질 맞춤 한약 처방을 유기적으로 결합하여';
      }
    },
    {
      regex: /맞춤\s*한약,\s*추나,\s*침구\s*치료\s*등을\s*통해/g,
      replacer: () => {
        if (topicKey === 'ADHD') return '전두엽 각성을 안정화하는 맞춤 한약과 경추 신경 긴장을 이완하는 정밀 추나요법을 체계적으로 연계하여';
        return '신경 안정 맞춤 한약과 두경부 신경 긴장을 완화하는 정밀 추나요법을 연계하여';
      }
    },
    {
      regex: /맞춤\s*한약,\s*추나요법,\s*침구\s*치료를\s*통해\s*무너진\s*신체\s*밸런스를\s*조화롭게\s*다독이고\s*있습니다[.\s]*/g,
      replacer: () => {
        return '흉곽 가동성을 회복시키는 정밀 추나요법과 내장기 순환을 돕는 표적 한약 처방을 결합하여 무너진 신경계와 신체 밸런스를 체계적으로 다독이고 있습니다. ';
      }
    },
    {
      regex: /억지로\s*신경을\s*억누르는\s*약물\s*대신,\s*고갈된\s*뇌\s*대사를\s*복구하고\s*교감신경의\s*흥분을\s*제어하는\s*맞춤\s*한약과\s*추나치료로\s*뇌\s*자율조절능력을\s*근본적으로\s*되살립니다[.\s]*/g,
      replacer: () => {
        return '단순 진정 약물에 의존하기보다, 뇌섬엽-편도체의 과각성을 진정시키는 보기안신(補氣安神) 맞춤 한약과 두경부 근막 긴장을 완화하는 림프 이완 추나요법을 통해 신경계의 자율 조절력을 본질적으로 복원합니다. ';
      }
    },
    {
      regex: /4대\s*병리\s*유형에\s*맞춘\s*한약과\s*추나\s*치료를\s*병행하여/g,
      replacer: () => {
        return '전두엽 도파민 대사를 보존하는 맞춤 한약과 두개경추 정렬을 바로잡는 정밀 추나요법을 병행하여';
      }
    },
    {
      regex: /맞춤\s*한약,\s*추나,\s*침구\s*치료\s*등\s*다중\s*표적\s*신경미세환경\s*완충\s*접근을\s*통해/g,
      replacer: () => {
        return '전두엽 도파민 대사 보존 맞춤 한약과 경추 신경 긴장을 완화하는 정밀 추나요법 등 다중 표적 신경미세환경 완충 접근을 통해';
      }
    },
    {
      regex: /맞춤\s*한약과\s*추나\s*치료로\s*체질\s*개선을\s*완성합니다[.]?/g,
      replacer: () => {
        return '부교감 미주신경 톤을 회복시키는 보음건비(補陰健脾) 맞춤 한약과 복압 실린더를 정상화하는 흉곽-골반 추나요법을 결합하여 체질 개선을 완성합니다.';
      }
    },
    {
      regex: /신경전달물질의\s*자가\s*회복을\s*돕는\s*정밀\s*맞춤\s*한약과\s*추나치료를\s*시행합니다[.]?/g,
      replacer: () => {
        return '세로토닌·도파민 신경망의 항상성을 재건하는 청뇌안신(淸腦安神) 맞춤 한약과 뇌척수액 순환을 돕는 상부 경추 정밀 추나요법을 유기적으로 적용합니다.';
      }
    }
  ];

  therapyReplacements.forEach(tr => {
    res = res.replace(tr.regex, (match) => {
      const rep = tr.replacer();
      recordChange('Rule 4 (치료법 나열 패턴 파괴)', match, rep);
      return rep;
    });
  });

  return res;
}

let modifiedFiles = 0;
let totalChanges = 0;

files.forEach(f => {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const topic = getTopicKey(data.category, data.title, data.content);
  const log = [];
  rewriteEngine(data.summary || '', topic, log);
  rewriteEngine(data.content || '', topic, log);

  if (log.length > 0) {
    modifiedFiles++;
    totalChanges += log.length;
    console.log(`[${modifiedFiles}] ${f} (${topic}): ${log.length} changes`);
  }
});

console.log(`\nTotal matched files: ${modifiedFiles} / ${files.length}`);
console.log(`Total replacements: ${totalChanges}`);
