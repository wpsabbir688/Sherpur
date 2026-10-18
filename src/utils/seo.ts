import { Destination } from '../types';

export function updateMetaTags(title: string, description: string) {
  document.title = title;

  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);
}

export function generateSitemapXml(destinations: Destination[], baseUrl: string): string {
  const urls = [
    { loc: baseUrl, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}#places`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}#upazilas`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}#categories`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}#guides`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}#about`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${baseUrl}#contact`, priority: '0.7', changefreq: 'monthly' },
    ...destinations
      .filter((d) => d.status === 'published')
      .map((d) => ({
        loc: `${baseUrl}#places/${d.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: d.lastVerifiedAt || new Date().toISOString().split('T')[0],
      })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${'lastmod' in u ? `    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
}
