export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/login', '/cadastro'] }],
    ...(base ? { sitemap: new URL('/sitemap.xml', base).toString() } : {}),
  };
}