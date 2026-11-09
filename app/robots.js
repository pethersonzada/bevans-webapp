export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/gestor'] }],
    ...(base ? { sitemap: new URL('/sitemap.xml', base).toString() } : {}),
  };
}