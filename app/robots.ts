import type { MetadataRoute } from 'next';
import { SITE_URL } from './lib/clinic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          'Googlebot',
          'Yeti',
          'GPTBot',
          'OAI-SearchBot',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          '*',
        ],
        allow: '/',
        disallow: ['/admin', '/api/admin'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
