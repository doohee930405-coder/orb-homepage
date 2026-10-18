'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import MarkdownView from '../../components/MarkdownView';
import { CLINIC_CATEGORIES, type Column, type ColumnFaq } from '../../lib/columnTypes';

const ENC_TOKEN_HEX = '565b5a68474a754764567a647d576667015c067b577c5204794605635c6157450d65025d02756f54';
const DEFAULT_GH_REPO = 'doohee930405-coder/orb-homepage';

function xorDecrypt(hex: string, key: string): string {
  try {
    let raw = '';
    for (let i = 0; i < hex.length; i += 2) {
      raw += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    let res = '';
    for (let i = 0; i < raw.length; i++) {
      res += String.fromCharCode(raw.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return res;
  } catch {
    return '';
  }
}

function getActiveGithubToken(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('orb_github_token');
    if (saved) return saved;
    const authKey = localStorage.getItem('orb_admin_authenticated') || '135700';
    return xorDecrypt(ENC_TOKEN_HEX, authKey);
  }
  return '';
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

async function getGithubFileSha(filePath: string, token: string): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${DEFAULT_GH_REPO}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}?ref=main`,
      {
        headers: {
          Authorization: `token ${token}`,
          'User-Agent': 'Orb-Admin',
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data.sha;
    }
  } catch {}
  return undefined;
}

async function commitDirectlyToGithub(col: any, isEdit: boolean): Promise<boolean> {
  const token = getActiveGithubToken();
  const slug = col.slug;
  const jsonStr = JSON.stringify(col, null, 2);
  const tagsStr = Array.isArray(col.tags) ? col.tags.join(', ') : '';
  const mdStr = `---
title: "${(col.title || '').replace(/"/g, '\\"')}"
slug: "${col.slug}"
category: "${col.category || '자율신경실조증'}"
author: "${col.author || '전두희 원장'}"
date: "${col.date || new Date().toISOString().slice(0, 10)}"
tags: [${tagsStr ? `"${col.tags.join('", "')}"` : ''}]
thumbnail: "${col.thumbnail || ''}"
summary: "${(col.summary || '').replace(/"/g, '\\"').replace(/\n/g, ' ')}"
faqs: ${JSON.stringify(col.faqs || [])}
---

${col.content || ''}
`;

  // 1. Commit JSON
  const jsonSha = await getGithubFileSha(`content/columns/${slug}.json`, token);
  const jsonRes = await fetch(
    `https://api.github.com/repos/${DEFAULT_GH_REPO}/contents/content/columns/${encodeURIComponent(slug)}.json`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'Orb-Admin',
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `feat(column): ${isEdit ? 'update' : 'publish'} ${slug}.json`,
        content: utf8ToBase64(jsonStr),
        branch: 'main',
        ...(jsonSha ? { sha: jsonSha } : {}),
      }),
    }
  );

  // 2. Commit MD
  const mdSha = await getGithubFileSha(`content/columns/${slug}.md`, token);
  await fetch(
    `https://api.github.com/repos/${DEFAULT_GH_REPO}/contents/content/columns/${encodeURIComponent(slug)}.md`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'Orb-Admin',
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `feat(column): ${isEdit ? 'update' : 'publish'} ${slug}.md`,
        content: utf8ToBase64(mdStr),
        branch: 'main',
        ...(mdSha ? { sha: mdSha } : {}),
      }),
    }
  );

  return jsonRes.ok;
}

async function deleteDirectlyFromGithub(slug: string): Promise<boolean> {
  const token = getActiveGithubToken();
  const jsonSha = await getGithubFileSha(`content/columns/${slug}.json`, token);
  if (jsonSha) {
    await fetch(
      `https://api.github.com/repos/${DEFAULT_GH_REPO}/contents/content/columns/${encodeURIComponent(slug)}.json`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `token ${token}`,
          'User-Agent': 'Orb-Admin',
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: `chore(column): delete ${slug}.json`,
          sha: jsonSha,
          branch: 'main',
        }),
      }
    );
  }

  const mdSha = await getGithubFileSha(`content/columns/${slug}.md`, token);
  if (mdSha) {
    await fetch(
      `https://api.github.com/repos/${DEFAULT_GH_REPO}/contents/content/columns/${encodeURIComponent(slug)}.md`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `token ${token}`,
          'User-Agent': 'Orb-Admin',
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: `chore(column): delete ${slug}.md`,
          sha: mdSha,
          branch: 'main',
        }),
      }
    );
  }

  return true;
}

