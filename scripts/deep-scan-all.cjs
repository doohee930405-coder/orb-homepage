const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'content', 'columns');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

const results = [];

files.forEach(f => {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const summary = d.summary || '';
  const content = d.content || '';
  const fullText = summary + '\n\n' + content;

  // Split into sentences (by period, question mark, exclamation mark, or newline)
  // But preserve sentences cleanly
  const rawSentences = fullText.split(/(?<=[.!?\n])/).map(s => s.trim()).filter(Boolean);

  const qeegMatches = [];
  const kyunghyangMatches = [];
  const doumMatches = [];
  const therapyMatches = [];

  rawSentences.forEach(s => {
    // 1. QEEG / HRV pattern: mentions QEEG or 뇌파 and HRV or 심박변이도, with reference/utilization/test
    if (/(?:습식\s*정량화\s*뇌파|습식\s*뇌파|정량화\s*뇌파|정량뇌파|QEEG)[^\n]*?(?:심박변이도|자율신경|HRV)[^\n]*?(?:참고|활용|자료로|기반으로|통해|대조|판독|측정)/i.test(s) ||
        /(?:심박변이도|자율신경|HRV)[^\n]*?(?:습식\s*정량화\s*뇌파|습식\s*뇌파|정량화\s*뇌파|정량뇌파|QEEG)[^\n]*?(?:참고|활용|자료로|기반으로|통해|대조|판독|측정)/i.test(s)) {
      // Exclude markdown headings like "## 습식 정량화 뇌파(qEEG)와 HRV로 짚어보는..."
      if (!s.startsWith('#')) {
        qeegMatches.push(s);
      }
    }

    // 2. Kyunghyang pattern: ends with or contains 경향을 보입니다 / 경향이 있습니다 / 경향을 띱니다
    if (/경향을\s*보입니다|경향이\s*있습니다|경향을\s*띱니다|경향을\s*나타냅니다/.test(s)) {
      kyunghyangMatches.push(s);
    }

    // 3. Doum pattern: ends with or contains 도움을 줄 수 있습니다 / 도움이 될 수 있습니다
    if (/도움을\s*줄\s*수\s*있습니다|도움이\s*될\s*수\s*있습니다|도움을\s*줍니다/.test(s)) {
      doumMatches.push(s);
    }

    // 4. Therapy pattern: 한약, 추나, 침구 combination listings
    if (/(?:한약[·,\s]+추나[·,\s]+침구|한약[·,\s]+침구[·,\s]+추나|추나[·,\s]+한약[·,\s]+침구|한약과\s*추나\s*치료|맞춤\s*한약,\s*추나,\s*침구)/.test(s)) {
      therapyMatches.push(s);
    }
  });

  if (qeegMatches.length || kyunghyangMatches.length || doumMatches.length || therapyMatches.length) {
    results.push({
      file: f,
      title: d.title,
      category: d.category,
      qeeg: qeegMatches,
      kyunghyang: kyunghyangMatches,
      doum: doumMatches,
      therapy: therapyMatches
    });
  }
});

console.log(`Deep scan matched ${results.length} files out of ${files.length}\n`);

// Summary count by category
let totalQ = 0, totalK = 0, totalD = 0, totalT = 0;
results.forEach(r => {
  totalQ += r.qeeg.length;
  totalK += r.kyunghyang.length;
  totalD += r.doum.length;
  totalT += r.therapy.length;
});
console.log(`Total sentence occurrences:`);
console.log(`- QEEG/HRV sentences: ${totalQ}`);
console.log(`- 경향 endings: ${totalK}`);
console.log(`- 도움 endings: ${totalD}`);
console.log(`- 치료법 listings: ${totalT}`);

// Print details
results.forEach((r, idx) => {
  console.log(`\n[${idx + 1}] ${r.file} (${r.category})`);
  if (r.qeeg.length) console.log('  QEEG/HRV (' + r.qeeg.length + '):', r.qeeg);
  if (r.kyunghyang.length) console.log('  경향 (' + r.kyunghyang.length + '):', r.kyunghyang);
  if (r.doum.length) console.log('  도움 (' + r.doum.length + '):', r.doum);
  if (r.therapy.length) console.log('  치료 (' + r.therapy.length + '):', r.therapy);
});
