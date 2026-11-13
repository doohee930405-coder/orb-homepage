import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/admin/' },
      { userAgent: 'Googlebot', allow: '/', disallow: '/admin/' },
      { userAgent: 'GPTBot', allow: '/', disallow: '/admin/' },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: '/admin/' },
      { userAgent: 'PerplexityBot', allow: '/', disallow: '/admin/' },
      { userAgent: 'ClaudeBot', allow: '/', disallow: '/admin/' },
      { userAgent: 'Google-Extended', allow: '/', disallow: '/admin/' },
      { userAgent: 'Yeti', allow: '/', disallow: '/admin/' },
      { userAgent: 'Bingbot', allow: '/', disallow: '/admin/' },
    ],
    sitemap: 'https://orbmed.co.kr/sitemap.xml',
  };
}
