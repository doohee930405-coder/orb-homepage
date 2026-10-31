// Cloudflare Pages Function: /api/analytics/track
// Records site-wide page views (PV) and unique visitors (UV) + individual column views
// with 15-second deduplication, bot filtering, and GitHub Gist cloud persistence.

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

function getFriendlyPageName(pagePath) {
  const clean = (pagePath || '').split('?')[0].replace(/\/+$/, '') || '/';
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

    const rawPath = typeof body.path === 'string' ? body.path.trim() : '';
    const rawSlug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const rawTitle = typeof body.title === 'string' ? body.title.trim() : '';
    const visitorId = (body.visitorId || '').trim();
    const sessionId = (body.sessionId || 'session').trim();

    // Validate: Either path or slug must be provided
    if (!rawPath && !rawSlug) {
      return new Response(
        JSON.stringify({ error: 'path or slug is required' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const cleanPath = (rawPath || (rawSlug ? `/columns/${rawSlug}` : '/')).split('?')[0].replace(/\/+$/, '') || '/';
    const cleanSlug = (rawSlug || (cleanPath.startsWith('/columns/') && cleanPath !== '/columns' ? cleanPath.replace('/columns/', '').trim() : '')).trim();
    const pageTitle = rawTitle || getFriendlyPageName(cleanPath);

    // Filter internal admin paths or API calls
    if (cleanPath.startsWith('/admin') || cleanPath.startsWith('/api')) {
      return new Response(
        JSON.stringify({ success: true, recorded: false, skipped: 'admin_path' }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const ip = context.request.headers.get('cf-connecting-ip') ||
      context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      '127.0.0.1';
    const userAgent = context.request.headers.get('user-agent') || '';

    // Filter out automated bots, crawlers, and AI agents
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
    const vidToken = visitorId ? visitorId.slice(0, 24) : `ip_${ipHash.slice(0, 10)}`;

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
      siteDailyStats: {},
      sitePagesTotal: {},
      siteSummary: { totalViews: 0, totalUV: 0, visitors: [] },
    };

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
        }
      }
    } catch (err) {
      console.warn('Gist fetch error:', err);
    }

    // Initialize data structures safely
    store.dailyStats = store.dailyStats || {};
    store.columnsTotal = store.columnsTotal || {};
    store.dedupLog = store.dedupLog || {};
    store.recentViews = store.recentViews || [];
    store.summary = store.summary || { totalViews: 0, totalUV: 0, visitors: [] };
    if (!Array.isArray(store.summary.visitors)) store.summary.visitors = [];

    store.siteDailyStats = store.siteDailyStats || {};
    store.sitePagesTotal = store.sitePagesTotal || {};
    store.siteSummary = store.siteSummary || { totalViews: 0, totalUV: 0, visitors: [] };
    if (!Array.isArray(store.siteSummary.visitors)) store.siteSummary.visitors = [];

    // 2. Cooldown against rapid reload/double-clicking spam (15 seconds per path/slug)
    const dedupKey = cleanSlug ? `col:${cleanSlug}:${vidToken}` : `site:${cleanPath}:${vidToken}`;
    const COOLDOWN_MS = 15 * 1000; // 15 seconds

    const lastViewTime = store.dedupLog[dedupKey] || 0;
    const isDuplicate = nowMs - lastViewTime < COOLDOWN_MS;

    if (isDuplicate) {
      return new Response(
        JSON.stringify({ success: true, recorded: false, isDuplicate: true }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // 3. Record new page view
    store.dedupLog[dedupKey] = nowMs;

    // Prune dedup log entries older than 15 minutes to keep Gist payload light
    const PRUNE_CUTOFF = nowMs - 15 * 60 * 1000;
    for (const k in store.dedupLog) {
      if (store.dedupLog[k] < PRUNE_CUTOFF) {
        delete store.dedupLog[k];
      }
    }

    // --- A. Site-wide tracking (All pages: /, /location, /diet, /treatments/*, /columns, /columns/[slug]) ---
    if (!store.siteDailyStats[viewDate]) {
      store.siteDailyStats[viewDate] = { views: 0, uv: 0, visitors: [], pages: {} };
    }
    const siteDayEntry = store.siteDailyStats[viewDate];
    siteDayEntry.pages = siteDayEntry.pages || {};
    if (!Array.isArray(siteDayEntry.visitors)) siteDayEntry.visitors = [];

    siteDayEntry.views = (siteDayEntry.views || 0) + 1;
    if (!siteDayEntry.visitors.includes(vidToken)) {
      siteDayEntry.visitors.push(vidToken);
    }
    siteDayEntry.uv = siteDayEntry.visitors.length;

    // Per-page daily entry
    if (!siteDayEntry.pages[cleanPath]) {
      siteDayEntry.pages[cleanPath] = { views: 0, uv: 0, visitors: [], name: pageTitle };
    }
    const pageDayEntry = siteDayEntry.pages[cleanPath];
    if (!Array.isArray(pageDayEntry.visitors)) pageDayEntry.visitors = [];
    pageDayEntry.views = (pageDayEntry.views || 0) + 1;
    pageDayEntry.name = pageTitle;
    if (!pageDayEntry.visitors.includes(vidToken)) {
      pageDayEntry.visitors.push(vidToken);
    }
    pageDayEntry.uv = pageDayEntry.visitors.length;

    // Page overall total
    if (!store.sitePagesTotal[cleanPath]) {
      store.sitePagesTotal[cleanPath] = { views: 0, name: pageTitle };
    }
    store.sitePagesTotal[cleanPath].views = (store.sitePagesTotal[cleanPath].views || 0) + 1;
    store.sitePagesTotal[cleanPath].name = pageTitle;

    // Site overall summary
    store.siteSummary.totalViews = (store.siteSummary.totalViews || 0) + 1;
    if (!store.siteSummary.visitors.includes(vidToken)) {
      store.siteSummary.visitors.push(vidToken);
    }
    store.siteSummary.totalUV = store.siteSummary.visitors.length;

    // --- B. Column-specific tracking (Only when an article is read) ---
    if (cleanSlug) {
      if (!store.dailyStats[viewDate]) {
        store.dailyStats[viewDate] = { views: 0, uv: 0, visitors: [], columns: {} };
      }
      const dayEntry = store.dailyStats[viewDate];
      if (!Array.isArray(dayEntry.visitors)) dayEntry.visitors = [];

      dayEntry.views = (dayEntry.views || 0) + 1;
      if (!dayEntry.visitors.includes(vidToken)) {
        dayEntry.visitors.push(vidToken);
      }
      dayEntry.uv = dayEntry.visitors.length;

      dayEntry.columns = dayEntry.columns || {};
      if (!dayEntry.columns[cleanSlug]) {
        dayEntry.columns[cleanSlug] = { views: 0, uv: 0, visitors: [] };
      }
      const colEntry = dayEntry.columns[cleanSlug];
      if (!Array.isArray(colEntry.visitors)) colEntry.visitors = [];
      colEntry.views = (colEntry.views || 0) + 1;
      if (!colEntry.visitors.includes(vidToken)) {
        colEntry.visitors.push(vidToken);
      }
      colEntry.uv = colEntry.visitors.length;

      // Column total
      if (!store.columnsTotal[cleanSlug]) {
        store.columnsTotal[cleanSlug] = { views: 0 };
      }
      store.columnsTotal[cleanSlug].views = (store.columnsTotal[cleanSlug].views || 0) + 1;

      // Global summary
      store.summary.totalViews = (store.summary.totalViews || 0) + 1;
      if (!store.summary.visitors.includes(vidToken)) {
        store.summary.visitors.push(vidToken);
      }
      store.summary.totalUV = store.summary.visitors.length;

      // Recent view log (keep last 50)
      store.recentViews.unshift({
        slug: cleanSlug,
        date: viewDate,
        time: createdAt,
        ipHash,
        vidToken,
      });
      if (store.recentViews.length > 50) {
        store.recentViews = store.recentViews.slice(0, 50);
      }
    }

    store.updatedAt = createdAt;

    // 4. Save updated store back to GitHub Gist asynchronously
    context.waitUntil(
      (async () => {
        try {
          await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: 'PATCH',
            headers: {
              Authorization: `token ${token}`,
              'Content-Type': 'application/json',
              'User-Agent': 'Orb-Analytics-Tracker',
            },
            body: JSON.stringify({
              files: {
                [GIST_FILE]: {
                  content: JSON.stringify(store),
                },
              },
            }),
          });
        } catch (e) {
          console.error('Async Gist save failed:', e);
        }
      })()
    );

    return new Response(
      JSON.stringify({
        success: true,
        recorded: true,
        viewDate,
        path: cleanPath,
        slug: cleanSlug || undefined,
        type: cleanSlug ? 'column' : 'site',
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error('Track error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal tracking error' }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
