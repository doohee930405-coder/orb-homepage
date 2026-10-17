const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'content', 'columns', '자율신경실조증-해결의-핵심-복압-과-호흡-283194.json');
const original = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('--- ORIGINAL SUMMARY ---');
console.log(original.summary);

console.log('\n--- TARGET MATCHES IN ORIGINAL CONTENT ---');
const content = original.content;

// 1. QEEG/HRV sentences
const qeegMatches = content.match(/[^.\n]*?(?:습식\s*정량화\s*뇌파|QEEG)[^.\n]*?(?:심박변이도|HRV)[^.\n]*?(?:참고\s*자료로\s*활용|기록)[^.\n]*?[.!\n]/gi) || [];
qeegMatches.forEach(m => console.log('QEEG:', m.trim()));

// 2. Ending sentences
const kyunghyangMatches = content.match(/[^.\n]*?경향을\s*보입니다[^.\n]*?[.!\n]/gi) || [];
kyunghyangMatches.forEach(m => console.log('경향:', m.trim()));

const doumMatches = content.match(/[^.\n]*?도움을\s*줄\s*수\s*있습니다[^.\n]*?[.!\n]/gi) || [];
doumMatches.forEach(m => console.log('도움:', m.trim()));

// 3. Therapy listing
const therapyMatches = content.match(/[^.\n]*?한약[·,\s]+추나[·,\s]+침구[^.\n]*?[.!\n]/gi) || [];
therapyMatches.forEach(m => console.log('치료:', m.trim()));
