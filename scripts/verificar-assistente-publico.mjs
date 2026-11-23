import {writeFile,appendFile} from 'node:fs/promises';
import {validarPaginaAssistente,validarRespostaChat} from '../app/lib/assistente-verificacao.mjs';

const BASE='https://bevans-webapp.vercel.app';
const resumo={alvo:'Chat nativo do BeVans',metodo:'GET página e POST FAQ público, sem credenciais',resultado:'inconclusivo',modeloGenerativoTestado:false};

try{
 const page=await fetch(BASE+'/assistente',{headers:{Accept:'text/html'},cache:'no-store',signal:AbortSignal.timeout(15000)});
 const html=await page.text();
 validarPaginaAssistente({status:page.status,html});
 const response=await fetch(BASE+'/api/assistente',{
  method:'POST',headers:{'Content-Type':'application/json',Origin:BASE},
  body:JSON.stringify({pergunta:'Quais funcionalidades já estão disponíveis?',historico:[]}),
  cache:'no-store',signal:AbortSignal.timeout(18000),
 });
 const tipo=response.headers.get('content-type')||'';
 const dados=await response.json();
 validarRespostaChat({status:response.status,tipo,dados});
 resumo.resultado='chat-nativo-http-aprovado';
 resumo.detalhe='A página e o endpoint do BeVans responderam. A geração por modelo e as jornadas autenticadas não fazem parte deste teste.';
 console.log('APROVADO: chat e FAQ responderam pelo domínio do BeVans.');
}catch(e){
 resumo.resultado='bloqueado';
 resumo.detalhe=e.message;
 console.error('FALHA: '+e.message);
 process.exitCode=1;
}
if(process.env.GITHUB_STEP_SUMMARY)
 await appendFile(process.env.GITHUB_STEP_SUMMARY,
  '## Chat BeVans: verificação pública\n\n'+
  '- Resultado: **'+resumo.resultado+'**\n'+
  '- Tipo: GET página e POST pergunta genérica, sem dados pessoais\n'+
  '- Limite: modelo pago e jornadas reais não testados\n'+
  '- Detalhe: '+resumo.detalhe+'\n');
if(process.env.RUNNER_TEMP)
 await writeFile(process.env.RUNNER_TEMP+'/bevans-assistente-publico.json',JSON.stringify(resumo,null,2)+'\n',{mode:0o600});
