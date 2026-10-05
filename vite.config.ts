import fs from 'fs';
import path from 'path';
import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import hostingConfig from './.openai/hosting.json';

// Ensure uploaded assets are copied to public/images/clinic
try {
  const imagesToSync = [
    {
      src: 'C:/Users/doohe/.gemini/antigravity/brain/1c63b403-d06b-4be1-8ecc-96df6e7a0569/.user_uploaded/media_1791195104776.png',
      dest: 'qeeg-brainmap-3d.png',
    },
    {
      src: 'C:/Users/doohe/.gemini/antigravity/brain/1c63b403-d06b-4be1-8ecc-96df6e7a0569/.user_uploaded/media_1791198555891.png',
      dest: 'heat-metabolism-diti.png',
    },
    {
      src: 'C:/Users/doohe/.gemini/antigravity/brain/1c63b403-d06b-4be1-8ecc-96df6e7a0569/.user_uploaded/media_1791198561360.png',
      dest: 'diet-acurex-line.png',
    },
    {
      src: 'C:/Users/doohe/.gemini/antigravity/brain/1c63b403-d06b-4be1-8ecc-96df6e7a0569/.user_uploaded/media_1791199064356.png',
      dest: 'diet-quantum-fit.png',
    },
  ];

  const targetDir = path.join(process.cwd(), 'public', 'images', 'clinic');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const item of imagesToSync) {
    const targetImg = path.join(targetDir, item.dest);
    if (fs.existsSync(item.src)) {
      if (!fs.existsSync(targetImg)) {
        fs.copyFileSync(item.src, targetImg);
      } else {
        const srcStat = fs.statSync(item.src);
        const destStat = fs.statSync(targetImg);
        if (srcStat.size !== destStat.size) {
          fs.copyFileSync(item.src, targetImg);
        }
      }
    }
  }
} catch {
  // ignore
}

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  '00000000-0000-4000-8000-000000000000';

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

const localBindingConfig = {
  main: 'vinext/server/app-router-entry',
  compatibility_flags: ['nodejs_compat'],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: 'site-creator-d1',
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: 'site-creator-r2',
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: localBindingConfig,
      }),
    ],
  };
});
