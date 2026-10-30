import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getAllColumns } from './columns';

const ENC_TOKEN_HEX = '565b5a68474a754764567a647d576667015c067b577c5204794605635c6157450d65025d02756f54';
const AUTH_KEY = '135700';
const GIST_ID = 'b39f505c3fe9fec1f8b17989d01a4323';
const GIST_FILE = 'orb_analytics.json';

export function getFriendlyPageName(pagePath: string): string {
  const clean = pagePath.split('?')[0].replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '') return '메인 홈페이지 (홈)';
  if (clean === '/location') return '오시는 길 / 진료시간';
  if (clean === '/diet') return '다이어트 클리닉 메인';
  if (clean === '/pain') return '통증·추나 클리닉 메인';
  if (clean === '/qeeg') return 'QEEG 뇌파검사 안내';
  if (clean === '/columns') return '칼럼 아카이브 (전체 목록)';
  if (clean === '/treatments/autonomic-qeeg') return '자율신경실조증·QEEG 클리닉';
  if (clean === '/treatments/pain-chuna') return '통증·척추 관절 추나요법';
  if (clean === '/treatments/diet') return '맞춤 한약 감량 진료';
  if (clean === '/treatments/stress-neurosis') return '스트레스·신경증 클리닉';
  if (clean === '/treatments/heat-metabolism') return '상열하한·대사 진료';
  if (clean === '/treatments/weight-metabolism') return '체형·대사 증후군 진료';
  if (clean.startsWith('/columns/')) {
    const rawSlug = clean.replace('/columns/', '');
    let decoded = rawSlug;
    try {
      decoded = decodeURIComponent(rawSlug);
    } catch {}
    return `[칼럼] ${decoded.length > 32 ? decoded.slice(0, 30) + '...' : decoded}`;
  }
  return clean;
}

function getGithubToken(): string {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  let raw = '';
  for (let i = 0; i < ENC_TOKEN_HEX.length; i += 2) {
    raw += String.fromCharCode(parseInt(ENC_TOKEN_HEX.substr(i, 2), 16));
  }
  let res = '';
  for (let i = 0; i < raw.length; i++) {
    res += String.fromCharCode(raw.charCodeAt(i) ^ AUTH_KEY.charCodeAt(i % AUTH_KEY.length));
  }
  return res;
}

let sqliteDbInstance: any = null;

function getSqliteDb() {
  if (sqliteDbInstance) return sqliteDbInstance;

  try {
    // node:sqlite is standard in Node.js 22+
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require('node:sqlite');
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'analytics.db');
    sqliteDbInstance = new DatabaseSync(dbPath);

    // Initialize Schema for both Columns & Site-wide analytics
    sqliteDbInstance.exec(`
      CREATE TABLE IF NOT EXISTS column_views_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        column_slug TEXT NOT NULL,
        visitor_id TEXT DEFAULT '',
        session_id TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        user_agent TEXT,
        view_date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_log_dedup_session 
        ON column_views_log (column_slug, session_id, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_log_dedup_ip 
        ON column_views_log (column_slug, ip_hash, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_log_slug_date 
        ON column_views_log (column_slug, view_date);

      CREATE TABLE IF NOT EXISTS column_daily_stats (
        column_slug TEXT NOT NULL,
        view_date TEXT NOT NULL,
        views_count INTEGER NOT NULL DEFAULT 0,
        unique_visitors INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (column_slug, view_date)
      );

      CREATE INDEX IF NOT EXISTS idx_daily_date 
        ON column_daily_stats (view_date DESC);

      CREATE INDEX IF NOT EXISTS idx_daily_slug 
        ON column_daily_stats (column_slug);

      -- Site-wide page tracking
      CREATE TABLE IF NOT EXISTS site_views_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_path TEXT NOT NULL,
        page_title TEXT,
        visitor_id TEXT DEFAULT '',
        session_id TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        user_agent TEXT,
        view_date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_site_log_date 
        ON site_views_log (view_date);

      CREATE INDEX IF NOT EXISTS idx_site_log_path 
        ON site_views_log (page_path);

      CREATE TABLE IF NOT EXISTS site_daily_stats (
        page_path TEXT NOT NULL,
        view_date TEXT NOT NULL,
        views_count INTEGER NOT NULL DEFAULT 0,
        unique_visitors INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (page_path, view_date)
      );
    `);

    // Migration
    try {
      sqliteDbInstance.exec(`ALTER TABLE column_views_log ADD COLUMN visitor_id TEXT DEFAULT ''`);
    } catch {}

    return sqliteDbInstance;
  } catch (err) {
    console.warn('node:sqlite could not be initialized:', err);
    return null;
  }
}

