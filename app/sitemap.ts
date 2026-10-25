import type { MetadataRoute } from 'next';
import { treatments } from './lib/clinic';
import { getAllColumns } from './lib/columns';

const DOMAIN = 'https://orbmed.co.kr';

export default function sitemap(): MetadataRoute.Sitemap {
  const columns = getAllColumns();
  const now = new Date();

  // Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${DOMAIN}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${DOMAIN}/columns`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${DOMAIN}/location`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${DOMAIN}/en`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${DOMAIN}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${DOMAIN}/en/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  // Only canonical treatment URLs belong in the sitemap.
  const treatmentRoutes: MetadataRoute.Sitemap = treatments.flatMap(({ slug }) => [
    {
      url: `${DOMAIN}/treatments/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${DOMAIN}/en/treatments/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]);

  // Dynamic Column Detail Routes
  const columnRoutes: MetadataRoute.Sitemap = columns.map((col) => {
    let dateObj = now;
    if (col.updatedAt || col.date) {
      const parsedDate = new Date(col.updatedAt || col.date);
      if (!isNaN(parsedDate.getTime())) {
        dateObj = parsedDate;
      }
    }
    const isQeegGuide = col.slug === 'qeeg-guide';

    return {
      url: `${DOMAIN}/columns/${encodeURIComponent(col.slug)}`,
      lastModified: dateObj,
      changeFrequency: isQeegGuide ? 'weekly' : 'monthly',
      priority: isQeegGuide ? 0.9 : 0.8,
    };
  });

  return [...staticRoutes, ...treatmentRoutes, ...columnRoutes];
}
