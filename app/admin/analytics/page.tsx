'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminAnalyticsDashboard from '../../components/AdminAnalyticsDashboard';

export default function AdminAnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authed = localStorage.getItem('orb_admin_authenticated') === '135700';
      setIsAuthenticated(authed);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    if (password.trim() === '135700') {
      try {
        localStorage.setItem('orb_admin_authenticated', '135700');
      } catch {}
      setIsAuthenticated(true);
      setPassword('');
      setIsLoggingIn(false);
      return;
    }
    setLoginError('비밀번호가 올바르지 않습니다.');
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('orb_admin_authenticated');
    } catch {}
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="admin-shell">
        <div className="admin-loading">
          <p>관리자 인증 상태를 확인하는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-shell">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <span className="admin-badge">Admin Authentication</span>
            <h1>원장실 통계 대시보드</h1>
            <p>보안을 위해 관리자 비밀번호를 입력해 주세요.</p>
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

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-topbar-title">
            <a href="/admin/columns" className="admin-logo">ORB CLINIC</a>
            <span>원장실 통합 대시보드</span>
          </div>

          <nav
            style={{
              display: 'flex',
              gap: '6px',
              background: '#F3F4F6',
              padding: '4px',
              borderRadius: '10px',
              flexShrink: 0,
            }}
          >
            <a
              href="/admin/columns"
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#4B5563',
                textDecoration: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              📝 칼럼 관리
            </a>
            <a
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
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              📊 방문자 및 조회수 통계
            </a>
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

      <main className="admin-main" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        <AdminAnalyticsDashboard />
      </main>
    </div>
  );
}
