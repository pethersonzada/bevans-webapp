export function robotsPolicy(env={}) {
  // Pré-visualizações na Vercel nunca devem expor o site de teste aos buscadores.
  if(env.VERCEL_ENV==='preview'||env.VERCEL_ENV==='development'){
    return {rules:[{userAgent:'*',disallow:'/'}]};
  }
  const base=env.NEXT_PUBLIC_SITE_URL||'https://bevans-webapp.vercel.app';
  return {
    rules:[{userAgent:'*',allow:'/',disallow:['/login','/cadastro','/painel','/convite','/api/']}],
    sitemap:new URL('/sitemap.xml',base).toString(),
  };
}
export default function robots(){return robotsPolicy(process.env);}
