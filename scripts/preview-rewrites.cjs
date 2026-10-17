const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'content', 'columns');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

// Rule 1 & 2: QEEG/HRV contextual rewrites by disease topic
const QEEG_TOPIC_BANKS = {
  '자율신경실조증': [
    '다채널 습식 정량화 뇌파(QEEG) 스펙트럼 측정치와 심박변이도(HRV) 자율신경 지표를 유기적으로 대조 분석하여',
    '두피 전극을 통한 고해상도 습식 뇌파(QEEG) 분석과 심박 간격의 미세 변이(HRV) 측정을 상호 교차 검증함으로써',
    '대뇌 피질의 주파수별 파워 스펙트럼(QEEG)과 교감·부교감신경의 역동성을 보여주는 자율신경(HRV) 데이터를 정밀 평가하여',
    '중앙자율신경망(CAN)의 통제력을 가늠하는 고감도 습식 QEEG 계측치와 심혈관계 신경 조절능(HRV)을 복합적으로 연계하여',
    '뇌신경망의 미세 활성도를 반영하는 습식 뇌파(QEEG) 계측과 심박 자율조절(HRV) 추이를 체계적으로 종합 판독하여'
  ],
  'ADHD': [
    '전두엽 세타/베타 비율(TBR)과 감각운동리듬을 계측하는 습식 정량화 뇌파(QEEG) 판독과 자율신경계 반응성(HRV) 지표를 유기적으로 대조하여',
    '대뇌 피질의 기능적 각성도(QEEG)와 스트레스 회복 탄력성을 대변하는 심박변이도(HRV) 생체 데이터를 입체적으로 비교·분석하여',
    '주의 집중 네트워크의 동기화 상태를 추적하는 습식 뇌파(QEEG)와 자율신경 항상성(HRV) 지표를 정밀하게 상호 교차하여',
    '고밀도 습식 전극 기반의 정량화 뇌파(QEEG) 스펙트럼과 심박 조절 역동성(HRV)을 종합적인 임상 판단의 객관적 근거로 삼아'
  ],
  '초민감자(HSP)': [
    '외부 자극 게이팅 결손 및 피질 과각성 추이를 포착하는 고해상도 습식 뇌파(QEEG)와 교감-부교감 밸런스를 측정하는 HRV 지표를 정밀 연계하여',
    '신경계의 역치 저하와 알로스타틱 부하를 객관화하는 다채널 습식 뇌파(QEEG) 프로파일 및 심박변이도(HRV) 반응성을 다각도로 대조 판독하여',
    '뇌섬엽-편도체 신경망의 미세 활성을 관찰하는 습식 정량뇌파(QEEG)와 자율신경 피로도를 나타내는 HRV 스펙트럼을 체계적으로 감안하여'
  ],
  '브레인포그': [
    '대뇌 피질 전반의 서파(Delta/Theta) 정체와 신경 신호 지연을 확인하는 습식 QEEG 데이터와 심혈관계 신경 적응도(HRV)를 종합 평가하여',
    '뇌신경망의 연결성(Coherence) 이상과 자율신경 활성 저하를 계측하는 습식 정량화 뇌파(QEEG) 및 심박변이도(HRV) 분석을 면밀히 대조하여',
    '피질 억제 상태와 미세순환 저하 소견을 가늠하는 고감도 습식 뇌파(QEEG)와 심박 자율조절능(HRV)을 유기적으로 연계 판독하여'
  ],
  '갑상선': [
    '대뇌 대사 저하 및 신경계 조절 불균형을 추적하는 습식 정량뇌파(QEEG) 분석과 자율신경계(HRV) 항상성 지표를 종합적으로 검토하여',
    '중추신경계 피로도와 말초 자율신경 긴장도를 평가하는 다채널 습식 뇌파(QEEG) 계측 및 심박변이도(HRV) 데이터를 정밀 상호 대조하여'
  ],
  '다이어트': [
    '시상하부 식욕 조절 회로의 과흥분도 및 대사 스트레스를 확인하기 위해 습식 뇌파(QEEG)와 자율신경 심박변이도(HRV)를 체계적인 참고 지표로 삼아',
    '뇌 보상회로의 민감도와 교감신경 항진 추이를 관찰하는 습식 정량뇌파(QEEG) 및 심박 자율조절(HRV) 데이터를 다각도로 교차 검증하여'
  ],
  '위장관': [
    '뇌-장 축(Gut-Brain Axis)의 신경 신호 전달 상태를 파악하고자 다채널 습식 정량뇌파(QEEG)와 미주신경 활성도를 가늠하는 HRV 검사 소견을 복합적으로 고려하여',
    '중추 신경 피로와 장신경계(ENS) 조절 상태를 대변하는 고해상도 습식 뇌파(QEEG) 및 자율신경 심박변이도(HRV) 지표를 유기적으로 연계 판독하여'
  ],
  '두통': [
    '뇌혈관의 미세 경련 및 피질 과흥분성을 추적하는 습식 뇌파(QEEG)와 심혈관 자율 조절력(HRV)을 다각도로 상호 대조하여',
    '삼차신경-혈관 신경망의 과감작 여부를 평가하는 정량뇌파(QEEG) 지표와 자율신경 심박변이도(HRV) 데이터를 정밀 비교하여'
  ],
  '불면/불안': [
    '시상하부-청반핵 각성 축의 과긴장 상태를 계측하는 습식 정량뇌파(QEEG)와 교감신경 흥분도를 대변하는 HRV 데이터를 심층 판독하여',
    '대뇌 피질의 고주파 베타파 항진과 부교감신경 이완 결손(HRV)을 상호 연계 평가하는 방식을 취하여'
  ],
  '기본': [
    '다채널 습식 정량화 뇌파(QEEG) 측정치와 심박변이도(HRV) 지표를 유기적으로 대조 분석하여',
    '두피 전극을 통한 고해상도 습식 뇌파(QEEG) 분석과 자율신경계(HRV) 반응성 측정을 병행 검토함으로써',
    '대뇌 피질의 주파수별 파워 스펙트럼(QEEG)과 심박 간격의 미세 변이(HRV) 데이터를 정밀하게 추적·평가하여',
    '객관적 생체 전기 신호인 다채널 QEEG 뇌파 프로파일과 심박변이도(HRV)를 상호 교차 검증하는 방식으로'
  ]
};

