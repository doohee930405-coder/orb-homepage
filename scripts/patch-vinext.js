import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFile = path.resolve(
  __dirname,
  '../node_modules/vinext/dist/utils/prerender-output-paths.js'
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf-8');
  let changed = false;

  // Ensure getOutputPath decodes URI to avoid exceeding 255-byte filename limits for unicode/korean slugs
  if (!content.includes('decodeURI(urlPath)')) {
    content = content.replace(
      'const clean = urlPath.replace(/^\\//, "");',
      'let clean; try { clean = decodeURI(urlPath).replace(/^\\//, ""); } catch { clean = urlPath.replace(/^\\//, ""); }'
    );
    content = content.replace(
      'return urlPath.replace(/^\\//, "") + ".rsc";',
      'let clean; try { clean = decodeURI(urlPath).replace(/^\\//, ""); } catch { clean = urlPath.replace(/^\\//, ""); } return clean + ".rsc";'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(targetFile, content, 'utf-8');
    console.log('[patch-vinext] Successfully patched vinext prerender-output-paths.js');
  } else {
    console.log('[patch-vinext] vinext prerender-output-paths.js already patched');
  }
}