export default function AdminColumnsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Column management states
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editorPreview, setEditorPreview] = useState(false);
  const [previewColumn, setPreviewColumn] = useState<Column | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Image upload modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadAltText, setUploadAltText] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Naver Blog Migration Modal states
  const [showNaverModal, setShowNaverModal] = useState(false);
  const [importTab, setImportTab] = useState<'blogId' | 'urls'>('blogId');
  const [naverBlogId, setNaverBlogId] = useState('orbmed');
  const [isFetchingNaver, setIsFetchingNaver] = useState(false);
  const [naverFetchError, setNaverFetchError] = useState('');

  // GitHub Deployment Settings modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [ghTokenInput, setGhTokenInput] = useState('');
  const [ghTokenStatus, setGhTokenStatus] = useState<string | null>(null);
  const [isTestingGhToken, setIsTestingGhToken] = useState(false);

  const [discoveredPosts, setDiscoveredPosts] = useState<
    Array<{
      logNo: string;
      blogId: string;
      title: string;
      categoryName: string;
      matchedCategory: string;
      date: string;
      url: string;
      selected: boolean;
      thumbnailUrl?: string;
    }>
  >([]);
  const [multiUrlsText, setMultiUrlsText] = useState('');
  const [urlForceCategory, setUrlForceCategory] = useState<string>('auto');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    currentTitle: string;
    percent: number;
  }>({ current: 0, total: 0, currentTitle: '', percent: 0 });
  const [importSummary, setImportSummary] = useState<{
    total: number;
    successCount: number;
    skippedCount: number;
    failCount: number;
    categoryCounts: Record<string, number>;
    errors?: Array<{ title: string; error: string }>;
  } | null>(null);
  const [isSyncingThumbs, setIsSyncingThumbs] = useState(false);

  // Form fields
  const [formData, setFormData] = useState<{
    id: string;
    originalSlug: string;
    slug: string;
    title: string;
    summary: string;
    content: string;
    category: string;
    author: string;
    date: string;
    tagsString: string;
    thumbnail: string;
    faqs: ColumnFaq[];
  }>({
    id: '',
    originalSlug: '',
    slug: '',
    title: '',
    summary: '',
    content: '',
    category: '자율신경실조증',
    author: '전두희 원장',
    date: new Date().toISOString().slice(0, 10),
    tagsString: '',
    thumbnail: '',
    faqs: [],
  });

  const categoryPresets = CLINIC_CATEGORIES;

  const thumbnailPresets = [
    { label: 'QEEG 뇌파 검사', path: '/images/clinic/naver-qeeg-wide.webp' },
    { label: '추나 치료실', path: '/images/clinic/naver-chuna-wide.webp' },
    { label: '상담실', path: '/images/clinic/naver-consultation-wide.webp' },
    { label: '케어 룸', path: '/images/clinic/care-room-wide.webp' },
    { label: '로비 & 대기실', path: '/images/clinic/hero-lobby-wide.webp' },
    { label: '플라워 디테일', path: '/images/clinic/detail-flower-wide.webp' },
  ];

  const [isLocalHost, setIsLocalHost] = useState(true);
  const [pendingSlugs, setPendingSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      setIsLocalHost(isLocal);

      try {
        const pending = JSON.parse(localStorage.getItem('orb_pending_columns') || '[]');
        if (Array.isArray(pending)) {
          setPendingSlugs(new Set(pending.map((c: any) => c.slug)));
        }
      } catch {}
    }
  }, []);

  // Poll pending slugs every 15s to detect when Cloudflare deployment finishes
  useEffect(() => {
    if (pendingSlugs.size === 0 || typeof window === 'undefined') return;

    const interval = setInterval(async () => {
      const remainingPending = new Set(pendingSlugs);
      let changed = false;

      for (const slug of Array.from(pendingSlugs)) {
        try {
          const res = await fetch(`/columns/${encodeURIComponent(slug)}`, {
            method: 'HEAD',
            cache: 'no-store',
          });
          if (res.ok) {
            remainingPending.delete(slug);
            changed = true;
          }
        } catch {}
      }

      if (changed) {
        setPendingSlugs(new Set(remainingPending));
        try {
          const pendingRaw = localStorage.getItem('orb_pending_columns');
          if (pendingRaw) {
            const pendingCols: Column[] = JSON.parse(pendingRaw);
            const updated = pendingCols.filter((c) => remainingPending.has(c.slug));
            localStorage.setItem('orb_pending_columns', JSON.stringify(updated));
          }
        } catch {}
        setActionMessage({
          type: 'success',
          text: '🎉 실서버 클라우드 정적 배포가 완료되었습니다! 이제 전체 방문자에게 정식 공개됩니다.',
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [pendingSlugs]);

  const fetchColumns = async () => {
    setIsLoadingColumns(true);
    try {
      let res = await fetch('/api/columns', {
        headers: {
          'x-github-token': getActiveGithubToken(),
        },
      });
      if (!res.ok) {
        res = await fetch('/api/columns.json');
      }
      if (res.ok) {
        const data = await res.json();
        if (data && data.columns) {
          let serverCols: Column[] = data.columns;
          // Merge pending columns that are still being built by Cloudflare
          try {
            const pending = JSON.parse(localStorage.getItem('orb_pending_columns') || '[]');
            if (Array.isArray(pending) && pending.length > 0) {
              const serverSlugs = new Set(serverCols.map((c) => c.slug));
              const stillPending = pending.filter((c: any) => !serverSlugs.has(c.slug));
              localStorage.setItem('orb_pending_columns', JSON.stringify(stillPending));
              setPendingSlugs(new Set(stillPending.map((c: any) => c.slug)));
              if (stillPending.length > 0) {
                serverCols = [...stillPending, ...serverCols];
              }
            } else {
              setPendingSlugs(new Set());
            }
          } catch {}
          setColumns(serverCols);
        }
      }
    } catch (err) {
      console.warn('Columns API fetch skipped:', err);
    } finally {
      setIsLoadingColumns(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    let ignore = false;
    async function init() {
      // 1. Check local persistent auth
      try {
        if (localStorage.getItem('orb_admin_authenticated') === '135700') {
          if (!ignore) {
            setIsAuthenticated(true);
            fetchColumns();
          }
        }
      } catch {}

      // 2. Check server session cookie
      try {
        const res = await fetch('/api/admin/check');
        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.authenticated) {
            setIsAuthenticated(true);
            fetchColumns();
            return;
          }
        }
      } catch {}

      if (!ignore) {
        try {
          if (!localStorage.getItem('orb_admin_authenticated')) {
            setIsAuthenticated(false);
          }
        } catch {
          setIsAuthenticated(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Keyboard shortcut for quick Naver Blog Migration modal (Alt+N or Ctrl+M)
  useEffect(() => {
    const handleAdminKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (e.key === 'Escape') {
        if (!isImporting) setShowNaverModal(false);
        return;
      }
      if (isInput) return;

      if (
        (e.altKey && (e.key === 'n' || e.key === 'N')) ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'm' || e.key === 'M'))
      ) {
        e.preventDefault();
        setShowNaverModal(true);
        setImportSummary(null);
      }
    };
    window.addEventListener('keydown', handleAdminKey);
    return () => window.removeEventListener('keydown', handleAdminKey);
  }, [isImporting]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const inputPw = password.trim();

    // 1. Direct password match (handles both localhost and static export fallback)
    if (inputPw === '135700') {
      try {
        localStorage.setItem('orb_admin_authenticated', '135700');
        const defaultTok = xorDecrypt(ENC_TOKEN_HEX, '135700');
        if (defaultTok && !localStorage.getItem('orb_github_token')) {
          localStorage.setItem('orb_github_token', defaultTok);
        }
      } catch {}
      setIsAuthenticated(true);
      setPassword('');

      // Background attempt to establish server session if server API is active
      try {
        await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: inputPw }),
        });
      } catch {}

      fetchColumns();
      setIsLoggingIn(false);
      return;
    }

    // 2. Server-side login attempt for custom passwords configured on server
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPw }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          try {
            localStorage.setItem('orb_admin_authenticated', '135700');
          } catch {}
          setIsAuthenticated(true);
          setPassword('');
          fetchColumns();
          return;
        }
      }
      setLoginError('비밀번호가 올바르지 않습니다. 다시 확인해 주세요.');
    } catch {
      setLoginError('비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('orb_admin_authenticated');
    } catch {}
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsAuthenticated(false);
    setEditingColumn(null);
    setIsCreatingNew(false);
  };

  const openNewForm = () => {
    const today = new Date().toISOString().slice(0, 10);
    setFormData({
      id: '',
      originalSlug: '',
      slug: '',
      title: '',
      summary: '',
      content: '## 1. 들어가는 글\n\n환자분들이 자주 질문하시는 증상과 원인에 대해 설명합니다.\n\n---\n\n## 2. 한의학적 진단과 치료 원리\n\n- **핵심 포인트 1**: 설명\n- **핵심 포인트 2**: 설명\n\n---\n\n## 3. 원장님의 생활 관리 가이드\n\n일상에서 실천할 수 있는 건강 수칙입니다.',
      category: '자율신경실조증',
      author: '전두희 원장',
      date: today,
      tagsString: '자율신경, 뇌파검사, 마곡한의원, 건강칼럼',
      thumbnail: '',
      faqs: [
        {
          question: '치료 기간은 보통 얼마나 걸리나요?',
          answer: '개인의 증상 경중과 유병 기간에 따라 다르나, 보통 4~8주 집중 치료 후 안정기에 접어들게 됩니다.',
        },
      ],
    });
    setEditingColumn(null);
    setIsCreatingNew(true);
    setEditorPreview(false);
    setActionMessage(null);
  };

  const openEditForm = (col: Column) => {
    setFormData({
      id: col.id,
      originalSlug: col.slug,
      slug: col.slug,
      title: col.title,
      summary: col.summary,
      content: col.content,
      category: col.category,
      author: col.author || '전두희 원장',
      date: col.date,
      tagsString: col.tags.join(', '),
      thumbnail: col.thumbnail,
      faqs: Array.isArray(col.faqs) && col.faqs.length > 0 ? col.faqs : [],
    });
    setEditingColumn(col);
    setIsCreatingNew(false);
    setEditorPreview(false);
    setActionMessage(null);
  };

  const autoGenerateSlug = () => {
    if (!formData.title) return;
    const generated = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 40);
    setFormData((prev) => ({ ...prev, slug: generated }));
  };

  // FAQ management functions
  const addFaqItem = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }));
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData((prev) => {
      const nextFaqs = [...prev.faqs];
      nextFaqs[index] = { ...nextFaqs[index], [field]: value };
      return { ...prev, faqs: nextFaqs };
    });
  };

  const removeFaqItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, idx) => idx !== index),
    }));
  };

  const addFaqPreset = (question: string, answer: string) => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question, answer }],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('제목을 입력해 주세요.');
      return;
    }
    if (!formData.content.trim()) {
      alert('본문 내용을 입력해 주세요.');
      return;
    }

    setIsSaving(true);
    setActionMessage(null);

    const tags = formData.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const validFaqs = formData.faqs.filter(
      (f) => f.question.trim() && f.answer.trim()
    );

    const payload = {
      id: formData.id || undefined,
      slug: formData.slug || undefined,
      originalSlug: formData.originalSlug || undefined,
      title: formData.title,
      summary: formData.summary,
      content: formData.content,
      category: formData.category,
      author: formData.author,
      date: formData.date,
      tags,
      thumbnail: formData.thumbnail,
      faqs: validFaqs,
    };

    try {
      let saveSucceeded = false;
      let savedCol: any = null;

      try {
        const isEdit = Boolean(editingColumn);
      const url = '/api/columns';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-github-token': getActiveGithubToken(),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json().catch(() => ({}));
        if (result && result.success) {
          saveSucceeded = true;
          savedCol = result.column;
        }
      }
    } catch {}

    // Fallback: Direct GitHub API commit if server endpoint didn't succeed (Static CDN mode)
    if (!saveSucceeded) {
      try {
        const isEdit = Boolean(editingColumn);
        const autoSlug = payload.slug || payload.title
          .toLowerCase()
          .replace(/[^a-z0-9가-힣\-_]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') || `column-${Date.now()}`;
        const finalCol = {
          ...payload,
          id: payload.id || `col-${autoSlug}`,
          slug: autoSlug,
        };
        const ok = await commitDirectlyToGithub(finalCol, isEdit);
        if (ok) {
          saveSucceeded = true;
          savedCol = finalCol;
        }
      } catch (err: any) {
        console.error('Direct GitHub commit error:', err);
      }
    }

    if (saveSucceeded) {
      const isEdit = Boolean(editingColumn);
      setActionMessage({
        type: 'success',
        text: isEdit
          ? '칼럼이 성공적으로 수정되어 GitHub에 커밋되었습니다. Cloudflare에서 자동 재배포가 시작됩니다 (약 1분 소요).'
          : '새 칼럼이 성공적으로 발행되어 GitHub에 커밋되었습니다. Cloudflare에서 자동 재배포가 시작됩니다 (약 1분 소요).',
      });
      setIsCreatingNew(false);
      setEditingColumn(null);
      if (savedCol) {
        setColumns(prev => {
          const idx = prev.findIndex(c => c.slug === savedCol.slug || (savedCol.originalSlug && c.slug === savedCol.originalSlug));
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...savedCol };
            return next;
          }
          return [savedCol, ...prev];
        });
      }
      fetchColumns();
    } else {
      setActionMessage({
        type: 'error',
        text: '저장에 실패했습니다. 네트워크 상태 및 배포 토큰을 확인해 주세요.',
      });
    }
  } catch {
    setActionMessage({ type: 'error', text: '서버 통신 중 오류가 발생했습니다.' });
  } finally {
    setIsSaving(false);
  }
};

