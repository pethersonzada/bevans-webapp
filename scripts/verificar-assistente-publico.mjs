import {writeFile,appendFile} from 'node:fs/promises';
import {validarPaginaPublica,validarRespostaStreamlit} from '../app/lib/assistente-verificacao.mjs';

// Sem credenciais, sessão ou pergunta à OpenAI. Apenas HTML e cabeçalhos públicos.
const AGENTE='https://bevans-suporte.streamlit.app/?embed=true';
const WEB='https://bevans-webapp.vercel.app/assistente';
const resumo={alvo:'Assistente BeVans',metodo:'GET somente leitura',chatRealTestado:false,resultado:'inconclusivo'};

async function consultar(url,{tentativas=3}={}){
 let ultimo;
 for(let i=0;i<tentativas;i++){
  try{
   const resposta=await fetch(url,{
    redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(20000),
    headers:{Accept:'text/html'},
   });
   const html=await resposta.text();
   return {status:resposta.status,url:resposta.url,tipo:resposta.headers.get('content-type')||'',
    frameOptions:resposta.headers.get('x-frame-options')||'',csp:resposta.headers.get('content-security-policy')||'',html};
  }catch(erro){
   ultimo=erro;
   if(i<tentativas-1)await new Promise(resolve=>setTimeout(resolve,8000));
  }
 }
 throw Error('Falha de conexão HTTP pública: '+(ultimo?.name==='TimeoutError'?'tempo limite':'rede indisponível'));
}

try{
 const [web,agente]=await Promise.all([consultar(WEB),consultar(AGENTE)]);
 validarPaginaPublica(web);
 validarRespostaStreamlit(agente);
 resumo.resultado='http-e-cabecalhos-aprovados';
 resumo.detalhe='A página web contém iframe e fallback; Streamlit respondeu HTML 200 sem bloqueio explícito nos cabeçalhos. A conversa real e a renderização visual ainda precisam de aceite humano.';
 console.log('APROVADO: página /assistente, origem Streamlit e políticas HTTP de incorporação.');
}catch(e){
 resumo.resultado='bloqueado';
 resumo.detalhe=e.message;
 console.error('FALHA: '+e.message);
 process.exitCode=1;
}
if(process.env.GITHUB_STEP_SUMMARY)
 await appendFile(process.env.GITHUB_STEP_SUMMARY,
  '## Assistente BeVans: prova pública\n\n'+
  '- Resultado: **'+resumo.resultado+'**\n'+
  '- Tipo: GET sem sessão, tokens ou perguntas ao modelo\n'+
  '- Limite: não demonstra resposta real nem compatibilidade visual do iframe\n'+
  '- Detalhe: '+resumo.detalhe+'\n');
if(process.env.RUNNER_TEMP){
 const file=process.env.RUNNER_TEMP+'/bevans-assistente-publico.json';
 await writeFile(file,JSON.stringify(resumo,null,2)+'\n',{mode:0o600});
}
