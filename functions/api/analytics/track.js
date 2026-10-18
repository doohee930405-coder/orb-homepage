// Cloudflare Pages Function: /api/analytics/track
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const slug = (body.slug || '').trim();
    const sessionId = (body.sessionId || 'session').trim();

    if (!slug) {
      return new Response(JSON.stringify({ error: 'slug is required' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const ip = context.request.headers.get('cf-connecting-ip') || '127.0.0.1';
    const userAgent = context.request.headers.get('user-agent') || '';

    // If Cloudflare D1 database binding 'DB' is available
    if (context.env && context.env.DB) {
      const now = new Date();
      const viewDate = now.toISOString().slice(0, 10);
      const createdAt = now.toISOString();
      const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

      // Simple one-way hash for IP privacy
      const enc = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        enc.encode(`${ip}-${userAgent}-orb-2026`)
      );
      const ipHash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16);

      // Check deduplication
      const existing = await context.env.DB.prepare(
        `SELECT id FROM column_views_log WHERE column_slug = ? AND (session_id = ? OR ip_hash = ?) AND created_at >= ? LIMIT 1`
      )
        .bind(slug, sessionId, ipHash, thirtyMinsAgo)
        .first();

      if (existing) {
        return new Response(
          JSON.stringify({ success: true, recorded: false, isDuplicate: true }),
          { status: 200, headers: CORS_HEADERS }
        );
      }

      // Insert log & upsert stats
      await context.env.DB.batch([
        context.env.DB.prepare(
          `INSERT INTO column_views_log (column_slug, session_id, ip_hash, user_agent, view_date, created_at) VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(slug, sessionId, ipHash, userAgent.slice(0, 200), viewDate, createdAt),
        context.env.DB.prepare(
          `INSERT INTO column_daily_stats (column_slug, view_date, views_count, unique_visitors) VALUES (?, ?, 1, 1) ON CONFLICT(column_slug, view_date) DO UPDATE SET views_count = views_count + 1, unique_visitors = unique_visitors + 1`
        ).bind(slug, viewDate),
      ]);

      return new Response(
        JSON.stringify({ success: true, recorded: true, isDuplicate: false }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({ success: true, recorded: true, isDuplicate: false, note: 'standalone mode' }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'tracking failed' }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
