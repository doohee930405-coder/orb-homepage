const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'content', 'columns');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

const qeegSentences = [];
const kyunghyangSentences = [];
const doumSentences = [];
const therapySentences = [];

files.forEach(f => {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const text = (d.summary || '') + '\n' + (d.content || '');
  const lines = text.split(/[.\n]/).map(s => s.trim()).filter(Boolean);

  lines.forEach(s => {
    if (/QEEG|HRV|습식\s*정량화\s*뇌파|심박변이도/i.test(s)) {
      if (/참고|활용|데이터|지표|기록|검사/.test(s)) {
        qeegSentences.push({ file: f, title: d.title, category: d.category, text: s });
      }
    }
    if (/경향을\s*보입니다|경향이\s*있습니다|경향을\s*띱니다/.test(s)) {
      kyunghyangSentences.push({ file: f, title: d.title, category: d.category, text: s });
    }
    if (/도움을\s*줄\s*수\s*있습니다|도움이\s*될\s*수\s*있습니다/.test(s)) {
      doumSentences.push({ file: f, title: d.title, category: d.category, text: s });
    }
    if (/한약[·,\s]+추나[·,\s]+침구|한약[·,\s]+침구[·,\s]+추나|추나[·,\s]+한약[·,\s]+침구/.test(s)) {
      therapySentences.push({ file: f, title: d.title, category: d.category, text: s });
    }
  });
});

console.log('QEEG sentences found:', qeegSentences.length);
console.log('경향 sentences found:', kyunghyangSentences.length);
console.log('도움 sentences found:', doumSentences.length);
console.log('치료 sentences found:', therapySentences.length);

console.log('\n--- QEEG Sample (First 15) ---');
qeegSentences.slice(0, 15).forEach((item, i) => console.log(`[${i+1}] (${item.category}) ${item.text.slice(0, 90)}`));

console.log('\n--- 치료 Sample ---');
therapySentences.forEach((item, i) => console.log(`[${i+1}] (${item.category}) ${item.text.slice(0, 90)}`));

console.log('\n--- 경향 Sample ---');
kyunghyangSentences.slice(0, 10).forEach((item, i) => console.log(`[${i+1}] (${item.category}) ${item.text.slice(0, 90)}`));

console.log('\n--- 도움 Sample ---');
doumSentences.slice(0, 10).forEach((item, i) => console.log(`[${i+1}] (${item.category}) ${item.text.slice(0, 90)}`));