// Rule 3: Endings (경향을 보입니다 -> 다양화)
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

// Rule 3: Endings (도움을 줄 수 있습니다 -> 다양화)
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

// Rule 4: Therapy breakdown per disease topic
const THERAPY_TOPIC_BANKS = {
  '복압호흡': '경추 부호흡근의 이상 긴장을 해소하고 횡격막-복횡근-골반기저근이 유기적으로 협응하는 360도 코어 복압 호흡을 체계화하는 동시에, 뇌-심장-내장 축의 미세순환을 돕는 표적 한약 처방과 흉추·늑골 아탈구를 정렬하는 추나요법을 결합하여',
  '자율신경실조증': '성상신경절 및 횡격신경 주변을 압박하는 경추·흉곽 구조를 부드럽게 이완하는 정밀 추나요법과, 시상하부-자율신경 조절축의 과각성을 안정시키고 미주신경 톤을 회복시키는 체질 맞춤 한약 처방을 유기적으로 적용하여',
  'ADHD': '전두엽 피질의 도파민·노르에피네프린 대사 효율을 보존하고 반동성 교감신경 흥분을 완화하는 신경 안정 한약과, 두경부 림프 순환 및 두개골 유동성을 정상화하는 추나 기법을 유기적으로 결합하여',
  '초민감자(HSP)': '지속된 감각 과부하로 고갈된 뇌 포도당 대사를 보충하고 뇌섬엽-편도체의 과잉 반응을 낮추는 보기안신(補氣安神) 맞춤 한약과, 방어적으로 수축된 전신 근막망의 긴장을 부드럽게 이완하는 림프-경추 이완 수기를 통해',
  '브레인포그': '혈뇌장벽(BBB)을 통과하는 미세 신경염증을 억제하고 글림파틱(Glymphatic) 뇌 노폐물 배출을 촉진하는 청뇌(淸腦) 맞춤 한약과, 뇌척수액 순환 장애를 유발하는 상부경추(C1-C2) 분절을 바로잡는 정밀 추나 치료를 병행하여',
  '갑상선': '초기 섬유화 상태의 갑상선 여포세포 미세순환을 개선하고 말초 조직의 활성형 T3 전환 효율을 높이는 대사 활성화 맞춤 한약과, 자율신경계 과각성을 안정시키는 척추 분절 교정을 복합적으로 활용하여',
  '다이어트': '장기 약물 투여로 인한 위장관 무력과 뇌 보상회로 위축을 개선하고 기초 대사 항상성을 재설정하는 위장-신경계 복합 한약 처방과, 복압 불균형 및 늑골 팽창을 정상화하는 흉곽 교정 치료를 단계적으로 연계하여',
  '위장관': '위장관 평활근의 연동운동을 정상화하고 장점막 상피장벽의 치밀결합을 복구하는 건비청장(健脾淸腸) 맞춤 한약과, 횡격막-내장기 정렬을 돕는 내장기 추나요법을 결합하여',
  '두통': '후두하근과 상부 경추 분절의 연축을 완화해 신경 압박을 경감하는 정밀 추나요법과, 뇌혈관의 미세 경련을 안정시키고 뇌 미세혈류 순환을 촉진하는 표적 한약 처방을 조화롭게 구성하여',
  '불면/불안': '과항진된 청반핵-시상하부 축의 경보 신호를 진정시키는 청열안신(淸熱安神) 한약과, 흉식호흡으로 굳어진 늑골과 횡격막을 이완시키는 이완 추나요법을 연계하여'
};

