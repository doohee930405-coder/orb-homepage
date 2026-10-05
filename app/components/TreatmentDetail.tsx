import ResponsivePicture from './ResponsivePicture';
import SiteHeader from './SiteHeader';
import TrackedLink from './TrackedLink';
import { clinic, treatmentPath, treatments, type Locale, type Treatment } from '../lib/clinic';

const detailCopy = {
  ko: {
    home: '홈',
    treatments: '진료 분야',
    concerns: '이런 불편을 살핍니다',
    process: '진료는 이렇게 이어집니다',
    noteTitle: '진료 전 참고해 주세요',
    note: '검사와 치료의 필요 여부는 문진과 진찰 후 결정됩니다. 같은 증상이라도 개인의 상태에 따라 진료 내용은 달라질 수 있습니다.',
    related: '다른 진료 분야',
    bookingTitle: '현재의 불편을 이야기해 주세요.',
    bookingBody: '네이버 예약에서 가능한 시간을 확인하거나 전화로 문의하실 수 있습니다.',
    booking: '네이버 예약',
    call: '전화 문의',
    back: '전체 진료 분야 보기',
    privacy: '개인정보처리방침',
  },
  en: {
    home: 'Home',
    treatments: 'Treatments',
    concerns: 'Concerns we review',
    process: 'How a visit proceeds',
    noteTitle: 'Before your visit',
    note: 'The need for tests and treatment is determined after consultation and examination. Care may differ between patients even when symptoms appear similar.',
    related: 'Other treatment areas',
    bookingTitle: 'Tell us what has been troubling you.',
    bookingBody: 'Check available appointments on Naver or call the clinic for assistance.',
    booking: 'Book on Naver',
    call: 'Call the clinic',
    back: 'View all treatments',
    privacy: 'Privacy',
  },
} as const;

