import React from 'react';
import { type Locale } from '../lib/clinic';

interface TreatmentSynergyBridgeProps {
  locale: Locale;
}

const BRIDGE_CONTENT = {
  ko: {
    eyebrow: 'STRUCTURAL & NEUROCHEMICAL SYNERGY',
    heading: "왜 신경안정제만으로는 해결되지 않을까요?\n몸의 '구조'와 뇌의 '화학'을 동시에 조율해야 합니다.",
    subtextLead: '자율신경실조증은 단순한 마음의 병이 아닙니다. 꽉 막힌 물리적 통로를 여는 ',
    subtextHighlight1: '상향식 추나요법',
    subtextMid: '과 과열된 스트레스 호르몬 스위치를 끄는 ',
    subtextHighlight2: '신경약리 맞춤 한약',
    subtextEnd: '이 결합될 때, 비로소 신경계는 스스로 회복하는 힘을 되찾습니다.',
    card1: {
      badge: 'STEP 01 · 상향식 추나요법',
      title: '경추·흉추·횡격막을 열어 뇌로 향하는 비상 신호를 끕니다',
      body: "자율신경의 80%는 몸에서 뇌로 올라가는 '상향식(Bottom-up) 신경망'입니다. 거북목으로 경직된 경추(미주신경 통로), 교감신경절이 밀집한 흉추, 호흡과 내장기 압력을 조절하는 횡격막이 굳어 있으면 뇌는 24시간을 위기 상황으로 착각합니다. 정밀 추나요법으로 물리적 압박을 해제해 뇌로 올라가는 가짜 비상 경보를 원천 차단합니다.",
      tags: ['#미주신경감압', '#횡격막이완', '#상향식신경조절'],
    },
    card2: {
      badge: 'STEP 02 · 신경약리 맞춤 한약',
      title: 'HPA축 호르몬을 제어해\n과열된 뇌를 식힙니다',
      body: '만성 스트레스와 신경염증으로 HPA축(시상하부-뇌하수체-부신)이 과활성화되면, 코르티솔과 아드레날린이 쉴 새 없이 분비되어 심계항진·불면·공황을 유발합니다. 정량화뇌파(QEEG)와 자율신경 데이터에 기반해 설계된 한약은 교감신경의 과흥분을 안정시키고 무너진 부교감신경의 톤을 올려 신경계의 화학적 항상성을 복원합니다.',
      tags: ['#HPA축안정화', '#신경염증완화', '#정량뇌파기반설계'],
    },
    banner: {
      eyebrow: 'TRANSPARENCY & DYNAMIC PRECISION',
      title: '처방된 모든 약재는 100% 투명하게 공개됩니다.\n단, 당신의 한약은 2주마다 새롭게 설계됩니다.',
      body: '오브한의원 마곡점은 식약처 검증을 통과한 GMP 인증 의약품용 규격 한약재만을 사용하며, 모든 약재명과 구성을 숨김없이 투명하게 공개합니다. 하지만 같은 약재라도 어느 시점에, 어떤 비율로 배합하느냐에 따라 결과는 완전히 달라집니다. 자율신경계의 회복 단계에 맞춰 2~4주 간격으로 약재 구성과 배합 비율을 정밀하게 재설계(Dynamic Re-design)하는 것—이것이 오브한의원 한약 치료의 핵심입니다.',
      pillars: [
        {
          code: '01. SAFETY',
          title: '100% GMP 의약품용 한약재',
          desc: '중금속·잔류농약 안전성 검증 완료',
        },
        {
          code: '02. HONESTY',
          title: '전 처방 약재명 투명 공개',
          desc: '환자의 알 권리를 존중하는 정직한 원칙',
        },
        {
          code: '03. PRECISION',
          title: '2~4주 단위 동적 재설계',
          desc: '회복 단계별 배합 비율 추적 조율',
        },
      ],
    },
  },
  en: {
    eyebrow: 'STRUCTURAL & NEUROCHEMICAL SYNERGY',
    heading: "Why Can't Sedatives Alone Resolve the Problem?\nWe Must Harmonize Both Somatic 'Structure' and Cerebral 'Chemistry'.",
    subtextLead: 'Autonomic dysregulation is not merely a psychological condition. When ',
    subtextHighlight1: 'bottom-up Chuna manual therapy',
    subtextMid: '—which unblocks constricted physical pathways—is combined with ',
    subtextHighlight2: 'neuropharmacological customized herbal medicine',
    subtextEnd: ' that switches off overactive stress hormones, the nervous system finally restores its innate capacity for self-regulation.',
    card1: {
      badge: 'STEP 01 · Bottom-Up Chuna Therapy',
      title: 'Decompressing the Cervical, Thoracic, and Diaphragm Pathways to Turn Off False Emergency Alarms to the Brain',
      body: "Approximately 80% of autonomic fibers constitute a 'bottom-up' afferent sensory pathway ascending from the body to the brain. When forward head posture tenses the cervical spine (vagus nerve conduit), the sympathetic-dense thoracic spine, or the diaphragm regulating visceral pressure, the brain mistakes this for an around-the-clock emergency. Precision Chuna therapy decompresses mechanical strain, silencing false distress signals at their source.",
      tags: ['#VagusNerveDecompression', '#DiaphragmaticRelease', '#BottomUpAutonomicRegulation'],
    },
    card2: {
      badge: 'STEP 02 · Neuropharmacological Herbal Medicine',
      title: 'Regulating HPA-Axis Hormones\nto Cool Down the Overheated Brain',
      body: 'When chronic stress and neuroinflammation trigger HPA-axis (hypothalamic-pituitary-adrenal) hyperactivity, continuous surges of cortisol and adrenaline cause palpitations, insomnia, and panic episodes. Formulated through objective QEEG brain mapping and autonomic biometric data, our customized herbal prescriptions calm sympathetic overarousal and elevate parasympathetic tone to reestablish chemical neuro-homeostasis.',
      tags: ['#HPAAxisStabilization', '#NeuroinflammationRelief', '#QEEGGuidedFormulation'],
    },
    banner: {
      eyebrow: 'TRANSPARENCY & DYNAMIC PRECISION',
      title: '100% of Prescribed Medicinal Herbs Are Openly Disclosed.\nYet, Your Formulation Is Re-Engineered Every 2 Weeks.',
      body: "ORB Korean Medicine Clinic exclusively uses pharmaceutical-grade, MFDS GMP-certified herbal medicines and transparently discloses every ingredient without exception. However, even with the same herbs, therapeutic efficacy depends entirely on the timing and proportion of the blend. Tracking your autonomic nervous system's recovery and dynamically re-engineering ingredient proportions every 2 to 4 weeks (Dynamic Re-design)—this is the cornerstone of ORB Clinic's neuro-herbal care.",
      pillars: [
        {
          code: '01. SAFETY',
          title: '100% GMP Pharmaceutical Grade',
          desc: 'Verified safety against heavy metals and pesticides',
        },
        {
          code: '02. HONESTY',
          title: 'Full Ingredient Disclosure',
          desc: 'Honest principles honoring patient transparency',
        },
        {
          code: '03. PRECISION',
          title: 'Biweekly Dynamic Re-design',
          desc: 'Tracking & calibrating formulation by recovery phase',
        },
      ],
    },
  },
} as const;

