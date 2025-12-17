export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: https://corelothomes.com/sitemap.xml`,
    { headers: { 'Content-Type': 'text/plain' } }
  );
}
