import type { MetadataRoute } from 'next';
import { SITE_URL, treatments } from './lib/clinic';
import { getAllColumns } from './lib/columns';

export default function sitemap(): MetadataRoute.Sitemap {
  const columns = getAllColumns();
  const now = new Date();

  // Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/columns`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/location`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/en/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  // Only canonical treatment URLs belong in the sitemap. Legacy aliases and
  // category query URLs declare different canonical URLs on their pages.
  const treatmentRoutes: MetadataRoute.Sitemap = treatments.flatMap(({ slug }) => [
    {
      url: `${SITE_URL}/treatments/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/en/treatments/${slug}`,
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
      url: `${SITE_URL}/columns/${col.slug}`,
      lastModified: dateObj,
      changeFrequency: isQeegGuide ? 'weekly' : 'monthly',
      priority: isQeegGuide ? 0.9 : 0.8,
    };
  });

  return [...staticRoutes, ...treatmentRoutes, ...columnRoutes];
}
