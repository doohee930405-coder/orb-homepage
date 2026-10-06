import fs from 'fs';
import path from 'path';

export function syncUploadedClinicImages(): void {
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
    // In edge/worker runtimes, filesystem operations are restricted; assets are already pre-synced.
  }
}

export function ensureQeegBrainmapImage(): string {
  syncUploadedClinicImages();
  return '/images/clinic/qeeg-brainmap-3d.png';
}

syncUploadedClinicImages();

