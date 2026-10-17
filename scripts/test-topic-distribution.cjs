const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'content', 'columns');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

// Refined topic detection with category prioritization
function getTopicKey(category, title, content) {
  const normCat = (category || '').trim();
  const cTitle = (title || '').toLowerCase();
  const cBody = (content || '').toLowerCase();

  // 1. Title/Category specifics
  if (cTitle.includes('복압') || cTitle.includes('호흡') || cTitle.includes('횡격막')) return '복압호흡';
  if (normCat === 'ADHD' || cTitle.includes('adhd') || cTitle.includes('콘서타')) return 'ADHD';
  if (normCat === '초민감자(HSP)' || cTitle.includes('초민감자') || cTitle.includes('hsp')) return '초민감자(HSP)';
  if (normCat === '브레인포그' || cTitle.includes('브레인포그') || cTitle.includes('브레인 포그')) return '브레인포그';
  if (normCat === '갑상선' || cTitle.includes('갑상선') || cTitle.includes('씬지로이드')) return '갑상선';
  if (normCat === '다이어트' || cTitle.includes('다이어트') || cTitle.includes('요요') || cTitle.includes('위고비') || cTitle.includes('마운자로')) return '다이어트';
  if (normCat === '위장관' || cTitle.includes('위장') || cTitle.includes('소화') || cTitle.includes('장누수') || cTitle.includes('담적') || cTitle.includes('식도')) return '위장관';
  if (cTitle.includes('두통') || cTitle.includes('후두신경') || cTitle.includes('경추성')) return '두통';
  if (cTitle.includes('불면') || cTitle.includes('불안') || cTitle.includes('수면') || cTitle.includes('공황')) return '불면/불안';
  if (normCat === '자율신경실조증' || cTitle.includes('자율신경')) return '자율신경실조증';

  // 2. Body fallbacks
  if (cBody.includes('복압') || cBody.includes('횡격막')) return '복압호흡';
  if (cBody.includes('adhd')) return 'ADHD';
  if (cBody.includes('초민감자') || cBody.includes('hsp')) return '초민감자(HSP)';
  if (cBody.includes('브레인포그')) return '브레인포그';
  if (cBody.includes('갑상선')) return '갑상선';
  if (cBody.includes('다이어트')) return '다이어트';
  if (cBody.includes('위장') || cBody.includes('소화')) return '위장관';
  
  return '자율신경실조증';
}

console.log('Testing topic assignment for all 62 files:\n');
const topicCounts = {};
files.forEach(f => {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const topic = getTopicKey(d.category, d.title, d.content);
  topicCounts[topic] = (topicCounts[topic] || 0) + 1;
});

console.log('Topic Distribution:');
console.log(topicCounts);