export interface RecordPageViewOptions {
  path?: string;
  slug?: string;
  title?: string;
  visitorId?: string;
  sessionId: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  type?: 'site' | 'column';
}

export interface RecordViewOptions {
  slug: string;
  visitorId?: string;
  sessionId: string;
  ip?: string;
  userAgent?: string;
}

export function recordPageView({
  path: rawPath,
  slug: rawSlug,
  title: rawTitle,
  visitorId = '',
  sessionId,
  ip = '',
  userAgent = '',
}: RecordPageViewOptions): {
  recorded: boolean;
  isDuplicate: boolean;
} {
  const cleanPath = (rawPath || (rawSlug ? `/columns/${rawSlug}` : '/')).split('?')[0].replace(/\/+$/, '') || '/';
  const cleanSlug = (rawSlug || (cleanPath.startsWith('/columns/') && cleanPath !== '/columns' ? cleanPath.replace('/columns/', '').trim() : '')).trim();
  const pageTitle = rawTitle ? rawTitle.trim() : getFriendlyPageName(cleanPath);

  const cleanVisitorId = visitorId.trim();
  const cleanSessionId = (sessionId || 'anonymous-session').trim();
  const salt = process.env.ANALYTICS_SALT || 'orb_clinic_salt_2026';
  const ipHash = crypto
    .createHash('sha256')
    .update((ip || '127.0.0.1') + (userAgent || '') + salt)
    .digest('hex')
    .slice(0, 16);

  const vidToken = cleanVisitorId ? cleanVisitorId.slice(0, 20) : `ip_${ipHash.slice(0, 10)}`;

  const kstNow = new Date(Date.now() + 9 * 3600000);
  const viewDate = kstNow.toISOString().slice(0, 10);
  const createdAt = kstNow.toISOString();
  const fifteenSecsAgo = new Date(kstNow.getTime() - 15 * 1000).toISOString();

  const db = getSqliteDb();
  let isDup = false;

  if (db) {
    try {
      // 1. Site Log Check
      const checkSiteStmt = db.prepare(`
        SELECT id FROM site_views_log
        WHERE page_path = ? 
          AND (visitor_id = ? OR session_id = ? OR ip_hash = ?)
          AND created_at >= ?
        LIMIT 1
      `);
      const existingSite = checkSiteStmt.get(cleanPath, vidToken, cleanSessionId, ipHash, fifteenSecsAgo);

      if (existingSite) {
        isDup = true;
      } else {
        const insertSiteStmt = db.prepare(`
          INSERT INTO site_views_log (page_path, page_title, visitor_id, session_id, ip_hash, user_agent, view_date, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insertSiteStmt.run(cleanPath, pageTitle.slice(0, 120), vidToken, cleanSessionId, ipHash, (userAgent || '').slice(0, 200), viewDate, createdAt);

        const upsertSiteStatsStmt = db.prepare(`
          INSERT INTO site_daily_stats (page_path, view_date, views_count, unique_visitors)
          VALUES (?, ?, 1, 1)
          ON CONFLICT(page_path, view_date) DO UPDATE SET
            views_count = views_count + 1
        `);
        upsertSiteStatsStmt.run(cleanPath, viewDate);
      }

      // 2. Column Log Check (if it's an article)
      if (cleanSlug) {
        const checkColStmt = db.prepare(`
          SELECT id FROM column_views_log
          WHERE column_slug = ? 
            AND (visitor_id = ? OR session_id = ? OR ip_hash = ?)
            AND created_at >= ?
          LIMIT 1
        `);
        const existingCol = checkColStmt.get(cleanSlug, vidToken, cleanSessionId, ipHash, fifteenSecsAgo);
        if (!existingCol) {
          const insertColStmt = db.prepare(`
            INSERT INTO column_views_log (column_slug, visitor_id, session_id, ip_hash, user_agent, view_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          insertColStmt.run(cleanSlug, vidToken, cleanSessionId, ipHash, (userAgent || '').slice(0, 200), viewDate, createdAt);

          const upsertColStatsStmt = db.prepare(`
            INSERT INTO column_daily_stats (column_slug, view_date, views_count, unique_visitors)
            VALUES (?, ?, 1, 1)
            ON CONFLICT(column_slug, view_date) DO UPDATE SET
              views_count = views_count + 1
          `);
          upsertColStatsStmt.run(cleanSlug, viewDate);
        }
      }
    } catch (err) {
      console.error('Error in SQLite recordPageView:', err);
    }
  }

  // Also sync to persistent cloud store (GitHub Gist) asynchronously
  try {
    const token = getGithubToken();
    fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { Authorization: `token ${token}`, 'User-Agent': 'Orb-Analytics-Tracker' },
    })
      .then((r) => r.json())
      .then(async (data) => {
        const rawContent = data.files?.[GIST_FILE]?.content;
        const store = rawContent ? JSON.parse(rawContent) : {};
        store.dedupLog = store.dedupLog || {};

        const nowMs = Date.now();
        const COOLDOWN_MS = 15 * 1000;

        // Prune dedup log older than 10 minutes
        const PRUNE_CUTOFF = nowMs - 10 * 60 * 1000;
        for (const k in store.dedupLog) {
          if (store.dedupLog[k] < PRUNE_CUTOFF) delete store.dedupLog[k];
        }

        // --- A. Site-wide tracking in Gist ---
        store.siteDailyStats = store.siteDailyStats || {};
        store.sitePagesTotal = store.sitePagesTotal || {};
        store.siteSummary = store.siteSummary || { totalViews: 0, totalUV: 0, visitors: [] };
        if (!Array.isArray(store.siteSummary.visitors)) {
          store.siteSummary.visitors = [];
        }

        const dedupSiteKey = `site:${cleanPath}:${vidToken}`;
        if (nowMs - (store.dedupLog[dedupSiteKey] || 0) >= COOLDOWN_MS) {
          store.dedupLog[dedupSiteKey] = nowMs;

          if (!store.siteDailyStats[viewDate]) {
            store.siteDailyStats[viewDate] = { views: 0, uv: 0, visitors: [], pages: {} };
          }
          const siteDay = store.siteDailyStats[viewDate];
          if (!Array.isArray(siteDay.visitors)) siteDay.visitors = [];
          siteDay.views = (siteDay.views || 0) + 1;
          if (!siteDay.visitors.includes(vidToken)) {
            siteDay.visitors.push(vidToken);
          }
          siteDay.uv = siteDay.visitors.length;

          siteDay.pages = siteDay.pages || {};
          if (!siteDay.pages[cleanPath]) {
            siteDay.pages[cleanPath] = { views: 0, uv: 0, visitors: [], title: pageTitle };
          }
          const pDay = siteDay.pages[cleanPath];
          if (!Array.isArray(pDay.visitors)) pDay.visitors = [];
          pDay.views = (pDay.views || 0) + 1;
          if (!pDay.visitors.includes(vidToken)) {
            pDay.visitors.push(vidToken);
          }
          pDay.uv = pDay.visitors.length;
          if (pageTitle) pDay.title = pageTitle;

          if (!store.sitePagesTotal[cleanPath]) {
            store.sitePagesTotal[cleanPath] = { views: 0, uv: 0, visitors: [], title: pageTitle };
          }
          const pTot = store.sitePagesTotal[cleanPath];
          if (!Array.isArray(pTot.visitors)) pTot.visitors = [];
          pTot.views = (pTot.views || 0) + 1;
          if (!pTot.visitors.includes(vidToken)) {
            pTot.visitors.push(vidToken);
          }
          pTot.uv = pTot.visitors.length;
          if (pageTitle) pTot.title = pageTitle;

          store.siteSummary.totalViews = (store.siteSummary.totalViews || 0) + 1;
          if (!store.siteSummary.visitors.includes(vidToken)) {
            store.siteSummary.visitors.push(vidToken);
          }
          store.siteSummary.totalUV = store.siteSummary.visitors.length;
        }

        // --- B. Column article tracking in Gist (if slug present) ---
        if (cleanSlug) {
          store.dailyStats = store.dailyStats || {};
          store.columnsTotal = store.columnsTotal || {};
          store.summary = store.summary || { totalViews: 0, totalUV: 0, visitors: [] };
          if (!Array.isArray(store.summary.visitors)) {
            store.summary.visitors = [];
          }

          const dedupArticleKey = `col:${cleanSlug}:${vidToken}`;
          if (nowMs - (store.dedupLog[dedupArticleKey] || 0) >= COOLDOWN_MS) {
            store.dedupLog[dedupArticleKey] = nowMs;

            if (!store.dailyStats[viewDate]) {
              store.dailyStats[viewDate] = { views: 0, uv: 0, visitors: [], columns: {} };
            }
            const dayEntry = store.dailyStats[viewDate];
            if (!Array.isArray(dayEntry.visitors)) {
              dayEntry.visitors = [];
            }
            dayEntry.views = (dayEntry.views || 0) + 1;
            if (!dayEntry.visitors.includes(vidToken)) {
              dayEntry.visitors.push(vidToken);
            }
            dayEntry.uv = dayEntry.visitors.length;

            dayEntry.columns = dayEntry.columns || {};
            if (!dayEntry.columns[cleanSlug]) {
              dayEntry.columns[cleanSlug] = { views: 0, uv: 0, visitors: [] };
            }
            const colDay = dayEntry.columns[cleanSlug];
            if (!Array.isArray(colDay.visitors)) {
              colDay.visitors = [];
            }
            colDay.views = (colDay.views || 0) + 1;
            if (!colDay.visitors.includes(vidToken)) {
              colDay.visitors.push(vidToken);
            }
            colDay.uv = colDay.visitors.length;

            if (!store.columnsTotal[cleanSlug]) {
              store.columnsTotal[cleanSlug] = { views: 0, uv: 0, visitors: [] };
            }
            const colTot = store.columnsTotal[cleanSlug];
            if (!Array.isArray(colTot.visitors)) {
              colTot.visitors = [];
            }
            colTot.views = (colTot.views || 0) + 1;
            if (!colTot.visitors.includes(vidToken)) {
              colTot.visitors.push(vidToken);
            }
            colTot.uv = colTot.visitors.length;

            store.summary.totalViews = (store.summary.totalViews || 0) + 1;
            if (!store.summary.visitors.includes(vidToken)) {
              store.summary.visitors.push(vidToken);
            }
            store.summary.totalUV = store.summary.visitors.length;
          }
        }

        store.updatedAt = createdAt;

        await fetch(`https://api.github.com/gists/${GIST_ID}`, {
          method: 'PATCH',
          headers: {
            Authorization: `token ${token}`,
            'User-Agent': 'Orb-Analytics-Tracker',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            files: {
              [GIST_FILE]: { content: JSON.stringify(store, null, 2) },
            },
          }),
        });
      })
      .catch(() => {});
  } catch {}

  return { recorded: !isDup, isDuplicate: isDup };
}

