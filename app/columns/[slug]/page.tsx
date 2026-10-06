import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MarkdownView from '../../components/MarkdownView';
import SafeImage from '../../components/SafeImage';
import SiteHeader from '../../components/SiteHeader';
import TrackedLink from '../../components/TrackedLink';
import { clinic, SITE_URL } from '../../lib/clinic';
import { getAllColumns, getColumnBySlug } from '../../lib/columns';

export function generateStaticParams() {
  const columns = getAllColumns();
  return columns.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug || '';
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {}
  let doubleDecodedSlug = decodedSlug;
  try {
    doubleDecodedSlug = decodeURIComponent(decodedSlug);
  } catch {}
  const column =
    getColumnBySlug(slug) ||
    getColumnBySlug(decodedSlug) ||
    getColumnBySlug(doubleDecodedSlug);
  if (!column) return {};

  const pageUrl = `${SITE_URL}/columns/${column.slug}`;
  const imageUrl = column.thumbnail.startsWith('http')
    ? column.thumbnail
    : `${SITE_URL}${column.thumbnail}`;

  const authorName = column.author || '오브한의원 대표원장 전두희';

  return {
    title: `${column.title} | 오브한의원 전두희 원장 칼럼`,
    description: column.summary,
    keywords: column.tags,
    authors: [{ name: authorName }],
    alternates: {
      canonical: pageUrl,
      languages: {
        ko: pageUrl,
      },
    },
    openGraph: {
      title: `${column.title} | 오브한의원 마곡점`,
      description: column.summary,
      url: pageUrl,
      siteName: '오브한의원 마곡점',
      locale: 'ko_KR',
      type: 'article',
      publishedTime: column.date,
      modifiedTime: column.updatedAt || column.date,
      authors: [authorName],
      tags: column.tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: column.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${column.title} | 오브한의원 전두희 원장`,
      description: column.summary,
      images: [imageUrl],
    },
  };
}

// Helper: Extract academic citations like [1], [2] from text
function extractCitations(content: string): string[] {
  const citations: string[] = [];
  const regex = /(?:^|\n)\s*(?:[-*]\s*)?\[(\d+)\]\s*([^\n\r]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const text = match[2].replace(/[*_#]/g, '').trim();
    if (text.length > 5) {
      citations.push(`[${match[1]}] ${text}`);
    }
  }
  return citations;
}

// Helper: Extract FAQ Q&A from ## headings
function extractFaqs(
  content: string,
  existingFaqs?: { question: string; answer: string }[]
): { question: string; answer: string }[] {
  if (existingFaqs && existingFaqs.length > 0) {
    return existingFaqs;
  }

  const faqs: { question: string; answer: string }[] = [];
  const sections = content.split(/\n(?=##\s+)/);

  for (const section of sections) {
    const match = section.match(/^##\s+([^\n\r]+)/);
    if (!match) continue;

    const rawQuestion = match[1].replace(/[*_#]/g, '').trim();
    // Exclude routine administrative/reference sections
    if (
      rawQuestion.includes('오브한의원') ||
      rawQuestion.includes('참고문헌') ||
      rawQuestion.includes('안내') ||
      rawQuestion.includes('의료법') ||
      rawQuestion.includes('References') ||
      rawQuestion.length < 5
    ) {
      continue;
    }

    // Get body after heading and locate the first substantive paragraph
    const bodyAfterHeading = section.replace(/^##\s+[^\n\r]+/, '').trim();
    const paragraphs = bodyAfterHeading.split(/\n\s*\n/);
    let answer = '';
    for (const p of paragraphs) {
      const cleanP = p.trim();
      if (
        cleanP &&
        !cleanP.startsWith('!') &&
        !cleanP.startsWith('>') &&
        !cleanP.startsWith('#') &&
        !cleanP.startsWith('---') &&
        !cleanP.startsWith('* [')
      ) {
        answer = cleanP
          .replace(/[*_#]/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .trim();
        break;
      }
    }

    if (rawQuestion && answer && answer.length >= 20) {
      faqs.push({
        question: rawQuestion,
        answer: answer.length > 300 ? answer.slice(0, 297) + '...' : answer,
      });
    }
  }

  return faqs;
}

// Helper: Map clinical category to schema medical specialties
function getMedicalSpecialty(category: string): string[] {
  const base = ['KoreanMedicine', 'FunctionalMedicine', 'Neuroscience'];
  switch (category) {
    case '자율신경실조증':
      return [...base, 'AutonomicNervousSystem', 'Dysautonomia', 'NeurovegetativeDisorders'];
    case '브레인포그':
      return [...base, 'CognitiveDisorders', 'Neuroinflammation', 'BrainFog'];
    case '초민감자(HSP)':
      return [...base, 'SensoryProcessingSensitivity', 'Neuropsychiatry'];
    case 'ADHD':
      return [...base, 'AttentionDeficitDisorder', 'Neurodevelopmental'];
    case '다이어트':
      return [...base, 'MetabolicSyndrome', 'ObesityMedicine', 'RadiofrequencyTherapy'];
    case '위장관':
      return [...base, 'Gastroenterology', 'BrainGutAxis', 'FunctionalGastrointestinalDisorders'];
    case '갑상선':
      return [...base, 'Endocrinology', 'ThyroidDisorders'];
    case '정량화뇌파검사':
      return [...base, 'QuantitativeEEG', 'ClinicalNeurophysiology', 'BrainMapping'];
    default:
      return base;
  }
}



export default async function ColumnDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug || '';
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {}
  let doubleDecodedSlug = decodedSlug;
  try {
    doubleDecodedSlug = decodeURIComponent(decodedSlug);
  } catch {}
  const column =
    getColumnBySlug(slug) ||
    getColumnBySlug(decodedSlug) ||
    getColumnBySlug(doubleDecodedSlug);

  if (!column) {
    notFound();
  }

  const allColumns = getAllColumns();

  // Related columns: prioritize the same category, fill with remaining to always show 3
  const categoryRelated = allColumns.filter(
    (c) => c.category === column.category && c.slug !== column.slug
  );
  const otherRelated = allColumns.filter(
    (c) => c.category !== column.category && c.slug !== column.slug
  );
  const relatedColumns = [...categoryRelated, ...otherRelated].slice(0, 3);

  const pageUrl = `${SITE_URL}/columns/${column.slug}`;
  const imageUrl = column.thumbnail.startsWith('http')
    ? column.thumbnail
    : `${SITE_URL}${column.thumbnail}`;

  const citations = extractCitations(column.content);
  const faqs = extractFaqs(column.content, column.faqs);
  const medicalSpecialties = getMedicalSpecialty(column.category);

  // Advanced Schema.org Graph for Google Medical SEO & AI Search Engines (AEO / GEO)
  const schemaGraph: any[] = [
    {
      '@type': ['MedicalWebPage', 'Article'],
      '@id': `${pageUrl}#medical-webpage`,
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        name: '오브한의원 마곡점',
        url: SITE_URL,
      },
      headline: column.title,
      description: column.summary,
      inLanguage: 'ko-KR',
      mainEntityOfPage: pageUrl,
      datePublished: column.date,
      dateModified: column.updatedAt || column.date,
      image: imageUrl,
      keywords: column.tags.join(', '),
      articleSection: column.category,
      medicalSpecialty: medicalSpecialties,
      citation: citations.length > 0 ? citations : undefined,
      author: {
        '@type': ['Physician', 'Person'],
        '@id': `${SITE_URL}/#physician-jeon`,
        name: '전두희',
        jobTitle: '오브한의원 대표원장',
        medicalSpecialty: [
          'KoreanMedicine',
          'AutonomicNervousSystem',
          'QuantitativeEEG',
          'Neurocognitive',
        ],
        worksFor: {
          '@type': 'MedicalClinic',
          name: '오브한의원 마곡점',
          url: SITE_URL,
          telephone: '02-6959-5982',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '서울 강서구 마곡중앙로 111 롯데캐슬 르웨스트 104동 2층 238·239호',
            addressLocality: '강서구',
            addressRegion: '서울',
            addressCountry: 'KR',
          },
        },
      },
      reviewedBy: {
        '@type': ['Physician', 'Person'],
        '@id': `${SITE_URL}/#physician-jeon`,
        name: '전두희',
        jobTitle: '오브한의원 대표원장',
        worksFor: {
          '@type': 'MedicalClinic',
          name: '오브한의원 마곡점',
          url: SITE_URL,
        },
      },
      publisher: {
        '@type': 'MedicalClinic',
        name: '오브한의원 마곡점',
        url: SITE_URL,
        telephone: '02-6959-5982',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/favicon.svg`,
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: '서울 강서구 마곡중앙로 111 롯데캐슬 르웨스트 104동 2층 238·239호',
          addressLocality: '강서구',
          addressRegion: '서울',
          addressCountry: 'KR',
        },
      },
      about: column.tags.map((tag) => ({
        '@type': 'MedicalCondition',
        name: tag,
      })),
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['.article-title', '.geo-summary-box', '.article-authority-box'],
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '홈',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '칼럼 아카이브',
          item: `${SITE_URL}/columns`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: column.category,
          item: `${SITE_URL}/columns?category=${encodeURIComponent(column.category)}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: column.title,
          item: pageUrl,
        },
      ],
    },
  ];

  // Inject FAQPage Schema if FAQs extracted
  if (faqs.length > 0) {
    schemaGraph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': schemaGraph,
  };

  const isQeegGuide = column.slug === 'qeeg-guide';

  return (
    <main className="site-shell column-detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader locale="ko" compact />

      {/* Article Header */}
      <article className="article-container">
        <header className="article-header">
          {/* 4-Step Semantic Breadcrumb Navigation */}
          <nav className="article-breadcrumb-nav" aria-label="브레드크럼 위치">
            <ol className="breadcrumb-ol">
              <li className="breadcrumb-li">
                <Link href="/">홈</Link>
                <span className="breadcrumb-sep" aria-hidden="true">›</span>
              </li>
              <li className="breadcrumb-li">
                <Link href="/columns">칼럼 아카이브</Link>
                <span className="breadcrumb-sep" aria-hidden="true">›</span>
              </li>
              <li className="breadcrumb-li">
                <Link href={`/columns?category=${encodeURIComponent(column.category)}`}>
                  {column.category}
                </Link>
                <span className="breadcrumb-sep" aria-hidden="true">›</span>
              </li>
              <li className="breadcrumb-li current" aria-current="page">
                <span>{column.title}</span>
              </li>
            </ol>
          </nav>

          <div className="article-header-meta">
            <span className="column-badge">{column.category}</span>
            <time dateTime={column.date}>{column.date}</time>
          </div>

          <h1 className="article-title">{column.title}</h1>

          {/* E-E-A-T Medical Review Authority Box (Top) */}
          <section className="article-authority-box" aria-label="의학적 검증 및 감수 정보">
            <div className="authority-badge-row">
              <span className="authority-verified-badge">
                <span className="badge-icon" aria-hidden="true">✓</span> 의학적 검수 완료 (Medical Review)
              </span>
              <span className="authority-review-date">
                최종 검수일: <time dateTime={column.updatedAt || column.date}>{column.updatedAt || column.date}</time>
              </span>
            </div>
            <div className="authority-details">
              <div className="authority-avatar-wrap">
                <div className="authority-avatar-circle" aria-hidden="true">
                  <span>전</span>
                </div>
              </div>
              <div className="authority-text-block">
                <p className="authority-writer">
                  <strong>의학적 집필 및 감수:</strong> 오브한의원 대표원장 <strong>전두희</strong> (한의사)
                </p>
                <p className="authority-standard">
                  <strong>진단 기준:</strong> 습식 정량화 뇌파(QEEG) 및 자율신경 기능 의학
                </p>
              </div>
            </div>
          </section>
        </header>

        {/* AI & GEO / AEO Summary Box (Answer Engine Optimized) */}
        <section className="geo-summary-box" aria-label="칼럼 핵심 진료 요약">
          <div className="geo-summary-title">
            <span aria-hidden="true">💡</span>
            <strong>전두희 원장의 핵심 진료 요약 (Medical Summary)</strong>
          </div>
          <p>{column.summary}</p>
        </section>

        {/* Article Cover Image: Only displayed if the markdown body does not already contain inline images */}
        {column.thumbnail && !column.content.includes('![') && (
          <figure className="article-figure">
            <SafeImage
              src={column.thumbnail}
              alt={column.title}
            />
          </figure>
        )}

        {/* Article Body (Markdown with Table, Callouts & Action Links) */}
        <section className="article-content-wrapper">
          <MarkdownView content={column.content} summary={column.summary} />
        </section>

        {/* Topic Cluster: Fixed QEEG Diagnostic Guide Internal Link Banner */}
        {!isQeegGuide && (
          <aside className="qeeg-internal-guide-banner" aria-label="핵심 진단 가이드">
            <div className="qeeg-guide-banner-inner">
              <div className="qeeg-guide-banner-badge">
                <span>DIAGNOSTIC PROTOCOL</span>
                <strong>핵심 진단 가이드</strong>
              </div>
              <div className="qeeg-guide-banner-text">
                <h4>각종 검사상 &lsquo;이상 없음&rsquo;에도 지속되는 고통, 원인을 규명합니다</h4>
                <p>
                  습식 정량화 뇌파(QEEG)와 정밀 자율신경 검사로 뇌 신경망 피로도와 불균형을 객관적 데이터로 분석하는 오브한의원의 진단 프로토콜을 확인해 보세요.
                </p>
              </div>
              <Link href="/columns/qeeg-guide" className="qeeg-guide-banner-link">
                <span>습식 정량화 뇌파검사(QEEG) 원리 보러가기</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </aside>
        )}

        {/* Article Tags */}
        {column.tags.length > 0 && (
          <footer className="article-tags-section">
            <span className="tags-label">관련 전문 태그:</span>
            <div className="tags-list">
              {column.tags.map((tag) => (
                <Link key={tag} href={`/columns?tag=${encodeURIComponent(tag)}`} className="tag-pill">
                  #{tag}
                </Link>
              ))}
            </div>
          </footer>
        )}

        {/* E-E-A-T Medical Review Authority Box (Bottom Closure) */}
        <section className="article-authority-box bottom" aria-label="의학적 검증 및 진료 고지">
          <div className="authority-details">
            <div className="authority-text-block">
              <p className="authority-writer">
                <strong>의학적 집필 및 감수:</strong> 오브한의원 대표원장 <strong>전두희</strong>
              </p>
              <p className="authority-standard">
                <strong>진단 기준:</strong> 습식 정량화 뇌파(QEEG) 및 자율신경 기능 의학
              </p>
              <p className="authority-note">
                오브한의원은 과학적이고 정량화된 뇌파 및 자율신경 데이터에 근거하여 개인별 원인 치료를 진행합니다.
              </p>
            </div>
          </div>
        </section>

        {/* Medical Disclaimer */}
        <div className="medical-disclaimer-box">
          <strong>[의료법 안내 및 진료 고지]</strong>
          <p>
            본 칼럼은 국민건강 증진과 올바른 의료 정보 전달을 목적으로 의료법 제56조 제1항을 준수하여 작성되었습니다.
            개인의 체질과 건강 상태에 따라 진단 및 치료 효과는 상이할 수 있으며, 정확한 치료 계획은 내원 후 의료진의 정밀 진찰을 통해 결정됩니다.
          </p>
        </div>

        {/* Back Link */}
        <div className="article-back-bar">
          <Link href="/columns" className="button button-ghost">
            ← 전체 칼럼 목록으로 돌아가기
          </Link>
        </div>
      </article>

      {/* Reservation CTA Section */}
      <section className="column-cta-section">
        <div className="column-cta-inner">
          <p className="eyebrow">RESERVATION & CONSULTATION</p>
          <h2>현재 겪고 계신 불편을 이야기해 주세요</h2>
          <p>
            오브한의원은 차분한 독립 진료실에서 환자 한 분 한 분을 위한 충분한 상담과 정밀 검사를 진행합니다.
          </p>
          <div className="primary-actions primary-actions-centered">
            <TrackedLink
              className="button button-solid"
              href={clinic.naverBookingUrl}
              target="_blank"
              rel="noreferrer"
              eventName="booking_click"
              eventLabel={`칼럼상세_예약_${column.slug}`}
            >
              네이버 예약 바로가기<span>↗</span>
            </TrackedLink>
            <TrackedLink
              className="button button-ghost"
              href={clinic.phoneHref}
              eventName="phone_click"
              eventLabel={`칼럼상세_전화_${column.slug}`}
            >
              전화 문의 ({clinic.phoneDisplay})
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* Topic Cluster: Related Category Columns */}
      {relatedColumns.length > 0 && (
        <section className="related-columns-section">
          <div className="related-columns-inner">
            <div className="section-heading">
              <p className="eyebrow">TOPIC CLUSTER · {column.category}</p>
              <h2>{column.category} 관련 추천 임상 칼럼</h2>
            </div>
            <div className="column-grid related-grid">
              {relatedColumns.map((col) => (
                <article key={col.slug} className="column-card">
                  <Link href={`/columns/${col.slug}`} className="column-card-link">
                    <div className="column-card-thumb">
                      <SafeImage
                        src={col.thumbnail || ''}
                        alt={col.title}
                        loading="lazy"
                      />
                      <span className="column-badge">{col.category}</span>
                    </div>
                    <div className="column-card-copy">
                      <time dateTime={col.date}>{col.date}</time>
                      <h3 className="column-card-title">{col.title}</h3>
                      <p className="column-card-summary">{col.summary}</p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="site-footer">
        <div>
          <strong>ORB</strong>
          <span>오브한의원 마곡점</span>
        </div>
        <address>
          {clinic.addressKo}
          <br />
          {clinic.phoneDisplay}
        </address>
        <div className="footer-meta">
          <Link href="/columns">원장 칼럼</Link>
          <Link href="/privacy">개인정보처리방침</Link>
          <span>© ORB Korean Medicine Clinic.</span>
        </div>
      </footer>
    </main>
  );
}
