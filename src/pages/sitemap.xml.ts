import { getCollection } from 'astro:content';

const staticRoutes = [
  '/',
  '/plans/',
  '/land/',
  '/about',
  '/financing',
  '/contact',
  '/legacy-index.html',
  '/CORELOT%20Operations%20Map.html',
  '/INVOICE_AND_STATEMENT_STANDARD.md',
  '/assets/brand-capability-matrix.html',
  '/assets/brand-guide.html',
  '/assets/community-brochure.html',
  '/assets/email-template.html',
  '/assets/house-plan-brochures.html',
  '/assets/single-home-email.html',
  '/assets/single-home-social.html',
  '/assets/site-plan-exhibit.html',
  '/assets/spot-lot-flyer.html',
  '/assets/subdivision-email.html',
  '/marketing/add-scott-hine.html',
  '/marketing/analytics.html',
  '/marketing/google-ads.html',
  '/marketing/houzz.html',
  '/marketing/lot-catalog.html',
  '/marketing/plan-catalog.html',
  '/marketing/white-oak-sign.html',
  '/blogs/add-value-home.html',
  '/blogs/affordable-meaning.html',
  '/blogs/beautiful-lawn-guide.html',
  '/blogs/build-on-your-lot.html',
  '/blogs/construction-perm-loan-benefits.html',
  '/blogs/corelot-design-process.html',
  '/blogs/corelot-products.html',
  '/blogs/financing-overview.html',
  '/blogs/home-style-selection.html',
  '/blogs/house-lot-options.html',
  '/blogs/house-match.html',
  '/blogs/lot-affordability.html',
  '/blogs/lot-feasibility.html',
  '/blogs/low-maintenance-homes.html',
  '/blogs/planning-pricing-wlmartin.html',
  '/blogs/production-vs-custom.html',
  '/blogs/restaurant-vs-builder.html',
  '/blogs/sales-process.html',
  '/blogs/the-lot.html',
  '/blogs/warranty-cost.html',
  '/blogs/what-is-quality.html',
  '/blogs/who-is-corelot.html',
  '/blogs/why-rent-own.html'
];

export async function GET() {
  const plans = await getCollection('plans');
  const land = await getCollection('land');
  const dynamicRoutes = [
    ...plans.map((plan) => `/plans/${plan.slug}/`),
    ...land.map((lot) => `/land/${lot.slug}/`),
  ];

  const pages = [...staticRoutes, ...dynamicRoutes];
  const urlset = pages
    .map((path) => `<url><loc>https://corelothomes.com${path}</loc></url>`)
    .join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlset}</urlset>`, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
