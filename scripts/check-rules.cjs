const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'content', 'columns');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

let matchedFiles = [];

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const text = (d.summary || '') + '\n' + (d.content || '');
  
  const hasQeegHrvRepeat = /(?:습식\s*정량화\s*뇌파|QEEG)[^.\n]*?(?:심박변이도|HRV)[^.\n]*?(?:참고\s*자료로\s*활용|생체\s*신호\s*데이터를\s*참고|참고\s*자료로\s*삼아|데이터를\s*기반으로)/i.test(text);
  const hasKyunghyang = /경향을\s*보입니다|경향이\s*있습니다/g.test(text);
  const hasDoum = /도움을\s*줄\s*수\s*있습니다|도움이\s*될\s*수\s*있습니다/g.test(text);
  const hasTherapyListing = /한약[·,\s]+추나[·,\s]+침구|한약[·,\s]+침구[·,\s]+추나|추나[·,\s]+한약[·,\s]+침구/g.test(text);

  if (hasQeegHrvRepeat || hasKyunghyang || hasDoum || hasTherapyListing) {
    matchedFiles.push({
      file: f,
      hasQeegHrvRepeat,
      hasKyunghyang,
      hasDoum,
      hasTherapyListing,
      title: d.title,
    });
  }
}

console.log('Total files matched:', matchedFiles.length, '/', files.length);
matchedFiles.forEach(m => {
  console.log(`- ${m.file} [QEEG: ${m.hasQeegHrvRepeat ? 'O' : 'X'}, 경향: ${m.hasKyunghyang ? 'O' : 'X'}, 도움: ${m.hasDoum ? 'O' : 'X'}, 치료나열: ${m.hasTherapyListing ? 'O' : 'X'}]`);
});