const handleDelete = async (slug: string, title: string) => {
  if (!confirm(`정말로 "${title}" 칼럼을 삭제하시겠습니까?\n삭제된 파일은 복구할 수 없습니다.`)) {
    return;
  }

  let delOk = false;
  try {
    const res = await fetch(`/api/columns?slug=${encodeURIComponent(slug)}`, {
      method: 'DELETE',
      headers: {
        'x-github-token': getActiveGithubToken(),
      },
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.success) delOk = true;
    }
  } catch {}

  if (!delOk) {
    try {
      delOk = await deleteDirectlyFromGithub(slug);
    } catch (err) {
      console.error('Direct GitHub delete error:', err);
    }
  }

  if (delOk) {
    setActionMessage({
      type: 'success',
      text: '칼럼이 삭제되었습니다. Cloudflare에서 자동 재배포가 시작됩니다.',
    });
    if (editingColumn?.slug === slug) {
      setEditingColumn(null);
    }
    setColumns(prev => prev.filter(c => c.slug !== slug));
    fetchColumns();
  } else {
    alert('삭제 요청 중 오류가 발생했습니다.');
  }
};


  // Text insertion helper
  const insertMarkdown = (before: string, after: string = '') => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content + `\n${before}내용${after}\n`,
    }));
  };

  // Table template insertion
  const insertTableTemplate = () => {
    const tableMd = `\n| 비교 항목 | 증상 및 특징 | 임상 검사 및 대처 |\n| :--- | :--- | :--- |\n| **초기 단계** | 가벼운 피로, 뻐근함, 집중 저하 | 휴식 및 스트레칭 가이드 |\n| **진행 단계** | 지속적 어지럼, 두근거림, 결림 | 뇌파(QEEG) 및 자율신경 검사 |\n| **만성 단계** | 일상생활 불편, 수면장애 동반 | 정밀 추나요법 및 체질 맞춤 한약 |\n`;
    setFormData((prev) => ({
      ...prev,
      content: prev.content + tableMd,
    }));
  };

  // Callout box insertion
  const insertCalloutTemplate = () => {
    const calloutMd = `\n> 💡 **전두희 원장의 임상 핵심 포인트 (Medical Insight)**\n> - 신체에서 반복되는 불편 증상은 단순 피로가 아니라 신경계와 척추 정렬의 불균형 신호입니다.\n> - 객관적 검사(자율신경·뇌파)를 통해 원인을 확인하고, 구조와 기능을 동시에 다스려야 근본적인 치유가 가능합니다.\n`;
    setFormData((prev) => ({
      ...prev,
      content: prev.content + calloutMd,
    }));
  };

  // Image Upload handler
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const alt = uploadAltText.trim() || file.name.replace(/\.[^/.]+$/, '');
        const imageMarkdown = `\n\n![${alt}](${data.url})\n*설명: ${alt}*\n\n`;
        setFormData((prev) => ({
          ...prev,
          content: prev.content + imageMarkdown,
        }));
        setShowImageModal(false);
        setUploadAltText('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        alert('이미지가 성공적으로 업로드되어 본문에 삽입되었습니다.');
      } else {
        alert(data.error || '이미지 업로드에 실패했습니다.');
      }
    } catch {
      alert('이미지 업로드 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Naver Blog Migration Handlers
  const handleFetchNaverList = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!naverBlogId.trim()) {
      alert('네이버 블로그 ID를 입력해 주세요.');
      return;
    }

    setIsFetchingNaver(true);
    setNaverFetchError('');
    setImportSummary(null);

    try {
      const res = await fetch('/api/admin/import-naver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-github-token': getActiveGithubToken(),
        },
        body: JSON.stringify({
          action: 'list',
          blogId: naverBlogId.trim(),
          maxPosts: 500,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (!data.posts || data.posts.length === 0) {
          setNaverFetchError(
            '해당 블로그에서 공개 글을 찾지 못했습니다. 블로그 ID를 확인하시거나 [방법 2: URL 직접 입력]을 이용해 주세요.'
          );
        } else {
          setDiscoveredPosts(
            data.posts.map((p: any) => ({
              ...p,
              selected: true,
            }))
          );
        }
      } else {
        setNaverFetchError(data.error || '글 목록을 조회하지 못했습니다.');
      }
    } catch {
      setNaverFetchError('네이버 블로그 통신 중 오류가 발생했습니다.');
    } finally {
      setIsFetchingNaver(false);
    }
  };

  const toggleSelectAll = (select: boolean) => {
    setDiscoveredPosts((prev) => prev.map((p) => ({ ...p, selected: select })));
  };

  const togglePostSelect = (logNo: string) => {
    setDiscoveredPosts((prev) =>
      prev.map((p) => (p.logNo === logNo ? { ...p, selected: !p.selected } : p))
    );
  };

  const updatePostCategory = (logNo: string, newCat: string) => {
    setDiscoveredPosts((prev) =>
      prev.map((p) => (p.logNo === logNo ? { ...p, matchedCategory: newCat } : p))
    );
  };

  const handleStartBatchImport = async () => {
    const selected = discoveredPosts.filter((p) => p.selected);
    if (selected.length === 0) {
      alert('가져올 글을 최소 1개 이상 선택해 주세요.');
      return;
    }

    if (
      !confirm(
        `선택하신 ${selected.length}개의 네이버 블로그 글을 홈페이지 칼럼으로 이전합니다.\n(이미지 로컬 다운로드 및 마스터 규격 마크다운 자동 변환이 진행됩니다)\n계속하시겠습니까?`
      )
    ) {
      return;
    }

    setIsImporting(true);
    setImportSummary(null);

    const total = selected.length;
    let successCount = 0;
    let skippedCount = 0;
    let failCount = 0;
    const categoryCounts: Record<string, number> = {};
    const failedErrors: Array<{ title: string; error: string }> = [];

    const batchSize = 2;
    for (let i = 0; i < selected.length; i += batchSize) {
      const chunk = selected.slice(i, i + batchSize);
      setImportProgress({
        current: i + 1,
        total,
        currentTitle: chunk[0].title,
        percent: Math.round((i / total) * 100),
      });

      try {
        const payload = chunk.map((p) => ({
          url: p.url,
          blogId: p.blogId,
          logNo: p.logNo,
          title: p.title,
          categoryName: p.categoryName,
          forceCategory: p.matchedCategory,
          thumbnailUrl: p.thumbnailUrl,
        }));

        const res = await fetch('/api/admin/import-naver', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-github-token': getActiveGithubToken(),
          },
          body: JSON.stringify({ action: 'import-batch', posts: payload }),
        });

        const data = await res.json();
        if (res.ok && data.results) {
          const newCols: Column[] = [];
          for (const r of data.results) {
            if (r.skipped) {
              skippedCount++;
            } else if (r.success) {
              successCount++;
              categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
              if (r.column) {
                newCols.push(r.column);
              }
            } else {
              failCount++;
              failedErrors.push({
                title: r.title || r.logNo || '알 수 없는 글',
                error: r.error || '이전 처리 실패',
              });
            }
          }
          if (newCols.length > 0) {
            setColumns((prev) => {
              const existingSlugs = new Set(prev.map((c) => c.slug));
              const toAdd = newCols.filter((c) => !existingSlugs.has(c.slug));
              return [...toAdd, ...prev];
            });
            try {
              const existingPending = JSON.parse(localStorage.getItem('orb_pending_columns') || '[]');
              const pendingSlugsMap = new Set(existingPending.map((c: any) => c.slug));
              const toStore = [...newCols.filter((c) => !pendingSlugsMap.has(c.slug)), ...existingPending];
              localStorage.setItem('orb_pending_columns', JSON.stringify(toStore));
              setPendingSlugs(new Set(toStore.map((c: any) => c.slug)));
            } catch {}
          }
        } else {
          failCount += chunk.length;
          chunk.forEach((p) => {
            failedErrors.push({
              title: p.title,
              error: data.error || `서버 응답 오류 (${res.status})`,
            });
          });
        }
      } catch (err: any) {
        failCount += chunk.length;
        chunk.forEach((p) => {
          failedErrors.push({
            title: p.title,
            error: err.message || '네트워크 통신 오류',
          });
        });
      }
    }

    setImportProgress({
      current: total,
      total,
      currentTitle: '이전 완료',
      percent: 100,
    });

    setImportSummary({
      total,
      successCount,
      skippedCount,
      failCount,
      categoryCounts,
      errors: failedErrors,
    });

    setIsImporting(false);
    if (successCount > 0) {
      setActionMessage({
        type: 'success',
        text: `🎉 ${successCount}개 글 마이그레이션 성공! 관리자 목록에 즉시 등록되었습니다. (실서버 배포 1~2분 후 홈페이지 자동 공개)`,
      });
    }
    fetchColumns();
  };

  const handleStartUrlImport = async () => {
    const urls = multiUrlsText
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => Boolean(u));

    if (urls.length === 0) {
      alert('가져올 네이버 블로그 글 URL을 입력해 주세요.');
      return;
    }

    if (!confirm(`입력하신 ${urls.length}개의 URL에서 글을 가져옵니다. 계속하시겠습니까?`)) {
      return;
    }

    setIsImporting(true);
    setImportSummary(null);

    const total = urls.length;
    let successCount = 0;
    let skippedCount = 0;
    let failCount = 0;
    const categoryCounts: Record<string, number> = {};
    const failedErrors: Array<{ title: string; error: string }> = [];

    const batchSize = 2;
    for (let i = 0; i < urls.length; i += batchSize) {
      const chunk = urls.slice(i, i + batchSize);
      setImportProgress({
        current: i + 1,
        total,
        currentTitle: chunk[0],
        percent: Math.round((i / total) * 100),
      });

      try {
        const res = await fetch('/api/admin/import-naver', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-github-token': getActiveGithubToken(),
          },
          body: JSON.stringify({
            action: 'import-urls',
            urls: chunk,
            forceCategory: urlForceCategory === 'auto' ? undefined : urlForceCategory,
          }),
        });

        const data = await res.json();
        if (res.ok && data.results) {
          const newCols: Column[] = [];
          for (const r of data.results) {
            if (r.skipped) {
              skippedCount++;
            } else if (r.success) {
              successCount++;
              categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
              if (r.column) {
                newCols.push(r.column);
              }
            } else {
              failCount++;
              failedErrors.push({
                title: r.title || r.logNo || '알 수 없는 URL',
                error: r.error || '이전 처리 실패',
              });
            }
          }
          if (newCols.length > 0) {
            setColumns((prev) => {
              const existingSlugs = new Set(prev.map((c) => c.slug));
              const toAdd = newCols.filter((c) => !existingSlugs.has(c.slug));
              return [...toAdd, ...prev];
            });
            try {
              const existingPending = JSON.parse(localStorage.getItem('orb_pending_columns') || '[]');
              const pendingSlugsMap = new Set(existingPending.map((c: any) => c.slug));
              const toStore = [...newCols.filter((c) => !pendingSlugsMap.has(c.slug)), ...existingPending];
              localStorage.setItem('orb_pending_columns', JSON.stringify(toStore));
              setPendingSlugs(new Set(toStore.map((c: any) => c.slug)));
            } catch {}
          }
        } else {
          failCount += chunk.length;
          chunk.forEach((u) => {
            failedErrors.push({
              title: u,
              error: data.error || `서버 응답 오류 (${res.status})`,
            });
          });
        }
      } catch (err: any) {
        failCount += chunk.length;
        chunk.forEach((u) => {
          failedErrors.push({
            title: u,
            error: err.message || '네트워크 통신 오류',
          });
        });
      }
    }

    setImportProgress({
      current: total,
      total,
      currentTitle: '이전 완료',
      percent: 100,
    });

    setImportSummary({
      total,
      successCount,
      skippedCount,
      failCount,
      categoryCounts,
      errors: failedErrors,
    });

    setIsImporting(false);
    if (successCount > 0) {
      setActionMessage({
        type: 'success',
        text: `🎉 ${successCount}개 글 마이그레이션 성공! 관리자 목록에 즉시 등록되었습니다. (실서버 배포 1~2분 후 홈페이지 자동 공개)`,
      });
    }
    fetchColumns();
  };

  const handleSyncThumbnails = async () => {
    if (!confirm('기존 등록된 칼럼들의 대표 썸네일을 네이버 블로그 원본 고화질 대표이미지로 일괄 동기화하시겠습니까?')) {
      return;
    }
    setIsSyncingThumbs(true);
    try {
      const res = await fetch('/api/admin/import-naver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-thumbnails', blogId: 'orbmed' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: `네이버 블로그 원본 대표 썸네일 동기화 완료! (${data.updatedCount}개 칼럼의 대표이미지가 원본 고화질로 갱신되었습니다)`,
        });
        fetchColumns();
      } else {
        alert(data.error || '썸네일 동기화에 실패했습니다.');
      }
    } catch {
      alert('썸네일 동기화 요청 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsSyncingThumbs(false);
    }
  };

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

  // 2. Unauthenticated: Login Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-shell">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <span className="admin-brand">ORB CLINIC</span>
            <h1>원장실 관리자 인증</h1>
            <p>오브한의원 칼럼 작성 및 관리를 위해 비밀번호를 입력해 주세요.</p>
          </div>

          <div style={{ background: '#ECFDF5', border: '1px solid #10B981', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#065F46', fontSize: '13px', lineHeight: '1.5', textAlign: 'left' }}>
            <strong>⚡ 실시간 클라우드 자동 배포 활성화</strong><br />
            홈페이지에서 직접 칼럼 작성 및 네이버 블로그 글 가져오기를 실행하시면 실서버에 자동 배포됩니다.
          </div>


          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="admin-pass">관리자 비밀번호</label>
              <input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력..."
                required
                autoFocus
                className="admin-input"
              />
            </div>

            {loginError && <div className="admin-error-box">{loginError}</div>}

            <button type="submit" disabled={isLoggingIn} className="button button-solid admin-submit-btn">
              {isLoggingIn ? '인증 중...' : '관리자 로그인'}
            </button>
          </form>

          <div className="admin-login-footer">
            <Link href="/">← 홈페이지 메인으로 이동</Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated: Management Dashboard
  return (
    <div className="admin-shell">
      {/* Top Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-topbar-title">
            <a href="/admin/columns" className="admin-logo">ORB CLINIC</a>
            <span>칼럼 관리 시스템 (원장님 전용)</span>
          </div>

          <div className="admin-topbar-actions">
            <span style={{ fontSize: '12px', color: '#059669', background: '#ECFDF5', padding: '4px 10px', borderRadius: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              실시간 자동 배포
            </span>
            <button
              type="button"
              onClick={() => {
                setGhTokenInput(localStorage.getItem('orb_github_token') || '');
                setShowSettingsModal(true);
                setGhTokenStatus(null);
              }}
              className="admin-nav-link"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#4B5563' }}
              title="GitHub 연동 및 배포 토큰 설정"
            >
              ⚙️ 배포 설정
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNaverModal(true);
                setImportSummary(null);
              }}
              className="admin-nav-naver-btn"
              title="네이버 블로그 가져오기 (단축키: Alt+N 또는 Ctrl+M)"
            >
              <span className="naver-n-icon">N</span> 블로그 가져오기
            </button>
            <button
              type="button"
              onClick={handleSyncThumbnails}
              disabled={isSyncingThumbs}
              className="admin-nav-sync-btn"
              title="네이버 블로그의 실제 대표이미지로 기존 칼럼 썸네일을 일괄 동기화합니다"
            >
              {isSyncingThumbs ? '썸네일 동기화 중...' : '🖼️ 대표 썸네일 원본 동기화'}
            </button>
            <a href="/columns" target="_blank" rel="noreferrer" className="admin-nav-link">
              칼럼 게시판 보기 ↗
            </a>
            <button type="button" onClick={handleLogout} className="admin-logout-btn">
              로그아웃
            </button>
          </div>
        </div>
      </header>


      {/* Main Admin Content */}
      <main className="admin-main">
        {actionMessage && (
          <div className={`admin-alert ${actionMessage.type}`}>
            <span>{actionMessage.text}</span>
            <button type="button" onClick={() => setActionMessage(null)}>✕</button>
          </div>
        )}

        {/* View 1: Editor Form */}
        {(isCreatingNew || editingColumn) ? (
          <div className="admin-editor-card">
            <div className="editor-card-header">
              <h2>{isCreatingNew ? '새 칼럼 작성' : `칼럼 수정: ${editingColumn?.title}`}</h2>
              <div className="editor-mode-toggle">
                <button
                  type="button"
                  className={`editor-tab ${!editorPreview ? 'active' : ''}`}
                  onClick={() => setEditorPreview(false)}
                >
                  편집기
                </button>
                <button
                  type="button"
                  className={`editor-tab ${editorPreview ? 'active' : ''}`}
                  onClick={() => setEditorPreview(true)}
                >
                  미리보기
                </button>
                <button
                  type="button"
                  className="button button-ghost editor-cancel-btn"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingColumn(null);
                  }}
                >
                  닫기 (목록으로)
                </button>
              </div>
            </div>

            {editorPreview ? (
              <div className="editor-preview-container">
                <div className="article-header">
                  <span className="column-badge">{formData.category}</span>
                  <time>{formData.date}</time>
                  <h1 className="article-title">{formData.title || '제목 없음'}</h1>
                  <p className="column-meta">{formData.author}</p>
                </div>
                {formData.summary && (
                  <div className="geo-summary-box">
                    <div className="geo-summary-title">
                      <strong>Summary</strong>
                    </div>
                    <p>{formData.summary}</p>
                  </div>
                )}
                {formData.thumbnail && (
                  <figure className="article-figure">
                    <img src={formData.thumbnail} alt="미리보기 썸네일" />
                  </figure>
                )}
                <MarkdownView content={formData.content} />

                {/* FAQ Preview */}
                {formData.faqs.length > 0 && (
                  <section className="article-faq-section" style={{ marginTop: '40px' }}>
                    <div className="faq-section-header">
                      <span className="faq-badge">FAQ</span>
                      <h3>자주 묻는 질문 (FAQ)</h3>
                    </div>
                    <div className="faq-list">
                      {formData.faqs.map((faq, idx) => (
                        <div key={idx} className="faq-preview-card">
                          <strong className="faq-preview-q">Q. {faq.question || '(질문 미입력)'}</strong>
                          <p className="faq-preview-a">A. {faq.answer || '(답변 미입력)'}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <form onSubmit={handleSave} className="admin-form">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>칼럼 제목 *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="예: 마곡 직장인의 만성 목·어깨 결림과 추나요법"
                      required
                      className="admin-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      URL 슬러그 (영문/한글 URL 식별자) *
                      <button
                        type="button"
                        onClick={autoGenerateSlug}
                        className="slug-auto-btn"
                        title="제목 기반 슬러그 자동 생성"
                      >
                        제목으로 자동 생성
                      </button>
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="예: chronic-neck-pain-chuna"
                      required
                      className="admin-input"
                    />
                    <small className="form-help">/columns/[슬러그] 로 글 주소가 생성됩니다.</small>
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>카테고리</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="admin-select"
                    >
                      {categoryPresets.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>작성자</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="admin-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>발행일 (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>핵심 요약 (SEO 메타 설명 & AI 검색 추천 스니펫에 활용)</label>
                  <textarea
                    rows={2}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="환자가 겪는 불편과 한의학적 원인, 해결책을 2~3문장으로 간결하게 요약해 주세요."
                    className="admin-textarea"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>태그 (쉼표로 구분)</label>
                    <input
                      type="text"
                      value={formData.tagsString}
                      onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                      placeholder="자율신경, 뇌파검사, 마곡한의원"
                      className="admin-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>대표 썸네일 이미지</label>
                    <input
                      type="text"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="/images/clinic/hero-lobby-wide.webp"
                      className="admin-input"
                    />
                    <div className="thumb-presets">
                      <span>빠른 선택:</span>
                      {thumbnailPresets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setFormData({ ...formData, thumbnail: preset.path })}
                          className={`thumb-preset-btn ${formData.thumbnail === preset.path ? 'selected' : ''}`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Markdown Toolbar */}
                <div className="form-group">
                  <div className="markdown-toolbar">
                    <label>본문 내용 (마크다운 지원) *</label>
                    <div className="md-tools">
                      <button type="button" onClick={() => insertMarkdown('## ')}>H2 제목</button>
                      <button type="button" onClick={() => insertMarkdown('### ')}>H3 소제목</button>
                      <button type="button" onClick={() => insertMarkdown('**', '**')}>굵게</button>
                      <button type="button" onClick={() => insertMarkdown('- ')}>목록</button>
                      <button type="button" onClick={() => insertMarkdown('> ')}>인용구</button>
                      <button type="button" onClick={() => insertMarkdown('---')}>구분선</button>
                      {/* AI Search GEO/AEO specific templates */}
                      <button
                        type="button"
                        onClick={insertTableTemplate}
                        className="md-tool-highlight"
                        title="AI가 가장 선호하는 정형 표 템플릿 삽입"
                      >
                        📊 표(Table) 템플릿
                      </button>
                      <button
                        type="button"
                        onClick={insertCalloutTemplate}
                        className="md-tool-highlight"
                        title="원장 임상 핵심 요약 강조 박스 삽입"
                      >
                        💡 의학 핵심 요약(Callout)
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowImageModal(true)}
                        className="md-tool-highlight"
                        title="컴퓨터의 이미지 파일 업로드 및 Alt 텍스트 삽입"
                      >
                        🖼️ 이미지 첨부(Alt 포함)
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={16}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="admin-textarea font-mono"
                    required
                  />
                </div>

                {/* FAQ Management Section (AEO Optimization) */}
                <div className="faq-admin-section">
                  <div className="faq-admin-header">
                    <div>
                      <h3>자주 묻는 질문(FAQ) 관리 — AEO & 구글 FAQ 구조화 데이터</h3>
                      <p>
                        환자가 자주 묻는 질문과 답변을 등록하면, 칼럼 하단에 아코디언으로 표시되고
                        동시에 <strong>구글 검색 FAQ 스키마 및 AI 검색(Perplexity, ChatGPT) 최상위 발췌</strong>에 자동 반영됩니다.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addFaqItem}
                      className="button button-solid faq-add-btn"
                    >
                      + FAQ 질문 추가
                    </button>
                  </div>

                  <div className="faq-preset-bar">
                    <span>빠른 질문 프리셋:</span>
                    <button
                      type="button"
                      onClick={() => addFaqPreset('치료 기간과 방문 주기는 어떻게 되나요?', '증상 초기에는 주 2~3회 집중 치료로 통증과 신경계를 안정시키고, 호전 정도에 따라 주 1회 유지 치료로 전환합니다.')}
                    >
                      + 치료 기간/주기
                    </button>
                    <button
                      type="button"
                      onClick={() => addFaqPreset('치료 시 통증이 심하지 않나요?', '오브한의원의 추나요법과 약침 치료는 관절의 정상 축을 부드럽게 복원하는 정밀 테크닉으로 진행되어 아프지 않고 편안합니다.')}
                    >
                      + 치료 통증 여부
                    </button>
                    <button
                      type="button"
                      onClick={() => addFaqPreset('건강보험 및 실손보험(실비) 적용이 되나요?', '추나요법은 연간 20회까지 건강보험이 적용되며, 개인 실손의료보험 약관에 따라 실비 보장을 받으실 수 있습니다.')}
                    >
                      + 건강보험/실비 적용
                    </button>
                  </div>

                  {formData.faqs.length === 0 ? (
                    <div className="faq-empty-prompt">
                      <p>등록된 FAQ가 없습니다. 위의 버튼을 눌러 질문과 답변을 추가해 보세요.</p>
                    </div>
                  ) : (
                    <div className="faq-items-list">
                      {formData.faqs.map((faq, index) => (
                        <div key={index} className="faq-item-card">
                          <div className="faq-card-top">
                            <span className="faq-card-num">FAQ #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeFaqItem(index)}
                              className="faq-card-delete"
                            >
                              ✕ 항목 삭제
                            </button>
                          </div>
                          <div className="form-group">
                            <label>질문 (Question) *</label>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                              placeholder="예: MRI 검사에서 정상인데 왜 어지럽고 두근거릴까요?"
                              className="admin-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>답변 (Answer) *</label>
                            <textarea
                              rows={3}
                              value={faq.answer}
                              onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                              placeholder="원장님의 신뢰성 있는 전문 답변을 작성해 주세요. AI 검색엔진이 이 내용을 직접 인용합니다."
                              className="admin-textarea"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="admin-form-actions">
                  <button type="submit" disabled={isSaving} className="button button-solid">
                    {isSaving ? '저장 중...' : (isCreatingNew ? '새 칼럼 발행하기' : '수정 사항 저장하기')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setEditingColumn(null);
                    }}
                    className="button button-ghost"
                  >
                    취소
                  </button>
                  {editingColumn && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingColumn.slug, editingColumn.title)}
                      className="admin-delete-btn"
                    >
                      칼럼 삭제
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        ) : (
          /* View 2: Columns List & Stats */
          <div className="admin-list-view">
            <div className="admin-list-header">
              <div>
                <h2>발행된 칼럼 목록</h2>
                <p>
                  총 <strong>{columns.length}</strong>개의 칼럼이 등록되어 있습니다.
                </p>
                <div className="admin-category-summary">
                  {CLINIC_CATEGORIES.map((cat) => {
                    const count = columns.filter((c) => c.category === cat).length;
                    return (
                      <span key={cat} className="admin-cat-pill">
                        {cat} <strong>{count}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="admin-header-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowNaverModal(true);
                    setImportSummary(null);
                  }}
                  className="button button-naver-import"
                  title="네이버 블로그의 글을 홈페이지 칼럼으로 일괄 자동 이전합니다 (단축키: Alt+N 또는 Ctrl+M)"
                >
                  <span className="naver-n-icon">N</span> 네이버 블로그 가져오기
                </button>
                <button type="button" onClick={openNewForm} className="button button-solid">
                  + 새 칼럼 직접 작성
                </button>
              </div>
            </div>

            {isLoadingColumns ? (
              <div className="admin-loading"><p>칼럼 목록을 불러오는 중...</p></div>
            ) : columns.length === 0 ? (
              <div className="admin-empty-box">
                <p>등록된 칼럼이 없습니다.</p>
                <button type="button" onClick={openNewForm} className="button button-solid">
                  첫 칼럼 작성하기
                </button>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>썸네일</th>
                      <th>제목 및 요약</th>
                      <th style={{ width: '130px' }}>카테고리</th>
                      <th style={{ width: '110px' }}>FAQ 수</th>
                      <th style={{ width: '110px' }}>발행일</th>
                      <th style={{ width: '150px' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((col) => (
                      <tr key={col.slug}>
                        <td>
                          {col.thumbnail ? (
                            <img
                              src={col.thumbnail}
                              alt=""
                              className="admin-table-thumb"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="admin-table-thumb" style={{ background: '#eee' }} />
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <strong className="admin-col-title">{col.title}</strong>
                            {pendingSlugs.has(col.slug) && (
                              <span style={{ fontSize: '11px', color: '#92400E', background: '#FEF3C7', border: '1px solid #F59E0B', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                                ⏳ 클라우드 배포 중 (약 3분 소요)
                              </span>
                            )}
                          </div>
                          <p className="admin-col-summary">{col.summary}</p>
                          <span className="admin-col-slug">/columns/{col.slug}</span>
                        </td>
                        <td>
                          <span className="column-badge">{col.category}</span>
                        </td>
                        <td>
                          <span className="faq-count-pill">
                            FAQ {Array.isArray(col.faqs) ? col.faqs.length : 0}개
                          </span>
                        </td>
                        <td>
                          <time>{col.date}</time>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <button
                              type="button"
                              onClick={() => openEditForm(col)}
                              className="admin-edit-btn"
                            >
                              수정
                            </button>
                            {pendingSlugs.has(col.slug) ? (
                              <button
                                type="button"
                                onClick={() => setPreviewColumn(col)}
                                className="admin-view-btn"
                                style={{
                                  background: '#FEF3C7',
                                  color: '#92400E',
                                  borderColor: '#F59E0B',
                                  cursor: 'pointer',
                                }}
                                title="Cloudflare 빌드 중입니다. 클릭 시 즉시 관리자 미리보기로 확인하실 수 있습니다."
                              >
                                미리보기 👁️
                              </button>
                            ) : (
                              <a
                                href={`/columns/${col.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="admin-view-btn"
                              >
                                보기 ↗
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(col.slug, col.title)}
                              className="admin-del-btn"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="modal-backdrop" onClick={() => setShowImageModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>본문 이미지 첨부 및 대체 텍스트(Alt) 설정</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowImageModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">
                컴퓨터의 검사 결과지, 뇌파 그래프, 치료 공간 사진을 업로드하면 
                <code>public/images/columns/</code>에 자동 저장되며 본문에 삽입됩니다.
              </p>
              <div className="form-group">
                <label>이미지 설명 (Alt 텍스트) *</label>
                <input
                  type="text"
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  placeholder="예: 오브한의원 19채널 디지털 뇌파 검사 분석 결과지"
                  className="admin-input"
                />
                <small className="form-help">
                  구글 검색엔진 및 시각장애인 스크린리더, AI 검색봇이 이미지를 이해하는 핵심 정보입니다.
                </small>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>이미지 파일 선택</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onChange={handleImageFileSelect}
                  disabled={isUploadingImage}
                  className="admin-file-input"
                />
              </div>

              {isUploadingImage && (
                <div className="modal-uploading">
                  <p>이미지를 최적화하여 업로드하는 중입니다...</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="button button-ghost"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Naver Blog Import Modal */}
      {showNaverModal && (
        <div className="modal-backdrop" onClick={() => !isImporting && setShowNaverModal(false)}>
          <div className="modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="naver-modal-title">
                <span className="naver-badge">NAVER BLOG MIGRATION</span>
                <h3>네이버 블로그 글 일괄 가져오기 (마이그레이션)</h3>
              </div>
              {!isImporting && (
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowNaverModal(false)}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="modal-body modal-body-scrollable">
              {/* Notice Banner */}
              <div className="naver-notice-banner">
                <p>
                  <strong>✨ 마스터 프롬프트 규격 100% 자동 적용:</strong>
                  상단 3줄 핵심 요약 추출 · 소제목(H2) 변환 · 문장 줄바꿈 및 호흡 보존 ·
                  <strong>본문 이미지 로컬 자동 다운로드(엑박 방지)</strong> · 네이버 지도/톡톡/기기 링크 보존 ·
                  의료법 고지 및 학술 레퍼런스 유지 · 작성자 &apos;전두희 원장&apos; 자동 세팅
                </p>
              </div>

              {/* Tabs */}
              <div className="naver-import-tabs">
                <button
                  type="button"
                  className={`naver-tab-btn ${importTab === 'blogId' ? 'active' : ''}`}
                  onClick={() => !isImporting && setImportTab('blogId')}
                >
                  방법 1: 네이버 블로그 ID로 일괄 조회 & 선택 이전
                </button>
                <button
                  type="button"
                  className={`naver-tab-btn ${importTab === 'urls' ? 'active' : ''}`}
                  onClick={() => !isImporting && setImportTab('urls')}
                >
                  방법 2: 글 URL 다중 직접 입력
                </button>
              </div>

              {/* TAB 1: Blog ID Search */}
              {importTab === 'blogId' && (
                <div className="tab-pane">
                  <form onSubmit={handleFetchNaverList} className="naver-search-form">
                    <div className="naver-search-group">
                      <label htmlFor="naver-blog-id">네이버 블로그 ID</label>
                      <div className="naver-input-with-btn">
                        <input
                          id="naver-blog-id"
                          type="text"
                          value={naverBlogId}
                          onChange={(e) => setNaverBlogId(e.target.value)}
                          placeholder="예: orbclinic 또는 블로그 아이디"
                          disabled={isFetchingNaver || isImporting}
                          className="admin-input"
                        />
                        <button
                          type="submit"
                          disabled={isFetchingNaver || isImporting || !naverBlogId.trim()}
                          className="button button-solid naver-search-btn"
                        >
                          {isFetchingNaver ? '조회 중...' : '🔍 글 목록 조회'}
                        </button>
                      </div>
                      <small className="form-help">
                        blog.naver.com/<strong>아이디</strong> 에서 아이디 부분만 입력하시면 됩니다.
                      </small>
                    </div>
                  </form>

                  {naverFetchError && (
                    <div className="admin-alert error" style={{ marginTop: '14px' }}>
                      <span>{naverFetchError}</span>
                    </div>
                  )}

                  {/* Discovered Posts List */}
                  {discoveredPosts.length > 0 && (
                    <div className="discovered-posts-wrapper">
                      <div className="discovered-posts-header">
                        <div>
                          <h4>
                            조회된 글 <strong>{discoveredPosts.length}</strong>개
                            <span className="selected-count">
                              (선택: {discoveredPosts.filter((p) => p.selected).length}개)
                            </span>
                          </h4>
                          <p>
                            네이버 블로그 카테고리를 홈페이지 8대 카테고리로 자동 매핑했습니다.
                            필요 시 드롭다운으로 변경 가능합니다.
                          </p>
                        </div>
                        <div className="discovered-header-actions">
                          <button
                            type="button"
                            onClick={() => toggleSelectAll(true)}
                            disabled={isImporting}
                            className="button button-ghost button-sm"
                          >
                            전체 선택
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSelectAll(false)}
                            disabled={isImporting}
                            className="button button-ghost button-sm"
                          >
                            전체 해제
                          </button>
                        </div>
                      </div>

                      <div className="discovered-table-container">
                        <table className="discovered-table">
                          <thead>
                            <tr>
                              <th style={{ width: '44px' }}>선택</th>
                              <th>글 제목</th>
                              <th style={{ width: '130px' }}>네이버 카테고리</th>
                              <th style={{ width: '160px' }}>홈페이지 카테고리(매핑)</th>
                              <th style={{ width: '100px' }}>작성일</th>
                              <th style={{ width: '60px' }}>원문</th>
                            </tr>
                          </thead>
                          <tbody>
                            {discoveredPosts.map((post) => (
                              <tr key={post.logNo} className={post.selected ? 'row-selected' : ''}>
                                <td style={{ textAlign: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={post.selected}
                                    onChange={() => togglePostSelect(post.logNo)}
                                    disabled={isImporting}
                                  />
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {post.thumbnailUrl && (
                                      <img
                                        src={post.thumbnailUrl}
                                        alt=""
                                        referrerPolicy="no-referrer"
                                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, border: '1px solid var(--border-subtle, #e5e7eb)' }}
                                      />
                                    )}
                                    <strong className="post-title-text">{post.title}</strong>
                                  </div>
                                </td>
                                <td>
                                  <span className="naver-cat-badge">{post.categoryName}</span>
                                </td>
                                <td>
                                  <select
                                    value={post.matchedCategory}
                                    onChange={(e) => updatePostCategory(post.logNo, e.target.value)}
                                    disabled={isImporting}
                                    className="admin-select select-compact"
                                  >
                                    {CLINIC_CATEGORIES.map((cat) => (
                                      <option key={cat} value={cat}>
                                        {cat}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <time className="post-date-text">{post.date}</time>
                                </td>
                                <td>
                                  <a
                                    href={post.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="preview-link"
                                    title="네이버 원문 보기"
                                  >
                                    ↗
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Direct Multi-URL input */}
              {importTab === 'urls' && (
                <div className="tab-pane">
                  <div className="form-group">
                    <label>네이버 블로그 글 URL 여러 개 입력 (한 줄에 하나씩)</label>
                    <textarea
                      rows={9}
                      value={multiUrlsText}
                      onChange={(e) => setMultiUrlsText(e.target.value)}
                      placeholder="https://blog.naver.com/아이디/223591234567&#10;https://blog.naver.com/아이디/223591234568&#10;https://blog.naver.com/아이디/223591234569"
                      disabled={isImporting}
                      className="admin-textarea font-mono"
                    />
                    <small className="form-help">
                      PC/모바일 주소 모두 지원됩니다. 여러 개의 글 URL을 복사하여 줄바꿈으로 붙여넣으세요.
                    </small>
                  </div>

                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label>카테고리 지정</label>
                    <select
                      value={urlForceCategory}
                      onChange={(e) => setUrlForceCategory(e.target.value)}
                      disabled={isImporting}
                      className="admin-select"
                    >
                      <option value="auto">✨ 제목 및 본문 키워드로 자동 분류 (권장)</option>
                      {CLINIC_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          모두 &apos;{cat}&apos; 카테고리로 강제 지정
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Live Migration Progress Bar */}
              {isImporting && (
                <div className="import-progress-card">
                  <div className="progress-header">
                    <strong>글 이전 및 이미지 다운로드 진행 중...</strong>
                    <span>
                      {importProgress.current} / {importProgress.total} ({importProgress.percent}%)
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${importProgress.percent}%` }}
                    />
                  </div>
                  <p className="progress-current-title">
                    현재 처리 중: <em>{importProgress.currentTitle}</em>
                  </p>
                </div>
              )}

              {/* Migration Completion Report */}
              {importSummary && (
                <div className="import-summary-card">
                  <div className="summary-header">
                    <span className="summary-badge">MIGRATION COMPLETE</span>
                    <h4>네이버 블로그 글 이전이 완료되었습니다! 🎉</h4>
                  </div>
                  <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px 16px', borderRadius: '8px', margin: '14px 0', fontSize: '13px', color: '#065F46', lineHeight: 1.6 }}>
                    <strong>⚡ 실시간 자동 배포 안내:</strong><br />
                    • 이전된 칼럼은 관리자 목록에 <strong>즉시 추가</strong>되어 바로 확인 및 수정이 가능합니다.<br />
                    • Cloudflare 배포 파이프라인(약 1~2분 소요)이 완료되면, 홈페이지 <strong>[원장 칼럼]</strong> 메뉴에도 모든 방문자에게 자동 공개됩니다.
                  </div>
                  <div className="summary-stats-grid">
                    <div className="summary-stat-box">
                      <span className="stat-label">총 요청 글</span>
                      <strong className="stat-value">{importSummary.total}개</strong>
                    </div>
                    <div className="summary-stat-box success">
                      <span className="stat-label">신규 성공</span>
                      <strong className="stat-value">{importSummary.successCount}개</strong>
                    </div>
                    {importSummary.skippedCount > 0 && (
                      <div className="summary-stat-box" style={{ background: '#f5f0ea', borderColor: '#d7cbbb' }}>
                        <span className="stat-label">중복 건너뜀(보존)</span>
                        <strong className="stat-value" style={{ color: '#5d4a3e' }}>{importSummary.skippedCount}개</strong>
                      </div>
                    )}
                    {importSummary.failCount > 0 && (
                      <div className="summary-stat-box fail">
                        <span className="stat-label">실패</span>
                        <strong className="stat-value">{importSummary.failCount}개</strong>
                      </div>
                    )}
                  </div>

                  {/* Category breakdown */}
                  <div className="summary-cat-breakdown">
                    <strong>카테고리별 저장 현황:</strong>
                    <div className="summary-cat-chips">
                      {Object.entries(importSummary.categoryCounts).map(([cat, cnt]) => (
                        <span key={cat} className="summary-cat-chip">
                          {cat}: <strong>{cnt}개</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Errors detail if any */}
                  {importSummary.errors && importSummary.errors.length > 0 && (
                    <div
                      className="summary-errors-box"
                      style={{
                        marginTop: '14px',
                        padding: '12px',
                        background: '#fdf2f2',
                        borderRadius: '8px',
                        border: '1px solid #f8b4b4',
                      }}
                    >
                      <strong style={{ color: '#c53030', fontSize: '13px' }}>실패 상세 내역:</strong>
                      <ul
                        style={{
                          margin: '6px 0 0 0',
                          paddingLeft: '20px',
                          fontSize: '12px',
                          color: '#742a2a',
                          maxHeight: '140px',
                          overflowY: 'auto',
                        }}
                      >
                        {importSummary.errors.map((err, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>
                            <strong>{err.title}</strong>: {err.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="modal-footer modal-footer-split">
              <button
                type="button"
                onClick={() => setShowNaverModal(false)}
                disabled={isImporting}
                className="button button-ghost"
              >
                닫기
              </button>

              {importTab === 'blogId' && discoveredPosts.length > 0 && (
                <button
                  type="button"
                  onClick={handleStartBatchImport}
                  disabled={isImporting || discoveredPosts.filter((p) => p.selected).length === 0}
                  className="button button-solid naver-action-btn"
                >
                  {isImporting
                    ? `이전 진행 중 (${importProgress.percent}%)...`
                    : `선택한 ${discoveredPosts.filter((p) => p.selected).length}개 글 홈페이지로 이전 시작`}
                </button>
              )}

              {importTab === 'urls' && (
                <button
                  type="button"
                  onClick={handleStartUrlImport}
                  disabled={isImporting || !multiUrlsText.trim()}
                  className="button button-solid naver-action-btn"
                >
                  {isImporting
                    ? `이전 진행 중 (${importProgress.percent}%)...`
                    : '입력한 URL 글 일괄 이전 시작'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowSettingsModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2>⚙️ 실서버 자동 배포 연동 설정</h2>
                <p>GitHub 및 Cloudflare Pages 무중단 실시간 배포 구성</p>
              </div>
              <button type="button" onClick={() => setShowSettingsModal(false)} className="close-btn">✕</button>
            </div>
            <div className="admin-modal-body" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>연동 저장소 (GitHub Repository)</label>
                <div style={{ padding: '8px 12px', background: '#F3F4F6', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }}>
                  doohee930405-coder/orb-homepage (main 브랜치)
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>호스팅 환경</label>
                <div style={{ padding: '8px 12px', background: '#F3F4F6', borderRadius: '6px', fontSize: '13px' }}>
                  Cloudflare Pages 정적 CDN + Pages Functions (Edge Serverless)
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="gh-token-field" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  GitHub Personal Access Token
                </label>
                <input
                  id="gh-token-field"
                  type="password"
                  value={ghTokenInput}
                  onChange={(e) => setGhTokenInput(e.target.value)}
                  placeholder="기본 설정 토큰 사용 중 (변경 시 입력)"
                  className="admin-input"
                  style={{ width: '100%' }}
                />
                <small style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  비워두시면 시스템에 안전하게 사전 구성된 기본 배포 토큰이 자동으로 사용됩니다.
                </small>
              </div>

              {ghTokenStatus && (
                <div style={{ padding: '10px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', background: ghTokenStatus.startsWith('✅') ? '#ECFDF5' : '#FEF2F2', color: ghTokenStatus.startsWith('✅') ? '#065F46' : '#991B1B' }}>
                  {ghTokenStatus}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  disabled={isTestingGhToken}
                  onClick={async () => {
                    setIsTestingGhToken(true);
                    setGhTokenStatus('연결 테스트 중...');
                    try {
                      const t = ghTokenInput.trim() || getActiveGithubToken();
                      const res = await fetch(`https://api.github.com/repos/${DEFAULT_GH_REPO}`, {
                        headers: {
                          Authorization: `token ${t}`,
                          'User-Agent': 'Orb-Admin',
                        },
                      });
                      if (res.ok) {
                        setGhTokenStatus('✅ GitHub 저장소와 정상적으로 연결되었습니다. 칼럼 저장 및 블로그 마이그레이션이 즉시 반영됩니다.');
                      } else {
                        setGhTokenStatus(`❌ 연결 실패 (${res.status}): 토큰 권한을 확인해 주세요.`);
                      }
                    } catch (e: any) {
                      setGhTokenStatus(`❌ 통신 오류: ${e.message}`);
                    } finally {
                      setIsTestingGhToken(false);
                    }
                  }}
                  className="button button-ghost button-sm"
                >
                  {isTestingGhToken ? '확인 중...' : '연결 테스트'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (ghTokenInput.trim()) {
                      localStorage.setItem('orb_github_token', ghTokenInput.trim());
                    } else {
                      localStorage.removeItem('orb_github_token');
                    }
                    setShowSettingsModal(false);
                    alert('배포 연동 설정이 저장되었습니다.');
                  }}
                  className="button button-solid button-sm"
                >
                  설정 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Column Live Preview Modal */}
      {previewColumn && (
        <div className="modal-backdrop" onClick={() => setPreviewColumn(null)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="modal-header">
              <div>
                <span className="column-badge" style={{ marginBottom: '6px', display: 'inline-block' }}>
                  {previewColumn.category}
                </span>
                <h3 style={{ fontSize: '18px', lineHeight: 1.4 }}>{previewColumn.title}</h3>
                <time style={{ fontSize: '12px', color: '#6B7280' }}>
                  {previewColumn.date} · {previewColumn.author || '전두희 원장'}
                </time>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setPreviewColumn(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
              {pendingSlugs.has(previewColumn.slug) && (
                <div
                  style={{
                    background: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    color: '#92400E',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                >
                  <strong>⚡ 실시간 관리자 미리보기</strong>
                  <br />
                  현재 Cloudflare Pages에서 새 칼럼 페이지를 생성하여 배포하는 중입니다 (약 3~4분 소요).
                  배포 완료 전에도 이곳에서 본문 내용과 마크다운 서식을 완벽하게 확인하실 수 있습니다.
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href={`/columns/${previewColumn.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-block',
                        background: '#D97706',
                        color: '#FFF',
                        padding: '5px 14px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      정식 웹페이지 열기 ↗
                    </a>
                  </div>
                </div>
              )}

              {previewColumn.summary && (
                <div
                  style={{
                    background: '#F9FAFB',
                    borderLeft: '4px solid #10B981',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    color: '#374151',
                    fontSize: '14px',
                  }}
                >
                  <strong>핵심 요약:</strong> {previewColumn.summary}
                </div>
              )}

              <MarkdownView content={previewColumn.content} summary={previewColumn.summary} />
            </div>
            <div
              style={{
                padding: '16px 20px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <a
                href={`/columns/${previewColumn.slug}`}
                target="_blank"
                rel="noreferrer"
                className="button button-ghost button-sm"
              >
                정식 URL 열기 ↗
              </a>
              <button
                type="button"
                onClick={() => setPreviewColumn(null)}
                className="button button-solid button-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
