// Monta caminhos em uma origem de staging sem gerar '//painel' ou '//notificacoes'.
export function stagingBaseUrl(url){
  if(!(url instanceof URL)||url.protocol!=='https:')throw new Error('Origem de staging HTTPS inválida.');
  return url.origin+(url.pathname==='/'?'':url.pathname.replace(/\/+$/,''));
}