function getTopicKey(category, title, content) {
  const combined = (category + ' ' + title + ' ' + content).toLowerCase();
  if (combined.includes('복압') || combined.includes('호흡') || combined.includes('횡격막')) return '복압호흡';
  if (combined.includes('adhd') || combined.includes('주의력') || combined.includes('콘서타')) return 'ADHD';
  if (combined.includes('초민감자') || combined.includes('hsp') || combined.includes('예민한')) return '초민감자(HSP)';
  if (combined.includes('브레인포그') || combined.includes('브레인 포그') || combined.includes('멍함')) return '브레인포그';
  if (combined.includes('갑상선') || combined.includes('씬지로이드')) return '갑상선';
  if (combined.includes('다이어트') || combined.includes('체중') || combined.includes('요요') || combined.includes('위고비') || combined.includes('마운자로')) return '다이어트';
  if (combined.includes('위장') || combined.includes('소화') || combined.includes('장누수') || combined.includes('담적')) return '위장관';
  if (combined.includes('두통') || combined.includes('후두신경') || combined.includes('경추성')) return '두통';
  if (combined.includes('불면') || combined.includes('불안') || combined.includes('수면') || combined.includes('공황')) return '불면/불안';
  return '자율신경실조증';
}

console.log('Previewing rewrite candidates across 62 columns...\n');

let previewCount = 0;
let kIndex = 0;
let dIndex = 0;
let qIndex = 0;

