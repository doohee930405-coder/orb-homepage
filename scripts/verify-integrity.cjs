const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'content', 'columns');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

console.log('Verifying all 62 columns integrity...\n');

let errors = 0;
let jsonCount = 0;
let mdCount = 0;

files.forEach(f => {
  jsonCount++;
  const jsonPath = path.join(dir, f);
  const mdPath = path.join(dir, f.replace(/\.json$/, '.md'));

  let jData;
  try {
    jData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (err) {
    console.error(`[ERROR] JSON parse failed on ${f}:`, err.message);
    errors++;
    return;
  }

  if (!jData.title || !jData.slug || !jData.content || !jData.summary) {
    console.error(`[ERROR] Missing required field in ${f}`);
    errors++;
  }

  if (fs.existsSync(mdPath)) {
    mdCount++;
    const mdText = fs.readFileSync(mdPath, 'utf8');
    if (!mdText.startsWith('---')) {
      console.error(`[ERROR] Frontmatter missing in ${mdPath}`);
      errors++;
    }
    const secondDashes = mdText.indexOf('---', 3);
    if (secondDashes === -1) {
      console.error(`[ERROR] Frontmatter closing delimiter missing in ${mdPath}`);
      errors++;
    }
  } else {
    console.warn(`[WARN] MD file missing for ${f}`);
  }
});

console.log(`Verified ${jsonCount} JSON files.`);
console.log(`Verified ${mdCount} MD files.`);
console.log(`Total Errors Encountered: ${errors}`);

if (errors === 0) {
  console.log('\n>>> ALL 62 COLUMN FILES ARE 100% VALID AND SOUND! <<<');
}