export default function TreatmentSynergyBridge({ locale }: TreatmentSynergyBridgeProps) {
  const content = BRIDGE_CONTENT[locale] ?? BRIDGE_CONTENT.ko;

  return (
    <section
      id="treatment-synergy"
      className="treatment-synergy-section reveal w-full bg-[#FAF8F5] py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-y border-[#EAE4DC] font-sans antialiased"
      aria-labelledby="synergy-heading"
    >
      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
        
        {/* 1. 상단 헤더 영역 */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs font-bold tracking-widest uppercase text-[#9A6B56]">
            {content.eyebrow}
          </p>

          <h2
            id="synergy-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C221E] leading-tight sm:leading-snug break-keep"
          >
            {content.heading.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx === 0 && <br className="hidden sm:inline" />}
              </React.Fragment>
            ))}
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-[#5C534E] leading-relaxed break-keep pt-1">
            {content.subtextLead}
            <strong className="font-semibold text-[#2C221E] underline decoration-[#9A6B56]/40 underline-offset-4">
              {content.subtextHighlight1}
            </strong>
            {content.subtextMid}
            <strong className="font-semibold text-[#2C221E] underline decoration-[#9A6B56]/40 underline-offset-4">
              {content.subtextHighlight2}
            </strong>
            {content.subtextEnd}
          </p>
        </header>

        {/* 2. 중단 2단 카드 영역 (모바일 1열, 데스크톱 2열) */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* 카드 1: 상향식 추나요법 */}
          <article className="group bg-white border border-[#EAE4DC] rounded-2xl p-6 sm:p-8 lg:p-9 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EAE4DC] text-[#9A6B56] text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#9A6B56] animate-pulse" aria-hidden="true" />
                {content.card1.badge}
              </div>

              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2C221E] leading-snug break-keep group-hover:text-[#9A6B56] transition-colors duration-200">
                {content.card1.title.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx === 0 && <br />}
                  </React.Fragment>
                ))}
              </h3>

              <p className="text-sm sm:text-base text-[#5C534E] leading-relaxed break-keep">
                {content.card1.body}
              </p>
            </div>

            <footer className="pt-6 mt-6 border-t border-[#F2ECE5] flex flex-wrap gap-2">
              {content.card1.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-xs text-[#5C534E] bg-[#F4EFEB] hover:bg-[#EAE4DC] px-3 py-1.5 rounded-full font-medium transition-colors duration-150"
                >
                  {tag}
                </span>
              ))}
            </footer>
          </article>

          {/* 카드 2: 신경약리 맞춤 한약 */}
          <article className="group bg-white border border-[#EAE4DC] rounded-2xl p-6 sm:p-8 lg:p-9 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EAE4DC] text-[#9A6B56] text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#9A6B56] animate-pulse" aria-hidden="true" />
                {content.card2.badge}
              </div>

              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2C221E] leading-snug break-keep group-hover:text-[#9A6B56] transition-colors duration-200">
                {content.card2.title.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx === 0 && <br />}
                  </React.Fragment>
                ))}
              </h3>

              <p className="text-sm sm:text-base text-[#5C534E] leading-relaxed break-keep">
                {content.card2.body}
              </p>
            </div>

            <footer className="pt-6 mt-6 border-t border-[#F2ECE5] flex flex-wrap gap-2">
              {content.card2.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-xs text-[#5C534E] bg-[#F4EFEB] hover:bg-[#EAE4DC] px-3 py-1.5 rounded-full font-medium transition-colors duration-150"
                >
                  {tag}
                </span>
              ))}
            </footer>
          </article>

        </div>

        {/* 3. 하단 신뢰 배너 영역 (다크 브라운 풀와이드 배너) */}
        <aside
          className="bg-gradient-to-br from-[#2C221E] via-[#261E1A] to-[#1E1714] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 shadow-lg relative overflow-hidden"
          aria-label={locale === 'en' ? 'Formulation transparency and dynamic re-design principles' : '한약 처방 투명성 및 동적 재설계 원칙'}
        >
          <div className="relative z-10 space-y-6 sm:space-y-8">
            
            {/* 배너 헤더 */}
            <div className="space-y-3">
              <p className="text-xs font-bold tracking-widest uppercase text-[#D4A387]">
                {content.banner.eyebrow}
              </p>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight break-keep">
                {content.banner.title.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx === 0 && <br className="hidden sm:inline" />}
                  </React.Fragment>
                ))}
              </h3>
              <p className="text-sm sm:text-base text-[#D8D0C5] leading-relaxed break-keep max-w-4xl pt-1">
                {content.banner.body}
              </p>
            </div>

            {/* 3단 그리드 아이콘 바 (모바일 1열, 데스크톱 3열) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 sm:pt-8 border-t border-[#443832]">
              
              {/* 항목 01. SAFETY */}
              <div className="flex items-start gap-4 p-2 -m-2 rounded-xl hover:bg-white/[0.03] transition-colors duration-200">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#3D322C] border border-[#53463E] flex items-center justify-center text-[#D4A387] shadow-inner">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold tracking-wider text-[#D4A387] block uppercase">
                    {content.banner.pillars[0].code}
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {content.banner.pillars[0].title}
                  </p>
                  <p className="text-xs sm:text-sm text-[#A89F97] break-keep leading-normal">
                    {content.banner.pillars[0].desc}
                  </p>
                </div>
              </div>

              {/* 항목 02. HONESTY */}
              <div className="flex items-start gap-4 p-2 -m-2 rounded-xl hover:bg-white/[0.03] transition-colors duration-200">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#3D322C] border border-[#53463E] flex items-center justify-center text-[#D4A387] shadow-inner">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold tracking-wider text-[#D4A387] block uppercase">
                    {content.banner.pillars[1].code}
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {content.banner.pillars[1].title}
                  </p>
                  <p className="text-xs sm:text-sm text-[#A89F97] break-keep leading-normal">
                    {content.banner.pillars[1].desc}
                  </p>
                </div>
              </div>

              {/* 항목 03. PRECISION */}
              <div className="flex items-start gap-4 p-2 -m-2 rounded-xl hover:bg-white/[0.03] transition-colors duration-200">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#3D322C] border border-[#53463E] flex items-center justify-center text-[#D4A387] shadow-inner">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold tracking-wider text-[#D4A387] block uppercase">
                    {content.banner.pillars[2].code}
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {content.banner.pillars[2].title}
                  </p>
                  <p className="text-xs sm:text-sm text-[#A89F97] break-keep leading-normal">
                    {content.banner.pillars[2].desc}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </aside>

      </div>
    </section>
  );
}
