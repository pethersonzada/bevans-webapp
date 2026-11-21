// API pública de excursões: tokens exclusivamente em cabeçalhos e sem cache.
export function apiPublicaBase() {
  const raw=String(process.env.NEXT_PUBLIC_BEVANS_API_URL||'').trim().replace(/\/+$/,'');
  if(!raw)throw Error('API BeVans não configurada para inscrições.');
  const url=new URL(raw);
  if(url.username||url.password||url.search||url.hash)throw Error('URL da API inválida.');
  if(url.protocol!=='https:'&&!(process.env.NODE_ENV==='development'&&url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))throw Error('Inscrições exigem API HTTPS.');
  return raw;
}
export function credencialValida(token){return typeof token==='string'&&/^[A-Za-z0-9_-]{32,128}$/.test(token);}
export async function conviteRequest(path,{convite,inscricao,method='GET',body,signal}={}){
  if(!['/publico/excursoes/convite','/publico/excursoes/credenciais','/publico/excursoes/inscricoes','/publico/excursoes/inscricao'].includes(path))throw Error('Recurso público não permitido.');
  if(!credencialValida(convite)&&!credencialValida(inscricao))throw Error('Convite ou credencial inválidos.');
  if(['/publico/excursoes/convite','/publico/excursoes/credenciais','/publico/excursoes/inscricoes'].includes(path)&&!credencialValida(convite))throw Error('Convite inválido.');
  if(['/publico/excursoes/inscricoes','/publico/excursoes/inscricao'].includes(path)&&!credencialValida(inscricao))throw Error('Credencial individual inválida.');
  const headers={'Accept':'application/json'};
  if(convite)headers['X-Convite']=convite;
  if(inscricao)headers['X-Inscricao']=inscricao;
  if(body!==undefined)headers['Content-Type']='application/json';
  const r=await fetch(apiPublicaBase()+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal,cache:'no-store',referrerPolicy:'no-referrer',credentials:'omit'});
  let data=null;try{const t=await r.text();if(t)data=JSON.parse(t);}catch{}
  if(!r.ok)throw Error(r.status===429?'Muitas tentativas. Tente novamente mais tarde.':r.status===404?'Convite/inscrição indisponível ou expirado.':'Não foi possível concluir a operação (HTTP '+r.status+').');
  return data;
}