files.forEach(f => {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const topicKey = getTopicKey(d.category, d.title, d.content);
  const qList = QEEG_TOPIC_BANKS[topicKey] || QEEG_TOPIC_BANKS['자율신경실조증'];
  const therapyReplacement = THERAPY_TOPIC_BANKS[topicKey] || THERAPY_TOPIC_BANKS['자율신경실조증'];

  let summaryMod = d.summary;
  let contentMod = d.content;
  let fileChanges = [];

  // Helper to rewrite text
  function processText(text, isSummary) {
    let modified = text;

    // 1. QEEG/HRV boilerplate
    // Target 1: 두피의 전기적 신호를 기록하는 습식 정량화 뇌파(QEEG) 검사와 자율신경 심박변이도(HRV) 검사를 참고 자료로 활용하여
    // Target 2: 습식 정량화 뇌파(QEEG) 검사와 자율신경 심박변이도(HRV) 검사를 참고 자료로 활용하여
    // Target 3: 습식 정량화 뇌파(QEEG) 및 자율신경(HRV) 검사 등 생체 신호 데이터를 참고 자료로 활용하여
    // Target 4: 습식 정량화 뇌파(QEEG) 검사와 자율신경(HRV) 검사를 참고 자료로 활용하여
    // Target 5: 습식 정량화 뇌파와 자율신경 HRV 데이터를 기반으로
    const qeegRegexes = [
      /(?:오브한의원에서는\s+)?두피의\s*전기적\s*신호를\s*기록하는\s*습식\s*정량화\s*뇌파\(QEEG\)\s*검사와\s*자율신경\s*심박변이도\(HRV\)\s*검사를\s*참고\s*자료로\s*활용하여[,\s]*/g,
      /(?:오브한의원에서는\s+)?습식\s*정량화\s*뇌파\(QEEG\)\s*검사와\s*자율신경\s*심박변이도\(HRV\)\s*검사를\s*참고\s*자료로\s*활용하여[,\s]*/g,
      /(?:오브한의원에서는\s+)?두피에서\s*측정되는\s*전기적\s*생체\s*신호를\s*기록하는\s*습식\s*정량화\s*뇌파\(QEEG\)\s*검사와\s*자율신경\(HRV\)\s*검사를\s*참고\s*자료로\s*활용하여[,\s]*/g,
      /(?:오브한의원에서는\s+)?습식\s*정량화\s*뇌파\(QEEG\)\s*(?:및|와)\s*자율신경\(HRV\)\s*검사\s*등\s*생체\s*신호\s*데이터를\s*참고\s*자료로\s*활용하여[,\s]*/g,
      /(?:오브한의원에서는\s+)?습식\s*정량화\s*뇌파\(QEEG\)\s*검사와\s*자율신경\(HRV\)\s*검사를\s*참고\s*자료로\s*활용하여[,\s]*/g,
      /(?:오브한의원에서는\s+)?습식\s*정량화\s*뇌파\(QEEG\)\s*검사와\s*자율신경\(HRV\)\s*검사를\s*참고\s*지표로\s*활용하고\s*있습니다[.\s]*/g,
      /(?:오브한의원은\s+)?습식\s*정량화\s*뇌파와\s*자율신경\s*HRV\s*데이터를\s*기반으로[,\s]*/g
    ];

    qeegRegexes.forEach(rgx => {
      if (rgx.test(modified)) {
        const replacement = qList[(qIndex++) % qList.length] + ' ';
        modified = modified.replace(rgx, (match) => {
          fileChanges.push({ type: 'Rule 1&2 (QEEG)', before: match.trim(), after: replacement.trim() });
          return replacement;
        });
      }
    });

    // 2. Ending: 경향을 보입니다
    const kRegex = /경향을\s*보입니다[.]?/g;
    if (kRegex.test(modified)) {
      modified = modified.replace(kRegex, (match) => {
        const rep = KYUNGHYANG_LIST[(kIndex++) % KYUNGHYANG_LIST.length];
        fileChanges.push({ type: 'Rule 3 (경향)', before: match.trim(), after: rep.trim() });
        return rep;
      });
    }

    // 3. Ending: 도움을 줄 수 있습니다
    const dRegex = /도움을\s*줄\s*수\s*있습니다[.]?/g;
    if (dRegex.test(modified)) {
      modified = modified.replace(dRegex, (match) => {
        const rep = DOUM_LIST[(dIndex++) % DOUM_LIST.length];
        fileChanges.push({ type: 'Rule 3 (도움)', before: match.trim(), after: rep.trim() });
        return rep;
      });
    }

    // 4. Therapy listing breakdown
    const tRegexes = [
      /개인별\s*상태에\s*맞춘\s*한약[·,\s]+추나[·,\s]+침구\s*치료를\s*병행하는\s*것은[,\s]*/g,
      /한약[·,\s]+추나[·,\s]+침구\s*등\s*개인별\s*맞춤\s*치료를\s*통해[,\s]*/g,
      /맞춤\s*한약,\s*추나,\s*침구\s*치료\s*등을\s*통해[,\s]*/g,
      /4대\s*병리\s*유형에\s*맞춘\s*한약과\s*추나\s*치료를\s*병행하여[,\s]*/g
    ];

    tRegexes.forEach(rgx => {
      if (rgx.test(modified)) {
        modified = modified.replace(rgx, (match) => {
          fileChanges.push({ type: 'Rule 4 (치료법)', before: match.trim(), after: therapyReplacement.trim() });
          return therapyReplacement + ' ';
        });
      }
    });

    return modified;
  }

  summaryMod = processText(summaryMod, true);
  contentMod = processText(contentMod, false);

  if (fileChanges.length > 0) {
    previewCount++;
    console.log(`\n======================================================`);
    console.log(`[#${previewCount}] ${f}`);
    console.log(`Topic: ${topicKey} | Category: ${d.category} | Changes: ${fileChanges.length}`);
    fileChanges.forEach((ch, idx) => {
      console.log(`  (${idx + 1}) [${ch.type}]`);
      console.log(`      BEFORE: ${ch.before}`);
      console.log(`      AFTER:  ${ch.after}`);
    });
  }
});

console.log(`\nTotal files with rewrites: ${previewCount} / ${files.length}`);