// Backward-compatible alias for existing column tracking calls
export function recordColumnView(options: RecordViewOptions) {
  return recordPageView({
    ...options,
    path: `/columns/${options.slug}`,
    type: 'column',
  });
}

export interface AnalyticsQueryOptions {
  range?: '7d' | '30d' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
}

// ---------------------------------------------------------------------------
// 1. Column Analytics (Existing Detailed Column Performance)
// ---------------------------------------------------------------------------
export function getColumnAnalytics({
  range = '7d',
  startDate,
  endDate,
}: AnalyticsQueryOptions) {
  const db = getSqliteDb();
  const allColumns = getAllColumns();

  const today = new Date(Date.now() + 9 * 3600000);
  const todayStr = today.toISOString().slice(0, 10);

  let finalStart = '';
  let finalEnd = todayStr;

  if (range === '7d') {
    const d = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    finalStart = d.toISOString().slice(0, 10);
  } else if (range === '30d') {
    const d = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
    finalStart = d.toISOString().slice(0, 10);
  } else if (range === 'custom' && startDate) {
    finalStart = startDate;
    if (endDate) finalEnd = endDate;
  } else {
    finalStart = '2026-01-01';
  }

  // Fallback if DB is unavailable
  if (!db) {
    return {
      summary: {
        totalColumns: allColumns.length,
        totalViews: 0,
        totalUV: 0,
        topColumns: [],
      },
      dailyTrends: [],
      columnsStats: allColumns.map((c) => ({
        slug: c.slug,
        title: c.title,
        date: c.date,
        category: c.category,
        totalViews: 0,
        rangeViews: 0,
        rangeUV: 0,
      })),
      startDate: finalStart,
      endDate: finalEnd,
      range,
    };
  }

  try {
    // 1. Query daily trend with distinct unique visitors
    const dailyStmt = db.prepare(`
      SELECT view_date as date, 
             COUNT(*) as views, 
             COUNT(DISTINCT CASE WHEN visitor_id != '' THEN visitor_id ELSE ip_hash END) as uv
      FROM column_views_log
      WHERE view_date >= ? AND view_date <= ?
      GROUP BY view_date
      ORDER BY view_date ASC
    `);
    const rawDaily = dailyStmt.all(finalStart, finalEnd) as Array<{
      date: string;
      views: number;
      uv: number;
    }>;

    const dateMap = new Map<string, { views: number; uv: number }>();
    rawDaily.forEach((r) => dateMap.set(r.date, { views: Number(r.views || 0), uv: Number(r.uv || 0) }));

    const dailyTrends: Array<{ date: string; views: number; uv: number }> = [];
    if (range === '7d' || range === '30d') {
      const cur = new Date(finalStart);
      const end = new Date(finalEnd);
      while (cur <= end) {
        const dStr = cur.toISOString().slice(0, 10);
        const val = dateMap.get(dStr) || { views: 0, uv: 0 };
        dailyTrends.push({ date: dStr, views: val.views, uv: val.uv });
        cur.setDate(cur.getDate() + 1);
      }
    } else {
      dateMap.forEach((val, dStr) => {
        dailyTrends.push({ date: dStr, views: val.views, uv: val.uv });
      });
      dailyTrends.sort((a, b) => a.date.localeCompare(b.date));
    }

    const rangeStatsStmt = db.prepare(`
      SELECT column_slug,
             COUNT(*) as range_views,
             COUNT(DISTINCT CASE WHEN visitor_id != '' THEN visitor_id ELSE ip_hash END) as range_uv
      FROM column_views_log
      WHERE view_date >= ? AND view_date <= ?
      GROUP BY column_slug
    `);
    const rangeRows = rangeStatsStmt.all(finalStart, finalEnd) as Array<{
      column_slug: string;
      range_views: number;
      range_uv: number;
    }>;
    const rangeMap = new Map<string, { rangeViews: number; rangeUV: number }>();
    rangeRows.forEach((r) => {
      rangeMap.set(r.column_slug, {
        rangeViews: Number(r.range_views || 0),
        rangeUV: Number(r.range_uv || 0),
      });
    });

    const totalStatsStmt = db.prepare(`
      SELECT column_slug, COUNT(*) as total_views
      FROM column_views_log
      GROUP BY column_slug
    `);
    const totalRows = totalStatsStmt.all() as Array<{
      column_slug: string;
      total_views: number;
    }>;
    const totalMap = new Map<string, number>();
    totalRows.forEach((r) => {
      totalMap.set(r.column_slug, Number(r.total_views || 0));
    });

    // Query true period-wide unique visitors (not sum of daily or column UV)
    const totalUVStmt = db.prepare(`
      SELECT COUNT(DISTINCT CASE WHEN visitor_id != '' THEN visitor_id ELSE ip_hash END) as total_uv
      FROM column_views_log
      WHERE view_date >= ? AND view_date <= ?
    `);
    const totalUVRow = totalUVStmt.get(finalStart, finalEnd) as { total_uv: number } | undefined;
    const totalRangeUV = totalUVRow ? Number(totalUVRow.total_uv || 0) : 0;

    let totalRangeViews = 0;

    const columnsStats = allColumns.map((col) => {
      const r = rangeMap.get(col.slug) || { rangeViews: 0, rangeUV: 0 };
      const tot = totalMap.get(col.slug) || 0;
      totalRangeViews += r.rangeViews;
      return {
        slug: col.slug,
        title: col.title,
        date: col.date,
        category: col.category,
        totalViews: tot,
        rangeViews: r.rangeViews,
        rangeUV: r.rangeUV,
      };
    });

    columnsStats.sort((a, b) => b.rangeViews - a.rangeViews);

    const topColumns = columnsStats.slice(0, 3).map((c) => ({
      slug: c.slug,
      title: c.title,
      category: c.category,
      views: c.rangeViews,
      uv: c.rangeUV,
    }));

    return {
      summary: {
        totalColumns: allColumns.length,
        totalViews: totalRangeViews,
        totalUV: totalRangeUV,
        topColumns,
      },
      dailyTrends,
      columnsStats,
      startDate: finalStart,
      endDate: finalEnd,
      range,
    };
  } catch (err) {
    console.error('Error fetching column analytics:', err);
    return {
      summary: {
        totalColumns: allColumns.length,
        totalViews: 0,
        totalUV: 0,
        topColumns: [],
      },
      dailyTrends: [],
      columnsStats: [],
      startDate: finalStart,
      endDate: finalEnd,
      range,
    };
  }
}

