// Verificação pública e somente leitura do Streamlit, sem iniciar conversas de IA.
const ORIGEM_AGENTE='https://bevans-suporte.streamlit.app';
const ORIGEM_WEB='https://bevans-webapp.vercel.app';

export function validarRespostaStreamlit({status,url,tipo,frameOptions='',csp='',html=''}) {
 const destino=new URL(url);
 if(destino.origin!==ORIGEM_AGENTE||destino.protocol!=='https:')
  throw Error('O assistente redirecionou para uma origem não autorizada.');
 if(status!==200)throw Error('O Streamlit não retornou HTTP 200.');
 if(!/^text\/html(?:;|$)/i.test(tipo||''))throw Error('A resposta do assistente não é HTML.');
 if(/\b(?:DENY|SAMEORIGIN)\b/i.test(frameOptions))
  throw Error('O Streamlit bloqueia incorporação por X-Frame-Options.');
 const diretiva=(csp||'').split(';').map(s=>s.trim()).find(s=>/^frame-ancestors(?:\s|$)/i.test(s));
 if(diretiva){
  const fontes=diretiva.split(/\s+/).slice(1);
  const permitido=fontes.some(f=>f==='*'||f==='https:'||f===ORIGEM_WEB||f==='https://*.vercel.app');
  if(!permitido)throw Error('A política frame-ancestors não permite o domínio do BeVans.');
 }
 if(/(?:this app has gone to sleep|app is sleeping|wake (?:this )?app up)/i.test(html))
  throw Error('O Streamlit está em suspensão e ainda não disponibilizou o chat.');
 if(!/streamlit|_stcore|stApp/i.test(html))
  throw Error('O serviço respondeu HTML, mas não foi possível reconhecer o aplicativo Streamlit.');
 return {origem:destino.origin,permiteIncorporacaoPorCabecalhos:true,status:200};
}

export function validarPaginaPublica({status,html}) {
 if(status!==200)throw Error('A página pública /assistente não retornou HTTP 200.');
 if(!html.includes('bevans-suporte.streamlit.app/')||
    !html.includes('Abrir assistente')||
    !html.includes('Conversa com o Assistente BeVans'))
  throw Error('A página pública não apresenta o iframe e a alternativa de acesso esperados.');
 return true;
}
