import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '../../../lib/auth';
import { extractFirstLocalImage, getAllColumns, resyncAllColumnThumbnails, sanitizeAllExistingColumnsOnDisk, saveColumn } from '../../../lib/columns';
import {
  downloadThumbnail,
  fetchNaverBlogPosts,
  importSingleNaverPost,
  matchCategory,
  normalizeNaverUrl,
} from '../../../lib/naverImporter';

export async function POST(req: Request) {
  // 1. Admin Authentication Check
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { error: '관리자 인증이 필요합니다. 로그인 후 다시 시도해 주세요.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const action = body.action || 'list';

    // Action 1: Discover & List Posts by Blog ID
    if (action === 'list' || action === 'discover') {
      const blogId = (body.blogId || '').trim();
      if (!blogId) {
        return NextResponse.json(
          { error: '조회할 네이버 블로그 ID를 입력해 주세요.' },
          { status: 400 }
        );
      }

      const maxPosts = body.maxPosts || 500;
      const posts = await fetchNaverBlogPosts(blogId, maxPosts);

      return NextResponse.json({
        success: true,
        blogId,
        totalFound: posts.length,
        posts,
      });
    }

    // Action 2: Batch Import Selected Posts
    if (action === 'import-batch') {
      const posts = body.posts;
      if (!Array.isArray(posts) || posts.length === 0) {
        return NextResponse.json(
          { error: '가져올 글 목록이 비어 있습니다.' },
          { status: 400 }
        );
      }

      const results = [];
      let successCount = 0;
      let skippedCount = 0;
      let failCount = 0;

      for (const item of posts) {
        try {
          const col = await importSingleNaverPost({
            url: item.url,
            blogId: item.blogId,
            logNo: item.logNo,
            categoryName: item.categoryName,
            forceCategory: item.forceCategory,
            title: item.title,
            thumbnailUrl: item.thumbnailUrl,
            overwrite: body.overwrite !== false,
          });

          if (col.skipped) {
            skippedCount++;
            results.push({
              logNo: item.logNo || col.slug,
              title: col.title,
              slug: col.slug,
              category: col.category,
              date: col.date,
              success: true,
              skipped: true,
              reason: col.skipReason,
            });
          } else {
            successCount++;
            results.push({
              logNo: item.logNo || col.slug,
              title: col.title,
              slug: col.slug,
              category: col.category,
              date: col.date,
              success: true,
              skipped: false,
            });
          }
        } catch (err: any) {
          console.error(`[Migration Error] logNo: ${item.logNo || 'unknown'}, error: ${err.message || err}`);
          results.push({
            logNo: item.logNo || '',
            title: item.title || item.url,
            success: false,
            error: err.message || '글 이전 중 알 수 없는 오류 발생',
          });
          failCount++;
        }
      }

      return NextResponse.json({
        success: true,
        total: posts.length,
        successCount,
        skippedCount,
        failCount,
        results,
      });
    }

    // Action 3: Import Multi-line Direct URLs
    if (action === 'import-urls') {
      const rawUrls: string[] = Array.isArray(body.urls)
        ? body.urls
        : typeof body.urlsText === 'string'
        ? body.urlsText.split('\n')
        : [];

      const cleanUrls = rawUrls
        .map((u) => u.trim())
        .filter((u) => Boolean(u) && (u.includes('blog.naver.com') || /^\d{8,14}$/.test(u)));

      if (cleanUrls.length === 0) {
        return NextResponse.json(
          { error: '가져올 유효한 네이버 블로그 URL을 최소 1개 이상 입력해 주세요.' },
          { status: 400 }
        );
      }

      const results = [];
      let successCount = 0;
      let skippedCount = 0;
      let failCount = 0;

      for (const url of cleanUrls) {
        try {
          const col = await importSingleNaverPost({
            url,
            forceCategory: body.forceCategory || undefined,
            overwrite: body.overwrite !== false,
          });

          if (col.skipped) {
            skippedCount++;
            results.push({
              logNo: col.slug,
              title: col.title,
              slug: col.slug,
              category: col.category,
              date: col.date,
              success: true,
              skipped: true,
              reason: col.skipReason,
            });
          } else {
            successCount++;
            results.push({
              logNo: col.slug,
              title: col.title,
              slug: col.slug,
              category: col.category,
              date: col.date,
              success: true,
              skipped: false,
            });
          }
        } catch (err: any) {
          console.error(`[Migration Error] logNo: ${url}, error: ${err.message || err}`);
          results.push({
            logNo: url,
            title: url,
            success: false,
            error: err.message || '글 이전 중 알 수 없는 오류 발생',
          });
          failCount++;
        }
      }

      return NextResponse.json({
        success: true,
        total: cleanUrls.length,
        successCount,
        skippedCount,
        failCount,
        results,
      });
    }

    // Action 4: Category Preview Helper
    if (action === 'match-category') {
      const categoryName = body.categoryName || '';
      const title = body.title || '';
      const matchedCategory = matchCategory(categoryName, title, '');
      return NextResponse.json({ success: true, matchedCategory });
    }

    // Action 5: Sync & Update Thumbnails of Existing Columns from Naver Blog
    if (action === 'sync-thumbnails') {
      const sanitizeResult = sanitizeAllExistingColumnsOnDisk();
      const resyncResult = await resyncAllColumnThumbnails();

      return NextResponse.json({
        success: true,
        totalChecked: resyncResult.totalChecked,
        updatedCount: resyncResult.updatedCount,
        sanitizedFiles: sanitizeResult.cleanedCount,
      });
    }

    // Action 6: Sanitize all columns on disk from internal JS scripts
    if (action === 'sanitize' || action === 'sanitize-all') {
      const result = sanitizeAllExistingColumnsOnDisk();
      return NextResponse.json({
        success: true,
        scannedCount: result.scannedCount,
        cleanedCount: result.cleanedCount,
      });
    }

    return NextResponse.json(
      { error: `알 수 없는 action 파라미터입니다: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Naver blog import API error:', error);
    return NextResponse.json(
      { error: error.message || '서버 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
