const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'content', 'columns');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

let qeegSentences = [];
let doumSentences = [];
let kyunghyangSentences = [];
let therapySentences = [];

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const text = (d.summary || '') + '\n' + (d.content || '');
  const sentences = text.split(/[.\n]/).map(s => s.trim()).filter(Boolean);

  for (const s of sentences) {
    if ((s.includes('QEEG') || s.includes('뇌파')) && (s.includes('HRV') || s.includes('심박변이도') || s.includes('생체 신호') || s.includes('참고'))) {
      if (s.includes('참고') || s.includes('검사') || s.includes('데이터')) {
        qeegSentences.push({ file: f, s });
      }
    }
    if (s.includes('도움을 줄 수') || s.includes('도움이 될 수') || s.includes('도움이 됩니다')) {
      doumSentences.push({ file: f, s });
    }
    if (s.includes('경향을') || s.includes('경향이')) {
      kyunghyangSentences.push({ file: f, s });
    }
    if ((s.includes('한약') && s.includes('추나')) || (s.includes('한약') && s.includes('침구')) || s.includes('맞춤 한약')) {
      therapySentences.push({ file: f, s });
    }
  }
}

console.log('QEEG/HRV sentences count:', qeegSentences.length);
console.log('Doum sentences count:', doumSentences.length);
console.log('Kyunghyang sentences count:', kyunghyangSentences.length);
console.log('Therapy sentences count:', therapySentences.length);

console.log('\n--- Sample QEEG/HRV sentences (first 6) ---');
qeegSentences.slice(0, 6).forEach(x => console.log(x.file + ' ::: ' + x.s));

console.log('\n--- Sample Doum sentences (first 6) ---');
doumSentences.slice(0, 6).forEach(x => console.log(x.file + ' ::: ' + x.s));

console.log('\n--- Sample Kyunghyang sentences (first 6) ---');
kyunghyangSentences.slice(0, 6).forEach(x => console.log(x.file + ' ::: ' + x.s));

console.log('\n--- Sample Therapy sentences (first 6) ---');
therapySentences.slice(0, 6).forEach(x => console.log(x.file + ' ::: ' + x.s));
