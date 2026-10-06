'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Column } from '../lib/columnTypes';
import SafeImage from './SafeImage';

interface ColumnListClientProps {
  initialColumns: Column[];
  categories: { name: string; count: number }[];
}

interface CategoryDefinition {
  title: string;
  subtitle: string;
  description: string;
  keywords: string[];
}

const CATEGORY_DEFINITIONS: Record<string, CategoryDefinition> = {
  '자율신경실조증': {
    title: '자율신경실조증 (Dysautonomia)',
    subtitle: '교감신경·부교감신경 불균형 및 신체화 증후군',
    description:
      '각종 검사상 이상이 없음에도 지속되는 두통, 어지럼, 가슴 두근거림, 만성 피로, 수면 장애 등 교감신경과 부교감신경의 불균형을 습식 정량화 뇌파(QEEG)와 심박변이도(HRV)로 객관화하여 신경계 과각성을 안정화합니다.',
    keywords: ['교감신경항진', '미주신경활성', 'HRV자율신경검사', 'QEEG정량뇌파', '신경계피로회복'],
  },
  '브레인포그': {
    title: '브레인포그 (Brain Fog)',
    subtitle: '뇌 피질 신경 신호 지연 및 신경염증성 인지 저하',
    description:
      '머리에 안개가 낀 듯한 멍함, 집중력 저하, 기억력 감퇴를 단순 피로가 아닌 뇌 피질의 신경 신호 전달 지연 및 신경염증 관점에서 정밀 진단하고 회복합니다.',
    keywords: ['인지기능저하', '서파증가', '전두엽활성도', '만성피로증후군', '뇌신경회복'],
  },
  '초민감자(HSP)': {
    title: '초민감자 / 감각처리민감성 (Highly Sensitive Person, SPS)',
    subtitle: '감각 게이팅 결손 및 신경계 중추 과흥분성 완화',
    description:
      '빛, 소리, 주변 분위기, 스트레스 등 외부 자극에 뇌신경계가 과민하게 반응하는 감각처리민감성(SPS)을 뇌파 분석을 통해 안정화하는 오브한의원 특화 진료입니다.',
    keywords: ['감각처리민감성', 'SPS', '알로스타틱부하', '경계억제', '신경과민완화'],
  },
  'ADHD': {
    title: '성인 및 청소년 ADHD (Attention Deficit Disorder)',
    subtitle: '전두엽 세타/베타 비율 불균형 및 신경망 조절',
    description:
      '주의력 결핍, 잦은 충동성, 실행기능 저하의 배후에 있는 전두엽 세타파/베타파 비율(Theta/Beta Ratio) 불균형을 객관적으로 분석하여 맞춤 뇌신경 치료를 진행합니다.',
    keywords: ['세타베타비율', '전두엽기능', '실행기능개선', '주의집중력', '신경가소성'],
  },
  '다이어트': {
    title: '대사 자율신경 다이어트 & 퀀텀핏 (Metabolic Diet)',
    subtitle: '시상하부 식욕 중추 조절 & k-온다 리프팅 기술 퀀텀핏 심부 열대사',
    description:
      '반복되는 요요와 정체기를 뇌 시상하부 식욕 중추와 대사 자율신경의 관점에서 접근하며, k-온다(ONDA) 리프팅과 동일한 심부 열대사 기술인 퀀텀핏 고주파와 체질 맞춤 한약으로 치료합니다.',
    keywords: ['퀀텀핏', 'k-온다리프팅기술', '심부열대사', '식욕중추조절', '체질맞춤한약'],
  },
  '위장관': {
    title: '기능성 위장관 질환 (Brain-Gut Axis & GI Disorders)',
    subtitle: '뇌-장 축(Brain-Gut Axis) 및 미주신경 기능 이상',
    description:
      '위내시경이나 복부 CT상 이상이 없음에도 지속되는 담적병, 과민대장증후군, 기능성 소화불량을 뇌-장 축(Brain-Gut Axis)과 미주신경 기능 평가를 통해 근본 치료합니다.',
    keywords: ['뇌장축', '미주신경조절', '담적병', '과민대장증후군', '역류성식도염'],
  },
  '갑상선': {
    title: '갑상선 및 내분비 대사 질환 (Thyroid & Neuroendocrine)',
    subtitle: '시상하부-뇌하수체-갑상선(HPT) 축 및 자율신경 대사 회복',
    description:
      '갑상선 기능 항진/저하 및 만성 대사 저하, 추위/더위 민감증을 자율신경계 및 내분비 피질 축의 균형 회복을 통해 다각도로 다스립니다.',
    keywords: ['HPT축', '대사저하', '만성냉증', '자율신경내분비', '면역기능강화'],
  },
  '정량화뇌파검사': {
    title: '습식 정량화 뇌파검사 (Quantitative EEG, QEEG)',
    subtitle: '국제 10-20 표준 전극 시스템 & 뇌 기능 3D 지형도 분석',
    description:
      '국제 10-20 표준 전극 시스템과 정밀 겔 센서를 통해 뇌 전 영역의 주파수 파워, 좌우 비대칭도, 신경망 연결성을 수치화하여 보이지 않는 신경 피로를 시각화하는 핵심 진단 장비입니다.',
    keywords: ['QEEG', '국제10-20시스템', '뇌파3D지형도', '습식센서', '정밀임피던스제어'],
  },
};



