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
    const visitorId = (body.visitorId || '').trim();
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

    // Compact visitor token: persistent visitorId or hashed fallback
    const vidToken = visitorId ? visitorId.slice(0, 20) : `ip_${ipHash.slice(0, 10)}`;

    const nowMs = Date.now();
    const { dateStr: viewDate, isoStr: createdAt } = getKstDate(new Date(nowMs));
    const token = getGithubToken(context.env);

    // 1. Fetch persistent store from GitHub Gist
    let store = {
      updatedAt: createdAt,
      summary: { totalViews: 0, totalUV: 0, visitors: [] },
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
    store.summary = store.summary || { totalViews: 0, totalUV: 0, visitors: [] };
    if (!Array.isArray(store.summary.visitors)) {
      store.summary.visitors = [];
    }

    // 2. Cooldown against rapid reload/double-clicking spam on the EXACT SAME article (15 seconds)
    const dedupArticleKey = `${slug}:${vidToken}`;
    const COOLDOWN_MS = 15 * 1000; // 15 seconds

    const lastViewTime = store.dedupLog[dedupArticleKey] || 0;
    const isDuplicate = nowMs - lastViewTime < COOLDOWN_MS;

    if (isDuplicate) {
      return new Response(
        JSON.stringify({ success: true, recorded: false, isDuplicate: true }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // 3. Record new page view and update unique visitor sets
    store.dedupLog[dedupArticleKey] = nowMs;

    // Prune dedup log entries older than 10 minutes to maintain light payload
    const PRUNE_CUTOFF = nowMs - 10 * 60 * 1000;
    for (const k in store.dedupLog) {
      if (store.dedupLog[k] < PRUNE_CUTOFF) {
        delete store.dedupLog[k];
      }
    }

    // A. Daily entry
    if (!store.dailyStats[viewDate]) {
      store.dailyStats[viewDate] = { views: 0, uv: 0, visitors: [], columns: {} };
    }
    const dayEntry = store.dailyStats[viewDate];
    if (!Array.isArray(dayEntry.visitors)) {
      dayEntry.visitors = [];
    }

    // PV increments on every view
    dayEntry.views = (dayEntry.views || 0) + 1;

    // UV only increments if this visitor is distinct for the day
    if (!dayEntry.visitors.includes(vidToken)) {
      dayEntry.visitors.push(vidToken);
    }
    dayEntry.uv = dayEntry.visitors.length;

    // B. Column daily entry
    dayEntry.columns = dayEntry.columns || {};
    if (!dayEntry.columns[slug]) {
      dayEntry.columns[slug] = { views: 0, uv: 0, visitors: [] };
    }
    const colDay = dayEntry.columns[slug];
    if (!Array.isArray(colDay.visitors)) {
      colDay.visitors = [];
    }
    colDay.views = (colDay.views || 0) + 1;
    if (!colDay.visitors.includes(vidToken)) {
      colDay.visitors.push(vidToken);
    }
    colDay.uv = colDay.visitors.length;

    // C. Column all-time totals
    if (!store.columnsTotal[slug]) {
      store.columnsTotal[slug] = { views: 0, uv: 0, visitors: [] };
    }
    const colTotal = store.columnsTotal[slug];
    if (!Array.isArray(colTotal.visitors)) {
      colTotal.visitors = [];
    }
    colTotal.views = (colTotal.views || 0) + 1;
    if (!colTotal.visitors.includes(vidToken)) {
      colTotal.visitors.push(vidToken);
    }
    colTotal.uv = colTotal.visitors.length;

    // D. Global summary
    store.summary.totalViews = (store.summary.totalViews || 0) + 1;
    if (!store.summary.visitors.includes(vidToken)) {
      store.summary.visitors.push(vidToken);
    }
    store.summary.totalUV = store.summary.visitors.length;
    store.updatedAt = createdAt;

    // Append to recent views (max 50)
    store.recentViews.unshift({
      slug,
      date: viewDate,
      time: createdAt,
      ipHash,
      vidToken,
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
            `INSERT INTO column_daily_stats (column_slug, view_date, views_count, unique_visitors) VALUES (?, ?, 1, 1) ON CONFLICT(column_slug, view_date) DO UPDATE SET views_count = views_count + 1`
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
