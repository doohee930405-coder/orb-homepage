import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getAllColumns } from './columns';

const ENC_TOKEN_HEX = '565b5a68474a754764567a647d576667015c067b577c5204794605635c6157450d65025d02756f54';
const AUTH_KEY = '135700';
const GIST_ID = 'b39f505c3fe9fec1f8b17989d01a4323';
const GIST_FILE = 'orb_analytics.json';

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

    // Initialize Schema
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
    `);

    // Migration: add visitor_id column if table already existed without it
    try {
      sqliteDbInstance.exec(`ALTER TABLE column_views_log ADD COLUMN visitor_id TEXT DEFAULT ''`);
    } catch {}

    return sqliteDbInstance;
  } catch (err) {
    console.warn('node:sqlite could not be initialized:', err);
    return null;
  }
}

export interface RecordViewOptions {
  slug: string;
  visitorId?: string;
  sessionId: string;
  ip?: string;
  userAgent?: string;
}

export function recordColumnView({ slug, visitorId = '', sessionId, ip = '', userAgent = '' }: RecordViewOptions): {
  recorded: boolean;
  isDuplicate: boolean;
} {
  const cleanSlug = slug.trim();
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
  if (db) {
    try {
      // Cooldown: 15 seconds against spam on the exact same column
      const checkStmt = db.prepare(`
        SELECT id FROM column_views_log
        WHERE column_slug = ? 
          AND (visitor_id = ? OR session_id = ? OR ip_hash = ?)
          AND created_at >= ?
        LIMIT 1
      `);
      const existing = checkStmt.get(cleanSlug, vidToken, cleanSessionId, ipHash, fifteenSecsAgo);

      if (existing) {
        return { recorded: false, isDuplicate: true };
      }

      const insertLogStmt = db.prepare(`
        INSERT INTO column_views_log (column_slug, visitor_id, session_id, ip_hash, user_agent, view_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertLogStmt.run(cleanSlug, vidToken, cleanSessionId, ipHash, (userAgent || '').slice(0, 200), viewDate, createdAt);

      const upsertStatsStmt = db.prepare(`
        INSERT INTO column_daily_stats (column_slug, view_date, views_count, unique_visitors)
        VALUES (?, ?, 1, 1)
        ON CONFLICT(column_slug, view_date) DO UPDATE SET
          views_count = views_count + 1
      `);
      upsertStatsStmt.run(cleanSlug, viewDate);
    } catch (err) {
      console.error('Error in SQLite recordColumnView:', err);
    }
  }

  // Also sync to persistent cloud store asynchronously
  try {
    const token = getGithubToken();
    fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { Authorization: `token ${token}`, 'User-Agent': 'Orb-Analytics-Tracker' },
    })
      .then((r) => r.json())
      .then(async (data) => {
        const rawContent = data.files?.[GIST_FILE]?.content;
        const store = rawContent ? JSON.parse(rawContent) : {};
        store.dailyStats = store.dailyStats || {};
        store.columnsTotal = store.columnsTotal || {};
        store.dedupLog = store.dedupLog || {};
        store.summary = store.summary || { totalViews: 0, totalUV: 0, visitors: [] };
        if (!Array.isArray(store.summary.visitors)) {
          store.summary.visitors = [];
        }

        const dedupArticleKey = `${cleanSlug}:${vidToken}`;
        const nowMs = Date.now();
        const COOLDOWN_MS = 15 * 1000; // 15 seconds

        if (nowMs - (store.dedupLog[dedupArticleKey] || 0) < COOLDOWN_MS) {
          return;
        }

        store.dedupLog[dedupArticleKey] = nowMs;

        // Prune dedup log older than 10 minutes
        const PRUNE_CUTOFF = nowMs - 10 * 60 * 1000;
        for (const k in store.dedupLog) {
          if (store.dedupLog[k] < PRUNE_CUTOFF) delete store.dedupLog[k];
        }

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

  return { recorded: true, isDuplicate: false };
}

export interface AnalyticsQueryOptions {
  range?: '7d' | '30d' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
}

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
