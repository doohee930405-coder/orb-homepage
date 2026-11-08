'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 자율신경실조증 증상 키워드 데이터셋 (중앙 텍스트 침범 방지 Safe-Zone 좌표 적용)
interface SymptomKeyword {
  id: string;
  text: string;
  size: string; // text-sm, text-base, text-xl, text-2xl, text-3xl
  weight: string; // font-normal, font-medium, font-bold
  opacity: string; // opacity-30 ~ opacity-100
  blur: string; // blur-[1px], blur-none
  position: { top?: string; bottom?: string; left?: string; right?: string };
  extraClass?: string;
}

const SYMPTOM_POOL: SymptomKeyword[] = [
  // Group 0: Top-Left, Right-Flank, Bottom-Left
  {
    id: '1',
    text: '원인 모를 가슴 두근거림',
    size: 'text-lg md:text-2xl',
    weight: 'font-bold',
    opacity: 'opacity-90',
    blur: 'blur-0',
    position: { top: '7%', left: '5%' },
    extraClass: 'max-w-[260px] md:max-w-none',
  },
  {
    id: '2',
    text: '과민성대장증후군',
    size: 'text-base md:text-xl',
    weight: 'font-medium',
    opacity: 'opacity-65',
    blur: 'blur-[0.5px]',
    position: { top: '44%', right: '3%' },
    extraClass: 'hidden lg:block max-w-[220px]',
  },
  {
    id: '3',
    text: '만성 소화장애 & 명치 답답함',
    size: 'text-sm md:text-base',
    weight: 'font-normal',
    opacity: 'opacity-50',
    blur: 'blur-[0.5px]',
    position: { bottom: '13%', left: '5%' },
    extraClass: 'max-w-[260px] md:max-w-none',
  },

  // Group 1: Top-Right, Left-Flank, Bottom-Right
  {
    id: '4',
    text: '숨이 턱 끝까지 차는 호흡 곤란',
    size: 'text-lg md:text-2xl',
    weight: 'font-bold',
    opacity: 'opacity-90',
    blur: 'blur-0',
    position: { top: '7%', right: '5%' },
    extraClass: 'max-w-[260px] md:max-w-none text-right',
  },
  {
    id: '5',
    text: '밤새 뒤척이는 불면증',
    size: 'text-base md:text-xl',
    weight: 'font-medium',
    opacity: 'opacity-70',
    blur: 'blur-0',
    position: { top: '48%', left: '3%' },
    extraClass: 'hidden lg:block max-w-[220px]',
  },
  {
    id: '6',
    text: '자도 자도 풀리지 않는 만성피로',
    size: 'text-lg md:text-2xl',
    weight: 'font-bold',
    opacity: 'opacity-95',
    blur: 'blur-0',
    position: { bottom: '13%', right: '5%' },
    extraClass: 'max-w-[260px] md:max-w-none text-right',
  },

  // Group 2: Top-Left, Right-Flank, Bottom-Left
  {
    id: '7',
    text: '머릿속 안개 브레인포그(Brain Fog)',
    size: 'text-xl md:text-3xl',
    weight: 'font-extrabold',
    opacity: 'opacity-100',
    blur: 'blur-0',
    position: { top: '8%', left: '6%' },
    extraClass: 'max-w-[280px] md:max-w-none',
  },
  {
    id: '8',
    text: '얼음장 같은 손발 수족냉증',
    size: 'text-sm md:text-lg',
    weight: 'font-normal',
    opacity: 'opacity-50',
    blur: 'blur-[0.5px]',
    position: { top: '40%', right: '3%' },
    extraClass: 'hidden lg:block max-w-[220px]',
  },
  {
    id: '9',
    text: '구름 위를 걷는 듯한 어지럼증',
    size: 'text-base md:text-xl',
    weight: 'font-semibold',
    opacity: 'opacity-75',
    blur: 'blur-0',
    position: { bottom: '15%', left: '6%' },
    extraClass: 'max-w-[260px] md:max-w-none',
  },

  // Group 3: Top-Right, Left-Flank, Bottom-Right
  {
    id: '10',
    text: '시도 때도 없는 식은땀과 열감',
    size: 'text-base md:text-xl',
    weight: 'font-medium',
    opacity: 'opacity-60',
    blur: 'blur-[0.5px]',
    position: { top: '8%', right: '6%' },
    extraClass: 'max-w-[260px] md:max-w-none text-right',
  },
  {
    id: '11',
    text: '목·어깨 만성 경직과 긴장성 두통',
    size: 'text-sm md:text-base',
    weight: 'font-normal',
    opacity: 'opacity-45',
    blur: 'blur-[0.5px]',
    position: { top: '42%', left: '3%' },
    extraClass: 'hidden lg:block max-w-[220px]',
  },
  {
    id: '12',
    text: '이유 없는 불안감과 공황 발작',
    size: 'text-lg md:text-2xl',
    weight: 'font-bold',
    opacity: 'opacity-85',
    blur: 'blur-0',
    position: { bottom: '15%', right: '6%' },
    extraClass: 'max-w-[260px] md:max-w-none text-right',
  },
];

