const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'content', 'columns');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

console.log('Inspecting clinical diagnostic sentences & treatment conclusions across all 62 files...\n');

files.forEach((f, idx) => {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const text = (d.content || '');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Find lines mentioning QEEG / 뇌파 / HRV / 오브한의원
  const diagnosticLines = lines.filter(l => 
    (l.includes('오브한의원') || l.includes('QEEG') || l.includes('HRV')) &&
    (l.includes('검사') || l.includes('진단') || l.includes('참고') || l.includes('측정')) &&
    !l.startsWith('#') && !l.startsWith('!') && !l.startsWith('[📍') && !l.startsWith('📌')
  );

  // Find conclusion lines mentioning 한약 / 치료 / 추나 / 침구
  const conclusionLines = lines.filter(l => 
    (l.includes('치료') || l.includes('한약') || l.includes('맞춤')) &&
    (l.includes('도움') || l.includes('개선') || l.includes('회복') || l.includes('병행')) &&
    !l.startsWith('#') && !l.startsWith('!') && !l.startsWith('[📍') && !l.startsWith('📌') && !l.includes('의료법')
  );

  console.log(`[${idx + 1}] ${f} (${d.category})`);
  if (diagnosticLines.length > 0) {
    console.log('  [진단/검사 문장]:', diagnosticLines[0].slice(0, 120));
  } else {
    console.log('  [진단/검사 문장]: (없음)');
  }
  if (conclusionLines.length > 0) {
    console.log('  [결론/치료 문장]:', conclusionLines[conclusionLines.length - 1].slice(0, 120));
  } else {
    console.log('  [결론/치료 문장]: (없음)');
  }
});
