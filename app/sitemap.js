import {ambientePrivado} from './lib/seo-visibility.mjs';

export function sitemapPolicy(env={}) {
  // Não publicar URLs de testes, mesmo que o Preview esteja protegido por login.
  if(ambientePrivado(env))return [];
  const base=env.NEXT_PUBLIC_SITE_URL||'https://bevans-webapp.vercel.app';
  return [
    {url:new URL('/',base).toString(),changeFrequency:'monthly',priority:1},
    {url:new URL('/contato',base).toString(),changeFrequency:'monthly',priority:.8},
    {url:new URL('/excursoes',base).toString(),changeFrequency:'monthly',priority:.8},
    {url:new URL('/termos',base).toString(),changeFrequency:'yearly',priority:.2},
    {url:new URL('/privacidade',base).toString(),changeFrequency:'yearly',priority:.2},
  ];
}
export default function sitemap(){return sitemapPolicy(process.env);}
