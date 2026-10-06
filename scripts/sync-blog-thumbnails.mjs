import fs from 'fs';
import path from 'path';

// Known logNo mapping for current columns
const SLUG_TO_LOGNO = {
  '신경성-위경련과-뒷목-뻣뻣함-굳어버린-장기와-근육을-푸는-천연-958747': '224414958747',
  'autonomic-dysregulation': '224428821373',
  'brainfog-recovery': '224421852305',
  'qeeg-guide': '224429314941',
};

const columnsDir = path.join(process.cwd(), 'content', 'columns');
const publicThumbDir = path.join(process.cwd(), 'public', 'images', 'columns', 'thumbnails');

if (!fs.existsSync(publicThumbDir)) {
  fs.mkdirSync(publicThumbDir, { recursive: true });
}

async function fetchNaverOfficialThumbnail(logNo) {
  const mUrl = `https://m.blog.naver.com/orbmed/${logNo}`;
  const res = await fetch(mUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15',
      'Referer': 'https://m.blog.naver.com/',
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status} when fetching ${mUrl}`);
  }
  const html = await res.text();
  const ogMatch =
    html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
  const thumbMatch = html.match(/"thumbnailUrl"\s*:\s*"([^"]+)"/i);

  const rawUrl = (ogMatch && ogMatch[1]) || (thumbMatch && thumbMatch[1]);
  if (!rawUrl) {
    throw new Error(`Could not find og:image or thumbnailUrl in ${mUrl}`);
  }
  return { rawUrl, html };
}

function extractUniqueHash(url) {
  // Extract hash (e.g. MDAxNzg5NjI1MjMzNjg5... or filename like KakaoTalk_...)
  const hashMatch = url.match(/(MDAx[a-zA-Z0-9_\.-]+)/i);
  if (hashMatch) return hashMatch[1];

  const fileMatch = url.match(/\/([^\/?#]+)\.(png|jpg|jpeg|webp)/i);
  if (fileMatch) return fileMatch[1];

  return null;
}

async function downloadThumbnail(postfilesUrl, logNo, ext = 'png') {
  const res = await fetch(postfilesUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://m.blog.naver.com/',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${postfilesUrl}: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const filePath = path.join(publicThumbDir, `thumb_${logNo}.${ext}`);
  fs.writeFileSync(filePath, buffer);

  // Also write duplicate as .png or .jpg so both file extensions exist
  const altExt = ext === 'png' ? 'jpg' : 'png';
  const altFilePath = path.join(publicThumbDir, `thumb_${logNo}.${altExt}`);
  fs.writeFileSync(altFilePath, buffer);

  return `/images/columns/thumbnails/thumb_${logNo}.${ext}`;
}

async function processAllColumns() {
  const files = fs.readdirSync(columnsDir).filter((f) => f.endsWith('.md'));
  console.log(`Found ${files.length} markdown files in ${columnsDir}\n`);

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const mdPath = path.join(columnsDir, file);
    const jsonPath = path.join(columnsDir, `${slug}.json`);
    let mdContent = fs.readFileSync(mdPath, 'utf8');

    // Determine logNo
    let logNo = SLUG_TO_LOGNO[slug];
    if (!logNo) {
      const numMatch = slug.match(/(\d{6,14})$/);
      if (numMatch) logNo = numMatch[1];
    }
    if (!logNo) {
      console.warn(`[SKIP] Could not determine logNo for ${slug}`);
      continue;
    }

    console.log(`----------------------------------------`);
    console.log(`Processing: ${slug} (logNo: ${logNo})`);

    // 1. Fetch Naver official thumbnail
    const { rawUrl: ogImageUrl } = await fetchNaverOfficialThumbnail(logNo);
    console.log(`  1. Official og:image URL: ${ogImageUrl}`);

    // 2. Extract unique hash / identifier
    const uniqueHash = extractUniqueHash(ogImageUrl);
    console.log(`  2. Extracted hash/key: ${uniqueHash}`);

    // 3. Extract all images in markdown body
    // Separate frontmatter from body
    const fmEndIdx = mdContent.indexOf('\n---', 4);
    const bodyContent = fmEndIdx !== -1 ? mdContent.slice(fmEndIdx + 4) : mdContent;
    const bodyImgMatches = [...bodyContent.matchAll(/!\[(.*?)\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+)\)/g)];
    console.log(`  3. Found ${bodyImgMatches.length} images in markdown body:`);
    bodyImgMatches.forEach((m, idx) => console.log(`     [${idx + 1}] ${m[2]}`));

    // 4. [매칭 1순위 - 본문 이미지 중 대표 사진 찾기]
    let matchedBodyImg = null;
    if (uniqueHash) {
      for (const m of bodyImgMatches) {
        const imgUrl = m[2];
        if (imgUrl.includes(uniqueHash)) {
          matchedBodyImg = imgUrl;
          break;
        }
      }
    }

    let finalThumbnail = '';
    let matchType = '';

    if (matchedBodyImg) {
      matchType = '1순위 (본문 이미지 매칭)';
      console.log(`  4. [1순위 성공] 본문 이미지와 해시 일치: ${matchedBodyImg}`);

      // If it's a remote URL, convert domain to postfiles.pstatic.net with ?type=w966 for guaranteed quality
      if (matchedBodyImg.startsWith('http')) {
        const postfilesImg = matchedBodyImg
          .replace('blogthumb.pstatic.net', 'postfiles.pstatic.net')
          .replace('mblogthumb-phinf.pstatic.net', 'postfiles.pstatic.net')
          .replace(/\?type=[^&]+/, '?type=w966');
        
        // Also download locally for 100% offline/local reliability
        const isJpg = postfilesImg.toUpperCase().includes('.JPG') || postfilesImg.toUpperCase().includes('.JPEG');
        const ext = isJpg ? 'jpg' : 'png';
        const localPath = await downloadThumbnail(postfilesImg, logNo, ext);
        console.log(`     -> Downloaded locally to: ${localPath}`);

        // Set the working postfiles path or local path
        // As requested: "그 본문 이미지의 정상 작동하는 경로(로컬 경로 또는 postfiles 경로)를 frontmatter의 thumbnail에 그대로 넣어줘!"
        finalThumbnail = postfilesImg;
      } else {
        finalThumbnail = matchedBodyImg;
      }
    } else {
      // 5. [매칭 2순위 - 도메인 변환으로 직접 다운로드]
      matchType = '2순위 (도메인 변환 직접 다운로드)';
      console.log(`  4. [2순위 실행] 본문 이미지 매칭 없음 -> postfiles 직접 변환 다운로드`);
      const postfilesUrl = ogImageUrl
        .replace('blogthumb.pstatic.net', 'postfiles.pstatic.net')
        .replace('mblogthumb-phinf.pstatic.net', 'postfiles.pstatic.net')
        .replace(/\?type=[^&]+/, '?type=w966');
      
      const isJpg = ogImageUrl.toUpperCase().includes('.JPG') || ogImageUrl.toUpperCase().includes('.JPEG');
      const ext = isJpg ? 'jpg' : 'png';
      const localPath = await downloadThumbnail(postfilesUrl, logNo, ext);
      console.log(`     -> Downloaded to: ${localPath}`);
      finalThumbnail = localPath;
    }

    console.log(`  5. Final thumbnail: ${finalThumbnail} (${matchType})`);

    // 6. Update markdown frontmatter
    const updatedMd = mdContent.replace(/^thumbnail:\s*["'][^"']*["']/m, `thumbnail: "${finalThumbnail}"`);
    fs.writeFileSync(mdPath, updatedMd, 'utf8');
    console.log(`  6. Updated ${file}`);

    // 7. Update json file if exists
    if (fs.existsSync(jsonPath)) {
      try {
        const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        jsonContent.thumbnail = finalThumbnail;
        jsonContent.updatedAt = '2026-10-06';
        fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2), 'utf8');
        console.log(`  7. Updated ${slug}.json`);
      } catch (err) {
        console.error(`  Failed to update JSON for ${slug}:`, err);
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`All columns successfully synchronized!`);
}

processAllColumns().catch((err) => {
  console.error('Fatal error during sync:', err);
  process.exit(1);
});
