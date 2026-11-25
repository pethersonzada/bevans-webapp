import {CONHECIMENTO_BEVANS} from './conhecimento-bevans.mjs';

const PALAVRAS_COMUNS=new Set('a o as os de da do das dos em no na nos nas por para com sobre um uma uns umas que quem qual quais como quando onde seu sua seus suas minha meu me voce você eu ele ela isso isto esse essa ja já ser ter pode posso tenho fazer faz preciso funciona funcionar quero gostaria sabe ajudar ajuda nao não sim é ao pelo pela mais menos algum alguma esta está sao são site app aplicativo bevans van vans dia agora aqui'.split(' '));
const EXPANSOES={
 gps:['mapa','localizacao','rastreamento'],
 localizar:['mapa','localizacao','rastreamento'],
 posicao:['mapa','localizacao','rastreamento'],
 embarcar:['embarque','presenca'],
 entrada:['entrar','turma'],
 convite:['excursao','inscricao'],
 excursao:['convite','inscricao'],
 notificacao:['aviso','alerta'],
 pagamento:['cobranca','contratacao'],
 conta:['cadastro','login'],
 senha:['login','recuperar'],
 alunos:['passageiro','turma'],
 motorista:['condutor'],
 condutor:['motorista'],
 estudante:['passageiro'],
 viagem:['rota','van'],
};
const normalizar=valor=>valor.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const palavras=texto=>normalizar(texto).replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(t=>t.length>=3&&!PALAVRAS_COMUNS.has(t));
function termos(texto){
 const base=palavras(texto);
 return new Set(base.flatMap(t=>[t,...(EXPANSOES[t]||[])]));
}

export function validarConversa(dados){
 if(!dados||typeof dados!=='object'||Array.isArray(dados))throw Error('Envie sua pergunta em formato válido.');
 const pergunta=typeof dados.pergunta==='string'?dados.pergunta.trim():'';
 if(pergunta.length<2||pergunta.length>800)throw Error('Escreva uma pergunta de 2 a 800 caracteres.');
 if(/\b(?:sk-[a-zA-Z0-9_-]{12,}|AIza[a-zA-Z0-9_-]{20,}|eyJ[a-zA-Z0-9_-]{30,})\b/.test(pergunta)||
    /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/.test(pergunta)||
    /\b[a-z0-9.+_-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(pergunta))
  throw Error('Não envie senhas, tokens, CPF ou e-mail pessoal pelo assistente.');
 const historico=dados.historico??[];
 if(!Array.isArray(historico)||historico.length>12)throw Error('O histórico desta conversa excedeu o limite.');
 const mensagens=historico.map(m=>{
  if(!m||typeof m!=='object'||!['user','assistant'].includes(m.role)||
     typeof m.content!=='string'||!m.content.trim()||m.content.length>1200)
    throw Error('O histórico contém mensagens inválidas.');
  return {role:m.role,content:m.content.trim()};
 });
 return {pergunta,historico:mensagens};
}

export function buscarFaq(pergunta,historico=[],limite=3){
 let consulta=pergunta;
 if(palavras(pergunta).length<=2){
  const ultima=[...historico].reverse().find(m=>m.role==='user'&&palavras(m.content).length>2);
  if(ultima)consulta=ultima.content+' '+pergunta;
 }
 const perguntaTermos=termos(consulta);
 const candidatos=CONHECIMENTO_BEVANS.map(item=>{
  const titulo=termos(item.pergunta),resposta=termos(item.resposta);
  let tituloHits=0,respostaHits=0;
  for(const palavra of perguntaTermos){
   if(titulo.has(palavra))tituloHits++;
   else if(resposta.has(palavra))respostaHits++;
  }
  const relevancia=tituloHits*5+respostaHits*0.9;
  return {...item,relevancia,tituloHits};
 }).filter(item=>item.tituloHits>=1&&item.relevancia>=5).sort((a,b)=>b.relevancia-a.relevancia);
 return candidatos.slice(0,limite);
}

export function responderPeloFaq(pergunta,historico=[]){
 const encontrados=buscarFaq(pergunta,historico,3);
 if(!encontrados.length)return {
  resposta:'Ainda não encontrei uma orientação confiável sobre isso no FAQ do BeVans. Posso ajudar com turmas, rotas, excursões, login e acompanhamento de viagens. Para outros assuntos, consulte os canais oficiais de suporte.',
  modo:'faq',fontes:[],destino:'contato',
 };
 const melhor=encontrados[0];
 return {resposta:melhor.resposta,modo:'faq',fontes:[melhor.origem],destino:melhor.destino};
}

export function prepararPrompt(pergunta,historico){
 const encontrados=buscarFaq(pergunta,historico,4);
 return {
  destino:encontrados[0]?.destino,
  contexto:encontrados.map((item,i)=>`Trecho ${i+1} (${item.origem}): ${item.pergunta}\n${item.resposta}`).join('\n\n'),
  fontes:[...new Set(encontrados.map(x=>x.origem))],
 };
}

// Reutiliza o contrato de agente baseado em FAQ do repositório BeVans,
// mas mantém a credencial OpenAI exclusivamente no servidor Next.js.
export async function responderComModelo(pergunta,historico,{apiKey,fetcher=fetch,model='gpt-4o-mini'}={}){
 const {contexto,fontes,destino}=prepararPrompt(pergunta,historico);
 if(!contexto)return responderPeloFaq(pergunta,historico);
 if(!apiKey||typeof apiKey!=='string')throw Error('Credencial da IA não configurada.');
 const mensagens=[
  {role:'system',content:'Você é o assistente de suporte BeVans. Responda em português do Brasil de forma clara e curta. Use SOMENTE os trechos validados do FAQ apresentados na última mensagem. Responda à primeira pergunta do FAQ selecionado. Use os demais trechos apenas como apoio. Se a resposta não estiver sustentada, informe a limitação. Não invente funções, políticas, acesso, horários ou valores. Nunca solicite dados pessoais. Não execute ações no aplicativo.'},
  {role:'user',content:'Trechos confirmados do FAQ:\n'+contexto},
 ];
 const resposta=await fetcher('https://api.openai.com/v1/chat/completions',{
  method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},
  body:JSON.stringify({model,messages:mensagens,max_tokens:380,temperature:0.2}),
  signal:AbortSignal.timeout(18000),
 });
 if(!resposta.ok)throw Error('A IA está temporariamente indisponível.');
 const json=await resposta.json();
 const texto=json?.choices?.[0]?.message?.content;
 if(typeof texto!=='string'||!texto.trim())throw Error('A IA retornou uma resposta vazia.');
 return {resposta:texto.trim().slice(0,2400),modo:'ia',fontes,destino};
}
