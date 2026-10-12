import fs from 'fs';

const pages = [
  'dist/client/index.html',
  'dist/client/location.html',
  'dist/client/qeeg.html',
  'dist/client/diet.html',
  'dist/client/pain.html',
  'dist/client/en.html'
];

pages.forEach((p) => {
  if (!fs.existsSync(p)) {
    console.log(`[MISSING] ${p}`);
    return;
  }
  const html = fs.readFileSync(p, 'utf8');
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1];
  const can = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1];
  const h1 = (html.match(/<h1[^>]*>([^<]*)<\/h1>/i) || [])[1];
  const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  let schemaType = 'none';
  if (jsonLdMatch) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      schemaType = data['@type'] || (data['@graph'] ? data['@graph'].map(g => g['@type']).join(', ') : 'valid JSON');
    } catch {
      schemaType = 'invalid JSON';
    }
  }
  console.log(`\n=== ${p} ===`);
  console.log('Size:', html.length, 'bytes');
  console.log('Title:', title);
  console.log('Canonical:', can);
  console.log('H1:', h1);
  if (jsonLdMatch) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      if (data['@graph']) {
        console.log('Schemas in @graph:');
        data['@graph'].forEach((item) => {
          console.log(` - ${item['@type']}: ${item.name || item.headline || ''}`);
        });
      } else {
        console.log(`Schema: ${data['@type']} (${data.name || ''})`);
      }
    } catch (e) {
      console.log('Schema JSON Parse Error:', e.message);
    }
  } else {
    console.log('No JSON-LD schema found');
  }
  console.log('Semantic <main> & <header>:', html.includes('<main') && html.includes('<header'));
});