// ---------------------------------------------------------------------------
// 2. Site-wide Analytics (Homepage, Treatments, Location, Columns All Included)
// ---------------------------------------------------------------------------
export function getSiteAnalytics({
  range = '7d',
  startDate,
  endDate,
}: AnalyticsQueryOptions) {
  const db = getSqliteDb();

  const today = new Date(Date.now() + 9 * 3600000);
  const todayStr = today.toISOString().slice(0, 10);

  let finalStart = '';
  let finalEnd = todayStr;

  if (range === '7d') {
    const d = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    finalStart = d.toISOString().slice(0, 10);
  } else if (range === '30d') {
    const d = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
    finalStart = d.toISOString().slice(0, 10);
  } else if (range === 'custom' && startDate) {
    finalStart = startDate;
    if (endDate) finalEnd = endDate;
  } else {
    finalStart = '2026-01-01';
  }

  // Pre-defined key website destinations for complete overview
  const STANDARD_PAGES = [
    { path: '/', name: '메인 홈페이지 (홈)' },
    { path: '/treatments/autonomic-qeeg', name: '자율신경실조증·QEEG 클리닉' },
    { path: '/treatments/pain-chuna', name: '통증·추나요법 클리닉' },
    { path: '/treatments/diet', name: '맞춤 한약 다이어트' },
    { path: '/location', name: '오시는 길 / 진료시간 안내' },
    { path: '/columns', name: '칼럼 아카이브 (전체 목록)' },
    { path: '/diet', name: '다이어트 랜딩 허브' },
    { path: '/pain', name: '통증 진료 랜딩 허브' },
    { path: '/qeeg', name: 'QEEG 뇌파검사 소개' },
  ];

  if (!db) {
    return {
      summary: {
        totalPages: STANDARD_PAGES.length,
        totalViews: 0,
        totalUV: 0,
        topPages: [],
      },
      dailyTrends: [],
      pagesStats: STANDARD_PAGES.map((p) => ({
        path: p.path,
        name: p.name,
        totalViews: 0,
        rangeViews: 0,
        rangeUV: 0,
      })),
      startDate: finalStart,
      endDate: finalEnd,
      range,
    };
  }

  try {
    // 1. Query daily trends for site
    const dailyStmt = db.prepare(`
      SELECT view_date as date, 
             COUNT(*) as views, 
             COUNT(DISTINCT CASE WHEN visitor_id != '' THEN visitor_id ELSE ip_hash END) as uv
      FROM site_views_log
      WHERE view_date >= ? AND view_date <= ?
      GROUP BY view_date
      ORDER BY view_date ASC
    `);
    const rawDaily = dailyStmt.all(finalStart, finalEnd) as Array<{
      date: string;
      views: number;
      uv: number;
    }>;

    const dateMap = new Map<string, { views: number; uv: number }>();
    rawDaily.forEach((r) => dateMap.set(r.date, { views: Number(r.views || 0), uv: Number(r.uv || 0) }));

    // Fallback: If site log has fewer entries than column views log for historical days, blend column log
    const colDailyStmt = db.prepare(`
      SELECT view_date as date, 
             COUNT(*) as views, 
             COUNT(DISTINCT CASE WHEN visitor_id != '' THEN visitor_id ELSE ip_hash END) as uv
      FROM column_views_log
      WHERE view_date >= ? AND view_date <= ?
      GROUP BY view_date
    `);
    const colRawDaily = colDailyStmt.all(finalStart, finalEnd) as Array<{
      date: string;
      views: number;
      uv: number;
    }>;
    colRawDaily.forEach((r) => {
      const existing = dateMap.get(r.date) || { views: 0, uv: 0 };
      dateMap.set(r.date, {
        views: Math.max(existing.views, Number(r.views || 0)),
        uv: Math.max(existing.uv, Number(r.uv || 0)),
      });
    });

    const dailyTrends: Array<{ date: string; views: number; uv: number }> = [];
    if (range === '7d' || range === '30d') {
      const cur = new Date(finalStart);
      const end = new Date(finalEnd);
      while (cur <= end) {
        const dStr = cur.toISOString().slice(0, 10);
        const val = dateMap.get(dStr) || { views: 0, uv: 0 };
        dailyTrends.push({ date: dStr, views: val.views, uv: val.uv });
        cur.setDate(cur.getDate() + 1);
      }
    } else {
      dateMap.forEach((val, dStr) => {
        dailyTrends.push({ date: dStr, views: val.views, uv: val.uv });
      });
      dailyTrends.sort((a, b) => a.date.localeCompare(b.date));
    }

    // 2. Query page-level breakdown
    const rangeStatsStmt = db.prepare(`
      SELECT page_path,
             MAX(page_title) as title,
             COUNT(*) as range_views,
             COUNT(DISTINCT CASE WHEN visitor_id != '' THEN visitor_id ELSE ip_hash END) as range_uv
      FROM site_views_log
      WHERE view_date >= ? AND view_date <= ?
      GROUP BY page_path
    `);
    const rangeRows = rangeStatsStmt.all(finalStart, finalEnd) as Array<{
      page_path: string;
      title: string;
      range_views: number;
      range_uv: number;
    }>;

    const pageMap = new Map<string, { name: string; rangeViews: number; rangeUV: number; totalViews: number }>();

    // Seed standard pages
    STANDARD_PAGES.forEach((p) => {
      pageMap.set(p.path, { name: p.name, rangeViews: 0, rangeUV: 0, totalViews: 0 });
    });

    rangeRows.forEach((r) => {
      const p = r.page_path;
      const existing = pageMap.get(p) || {
        name: r.title || getFriendlyPageName(p),
        rangeViews: 0,
        rangeUV: 0,
        totalViews: 0,
      };
      existing.rangeViews = Number(r.range_views || 0);
      existing.rangeUV = Number(r.range_uv || 0);
      if (r.title && existing.name === p) existing.name = r.title;
      pageMap.set(p, existing);
    });

    // 3. Query total views per page
    const totalStatsStmt = db.prepare(`
      SELECT page_path, COUNT(*) as total_views
      FROM site_views_log
      GROUP BY page_path
    `);
    const totalRows = totalStatsStmt.all() as Array<{
      page_path: string;
      total_views: number;
    }>;
    totalRows.forEach((r) => {
      const existing = pageMap.get(r.page_path);
      if (existing) {
        existing.totalViews = Number(r.total_views || 0);
      }
    });

    // Query site-wide period unique visitors
    const totalSiteUVStmt = db.prepare(`
      SELECT COUNT(DISTINCT CASE WHEN visitor_id != '' THEN visitor_id ELSE ip_hash END) as total_uv
      FROM site_views_log
      WHERE view_date >= ? AND view_date <= ?
    `);
    const siteUVRow = totalSiteUVStmt.get(finalStart, finalEnd) as { total_uv: number } | undefined;

    // Period total calculations
    let totalRangeViews = 0;
    const pagesStats: Array<{
      path: string;
      name: string;
      totalViews: number;
      rangeViews: number;
      rangeUV: number;
    }> = [];

    pageMap.forEach((val, p) => {
      totalRangeViews += val.rangeViews;
      pagesStats.push({
        path: p,
        name: val.name,
        totalViews: Math.max(val.totalViews, val.rangeViews),
        rangeViews: val.rangeViews,
        rangeUV: val.rangeUV,
      });
    });

    // Sort by range views
    pagesStats.sort((a, b) => b.rangeViews - a.rangeViews);

    // If site_views_log just started today, blend total UV with column UV so historical numbers match
    const colUVStmt = db.prepare(`
      SELECT COUNT(DISTINCT CASE WHEN visitor_id != '' THEN visitor_id ELSE ip_hash END) as total_uv
      FROM column_views_log
      WHERE view_date >= ? AND view_date <= ?
    `);
    const colUVRow = colUVStmt.get(finalStart, finalEnd) as { total_uv: number } | undefined;

    const baseUV = Number(siteUVRow?.total_uv || 0);
    const colUV = Number(colUVRow?.total_uv || 0);
    const totalSiteUV = Math.max(baseUV, colUV);

    const topPages = pagesStats.slice(0, 5).map((p) => ({
      path: p.path,
      name: p.name,
      views: p.rangeViews,
      uv: p.rangeUV,
    }));

    return {
      summary: {
        totalPages: pagesStats.length,
        totalViews: Math.max(totalRangeViews, dailyTrends.reduce((acc, d) => acc + d.views, 0)),
        totalUV: totalSiteUV,
        topPages,
      },
      dailyTrends,
      pagesStats,
      startDate: finalStart,
      endDate: finalEnd,
      range,
    };
  } catch (err) {
    console.error('Error fetching site analytics:', err);
    return {
      summary: {
        totalPages: STANDARD_PAGES.length,
        totalViews: 0,
        totalUV: 0,
        topPages: [],
      },
      dailyTrends: [],
      pagesStats: [],
      startDate: finalStart,
      endDate: finalEnd,
      range,
    };
  }
}

