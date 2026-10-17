const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'content', 'columns');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

console.log(`Scanning ${files.length} column files...\n`);

const allMatches = [];

files.forEach(f => {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const summary = d.summary || '';
  const content = d.content || '';

  const fileReport = {
    file: f,
    title: d.title,
    category: d.category,
    summaryQeeg: [],
    summaryKyunghyang: [],
    summaryDoum: [],
    summaryTherapy: [],
    contentQeeg: [],
    contentKyunghyang: [],
    contentDoum: [],
    contentTherapy: []
  };

  // Helper to test
  function testText(text, targetObj, prefix) {
    // 1. QEEG/HRV boilerplate pattern
    // e.g. QEEG/뇌파 + HRV/심박변이도/생체 신호 + 참고/활용/기반/지표/기록
    const qeegRegex = /[^.!?\n]*?(?:습식\s*정량화\s*뇌파|습식\s*뇌파|QEEG)[^.!?\n]*?(?:심박변이도|자율신경|HRV|생체\s*신호)[^.!?\n]*?(?:참고\s*자료로\s*활용|참고\s*자료|활용하여|기반으로|참고하고|기록·참고하고|바탕으로)[^.!?\n]*?[.!?\n]/gi;
    let m;
    while ((m = qeegRegex.exec(text)) !== null) {
      targetObj[prefix + 'Qeeg'].push(m[0].trim());
    }

    // 2. Kyunghyang
    const kRegex = /[^.!?\n]*?경향을\s*보입니다[^.!?\n]*?[.!?\n]/g;
    while ((m = kRegex.exec(text)) !== null) {
      targetObj[prefix + 'Kyunghyang'].push(m[0].trim());
    }

    // 3. Doum
    const dRegex = /[^.!?\n]*?도움을\s*줄\s*수\s*있습니다[^.!?\n]*?[.!?\n]/g;
    while ((m = dRegex.exec(text)) !== null) {
      targetObj[prefix + 'Doum'].push(m[0].trim());
    }

    // 4. Therapy listing
    const tRegex = /[^.!?\n]*?(?:한약[·,\s]+추나[·,\s]+침구|한약[·,\s]+침구[·,\s]+추나|추나[·,\s]+한약[·,\s]+침구|한약과\s*추나\s*치료|맞춤\s*한약,\s*추나,\s*침구)[^.!?\n]*?[.!?\n]/g;
    while ((m = tRegex.exec(text)) !== null) {
      targetObj[prefix + 'Therapy'].push(m[0].trim());
    }
  }

  testText(summary, fileReport, 'summary');
  testText(content, fileReport, 'content');

  const totalHits = fileReport.summaryQeeg.length + fileReport.summaryKyunghyang.length +
                    fileReport.summaryDoum.length + fileReport.summaryTherapy.length +
                    fileReport.contentQeeg.length + fileReport.contentKyunghyang.length +
                    fileReport.contentDoum.length + fileReport.contentTherapy.length;

  if (totalHits > 0) {
    allMatches.push(fileReport);
  }
});

console.log(`Files with pattern hits: ${allMatches.length} / ${files.length}\n`);

allMatches.forEach((r, idx) => {
  console.log(`=== [${idx + 1}] ${r.file} (${r.category}) ===`);
  if (r.summaryQeeg.length) console.log('  [Summary QEEG]:', r.summaryQeeg);
  if (r.summaryKyunghyang.length) console.log('  [Summary 경향]:', r.summaryKyunghyang);
  if (r.summaryDoum.length) console.log('  [Summary 도움]:', r.summaryDoum);
  if (r.summaryTherapy.length) console.log('  [Summary 치료]:', r.summaryTherapy);
  if (r.contentQeeg.length) console.log('  [Content QEEG]:', r.contentQeeg);
  if (r.contentKyunghyang.length) console.log('  [Content 경향]:', r.contentKyunghyang);
  if (r.contentDoum.length) console.log('  [Content 도움]:', r.contentDoum);
  if (r.contentTherapy.length) console.log('  [Content 치료]:', r.contentTherapy);
});
