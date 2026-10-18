'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Column } from '../../lib/columnTypes';

interface DailyTrendItem {
  date: string;
  views: number;
  uv: number;
}

interface ColumnStatItem {
  slug: string;
  title: string;
  date: string;
  category: string;
  totalViews: number;
  rangeViews: number;
  rangeUV: number;
}

interface TopColumnItem {
  slug: string;
  title: string;
  category: string;
  views: number;
  uv: number;
}

interface AnalyticsData {
  summary: {
    totalColumns: number;
    totalViews: number;
    totalUV: number;
    topColumns: TopColumnItem[];
  };
  dailyTrends: DailyTrendItem[];
  columnsStats: ColumnStatItem[];
  startDate: string;
  endDate: string;
  range: string;
}

export default function AdminAnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Range and data states
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [chartMetric, setChartMetric] = useState<'both' | 'views' | 'uv'>('both');

  // Table filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Single column detail trend modal
  const [selectedColumnTrend, setSelectedColumnTrend] = useState<{
    slug: string;
    title: string;
    category: string;
    daily: DailyTrendItem[];
  } | null>(null);
  const [isLoadingTrend, setIsLoadingTrend] = useState(false);
  const trendDialogRef = useRef<HTMLDialogElement>(null);

  // Tooltip hover state
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    x: number;
    y: number;
    item: DailyTrendItem;
  } | null>(null);

  const getActiveToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('orb_admin_authenticated') || '135700';
    }
    return '';
  };

  const fetchAnalytics = async (selectedRange = range) => {
    setIsLoading(true);
    try {
      const token = getActiveToken();
      const res = await fetch(`/api/admin/analytics?range=${selectedRange}`, {
        headers: {
          'x-admin-token': token,
          'x-github-token': localStorage.getItem('orb_github_token') || '',
        },
      });

      if (res.status === 403) {
        setIsAuthenticated(false);
        try {
          localStorage.removeItem('orb_admin_authenticated');
        } catch {}
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAnalyticsData(data);
        }
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authed = localStorage.getItem('orb_admin_authenticated') === '135700';
      if (authed) {
        setIsAuthenticated(true);
        fetchAnalytics(range);
      } else {
        setIsAuthenticated(false);
      }
    }
  }, []);

  const handleRangeChange = (newRange: '7d' | '30d' | 'all') => {
    setRange(newRange);
    fetchAnalytics(newRange);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const inputPw = password.trim();

    if (inputPw === '135700') {
      try {
        localStorage.setItem('orb_admin_authenticated', '135700');
      } catch {}
      setIsAuthenticated(true);
      setPassword('');
      fetchAnalytics(range);
      setIsLoggingIn(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPw }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('orb_admin_authenticated', '135700');
          setIsAuthenticated(true);
          setPassword('');
          fetchAnalytics(range);
          return;
        }
      }
      setLoginError('비밀번호가 올바르지 않습니다.');
    } catch {
      setLoginError('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('orb_admin_authenticated');
    } catch {}
    setIsAuthenticated(false);
  };

  const openColumnTrendModal = async (col: ColumnStatItem) => {
    setIsLoadingTrend(true);
    setSelectedColumnTrend({
      slug: col.slug,
      title: col.title,
      category: col.category,
      daily: [],
    });

    if (trendDialogRef.current) {
      trendDialogRef.current.showModal();
    }

    try {
      const token = getActiveToken();
      const res = await fetch(`/api/admin/analytics?slug=${encodeURIComponent(col.slug)}&days=30`, {
        headers: { 'x-admin-token': token },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.dailyTrend) {
          setSelectedColumnTrend({
            slug: col.slug,
            title: col.title,
            category: col.category,
            daily: data.dailyTrend,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load column trend:', err);
    } finally {
      setIsLoadingTrend(false);
    }
  };

  const closeColumnTrendModal = () => {
    if (trendDialogRef.current) {
      trendDialogRef.current.close();
    }
    setSelectedColumnTrend(null);
  };

  // Filter columns list by search & category
  const filteredColumns = useMemo(() => {
    if (!analyticsData?.columnsStats) return [];
    return analyticsData.columnsStats.filter((c) => {
      if (selectedCategory !== 'all' && c.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [analyticsData, selectedCategory, searchQuery]);

  // Categories list with counts
  const categoriesList = useMemo(() => {
    if (!analyticsData?.columnsStats) return [];
    const counts: Record<string, number> = {};
    analyticsData.columnsStats.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [analyticsData]);

  // --- Chart Calculation Helpers ---
  const trends = analyticsData?.dailyTrends || [];
  const maxViewVal = useMemo(() => {
    if (trends.length === 0) return 100;
    const maxVal = Math.max(...trends.map((t) => Math.max(t.views, t.uv)));
    return Math.max(10, Math.ceil(maxVal * 1.15));
  }, [trends]);

  // Chart SVG Coordinates
  const chartWidth = 900;
  const chartHeight = 280;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  const getX = (idx: number) => {
    if (trends.length <= 1) return paddingX + plotWidth / 2;
    return paddingX + (idx / (trends.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const ratio = Math.min(1, Math.max(0, val / maxViewVal));
    return chartHeight - paddingY - ratio * plotHeight;
  };

  const viewsPolyline = useMemo(() => {
    if (trends.length === 0) return '';
    return trends.map((t, idx) => `${getX(idx)},${getY(t.views)}`).join(' ');
  }, [trends, maxViewVal]);

  const uvPolyline = useMemo(() => {
    if (trends.length === 0) return '';
    return trends.map((t, idx) => `${getX(idx)},${getY(t.uv)}`).join(' ');
  }, [trends, maxViewVal]);

  const viewsAreaPath = useMemo(() => {
    if (trends.length === 0) return '';
    const points = trends.map((t, idx) => `${getX(idx)},${getY(t.views)}`).join(' L ');
    const bottomY = chartHeight - paddingY;
    return `M ${getX(0)},${bottomY} L ${points} L ${getX(trends.length - 1)},${bottomY} Z`;
  }, [trends, maxViewVal]);

  // 1. Loading auth state
  if (isAuthenticated === null) {
    return (
      <div className="admin-shell">
        <div className="admin-loading">
          <p>관리자 인증 상태를 확인하는 중입니다...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Secure Login Prompt
  if (!isAuthenticated) {
    return (
      <div className="admin-shell">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <span className="admin-brand">ORB CLINIC</span>
            <h1>칼럼 통계 분석 (원장님 전용)</h1>
            <p>보안 접속이 필요합니다. 관리자 비밀번호를 입력해 주세요.</p>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="admin-pass">관리자 비밀번호</label>
              <input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력 (기본: 135700)"
                required
                className="admin-input"
                autoFocus
              />
            </div>
            {loginError && <p className="admin-error-box">{loginError}</p>}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="button button-solid admin-submit-btn"
            >
              {isLoggingIn ? '인증 확인 중...' : '통계 대시보드 입장'}
            </button>
          </form>

          <div className="admin-login-footer">
            <Link href="/admin/columns">← 칼럼 관리 페이지로 이동</Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Analytics Dashboard
  return (
    <div className="admin-shell">
      {/* Top Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-topbar-title">
            <Link href="/admin/columns" className="admin-logo">
              ORB CLINIC
            </Link>
            <span>원장실 통합 대시보드</span>
          </div>

          {/* Navigation Tabs */}
          <nav
            style={{
              display: 'flex',
              gap: '6px',
              background: '#F3F4F6',
              padding: '4px',
              borderRadius: '10px',
            }}
          >
            <Link
              href="/admin/columns"
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#4B5563',
                textDecoration: 'none',
              }}
            >
              📝 칼럼 관리
            </Link>
            <Link
              href="/admin/analytics"
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                background: '#A9784A',
                color: '#FFF',
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              📊 방문자 및 조회수 통계
            </Link>
          </nav>

          <div className="admin-topbar-actions">
            <a href="/columns" target="_blank" rel="noreferrer" className="admin-nav-link">
              칼럼 게시판 보기 ↗
            </a>
            <button type="button" onClick={handleLogout} className="admin-logout-btn">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Analytics Container */}
      <main className="admin-main" style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px' }}>
        {/* Top Control Bar: Period Selection & Refresh */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            background: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', marginBottom: '4px' }}>
              칼럼 조회수 및 일자별 방문 추이 분석
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              조회 기간: <strong>{analyticsData?.startDate || '...'} ~ {analyticsData?.endDate || '...'}</strong> (30분 내 중복 새로고침 필터링 적용)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'inline-flex', background: '#F3F4F6', borderRadius: '8px', padding: '3px' }}>
              <button
                type="button"
                onClick={() => handleRangeChange('7d')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: range === '7d' ? '#FFFFFF' : 'transparent',
                  color: range === '7d' ? '#1F2937' : '#6B7280',
                  boxShadow: range === '7d' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                최근 7일
              </button>
              <button
                type="button"
                onClick={() => handleRangeChange('30d')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: range === '30d' ? '#FFFFFF' : 'transparent',
                  color: range === '30d' ? '#1F2937' : '#6B7280',
                  boxShadow: range === '30d' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                최근 30일
              </button>
              <button
                type="button"
                onClick={() => handleRangeChange('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: range === 'all' ? '#FFFFFF' : 'transparent',
                  color: range === 'all' ? '#1F2937' : '#6B7280',
                  boxShadow: range === 'all' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                전체 기간
              </button>
            </div>

            <button
              type="button"
              onClick={() => fetchAnalytics(range)}
              disabled={isLoading}
              className="button button-ghost button-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              🔄 {isLoading ? '새로고침 중...' : '새로고침'}
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          {/* Card 1: Total Columns */}
          <div
            style={{
              background: '#FFFFFF',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>총 발행 칼럼</span>
              <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '2px 8px', borderRadius: '6px', fontSize: '12px' }}>
                8개 분야
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827' }}>
              {analyticsData?.summary?.totalColumns || 0}
              <span style={{ fontSize: '15px', fontWeight: 500, color: '#6B7280', marginLeft: '4px' }}>편</span>
            </div>
            <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px' }}>
              ✔ 습식 뇌파 및 자율신경 의학 기준
            </div>
          </div>

          {/* Card 2: Total Page Views */}
          <div
            style={{
              background: '#FFFFFF',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>기간 내 총 조회수 (PV)</span>
              <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                Page Views
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563EB' }}>
              {(analyticsData?.summary?.totalViews || 0).toLocaleString()}
              <span style={{ fontSize: '15px', fontWeight: 500, color: '#6B7280', marginLeft: '4px' }}>회</span>
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
              선택 기간 동안의 총 열람 횟수
            </div>
          </div>

          {/* Card 3: Total Unique Visitors */}
          <div
            style={{
              background: '#FFFFFF',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>순 방문자 수 (UV)</span>
              <span style={{ background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                Unique Visitors
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669' }}>
              {(analyticsData?.summary?.totalUV || 0).toLocaleString()}
              <span style={{ fontSize: '15px', fontWeight: 500, color: '#6B7280', marginLeft: '4px' }}>명</span>
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
              방문자당 평균{' '}
              <strong>
                {analyticsData?.summary?.totalUV
                  ? ((analyticsData.summary.totalViews / analyticsData.summary.totalUV).toFixed(1))
                  : '1.0'}
              </strong>
              편 열람
            </div>
          </div>

          {/* Card 4: Top 3 Columns */}
          <div
            style={{
              background: '#FFFFFF',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>인기 칼럼 TOP 3</span>
              <span style={{ fontSize: '12px', color: '#D97706', fontWeight: 700 }}>🏆 Best</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(analyticsData?.summary?.topColumns || []).length === 0 ? (
                <div style={{ fontSize: '12px', color: '#9CA3AF', padding: '10px 0', textAlign: 'center' }}>
                  현재 집계된 방문 기록이 없습니다.<br />
                  <span style={{ fontSize: '11px', color: '#B45309' }}>칼럼 열람 시 실시간으로 순위가 집계됩니다.</span>
                </div>
              ) : (
                (analyticsData?.summary?.topColumns || []).slice(0, 3).map((col, idx) => (
                  <div
                    key={col.slug}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: idx === 0 ? '#FEF3C7' : '#F3F4F6',
                          color: idx === 0 ? '#B45309' : '#4B5563',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '11px',
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: '#1F2937',
                          fontWeight: 500,
                          maxWidth: '160px',
                        }}
                        title={col.title}
                      >
                        {col.title}
                      </span>
                    </div>
                    <strong style={{ color: '#2563EB', flexShrink: 0 }}>{col.views.toLocaleString()}회</strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Chart Section: Trends Visualization */}
        <section
          style={{
            background: '#FFFFFF',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1F2937' }}>
                일자별 전체 조회수(PV) 및 순 방문자(UV) 추이
              </h2>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                날짜별 추이를 통해 어떤 요일과 시간대에 칼럼 소비가 활발한지 파악할 수 있습니다.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Metric filter */}
              <div style={{ display: 'inline-flex', background: '#F3F4F6', borderRadius: '6px', padding: '2px' }}>
                <button
                  type="button"
                  onClick={() => setChartMetric('both')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: chartMetric === 'both' ? '#FFFFFF' : 'transparent',
                    color: chartMetric === 'both' ? '#1F2937' : '#6B7280',
                  }}
                >
                  전체 지표
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('views')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: chartMetric === 'views' ? '#FFFFFF' : 'transparent',
                    color: chartMetric === 'views' ? '#2563EB' : '#6B7280',
                  }}
                >
                  조회수(PV)만
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('uv')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: chartMetric === 'uv' ? '#FFFFFF' : 'transparent',
                    color: chartMetric === 'uv' ? '#059669' : '#6B7280',
                  }}
                >
                  순방문(UV)만
                </button>
              </div>

              {/* Chart type toggle */}
              <div style={{ display: 'inline-flex', background: '#F3F4F6', borderRadius: '6px', padding: '2px' }}>
                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: chartType === 'line' ? '#FFFFFF' : 'transparent',
                    color: chartType === 'line' ? '#1F2937' : '#6B7280',
                  }}
                >
                  📈 라인
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: chartType === 'bar' ? '#FFFFFF' : 'transparent',
                    color: chartType === 'bar' ? '#1F2937' : '#6B7280',
                  }}
                >
                  📊 막대
                </button>
              </div>
            </div>
          </div>

          {/* SVG Interactive Chart Canvas */}
          <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{ width: '100%', height: 'auto', minWidth: '600px', display: 'block' }}
            >
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines & Y-Axis Scale Values */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const yVal = chartHeight - paddingY - ratio * plotHeight;
                const labelVal = Math.round(ratio * maxViewVal);
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={yVal}
                      x2={chartWidth - paddingX}
                      y2={yVal}
                      stroke="#E5E7EB"
                      strokeDasharray={ratio === 0 ? 'none' : '4 4'}
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={yVal + 4}
                      textAnchor="end"
                      fill="#9CA3AF"
                      fontSize="11"
                      fontFamily="Pretendard, sans-serif"
                    >
                      {labelVal}
                    </text>
                  </g>
                );
              })}

              {/* Chart Mode: Line Chart */}
              {chartType === 'line' && (
                <>
                  {/* Views Area Fill */}
                  {(chartMetric === 'both' || chartMetric === 'views') && viewsAreaPath && (
                    <path d={viewsAreaPath} fill="url(#viewsGradient)" />
                  )}

                  {/* Views Line */}
                  {(chartMetric === 'both' || chartMetric === 'views') && viewsPolyline && (
                    <polyline
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={viewsPolyline}
                    />
                  )}

                  {/* UV Line */}
                  {(chartMetric === 'both' || chartMetric === 'uv') && uvPolyline && (
                    <polyline
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2.5"
                      strokeDasharray={chartMetric === 'both' ? '6 3' : 'none'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={uvPolyline}
                    />
                  )}

                  {/* Data Points on hover/always */}
                  {trends.map((t, idx) => {
                    const cx = getX(idx);
                    const cyViews = getY(t.views);
                    const cyUv = getY(t.uv);
                    return (
                      <g key={t.date}>
                        {(chartMetric === 'both' || chartMetric === 'views') && (
                          <circle
                            cx={cx}
                            cy={cyViews}
                            r={hoveredPoint?.index === idx ? 6 : 4}
                            fill="#FFFFFF"
                            stroke="#2563EB"
                            strokeWidth="2.5"
                          />
                        )}
                        {(chartMetric === 'both' || chartMetric === 'uv') && (
                          <circle
                            cx={cx}
                            cy={cyUv}
                            r={hoveredPoint?.index === idx ? 5 : 3}
                            fill="#FFFFFF"
                            stroke="#059669"
                            strokeWidth="2"
                          />
                        )}
                      </g>
                    );
                  })}
                </>
              )}

              {/* Chart Mode: Bar Chart */}
              {chartType === 'bar' && (
                <g>
                  {trends.map((t, idx) => {
                    const xCenter = getX(idx);
                    const barGroupWidth = Math.min(36, Math.max(16, (plotWidth / trends.length) * 0.7));
                    const bottomY = chartHeight - paddingY;

                    if (chartMetric === 'both') {
                      const barW = barGroupWidth / 2 - 2;
                      const hViews = Math.max(2, (t.views / maxViewVal) * plotHeight);
                      const hUv = Math.max(2, (t.uv / maxViewVal) * plotHeight);
                      return (
                        <g key={t.date}>
                          <rect
                            x={xCenter - barW - 1}
                            y={bottomY - hViews}
                            width={barW}
                            height={hViews}
                            fill="#3B82F6"
                            rx="3"
                          />
                          <rect
                            x={xCenter + 1}
                            y={bottomY - hUv}
                            width={barW}
                            height={hUv}
                            fill="#10B981"
                            rx="3"
                          />
                        </g>
                      );
                    }

                    const val = chartMetric === 'views' ? t.views : t.uv;
                    const h = Math.max(2, (val / maxViewVal) * plotHeight);
                    const color = chartMetric === 'views' ? '#3B82F6' : '#10B981';
                    return (
                      <rect
                        key={t.date}
                        x={xCenter - barGroupWidth / 2}
                        y={bottomY - h}
                        width={barGroupWidth}
                        height={h}
                        fill={color}
                        rx="4"
                      />
                    );
                  })}
                </g>
              )}

              {/* X-Axis Date Labels & Hover Overlay Triggers */}
              {trends.map((t, idx) => {
                const x = getX(idx);
                const displayDate = t.date.slice(5).replace('-', '/');
                const isHovered = hoveredPoint?.index === idx;

                return (
                  <g key={t.date}>
                    {/* Hover column line */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={paddingY}
                        x2={x}
                        y2={chartHeight - paddingY}
                        stroke="#9CA3AF"
                        strokeDasharray="3 3"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Date label */}
                    <text
                      x={x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fill={isHovered ? '#1F2937' : '#6B7280'}
                      fontWeight={isHovered ? 700 : 500}
                      fontSize="11"
                      fontFamily="Pretendard, sans-serif"
                    >
                      {displayDate}
                    </text>

                    {/* Invisible full-height hover capture slice */}
                    <rect
                      x={x - plotWidth / (trends.length * 2)}
                      y={paddingY}
                      width={plotWidth / trends.length}
                      height={plotHeight}
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() =>
                        setHoveredPoint({
                          index: idx,
                          x,
                          y: getY(t.views),
                          item: t,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Floating Tooltip Card */}
            {hoveredPoint && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                  top: '15px',
                  transform: 'translateX(-50%)',
                  background: 'rgba(17, 24, 39, 0.95)',
                  color: '#FFFFFF',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  zIndex: 10,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '3px' }}>
                  📅 {hoveredPoint.item.date}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: '#93C5FD' }}>
                    조회수(PV): <strong>{hoveredPoint.item.views.toLocaleString()}회</strong>
                  </span>
                  <span style={{ color: '#6EE7B7' }}>
                    순방문(UV): <strong>{hoveredPoint.item.uv.toLocaleString()}명</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chart Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px', fontSize: '13px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1F2937' }}>
              <span style={{ width: '12px', height: '12px', background: '#2563EB', borderRadius: '3px' }}></span>
              페이지 조회수 (Page Views)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1F2937' }}>
              <span style={{ width: '12px', height: '12px', background: '#059669', borderRadius: '3px' }}></span>
              순 방문자 수 (Unique Visitors)
            </span>
          </div>
        </section>

        {/* Detailed Columns Table */}
        <section
          style={{
            background: '#FFFFFF',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1F2937' }}>
                칼럼별 상세 조회수 및 분석 목록
              </h2>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                행을 클릭하거나 &lsquo;추이 보기&rsquo; 버튼을 누르면 해당 칼럼만의 일자별 상세 그래프를 조회할 수 있습니다.
              </p>
            </div>

            {/* Search Input & Category Filter */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="admin-select"
                style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px' }}
              >
                <option value="all">전체 분야 ({analyticsData?.columnsStats?.length || 0})</option>
                {categoriesList.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>

              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="칼럼 제목 검색..."
                className="admin-input"
                style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', width: '220px' }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>칼럼 제목 및 분야</th>
                  <th style={{ width: '120px' }}>카테고리</th>
                  <th style={{ width: '100px' }}>발행일</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>총 누적 PV</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>기간 내 PV</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>순 방문 UV</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>방문 추이</th>
                </tr>
              </thead>
              <tbody>
                {filteredColumns.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                      조건에 일치하는 칼럼이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredColumns.map((col, index) => (
                    <tr
                      key={col.slug}
                      style={{ cursor: 'pointer' }}
                      onClick={() => openColumnTrendModal(col)}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: index < 3 ? '#B45309' : '#9CA3AF',
                              background: index < 3 ? '#FEF3C7' : '#F3F4F6',
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {index + 1}
                          </span>
                          <strong className="admin-col-title" style={{ fontSize: '14px', color: '#1F2937' }}>
                            {col.title}
                          </strong>
                        </div>
                        <span className="admin-col-slug" style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '28px' }}>
                          /columns/{col.slug}
                        </span>
                      </td>
                      <td>
                        <span className="column-badge" style={{ fontSize: '11px' }}>
                          {col.category}
                        </span>
                      </td>
                      <td>
                        <time style={{ fontSize: '12px', color: '#6B7280' }}>{col.date}</time>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#4B5563' }}>
                        {col.totalViews.toLocaleString()}회
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#2563EB' }}>
                        {col.rangeViews.toLocaleString()}회
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        {col.rangeUV.toLocaleString()}명
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openColumnTrendModal(col);
                          }}
                          className="button button-sm button-ghost"
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#4B5563',
                            border: '1px solid #D1D5DB',
                            borderRadius: '6px',
                            background: '#FFFFFF',
                          }}
                        >
                          추이 보기 📈
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Single Column Daily Trend Modal (Native <dialog> for accessible overlays) */}
      <dialog
        ref={trendDialogRef}
        style={{
          border: 'none',
          borderRadius: '16px',
          padding: 0,
          maxWidth: '750px',
          width: '90%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          background: '#FFFFFF',
        }}
      >
        {selectedColumnTrend && (
          <div style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <span className="column-badge" style={{ marginBottom: '6px', display: 'inline-block' }}>
                  {selectedColumnTrend.category}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', lineHeight: 1.4, margin: '4px 0' }}>
                  {selectedColumnTrend.title}
                </h3>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  최근 30일간 일자별 조회수 및 순 방문 추이
                </span>
              </div>
              <button
                type="button"
                onClick={closeColumnTrendModal}
                style={{
                  border: 'none',
                  background: '#F3F4F6',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4B5563',
                  fontWeight: 800,
                }}
              >
                ✕
              </button>
            </div>

            {isLoadingTrend ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: '#6B7280' }}>
                <p>일자별 상세 통계를 불러오는 중...</p>
              </div>
            ) : selectedColumnTrend.daily.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
                해당 기간 동안의 조회 기록이 없습니다.
              </div>
            ) : (
              <div>
                {/* Modal Sub-chart */}
                <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                  <svg viewBox="0 0 650 200" style={{ width: '100%', height: 'auto', display: 'block' }}>
                    {/* Y-axis grid */}
                    {[0, 0.5, 1].map((r) => (
                      <line
                        key={r}
                        x1="30"
                        y1={170 - r * 140}
                        x2="630"
                        y2={170 - r * 140}
                        stroke="#E5E7EB"
                        strokeDasharray="3 3"
                      />
                    ))}

                    {/* Bars for daily views */}
                    {selectedColumnTrend.daily.map((d, i) => {
                      const maxV = Math.max(5, ...selectedColumnTrend.daily.map((item) => item.views));
                      const x = 30 + (i / (selectedColumnTrend.daily.length - 1 || 1)) * 590;
                      const barH = Math.max(2, (d.views / maxV) * 140);
                      return (
                        <g key={d.date}>
                          <rect
                            x={x - 6}
                            y={170 - barH}
                            width="12"
                            height={barH}
                            fill="#3B82F6"
                            rx="2"
                          />
                          {i % 5 === 0 && (
                            <text
                              x={x}
                              y="190"
                              textAnchor="middle"
                              fontSize="10"
                              fill="#6B7280"
                            >
                              {d.date.slice(5)}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #E5E7EB',
                    paddingTop: '16px',
                  }}
                >
                  <a
                    href={`/columns/${selectedColumnTrend.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="button button-ghost button-sm"
                  >
                    웹사이트 칼럼 열기 ↗
                  </a>
                  <button
                    type="button"
                    onClick={closeColumnTrendModal}
                    className="button button-solid button-sm"
                  >
                    닫기
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
