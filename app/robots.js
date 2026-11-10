export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://bevans-webapp.vercel.app';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/login', '/cadastro'] }],
    sitemap: new URL('/sitemap.xml', base).toString(),
  };
}
