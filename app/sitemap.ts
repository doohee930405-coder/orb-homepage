import type { MetadataRoute } from 'next';
import { SITE_URL } from './lib/clinic';
import { getAllColumns } from './lib/columns';
import { CLINIC_CATEGORIES } from './lib/columnTypes';

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
      url: `${SITE_URL}/treatments/autonomic-qeeg`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/treatments/pain-chuna`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/treatments/stress-neurosis`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/treatments/weight-metabolism`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/en/treatments/autonomic-qeeg`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/en/treatments/pain-chuna`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/en/treatments/stress-neurosis`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/en/treatments/weight-metabolism`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
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

  // 8 Category Topic Cluster Hubs
  const categoryRoutes: MetadataRoute.Sitemap = CLINIC_CATEGORIES.map((cat) => ({
    url: `${SITE_URL}/columns?category=${encodeURIComponent(cat)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

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

  return [...staticRoutes, ...categoryRoutes, ...columnRoutes];
}