function cleanDisplayText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&middot;/g, '·')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ');
}

export default function ColumnListClient({ initialColumns, categories }: ColumnListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Read URL query parameters on initial mount (e.g., from breadcrumb or tag click)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      const tag = params.get('tag');
      const q = params.get('q');
      if (cat) {
        setSelectedCategory(cat);
      }
      if (tag) {
        setSearchQuery(tag);
      } else if (q) {
        setSearchQuery(q);
      }
    }
  }, []);

  const filteredColumns = useMemo(() => {
    return initialColumns.filter((col) => {
      // Category filter
      if (selectedCategory !== 'all' && col.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = col.title.toLowerCase().includes(q);
        const inSummary = col.summary.toLowerCase().includes(q);
        const inTags = col.tags.some((t) => t.toLowerCase().includes(q));
        const inContent = col.content.toLowerCase().includes(q);
        return inTitle || inSummary || inTags || inContent;
      }
      return true;
    });
  }, [initialColumns, selectedCategory, searchQuery]);

  const activeCategoryDef =
    selectedCategory !== 'all' ? CATEGORY_DEFINITIONS[selectedCategory] : null;

  return (
    <div className="column-list-wrapper">
      {/* Search and Category Filter Toolbar */}
      <div className="column-toolbar">
        <div className="category-chips" role="tablist" aria-label="칼럼 카테고리">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            전체 ({initialColumns.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.name}
              className={`category-chip ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        <div className="search-box">
          <input
            type="search"
            placeholder="증상, 질환, 검사명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="칼럼 검색"
            className="search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* SEO Topic Cluster: Category Definition Header Box */}
      {activeCategoryDef ? (
        <aside className="category-definition-header" aria-label={`${selectedCategory} 진료 정의`}>
          <div className="cat-def-badge-row">
            <span className="cat-def-badge">TOPIC CLUSTER · CLINICAL FOCUS</span>
            <span className="cat-def-sub">{activeCategoryDef.subtitle}</span>
          </div>
          <h2 className="cat-def-title">{activeCategoryDef.title}</h2>
          <p className="cat-def-desc">{activeCategoryDef.description}</p>
          <div className="cat-def-keywords">
            {activeCategoryDef.keywords.map((kw) => (
              <span key={kw} className="cat-def-kw">
                #{kw}
              </span>
            ))}
          </div>
        </aside>
      ) : (
        <aside className="category-definition-header overview" aria-label="오브한의원 임상 칼럼 아카이브 소개">
          <div className="cat-def-badge-row">
            <span className="cat-def-badge">ORB CLINICAL ARCHIVE</span>
            <span className="cat-def-sub">근거 중심 신경계·대사 기능 의학</span>
          </div>
          <h2 className="cat-def-title">오브한의원 원장 임상 칼럼 아카이브</h2>
          <p className="cat-def-desc">
            뇌신경·자율신경·정량화뇌파(QEEG) 중점 진료 기관으로서, 보이지 않는 신경학적 고통과 만성 증상의 기전을 의학적 근거와 임상 데이터를 바탕으로 명쾌하게 해설합니다. 상단 카테고리를 선택하시면 각 진료 분야별 핵심 정의와 칼럼을 모아보실 수 있습니다.
          </p>
          <div className="cat-def-keywords">
            <span className="cat-def-kw">#습식정량뇌파</span>
            <span className="cat-def-kw">#자율신경실조증</span>
            <span className="cat-def-kw">#브레인포그</span>
            <span className="cat-def-kw">#초민감자(HSP)</span>
            <span className="cat-def-kw">#ADHD</span>
            <span className="cat-def-kw">#퀀텀핏다이어트</span>
            <span className="cat-def-kw">#기능성위장관</span>
            <span className="cat-def-kw">#갑상선대사</span>
          </div>
        </aside>
      )}

      {/* Results Count & Active Filters */}
      <div className="filter-status">
        <p>
          총 <strong>{filteredColumns.length}</strong>개의 칼럼
          {searchQuery && <span> · &ldquo;{searchQuery}&rdquo; 검색 결과</span>}
        </p>
      </div>

      {/* Columns Grid */}
      {filteredColumns.length > 0 ? (
        <div className="column-grid">
          {filteredColumns.map((col) => (
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
                  <div className="column-meta">
                    <time dateTime={col.date}>{col.date}</time>
                    <span>·</span>
                    <span>{col.author}</span>
                  </div>
                  <h3 className="column-card-title">{cleanDisplayText(col.title)}</h3>
                  <p className="column-card-summary">{cleanDisplayText(col.summary)}</p>
                  <div className="column-card-footer">
                    <div className="column-tags">
                      {col.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag-pill">#{tag}</span>
                      ))}
                    </div>
                    <span className="column-read-more" aria-hidden="true">
                      읽기 →
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="column-empty">
          <p>해당 조건에 맞는 칼럼이 없습니다.</p>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          >
            전체 칼럼 보기
          </button>
        </div>
      )}
    </div>
  );
}
