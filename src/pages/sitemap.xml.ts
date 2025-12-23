import { getCollection } from 'astro:content';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../../public');

async function listStaticRoutes(): Promise<string[]> {
  const subdirs = ['', 'assets', 'marketing', 'blogs'];
  const routes: string[] = ['/', '/plans/', '/land/', '/about', '/process', '/financing', '/faq', '/contact'];

  for (const subdir of subdirs) {
    const dirPath = path.join(publicDir, subdir);
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!entry.name.match(/\.(html|md)$/i)) continue;
      const href = path.posix.join('/', subdir, entry.name);
      routes.push(encodeURI(href));
    }
  }

  return routes.sort((a, b) => a.localeCompare(b));
}

export async function GET() {
  const plans = await getCollection('plans');
  const land = await getCollection('land');
  const staticRoutes = await listStaticRoutes();
  const dynamicRoutes = [
    ...plans.map((plan) => `/plans/${plan.id}/`),
    ...land.map((lot) => `/land/${lot.id}/`),
  ];

  const pages = [...staticRoutes, ...dynamicRoutes];
  const urlset = pages
    .map((path) => `<url><loc>https://corelothomes.com${path}</loc></url>`)
    .join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlset}</urlset>`, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
