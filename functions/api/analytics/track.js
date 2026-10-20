// Cloudflare Pages Function: /api/analytics/track
// Records column page views and unique visitors with 30-minute deduplication and cloud persistence.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const ENC_TOKEN_HEX = '565b5a68474a754764567a647d576667015c067b577c5204794605635c6157450d65025d02756f54';
const AUTH_KEY = '135700';
const GIST_ID = 'b39f505c3fe9fec1f8b17989d01a4323';
const GIST_FILE = 'orb_analytics.json';

function getGithubToken(env) {
  if (env && env.GITHUB_TOKEN) return env.GITHUB_TOKEN;
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

function getKstDate(d = new Date()) {
  const kst = new Date(d.getTime() + 9 * 3600000);
  return {
    dateStr: kst.toISOString().slice(0, 10),
    isoStr: kst.toISOString(),
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    let body = {};
    try {
      const text = await context.request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      body = await context.request.json().catch(() => ({}));
    }

    const slug = (body.slug || '').trim();
    const sessionId = (body.sessionId || 'session').trim();

    if (!slug) {
      return new Response(JSON.stringify({ error: 'slug is required' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const ip = context.request.headers.get('cf-connecting-ip') ||
      context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      '127.0.0.1';
    const userAgent = context.request.headers.get('user-agent') || '';

    // Filter out bots, automated crawlers, and AI agents
    const uaLower = userAgent.toLowerCase();
    const isBot =
      uaLower.includes('bot') ||
      uaLower.includes('crawler') ||
      uaLower.includes('spider') ||
      uaLower.includes('googlebot') ||
      uaLower.includes('bingbot') ||
      uaLower.includes('yeti') ||
      uaLower.includes('daum') ||
      uaLower.includes('slurp') ||
      uaLower.includes('headlesschrome') ||
      uaLower.includes('lighthouse') ||
      uaLower.includes('bytespider') ||
      uaLower.includes('gptbot') ||
      uaLower.includes('claude') ||
      uaLower.includes('perplexity') ||
      uaLower.includes('semrush') ||
      uaLower.includes('ahrefs');

    if (isBot) {
      return new Response(
        JSON.stringify({ success: true, recorded: false, isBot: true }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // SHA-256 hash for IP privacy
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      enc.encode(`${ip}-${userAgent}-orb-2026`)
    );
    const ipHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 16);

    const nowMs = Date.now();
    const { dateStr: viewDate, isoStr: createdAt } = getKstDate(new Date(nowMs));
    const token = getGithubToken(context.env);

    // 1. Fetch persistent store from GitHub Gist
    let store = {
      updatedAt: createdAt,
      summary: { totalViews: 0, totalUV: 0 },
      dailyStats: {},
      columnsTotal: {},
      dedupLog: {},
      recentViews: [],
    };

    let gistSuccess = false;
    try {
      const gistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        headers: {
          Authorization: `token ${token}`,
          'User-Agent': 'Orb-Analytics-Tracker',
        },
      });

      if (gistRes.ok) {
        const gistData = await gistRes.json();
        const rawContent = gistData.files?.[GIST_FILE]?.content;
        if (rawContent) {
          store = JSON.parse(rawContent);
          gistSuccess = true;
        }
      }
    } catch (err) {
      console.warn('Gist fetch error:', err);
    }

    store.dailyStats = store.dailyStats || {};
    store.columnsTotal = store.columnsTotal || {};
    store.dedupLog = store.dedupLog || {};
    store.recentViews = store.recentViews || [];
    store.summary = store.summary || { totalViews: 0, totalUV: 0 };

    // 2. Check 30-minute deduplication (per-column & per-session/ip)
    const dedupSessionKey = `${slug}:sess_${sessionId}`;
    const dedupIpKey = `${slug}:ip_${ipHash}`;
    const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

    const lastSessionTime = store.dedupLog[dedupSessionKey] || 0;
    const lastIpTime = store.dedupLog[dedupIpKey] || 0;

    const isDuplicate =
      nowMs - lastSessionTime < COOLDOWN_MS || nowMs - lastIpTime < COOLDOWN_MS;

    if (isDuplicate) {
      return new Response(
        JSON.stringify({ success: true, recorded: false, isDuplicate: true }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // 3. Record new unique visit
    // Update dedup timestamps
    store.dedupLog[dedupSessionKey] = nowMs;
    store.dedupLog[dedupIpKey] = nowMs;

    // Prune entries older than 60 minutes to maintain light payload
    const PRUNE_CUTOFF = nowMs - 60 * 60 * 1000;
    for (const k in store.dedupLog) {
      if (store.dedupLog[k] < PRUNE_CUTOFF) {
        delete store.dedupLog[k];
      }
    }

    // Initialize daily entry if not exists
    if (!store.dailyStats[viewDate]) {
      store.dailyStats[viewDate] = { views: 0, uv: 0, columns: {} };
    }
    const dayEntry = store.dailyStats[viewDate];
    dayEntry.views = (dayEntry.views || 0) + 1;
    dayEntry.uv = (dayEntry.uv || 0) + 1;

    dayEntry.columns = dayEntry.columns || {};
    if (!dayEntry.columns[slug]) {
      dayEntry.columns[slug] = { views: 0, uv: 0 };
    }
    dayEntry.columns[slug].views = (dayEntry.columns[slug].views || 0) + 1;
    dayEntry.columns[slug].uv = (dayEntry.columns[slug].uv || 0) + 1;

    // Update column all-time totals
    if (!store.columnsTotal[slug]) {
      store.columnsTotal[slug] = { views: 0, uv: 0 };
    }
    store.columnsTotal[slug].views = (store.columnsTotal[slug].views || 0) + 1;
    store.columnsTotal[slug].uv = (store.columnsTotal[slug].uv || 0) + 1;

    // Update global summary
    store.summary.totalViews = (store.summary.totalViews || 0) + 1;
    store.summary.totalUV = (store.summary.totalUV || 0) + 1;
    store.updatedAt = createdAt;

    // Append to recent views (max 50)
    store.recentViews.unshift({
      slug,
      date: viewDate,
      time: createdAt,
      ipHash,
    });
    if (store.recentViews.length > 50) {
      store.recentViews = store.recentViews.slice(0, 50);
    }

    // 4. Save to persistent Gist in background
    try {
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
    } catch (patchErr) {
      console.error('Failed to update analytics gist:', patchErr);
    }

    // 5. Cloudflare D1 integration if bound
    if (context.env && context.env.DB) {
      try {
        await context.env.DB.batch([
          context.env.DB.prepare(
            `INSERT INTO column_views_log (column_slug, session_id, ip_hash, user_agent, view_date, created_at) VALUES (?, ?, ?, ?, ?, ?)`
          ).bind(slug, sessionId, ipHash, userAgent.slice(0, 200), viewDate, createdAt),
          context.env.DB.prepare(
            `INSERT INTO column_daily_stats (column_slug, view_date, views_count, unique_visitors) VALUES (?, ?, 1, 1) ON CONFLICT(column_slug, view_date) DO UPDATE SET views_count = views_count + 1, unique_visitors = unique_visitors + 1`
          ).bind(slug, viewDate),
        ]);
      } catch (d1Err) {
        console.warn('D1 batch write skipped:', d1Err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, recorded: true, isDuplicate: false }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'tracking failed' }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
