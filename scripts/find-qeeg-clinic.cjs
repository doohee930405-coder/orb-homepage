const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'content', 'columns');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

const matches = [];

files.forEach(f => {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const text = (d.summary || '') + '\n' + (d.content || '');
  const sentences = text.split(/(?<=[.!?\n])/).map(s => s.trim()).filter(Boolean);

  const fileHits = [];
  sentences.forEach(s => {
    // Boilerplate clinic diagnosis sentence mentioning QEEG and HRV
    if (/(?:오브한의원|본원|마곡\s*오브한의원)[^\n]*?(?:습식\s*정량화\s*뇌파|습식\s*뇌파|정량뇌파|QEEG)[^\n]*?(?:심박변이도|자율신경|HRV)[^\n]*?(?:진단|짚어|활용|참고|기반|확인|평가|증명|분석)/i.test(s) ||
        /(?:오브한의원|본원|마곡\s*오브한의원)[^\n]*?(?:심박변이도|자율신경|HRV)[^\n]*?(?:습식\s*정량화\s*뇌파|습식\s*뇌파|정량뇌파|QEEG)[^\n]*?(?:진단|짚어|활용|참고|기반|확인|평가|증명|분석)/i.test(s)) {
      if (!s.startsWith('#')) {
        fileHits.push(s);
      }
    }
  });

  if (fileHits.length > 0) {
    matches.push({ file: f, title: d.title, category: d.category, hits: fileHits });
  }
});

console.log(`Found clinic QEEG/HRV boilerplate in ${matches.length} files:\n`);
matches.forEach((m, idx) => {
  console.log(`[${idx + 1}] ${m.file} (${m.category})`);
  m.hits.forEach(h => console.log('    -> ' + h));
});
