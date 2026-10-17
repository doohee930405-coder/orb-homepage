const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'content', 'columns');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

const results = [];

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const text = (d.summary || '') + '\n' + (d.content || '');
  
  // 1. QEEG/HRV pattern
  const qeegMatches = text.match(/[^.\n]*?(?:습식\s*정량화\s*뇌파|QEEG)[^.\n]*?(?:HRV|심박변이도|생체\s*신호)[^.\n]*?(?:참고\s*자료|활용|데이터|지표|기록)[^.\n]*?[.!\n]/gi) || [];
  
  // 2. Ending patterns: 경향을 보입니다 / 도움을 줄 수 있습니다
  const kyunghyangMatches = text.match(/[^.\n]*?경향(?:을\s*보입니다|이\s*있습니다|을\s*띱니다)[^.\n]*?[.!\n]/gi) || [];
  const doumMatches = text.match(/[^.\n]*?도움을\s*줄\s*수\s*있습니다[^.\n]*?[.!\n]/gi) || [];
  
  // 3. Therapy listing pattern: 한약·추나·침구 or similar
  const therapyMatches = text.match(/[^.\n]*?(?:한약[·,\s]+추나[·,\s]+침구|한약[·,\s]+침구[·,\s]+추나|추나[·,\s]+한약[·,\s]+침구)[^.\n]*?[.!\n]/gi) || [];

  if (qeegMatches.length > 0 || kyunghyangMatches.length > 0 || doumMatches.length > 0 || therapyMatches.length > 0) {
    results.push({
      file: f,
      category: d.category,
      title: d.title,
      qeeg: qeegMatches,
      kyunghyang: kyunghyangMatches,
      doum: doumMatches,
      therapy: therapyMatches,
    });
  }
}

console.log('Files with targeted patterns:', results.length, '/', files.length);
results.forEach((r, idx) => {
  console.log(`\n[${idx + 1}] ${r.file} (${r.category})`);
  if (r.qeeg.length) console.log('   QEEG/HRV:', r.qeeg.map(s => s.trim().slice(0, 100)));
  if (r.kyunghyang.length) console.log('   Kyunghyang:', r.kyunghyang.map(s => s.trim().slice(0, 100)));
  if (r.doum.length) console.log('   Doum:', r.doum.map(s => s.trim().slice(0, 100)));
  if (r.therapy.length) console.log('   Therapy:', r.therapy.map(s => s.trim().slice(0, 100)));
});
