// Valida a conversa nativa em produção sem pedir credenciais ou dados pessoais.
export function validarPaginaAssistente({status,html}){
 if(status!==200)throw Error('A página /assistente não retornou HTTP 200.');
 if(typeof html!=='string'||!html.includes('Iniciar conversa no BeVans')||
    !html.includes('Seu espaço para tirar dúvidas sobre o BeVans'))
  throw Error('A página publicada não apresenta o acesso ao chat nativo.');
 if(html.includes('bevans-suporte.streamlit.app/?embed=true'))
  throw Error('A página ainda embute o Streamlit.');
 return true;
}

export function validarRespostaChat({status,tipo,dados}){
 if(status!==200)throw Error('A API do chat não retornou HTTP 200.');
 if(!/^application\/json(?:;|$)/i.test(tipo||''))
  throw Error('A API do chat não retornou JSON.');
 if(!dados||typeof dados.resposta!=='string'||!dados.resposta.trim()||
    !['faq','ia'].includes(dados.modo))
  throw Error('A API do chat retornou contrato inválido.');
 if(dados.resposta.length>2500)throw Error('Resposta do chat excedeu o limite.');
 return true;
}