export default function TreatmentDetail({ treatment, locale }: { treatment: Treatment; locale: Locale }) {
  const text = detailCopy[locale];
  const isEnglish = locale === 'en';
  const home = isEnglish ? '/en' : '/';
  const related = treatments.filter((item) => item.slug !== treatment.slug);

  return (
    <main className={`site-shell detail-page locale-${locale}`} lang={locale}>
      <SiteHeader locale={locale} compact />
      <section className="detail-hero">
        <div className="detail-hero-copy">
          <nav className="breadcrumbs" aria-label={isEnglish ? 'Breadcrumb' : '현재 위치'}>
            <a href={home}>{text.home}</a><span>/</span><a href={`${home}#treatments`}>{text.treatments}</a>
          </nav>
          <p className="eyebrow">TREATMENT {treatment.number}</p>
          <h1>{treatment.title[locale]}</h1>
          <p>{treatment.summary[locale]}</p>
        </div>
        {treatment.slug === 'diet' ? (
          <div className="diet-hero-duo">
            <div className="diet-hero-duo-item diet-duo-quantum">
              <img
                src="/images/clinic/diet-quantum-fit.png"
                alt={isEnglish ? 'Quantum Fit Microwave Lifting (Same Technology as ONDA Lifting)' : '오브한의원 퀀텀핏 극초단파 리프팅 (K-온다 리프팅 동일 기술)'}
                className="diet-duo-img"
              />
              <div className="diet-duo-overlay">
                <span className="diet-duo-tag">{isEnglish ? 'K-ONDA LIFTING TECH' : 'K-온다 동일 극초단파'}</span>
                <strong>{isEnglish ? 'Quantum Fit Microwave' : '퀀텀핏 극초단파 리프팅'}</strong>
              </div>
            </div>
            <div className="diet-hero-duo-item diet-duo-line">
              <img
                src="/images/clinic/diet-acurex-line.png"
                alt={isEnglish ? 'Acurex Line Targeted Pharmacopuncture' : '오브한의원 아큐렉스 라인 약침'}
                className="diet-duo-img"
              />
              <div className="diet-duo-overlay">
                <span className="diet-duo-tag">{isEnglish ? 'TARGETED SCULPTING' : '고농축 지방 분해'}</span>
                <strong>{isEnglish ? 'Acurex Line' : '아큐렉스 라인 약침'}</strong>
              </div>
            </div>
          </div>
        ) : (
          <ResponsivePicture
            className="detail-hero-image"
            image={treatment.image}
            alt={treatment.imageAlt[locale]}
            eager
            position={treatment.imagePosition}
            fit={treatment.imageFit}
          />
        )}
      </section>

      <section className="detail-intro">
        <p>{treatment.intro[locale]}</p>
      </section>

      {treatment.slug === 'diet' && (
        <section className="diet-tech-section">
          <div className="diet-tech-header">
            <p className="eyebrow">
              {isEnglish ? 'SIGNATURE DUAL CONTOURING TECHNOLOGY' : 'SIGNATURE DUAL CONTOURING TECHNOLOGY'}
            </p>
            <h2>
              {isEnglish
                ? 'Quantum Fit (Same Technology as ONDA Lifting) & Acurex Line Dual Solution'
                : 'K-온다(ONDA) 리프팅과 동일한 기술력의 퀀텀핏과\n고농축 아큐렉스 라인약침의 듀얼 솔루션'}
            </h2>
            <p>
              {isEnglish
                ? 'Reshape facial and body contours without pain or downtime through next-generation microwave lifting and targeted herbal pharmacopuncture.'
                : '오브한의원 다이어트 클리닉은 무리한 절식이나 피부 처짐 없이, 통증 없는 차세대 극초단파 리프팅과 순수 생약 성분의 라인약침을 결합하여 무너진 페이스 라인과 바디 윤곽을 정밀하게 재설계합니다.'}
            </p>
          </div>

          <div className="diet-tech-grid">
            {/* 1. QUANTUM FIT CARD */}
            <article className="diet-tech-card diet-card-quantum">
              <div className="diet-tech-visual-wrap">
                <img
                  src="/images/clinic/diet-quantum-fit.png"
                  alt={isEnglish ? 'Quantum Fit Microwave Beauty Platform' : '오브한의원 퀀텀핏 극초단파 장비'}
                  className="diet-tech-poster"
                />
                <span className="tech-badge-gold">
                  {isEnglish ? 'K-ONDA LIFTING DUAL MICROWAVE' : 'K-온다 리프팅 동일 기술'}
                </span>
              </div>
              <div className="diet-tech-body">
                <div className="diet-tech-meta">
                  <span className="tech-num">TECH 01</span>
                  <h3>{isEnglish ? 'Quantum Fit Microwave Lifting' : '퀀텀핏 극초단파 리프팅'}</h3>
                  <strong className="tech-sub-strong">
                    {isEnglish
                      ? 'Painless Microwave Technology Identical to ONDA Lifting'
                      : '온다(ONDA) 리프팅과 동일한 2.45GHz 극초단파 기술력'}
                  </strong>
                </div>
                <ul className="tech-features">
                  <li>
                    <strong>{isEnglish ? 'Targeted Fat Cell Apoptosis' : '온다 리프팅과 동일한 극초단파 에너지'}</strong>
                    <p>
                      {isEnglish
                        ? 'Unlike traditional RF or HIFU, selective 2.45GHz microwaves bypass epidermal tissue to target and dissolve subcutaneous fat cells directly.'
                        : '기존 고주파(RF)나 초음파(HIFU)의 한계를 넘어, 피부 표면 손상 없이 피하지방층에만 선택적으로 에너지를 집중시켜 심부 지방세포의 사멸(Apoptosis)을 유도합니다.'}
                    </p>
                  </li>
                  <li>
                    <strong>{isEnglish ? 'Contact Cooling System' : '강력한 접촉식 쿨링으로 무통증 시술'}</strong>
                    <p>
                      {isEnglish
                        ? 'Built-in surface cooling protects the outer skin layer, ensuring high-energy delivery without pain, burns, or the need for anesthesia.'
                        : '피부 표면 온도를 차갑게 제어하는 특허 쿨링 헤드가 작동하여 마취 크림이나 수면 마취 없이도 통증과 열감 없이 매우 편안하게 시술받으실 수 있습니다.'}
                    </p>
                  </li>
                  <li>
                    <strong>{isEnglish ? 'Dual Fat Reduction & Collagen Tightening' : '지방 분해 + 콜라겐 리프팅 동시 구현'}</strong>
                    <p>
                      {isEnglish
                        ? 'Dissolves stubborn fat deposits while immediately shrinking and stimulating collagen fibers, preventing post-weight loss skin sagging.'
                        : '심부 지방을 분해함과 동시에 진피층의 콜라겐 생성을 강력 촉진하여, 살이 빠진 뒤에도 피부 처짐 없이 탄력 있게 달라붙는 밀착 리프팅 효과를 선사합니다.'}
                    </p>
                  </li>
                  <li>
                    <strong>{isEnglish ? 'Key Indications' : '주요 적용 부위'}</strong>
                    <p>
                      {isEnglish
                        ? 'Double chin, jawline definition, jowls, buccal fat, flanks (love handles), upper arms, abdomen, inner thighs.'
                        : '이중턱, 처진 턱선, 심부볼, 불독살, 부유방, 복부 러브핸들, 팔뚝 밑살, 허벅지 안쪽 등 운동으로 빠지지 않는 군살 부위.'}
                    </p>
                  </li>
                </ul>
              </div>
            </article>

            {/* 2. ACUREX LINE CARD */}
            <article className="diet-tech-card diet-card-line">
              <div className="diet-tech-visual-wrap">
                <img
                  src="/images/clinic/diet-acurex-line.png"
                  alt={isEnglish ? 'Acurex Line Pharmacopuncture' : '오브한의원 아큐렉스 라인 약침'}
                  className="diet-tech-poster"
                />
                <span className="tech-badge-bronze">
                  {isEnglish ? 'PURE HERBAL CONTOURING' : '고농축 순수 생약 성분'}
                </span>
              </div>
              <div className="diet-tech-body">
                <div className="diet-tech-meta">
                  <span className="tech-num">TECH 02</span>
                  <h3>{isEnglish ? 'Acurex Line Pharmacopuncture' : '아큐렉스 라인 약침'}</h3>
                  <strong className="tech-sub-strong">
                    {isEnglish
                      ? 'Targeted Localized Fat Dissolution & Lymphatic Clearance'
                      : '스테로이드·PPC 없는 안전한 국소 지방 분해 & 림프 배출'}
                  </strong>
                </div>
                <ul className="tech-features">
                  <li>
                    <strong>{isEnglish ? 'Steroid-Free Natural Prescription' : '천연 생약 유래 프리미엄 안전 처방'}</strong>
                    <p>
                      {isEnglish
                        ? 'Formulated exclusively with concentrated herbal extracts without steroids, PPC, or hormonal disruptors, eliminating risks of tissue depression.'
                        : '피부 패임이나 부정출혈 등 호르몬성 부작용을 유발할 수 있는 스테로이드, PPC를 배제하고, 안전성을 입증받은 고농축 천연 생약 성분만을 정밀 배합했습니다.'}
                    </p>
                  </li>
                  <li>
                    <strong>{isEnglish ? 'Cell Membrane Softening & Lymph Clearance' : '지방세포막 이완 및 신속한 노폐물 배출'}</strong>
                    <p>
                      {isEnglish
                        ? 'Relaxes dense fat clusters and stimulates micro-lymphatic flow, rapidly draining decomposed fatty acids and toxins through natural metabolism.'
                        : '단단하게 굳은 지방세포막의 투과성을 높여 지방을 액화시키고, 국소 림프 순환을 뚫어주어 분해된 지방과 정체된 노폐물이 땀과 소변으로 신속히 배출됩니다.'}
                    </p>
                  </li>
                  <li>
                    <strong>{isEnglish ? 'Cellulite & Microcirculation Improvement' : '만성 부종 완화 및 셀룰라이트 매끄러운 개선'}</strong>
                    <p>
                      {isEnglish
                        ? 'Improves sluggish microcirculation in fibrotic cellulite zones, creating smooth skin texture and reducing localized swelling.'
                        : '섬유화되어 울퉁불퉁해진 셀룰라이트 부위의 미세 혈류를 촉진하여 붓기를 신속히 가라앉히고 매끄럽고 매력적인 실루엣을 조각합니다.'}
                    </p>
                  </li>
                  <li>
                    <strong>{isEnglish ? 'Key Indications' : '주요 적용 부위'}</strong>
                    <p>
                      {isEnglish
                        ? 'Facial contours, submental fat, bra-line bulges, lower belly, love handles, cellulite on thighs.'
                        : '늘어진 볼살·이중턱, 브래지어 라인 군살, 부유방, 아랫배 똥배, 옆구리 러브핸들, 허벅지 셀룰라이트.'}
                    </p>
                  </li>
                </ul>
              </div>
            </article>
          </div>

          {/* DUAL SYNERGY BANNER */}
          <div className="diet-synergy-box">
            <div className="synergy-badge">
              {isEnglish ? 'SYNERGY PROTOCOL' : 'DUAL SYNERGY PROTOCOL'}
            </div>
            <h4>
              {isEnglish
                ? 'Why Combine Quantum Fit (ONDA Tech) with Acurex Line?'
                : '왜 퀀텀핏(K-온다 동일 기술)과 아큐렉스 라인약침을 병행해야 할까요?'}
            </h4>
            <p>
              {isEnglish
                ? 'Acurex Line pre-softens rigid subcutaneous fat clusters and activates lymphatic drainage pathways. Immediately following, Quantum Fit delivers focused 2.45GHz microwave energy deep into the relaxed tissue, selectively destroying fat cells and contracting collagen. This synergistic protocol delivers over twice the reduction speed and contour-sculpting precision of either treatment alone.'
                : '아큐렉스 라인약침으로 단단하게 뭉친 지방과 섬유성 셀룰라이트를 부드럽게 이완시키고 림프 배출로를 활짝 열어준 뒤, K-온다 리프팅과 동일한 기술력의 퀀텀핏 극초단파 에너지를 조사하여 심부 지방세포를 집중 사멸시키고 늘어진 피부를 강력하게 조여줍니다. 두 시술의 유기적 결합으로 단독 시술 대비 압도적인 감량 속도와 지속력을 경험하실 수 있습니다.'}
            </p>
          </div>
        </section>
      )}

      <section className="detail-columns">
        <article>
          <p className="eyebrow">01 · CONCERNS</p>
          <h2>{text.concerns}</h2>
          <ul className="detail-list">
            {treatment.concerns[locale].map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article>
          <p className="eyebrow">02 · PROCESS</p>
          <h2>{text.process}</h2>
          <ol className="process-list">
            {treatment.care[locale].map((item, index) => (
              <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></li>
            ))}
          </ol>
        </article>
      </section>

      <aside className="medical-note">
        <strong>{text.noteTitle}</strong>
        <p>{text.note}</p>
      </aside>

      <section className="related-section">
        <div className="section-heading">
          <p className="eyebrow">RELATED</p>
          <h2>{text.related}</h2>
        </div>
        <div className="related-grid">
          {related.map((item) => (
            <a href={treatmentPath(locale, item.slug)} key={item.slug}>
              <span>{item.number}</span>
              <strong>{item.shortTitle[locale]}</strong>
              <i aria-hidden="true">→</i>
            </a>
          ))}
        </div>
      </section>

      <section className="contact-section detail-contact">
        <p className="eyebrow">RESERVATION</p>
        <h2>{text.bookingTitle}</h2>
        <p>{text.bookingBody}</p>
        <div className="primary-actions primary-actions-centered">
          <TrackedLink className="button button-light" href={clinic.naverBookingUrl} target="_blank" rel="noreferrer" eventName="booking_click" eventLabel={text.booking}>{text.booking}<span>↗</span></TrackedLink>
          <TrackedLink className="button button-outline-light" href={clinic.phoneHref} eventName="phone_click" eventLabel={text.call}>{text.call}</TrackedLink>
        </div>
        <a className="back-link" href={`${home}#treatments`}>← {text.back}</a>
      </section>

      <footer className="site-footer">
        <div><strong>ORB</strong><span>{isEnglish ? clinic.nameEn : clinic.nameKo}</span></div>
        <address>{isEnglish ? clinic.addressEn : clinic.addressKo}<br />{clinic.phoneDisplay}</address>
        <div className="footer-meta"><a href={isEnglish ? '/en/privacy' : '/privacy'}>{text.privacy}</a><span>© ORB Korean Medicine Clinic.</span></div>
      </footer>

      <aside className="mobile-cta" aria-label={isEnglish ? 'Appointment actions' : '예약 바로가기'}>
        <TrackedLink href={clinic.naverBookingUrl} target="_blank" rel="noreferrer" eventName="booking_click" eventLabel={text.booking}>{text.booking}</TrackedLink>
        <TrackedLink href={clinic.phoneHref} eventName="phone_click" eventLabel={text.call}>{text.call}</TrackedLink>
      </aside>
    </main>
  );
}