// '왜 정량화 뇌파 분석인가?' 3열 Feature Cards 데이터
interface FeatureCardData {
  step: string;
  keyword: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  icon: React.ReactNode;
}

const FEATURE_CARDS: FeatureCardData[] = [
  {
    step: '01',
    keyword: '정밀 측정',
    title: '국제 10-20 표준 전극 시스템',
    subtitle: '다채널 전뇌(Full-Head) 정밀 습식 검사',
    description:
      '시중의 간이 건식 밴드는 이마 부위 일부 채널만 측정하여 두피 저항과 땀, 잡파 노이즈에 매우 취약합니다. 오브한의원은 국제 표준 전극 시스템과 의료용 전도성 겔(Gel)을 채택하여 피부 접촉 저항(Impedance)을 극소화하고, 전두엽·측두엽·두정엽·후두엽 전뇌의 미세 생체 전위(μV)를 오차 없이 정밀 측정합니다.',
    highlights: ['국제 10-20 표준 다채널 전뇌 분석', '의료용 전도성 겔 피부 저항 극소화', '전두·측두·두정·후두 전 영역 정밀 측정'],
    icon: (
      <svg className="w-8 h-8 text-[#8E7463]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* 센서/정밀 타겟 아이콘 */}
        <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      </svg>
    ),
  },
  {
    step: '02',
    keyword: '초정밀 노이즈 차단',
    title: '생체 잡파 분리 & 순수 신호 추출',
    subtitle: '독립성분분석(ICA) 기반 아티팩트 정제',
    description:
      '뇌파는 마이크로볼트(μV) 단위의 극미세 신호이기 때문에 눈 깜빡임, 심장 박동(ECG), 저작근 및 두경부 근육의 떨림(EMG)에 쉽게 왜곡됩니다. 첨단 신호 처리 알고리즘과 전극별 실시간 모니터링을 통해 외부 노이즈와 근육 간섭을 원천 분리하고, 순수 대뇌 피질 신경망 신호만을 깨끗하게 추출합니다.',
    highlights: ['눈 깜빡임·안구 운동 노이즈 제거', '심전도(ECG)·근전도(EMG) 간섭 차단', '순수 뇌 피질 신경망 신호 정제'],
    icon: (
      <svg className="w-8 h-8 text-[#8E7463]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* 노이즈 차단 & 쉴드 아이콘 */}
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    step: '03',
    keyword: 'AI 데이터 대조',
    title: '표준 건강 대조군 빅데이터 매핑',
    subtitle: 'Normative Database Z-Score & 3D 뇌지도',
    description:
      '단순한 파형 육안 판독에 그치지 않고, 동일 성별·연령대 건강한 수만 명의 정상 뇌파 표준 빅데이터(Normative DB)와 정밀 대조합니다. 표준편차 지표인 Z-score(Z=-3.00 ~ +3.00)로 수치화하여, 뇌 신경망의 과열(붉은색)과 기능 저하(푸른색)를 3차원 입체 지형도(3D Brain Map)로 시각화하여 입증합니다.',
    highlights: ['성별·연령별 정상군 DB Z-score', '신경망 과열(Red)·저하(Blue) 3D 시각화', '객관적 데이터 기반 1:1 처방 설계'],
    icon: (
      <svg className="w-8 h-8 text-[#8E7463]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* 뇌 신경망 및 3D 데이터 분석 아이콘 */}
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
        <circle cx="8" cy="9" r="1" fill="currentColor" />
        <circle cx="16" cy="9" r="1" fill="currentColor" />
        <circle cx="8" cy="15" r="1" fill="currentColor" />
        <circle cx="16" cy="15" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

export default function TreatmentMethodSection() {
  // 클라이언트 마운트 여부 확인 (Hydration 안전성 확보)
  const [mounted, setMounted] = useState(false);
  // 활성화되어 화면에 팝업되는 증상 키워드 인덱스 그룹 (3.8초 주기로 전환)
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    // 3.8초마다 화면 곳곳의 증상 키워드 그룹 순환 (중앙 텍스트 침범 없는 Safe Zone)
    const interval = setInterval(() => {
      setActiveGroupIndex((prev) => (prev + 1) % 4);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  // 12개 키워드를 3개씩 4그룹으로 분할
  const currentKeywords = [
    SYMPTOM_POOL[activeGroupIndex * 3],
    SYMPTOM_POOL[activeGroupIndex * 3 + 1],
    SYMPTOM_POOL[activeGroupIndex * 3 + 2],
  ].filter(Boolean);

  return (
    <section id="diagnostic" className="relative w-full overflow-hidden font-sans">
      {/* =========================================================================
          1. 히어로 인트로 (증상 팝업 & 브레인포그 안개 영역)
          - 배경: 다크 브라운 bg-[#4E4647] Full-width
          - 3.8초 주기 페이드인/아웃 전환
          - 중앙 메인 텍스트 영역 침범 방지 Safe-Zone 레이아웃
      ========================================================================= */}
      <div className="relative w-full min-h-[580px] md:min-h-[660px] bg-[#4E4647] text-white flex flex-col justify-center items-center px-6 py-20 select-none overflow-hidden">
        {/* 배경 안개 (Brain Fog Glow Effects) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[420px] h-[420px] bg-[#6B5E5F]/30 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#3B3435]/50 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#8E7463]/10 rounded-full blur-[140px]" />
        </div>

        {/* 증상 키워드 팝업 레이어 (중앙 메인 카피와 겹치지 않는 외곽 Safe Zone) */}
        {mounted && (
          <div className="absolute inset-0 pointer-events-none max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeGroupIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="w-full h-full relative"
              >
                {currentKeywords.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.88, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, y: -12 }}
                    transition={{
                      duration: 0.9,
                      delay: idx * 0.15,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      position: 'absolute',
                      ...item.position,
                    }}
                    className={`text-stone-200 tracking-tight transition-all duration-700 ${item.size} ${item.weight} ${item.opacity} ${item.blur} ${item.extraClass || ''} drop-shadow-md whitespace-nowrap`}
                  >
                    <span className="relative inline-block">
                      {item.text}
                      {/* 미세한 신경 신호 점멸 점 */}
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E0D3C1] ml-2 align-middle animate-ping opacity-75" />
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* 히어로 중앙 환자 공감 카피 (독립된 z-10 영역 확보) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative z-10 max-w-2xl lg:max-w-3xl text-center mx-auto px-4"
        >
          {/* 수정된 배지 문구 */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#E7DEC8] text-xs md:text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#E7DEC8] animate-pulse" />
            자율신경실조증 환자분들이 매일 마주하는 고통
          </div>

          <h3 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-snug md:leading-tight mb-6">
            "검사 결과는 늘 정상이라는데,<br className="hidden sm:inline" />
            내 몸은 왜 이렇게 괴롭고 힘들까요?"
          </h3>

          <p className="text-sm md:text-base lg:text-lg text-stone-300 font-light leading-relaxed max-w-2xl mx-auto">
            원인을 알 수 없는 불안, 안개 낀 듯 멍한 머리, 멈추지 않는 심장 두근거림…<br className="hidden sm:inline" />
            기분 탓이나 의지 부족이 아닙니다. 눈에 보이지 않던 신경계의 SOS 신호입니다.
          </p>
        </motion.div>

        {/* 아래로 이어지는 은은한 스크롤 다운 가이드 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400 text-xs font-light tracking-widest uppercase"
        >
          <span>Scroll down for solution</span>
          <svg className="w-4 h-4 animate-bounce text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>

      {/* =========================================================================
          2. 솔루션 메시지 및 배경 트랜지션 (어둠 -> 크림 베이지 크로스페이드)
          - 다크 브라운(#4E4647)에서 부드러운 웜 크림 베이지(#FAF8F5)로 점진적 전환
          - 뷰포트 정중앙 정렬 (min-h, flex-col, items-center, justify-center)
          - 메인 카피: OUR APPROACH ORB 시그니처 골드(#e5b98a) 및 지정 줄바꿈 적용
      ========================================================================= */}
      <div className="relative w-full min-h-[500px] md:min-h-[580px] flex flex-col justify-center items-center bg-gradient-to-b from-[#4E4647] via-[#857774]/25 to-[#FAF8F5] py-20 md:py-28 px-6 text-center">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center justify-center text-center"
          >
            {/* 정밀 진단 솔루션 배지 */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8E7463]/10 border border-[#8E7463]/25 text-[#634E3F] text-xs md:text-sm font-semibold tracking-wider uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-[#8E7463]" />
              DIAGNOSTIC TECHNOLOGY · QEEG SYSTEM
            </div>

            {/* 메인 카피 (정중앙 정렬, 지정 2줄 줄바꿈, '이상 없음' #e5b98a 골드 컬러) */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold text-stone-900 leading-snug md:leading-tight lg:leading-[1.35] tracking-tight max-w-4xl mx-auto mb-6 text-center">
              <span className="block">
                병원 검사상{' '}
                <span className="text-[#e5b98a] font-black underline decoration-[#e5b98a]/70 underline-offset-8">
                  '이상 없음'
                </span>
                에도 지속되는 고통,
              </span>
              <span className="block text-stone-950 font-black mt-2">
                뇌와 자율신경의 기능적 불균형에서 답을 찾습니다.
              </span>
            </h2>

            {/* 솔루션 보조 설명 (지정 3줄 줄바꿈 및 정중앙 정렬) */}
            <div className="text-base md:text-lg text-stone-600 font-normal leading-relaxed max-w-3xl mx-auto text-center space-y-1.5">
              <p className="block">
                CT나 MRI는 뇌출혈이나 종양 같은 <strong className="font-semibold text-stone-800">'구조적 기질 병변'</strong>만 진단합니다.
              </p>
              <p className="block">
                오브한의원은 보이지 않는 뇌신경망의 미세 과열과 자율신경 조절 장애를
              </p>
              <p className="block">
                <strong className="font-semibold text-stone-800">습식 정량화 뇌파(qEEG)와 심박변이도(HRV)</strong>로 객관화합니다.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* =========================================================================
          3. '왜 정량화 뇌파 분석인가?' (Feature Cards 3열 레이아웃)
          - 배경: 단정하고 편안한 크림 베이지 (#FAF8F5)
          - 레이아웃: grid-cols-1 md:grid-cols-3
          - 핵심 키워드 강조: '정밀 측정', '초정밀 노이즈 차단', 'AI 데이터 대조'
          - 호버 효과: hover:-translate-y-2 및 그림자 심화
          - 텍스트 위계(Hierarchy): 소제목 강조 + 상세 설명 text-stone-500
      ========================================================================= */}
      <div className="w-full bg-[#FAF8F5] pt-6 md:pt-12 pb-24 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* 섹션 서두 라벨 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h3 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">
              왜 습식 정량화 뇌파(qEEG) 분석인가?
            </h3>
            <p className="text-sm md:text-base text-stone-500 mt-2 font-normal">
              간이 밴드나 설문식 검사와는 차원이 다른 대학병원급 객관적 뇌신경 정밀 진단 시스템
            </p>
          </motion.div>

          {/* 3열 반응형 Feature Cards 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {FEATURE_CARDS.map((card, index) => (
              <motion.article
                key={card.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.65, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="group relative bg-white rounded-2xl p-8 lg:p-9 border border-[#EAE4DC] shadow-sm hover:shadow-xl hover:border-[#8E7463]/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* 상단: 스텝 번호 & 아이콘 */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-[#FAF8F5] group-hover:bg-[#8E7463]/10 border border-[#EAE4DC] group-hover:border-[#8E7463]/25 flex items-center justify-center transition-colors duration-300">
                      {card.icon}
                    </div>
                    <span className="text-xs font-mono font-bold tracking-widest text-[#8E7463] px-2.5 py-1 rounded-md bg-[#8E7463]/10 border border-[#8E7463]/20">
                      STEP {card.step}
                    </span>
                  </div>

                  {/* 핵심 키워드 강조 (Bold 폰트로 크게 강조) */}
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-[#8E7463] uppercase tracking-wider block mb-1">
                      {card.subtitle}
                    </span>
                    <h4 className="text-2xl lg:text-[26px] font-extrabold text-stone-900 tracking-tight group-hover:text-[#634E3F] transition-colors duration-200">
                      {card.keyword}
                    </h4>
                  </div>

                  {/* 카드 소제목 */}
                  <h5 className="text-sm font-bold text-stone-800 mb-4 pb-3 border-b border-stone-100">
                    {card.title}
                  </h5>

                  {/* 상세 설명 (위계 조절: text-stone-500, 작은 폰트) */}
                  <p className="text-[13.5px] lg:text-sm text-stone-500 font-normal leading-relaxed text-justify mb-6">
                    {card.description}
                  </p>
                </div>

                {/* 하단 체크포인트 하이라이트 */}
                <div className="pt-4 border-t border-stone-100/80">
                  <ul className="space-y-2">
                    {card.highlights.map((item, hIdx) => (
                      <li key={hIdx} className="flex items-center gap-2 text-xs font-medium text-stone-700">
                        <span className="w-4 h-4 rounded-full bg-[#8E7463]/15 text-[#8E7463] flex items-center justify-center text-[10px] font-bold shrink-0">
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>

          {/* 하단 안내 및 칼럼 바로가기 링크 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <a
              href="/qeeg"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#634E3F] hover:text-[#42342A] hover:underline underline-offset-4 transition-all"
            >
              <span>오브한의원 습식 정량화 뇌파(qEEG) 측정 과정 및 장비 안내 자세히 보기</span>
              <span aria-hidden="true">→</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