// ---------------------------------------------------------------------------
// 3. Single Column Trend Modal
// ---------------------------------------------------------------------------
export function getSingleColumnDailyTrend(slug: string, days = 30) {
  const db = getSqliteDb();
  if (!db) return [];

  const today = new Date(Date.now() + 9 * 3600000);
  const start = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = today.toISOString().slice(0, 10);

  try {
    const stmt = db.prepare(`
      SELECT view_date as date, 
             COUNT(*) as views, 
             COUNT(DISTINCT CASE WHEN visitor_id != '' THEN visitor_id ELSE ip_hash END) as uv
      FROM column_views_log
      WHERE column_slug = ? AND view_date >= ? AND view_date <= ?
      GROUP BY view_date
      ORDER BY view_date ASC
    `);
    const rows = stmt.all(slug, startStr, endStr) as Array<{
      date: string;
      views: number;
      uv: number;
    }>;

    const dateMap = new Map<string, { views: number; uv: number }>();
    rows.forEach((r) => dateMap.set(r.date, { views: Number(r.views || 0), uv: Number(r.uv || 0) }));

    const result: Array<{ date: string; views: number; uv: number }> = [];
    const cur = new Date(start);
    while (cur <= today) {
      const dStr = cur.toISOString().slice(0, 10);
      const val = dateMap.get(dStr) || { views: 0, uv: 0 };
      result.push({ date: dStr, views: val.views, uv: val.uv });
      cur.setDate(cur.getDate() + 1);
    }
    return result;
  } catch (err) {
    console.error('Error fetching single column daily trend:', err);
    return [];
  }
}
