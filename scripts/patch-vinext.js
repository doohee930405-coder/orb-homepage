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

const prerenderJs = path.resolve(__dirname, '../node_modules/vinext/dist/build/prerender.js');
if (fs.existsSync(prerenderJs)) {
  let pContent = fs.readFileSync(prerenderJs, 'utf-8');
  if (!pContent.includes('closeAllConnections')) {
    pContent = pContent.replaceAll(
      'if (ownedProdServerHandle) await new Promise((resolve) => ownedProdServerHandle.server.close(() => resolve()));',
      'if (ownedProdServerHandle) { try { ownedProdServerHandle.server.closeAllConnections(); } catch {} await new Promise((resolve) => ownedProdServerHandle.server.close(() => resolve())); }'
    );
    fs.writeFileSync(prerenderJs, pContent, 'utf-8');
    console.log('[patch-vinext] Successfully patched closeAllConnections in prerender.js');
  }
}
