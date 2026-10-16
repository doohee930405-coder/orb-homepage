const DEFAULT_REPO = 'doohee930405-coder/orb-homepage';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-github-token',
  'Content-Type': 'application/json',
};

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

function getGithubConfig(context) {
  const token =
    context.request.headers.get('x-github-token') ||
    (context.env && (context.env.GITHUB_TOKEN || context.env.GH_TOKEN)) ||
    '';
  const repo =
    (context.env && context.env.GITHUB_REPO) ||
    DEFAULT_REPO;
  return { token, repo };
}

async function getFileSha(repo, filePath, token) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}?ref=main`, {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Orb-Admin',
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.sha;
    }
  } catch {}
  return undefined;
}

async function commitFileToGithub(repo, filePath, contentStr, message, token) {
  const sha = await getFileSha(repo, filePath, token);
  const b64 = toBase64(contentStr);

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'Orb-Admin',
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message,
      content: b64,
      branch: 'main',
      ...(sha ? { sha } : {}),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `GitHub commit failed (${res.status})`);
  }
  return data;
}

async function deleteFileFromGithub(repo, filePath, message, token) {
  const sha = await getFileSha(repo, filePath, token);
  if (!sha) return { deleted: false, reason: 'File does not exist on GitHub' };

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'Orb-Admin',
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message,
      sha,
      branch: 'main',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `GitHub delete failed (${res.status})`);
  }
  return data;
}

function formatColumnToMarkdown(col) {
  const tagsStr = Array.isArray(col.tags) ? col.tags.join(', ') : '';
  const faqsJson = Array.isArray(col.faqs) && col.faqs.length > 0 ? JSON.stringify(col.faqs) : '[]';

  return `---
title: "${(col.title || '').replace(/"/g, '\\"')}"
slug: "${col.slug}"
category: "${col.category || '자율신경실조증'}"
author: "${col.author || '전두희 원장'}"
date: "${col.date || new Date().toISOString().slice(0, 10)}"
tags: [${tagsStr ? `"${col.tags.join('", "')}"` : ''}]
thumbnail: "${col.thumbnail || ''}"
summary: "${(col.summary || '').replace(/"/g, '\\"').replace(/\n/g, ' ')}"
faqs: ${faqsJson}
---

${col.content || ''}
`;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  // 1. Try static assets fetch first
  try {
    if (context.env && context.env.ASSETS) {
      const assetRes = await context.env.ASSETS.fetch(new Request(new URL('/api/columns.json', context.request.url)));
      if (assetRes.ok) {
        const text = await assetRes.text();
        return new Response(text, { status: 200, headers: CORS_HEADERS });
      }
    }
  } catch {}

  // 2. Direct fetch to local static asset
  try {
    const staticRes = await fetch(new URL('/api/columns.json', context.request.url).toString());
    if (staticRes.ok) {
      const data = await staticRes.json();
      return new Response(JSON.stringify(data), { status: 200, headers: CORS_HEADERS });
    }
  } catch {}

  // 3. Fallback to GitHub contents listing
  try {
    const { token, repo } = getGithubConfig(context);
    const ghRes = await fetch(`https://api.github.com/repos/${repo}/contents/content/columns?ref=main`, {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Orb-Admin',
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    if (ghRes.ok) {
      const files = await ghRes.json();
      const jsonFiles = Array.isArray(files) ? files.filter(f => f.name.endsWith('.json')) : [];
      // Fetch up to 100 columns
      const cols = [];
      for (const jf of jsonFiles.slice(0, 100)) {
        try {
          const itemRes = await fetch(jf.download_url);
          if (itemRes.ok) cols.push(await itemRes.json());
        } catch {}
      }
      cols.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return new Response(JSON.stringify({ success: true, columns: cols }), { status: 200, headers: CORS_HEADERS });
    }
  } catch {}

  return new Response(JSON.stringify({ success: true, columns: [] }), { status: 200, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  return handleSaveColumn(context, false);
}

export async function onRequestPut(context) {
  return handleSaveColumn(context, true);
}

async function handleSaveColumn(context, isUpdate) {
  try {
    const body = await context.request.json();
    if (!body.title || !body.title.trim()) {
      return new Response(JSON.stringify({ success: false, error: '제목을 입력해 주세요.' }), { status: 400, headers: CORS_HEADERS });
    }

    const { token, repo } = getGithubConfig(context);

    let slug = (body.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!slug) {
      slug = `column-${Date.now()}`;
    }

    const col = {
      id: body.id || `col-${slug}`,
      slug,
      title: body.title.trim(),
      summary: (body.summary || '').trim(),
      content: (body.content || '').trim(),
      category: body.category || '자율신경실조증',
      author: body.author || '전두희 원장',
      date: body.date || new Date().toISOString().slice(0, 10),
      tags: Array.isArray(body.tags) ? body.tags : [],
      thumbnail: body.thumbnail || '',
      updatedAt: new Date().toISOString().slice(0, 10),
      faqs: Array.isArray(body.faqs) ? body.faqs : [],
    };

    const jsonStr = JSON.stringify(col, null, 2);
    const mdStr = formatColumnToMarkdown(col);

    // Commit .json and .md to GitHub
    await commitFileToGithub(repo, `content/columns/${slug}.json`, jsonStr, `feat(column): ${isUpdate ? 'update' : 'publish'} ${slug}.json`, token);
    await commitFileToGithub(repo, `content/columns/${slug}.md`, mdStr, `feat(column): ${isUpdate ? 'update' : 'publish'} ${slug}.md`, token);

    // If slug was renamed during update, delete old files
    if (body.originalSlug && body.originalSlug !== slug) {
      try {
        await deleteFileFromGithub(repo, `content/columns/${body.originalSlug}.json`, `chore: remove renamed column ${body.originalSlug}.json`, token);
        await deleteFileFromGithub(repo, `content/columns/${body.originalSlug}.md`, `chore: remove renamed column ${body.originalSlug}.md`, token);
      } catch {}
    }

    return new Response(
      JSON.stringify({
        success: true,
        column: col,
        message: '칼럼이 저장되어 GitHub에 자동 커밋되었습니다. Cloudflare에서 사이트가 자동 재배포됩니다 (약 1분 소요).',
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || '저장 중 오류가 발생했습니다.' }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function onRequestDelete(context) {
  try {
    const url = new URL(context.request.url);
    const slug = url.searchParams.get('slug');
    if (!slug) {
      return new Response(JSON.stringify({ success: false, error: '삭제할 칼럼의 slug가 필요합니다.' }), { status: 400, headers: CORS_HEADERS });
    }

    const { token, repo } = getGithubConfig(context);

    await deleteFileFromGithub(repo, `content/columns/${slug}.json`, `chore(column): delete column ${slug}.json`, token);
    await deleteFileFromGithub(repo, `content/columns/${slug}.md`, `chore(column): delete column ${slug}.md`, token);

    return new Response(
      JSON.stringify({
        success: true,
        message: `"${slug}" 칼럼이 GitHub에서 삭제되었습니다. Cloudflare에서 자동 재배포가 시작됩니다.`,
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || '삭제 중 오류가 발생했습니다.' }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
