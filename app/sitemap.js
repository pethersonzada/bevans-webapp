export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) return [];
  return [
    { url: new URL('/',base).toString(), changeFrequency:'monthly', priority:1 },
    { url: new URL('/contato',base).toString(), changeFrequency:'monthly', priority:.8 },
    { url: new URL('/termos',base).toString(), changeFrequency:'yearly', priority:.2 },
  ];
}