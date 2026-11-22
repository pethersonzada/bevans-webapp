// A mesma decisão deve valer para robots.txt, sitemap, HTML e cabeçalhos.
// Preview e desenvolvimento não devem ser indexados, mesmo se a URL vazar.
export function ambientePrivado(env={}){
 return env.VERCEL_ENV==='preview'||env.VERCEL_ENV==='development';
}
export function metadadosRobots(env={}){
 if(ambientePrivado(env))return {index:false,follow:false,noarchive:true,
  googleBot:{index:false,follow:false,noimageindex:true}};
 return {index:true,follow:true};
}
