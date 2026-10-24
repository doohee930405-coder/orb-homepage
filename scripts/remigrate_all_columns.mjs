import fs from 'fs';
import path from 'path';
import { convertNaverHtmlToMasterMarkdown } from '../app/lib/naverImporter.ts';
import { saveColumn } from '../app/lib/columns.ts';

const naverPosts = JSON.parse(
  fs.readFileSync('C:/Users/doohe/.gemini/antigravity/brain/1c63b403-d06b-4be1-8ecc-96df6e7a0569/scratch/all_naver_posts.json', 'utf8')
);

const dir = 'c:/Users/doohe/Downloads/orb-homepage-main/orb-homepage/content/columns';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));

const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1';

async function fetchPostHtml(logNo) {
  const mobileUrl = `https://m.blog.naver.com/orbmed/${logNo}`;
  try {
    const res = await fetch(mobileUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        Referer: 'https://m.blog.naver.com/',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    });
    if (res.ok) {
      const text = await res.text();
      if (text.includes('se-main-container') || text.includes('postViewArea')) {
        return text;
      }
    }
  } catch {}

  // Fallback to PC
  const pcUrl = `https://blog.naver.com/PostView.naver?blogId=orbmed&logNo=${logNo}&redirect=Dlog&widgetTypeCall=true`;
  const res = await fetch(pcUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Referer: 'https://blog.naver.com/orbmed',
    },
  });
  return res.text();
}

async function remigrateAll() {
  console.log(`Starting 1:1 re-migration of all ${files.length} columns from Naver blog 원문...`);

  const report = [];
  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(dir, file);
    const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Match logNo
    let logNo = '';
    const m = existing.slug.match(/(\d{6})$/);
    if (m) {
      const p = naverPosts.find((post) => post.logNo.endsWith(m[1]));
      if (p) logNo = p.logNo;
    }

    if (!logNo) {
      if (existing.slug === 'qeeg-guide') logNo = '224412844140';
      if (existing.slug === 'brainfog-recovery') logNo = '224421852305';
    }

    if (!logNo) {
      const cleanTitle = existing.title.replace(/[^가-힣a-zA-Z0-9]/g, '');
      const p = naverPosts.find((post) => {
        const pClean = post.title.replace(/[^가-힣a-zA-Z0-9]/g, '');
        return pClean.includes(cleanTitle.slice(0, 15)) || cleanTitle.includes(pClean.slice(0, 15));
      });
      if (p) logNo = p.logNo;
    }

    if (!logNo) {
      console.warn(`[SKIP] No Naver post matched for: ${existing.slug} (${existing.title})`);
      skipCount++;
      continue;
    }

    try {
      const html = await fetchPostHtml(logNo);
      if (!html || html.length < 500) {
        console.warn(`[WARN] HTML empty or too small for logNo ${logNo}`);
        skipCount++;
        continue;
      }

      const beforeH2 = (existing.content.match(/^##\s+/gm) || []).length;
      const beforeH3 = (existing.content.match(/^###\s+/gm) || []).length;
      const beforeU = (existing.content.match(/<u>/g) || []).length;
      const beforeB = (existing.content.match(/\*\*[^*]+\*\*/g) || []).length;

      const parsed = await convertNaverHtmlToMasterMarkdown(
        html,
        existing.title,
        existing.slug,
        existing.thumbnail,
        logNo
      );

      const afterH2 = (parsed.content.match(/^##\s+/gm) || []).length;
      const afterH3 = (parsed.content.match(/^###\s+/gm) || []).length;
      const afterU = (parsed.content.match(/<u>/g) || []).length;
      const afterB = (parsed.content.match(/\*\*[^*]+\*\*/g) || []).length;

      const updatedColumn = {
        ...existing,
        summary: parsed.summary || existing.summary,
        content: parsed.content,
        // Retain existing local thumbnail if already valid
        thumbnail: existing.thumbnail && !existing.thumbnail.startsWith('http') ? existing.thumbnail : (parsed.thumbnail || existing.thumbnail || ''),
        faqs: existing.faqs && existing.faqs.length > 0 ? existing.faqs : parsed.faqs,
      };

      saveColumn(updatedColumn);
      successCount++;

      report.push({
        slug: existing.slug,
        title: existing.title.slice(0, 35),
        logNo,
        h2: `${beforeH2} -> ${afterH2}`,
        h3: `${beforeH3} -> ${afterH3}`,
        u: `${beforeU} -> ${afterU}`,
        b: `${beforeB} -> ${afterB}`,
      });

      console.log(`[${i + 1}/${files.length}] Re-migrated: ${existing.slug} (H2: ${beforeH2}->${afterH2}, U: ${beforeU}->${afterU}, B: ${beforeB}->${afterB})`);
    } catch (err) {
      console.error(`[ERROR] Failed to re-migrate ${existing.slug}:`, err);
    }
  }

  console.log('\n======================================================');
  console.log(`Re-migration finished! Success: ${successCount}, Skipped: ${skipCount}, Total: ${files.length}`);
  console.log('======================================================\n');
  fs.writeFileSync(
    'C:/Users/doohe/.gemini/antigravity/brain/1c63b403-d06b-4be1-8ecc-96df6e7a0569/scratch/remigration_report.json',
    JSON.stringify(report, null, 2),
    'utf8'
  );
}

remigrateAll().catch(console.error);
