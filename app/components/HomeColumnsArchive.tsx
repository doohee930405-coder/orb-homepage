'use client';

import { useMemo, useState } from 'react';
import type { Column } from '../lib/columnTypes';
import SafeImage from './SafeImage';

interface HomeColumnsArchiveProps {
  columns: Column[];
  eyebrow: string;
  title: string;
  subtitle: string;
  readMoreText: string;
  viewAllText: string;
}

export default function HomeColumnsArchive({
  columns = [],
  eyebrow,
  title,
  subtitle,
  readMoreText,
  viewAllText,
}: HomeColumnsArchiveProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract available categories from the columns in order
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of columns) {
      counts[c.category] = (counts[c.category] || 0) + 1;
    }
    return Object.keys(counts).map((cat) => ({
      name: cat,
      count: counts[cat],
    }));
  }, [columns]);

  // Filter columns based on selected category (display up to 3)
  const displayedColumns = useMemo(() => {
    const list =
      selectedCategory === 'all'
        ? columns
        : columns.filter((c) => c.category === selectedCategory);
    return list.slice(0, 3);
  }, [columns, selectedCategory]);

  return (
    <section className="home-columns-section reveal" id="columns">
      <div className="home-columns-header">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <p>{subtitle}</p>
        </div>

        {/* Category Tabs (사진 속 탭 및 상단 탭 전환 지원) */}
        <div className="home-column-tabs-wrapper" role="tablist" aria-label="칼럼 카테고리 탭">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            className={`home-tab-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            전체 ({columns.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.name}
              className={`home-tab-pill ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Columns Grid */}
      <div className="home-columns-grid">
        {displayedColumns.map((col) => (
          <article key={col.id || col.slug} className="home-column-card">
            <a href={`/columns/${col.slug}`} className="home-column-card-link">
              <div className="home-column-thumb-wrap">
                <SafeImage
                  src={col.thumbnail || ''}
                  alt={col.title}
                  className="home-column-thumb"
                  loading="lazy"
                />
                {/* 사진 속 뱃지 탭 클릭 시 해당 카테고리로 즉시 전환 */}
                <button
                  type="button"
                  className="home-column-cat-pill interactive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedCategory(col.category);
                  }}
                  title={`'${col.category}' 카테고리 칼럼 전환`}
                  aria-label={`${col.category} 카테고리 칼럼 전환`}
                >
                  {col.category}
                </button>
              </div>
              <div className="home-column-content">
                <div className="home-column-meta">
                  <time dateTime={col.date}>{col.date}</time>
                  <span className="meta-divider">·</span>
                  <span className="meta-author">{col.author || '전두희 원장'}</span>
                </div>
                <h3 className="home-column-title">{col.title}</h3>
                <p className="home-column-summary">{col.summary}</p>
                <div className="home-column-footer">
                  <span className="read-more-text">
                    {readMoreText}
                    <i aria-hidden="true">→</i>
                  </span>
                </div>
              </div>
            </a>
          </article>
        ))}
      </div>

      {/* View All Action */}
      <div className="home-columns-action">
        <a
          href={
            selectedCategory === 'all'
              ? '/columns'
              : `/columns?category=${encodeURIComponent(selectedCategory)}`
          }
          className="button button-outline-dark"
        >
          {selectedCategory === 'all'
            ? viewAllText
            : `${selectedCategory} 칼럼 전체 보기`}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
