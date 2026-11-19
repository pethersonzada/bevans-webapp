// Contratos HTTP espelhados dos serviços do bevans-frontend em 18/11/2026.
const clean = text => String(text || '').trim().replace(/\/+$/, '');
export const apiBase = () => {
  const raw = clean(process.env.NEXT_PUBLIC_BEVANS_API_URL);
  if (!raw) throw new Error('Configure NEXT_PUBLIC_BEVANS_API_URL antes de usar o painel.');
  const url = new URL(raw);
  if (url.protocol !== 'https:' && !(process.env.NODE_ENV === 'development' && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new Error('A API do painel precisa utilizar HTTPS.');
  if (url.username || url.password || url.search || url.hash) throw new Error('URL da API inválida.');
  return raw;
};
export function idSeguro(value) {
  if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value))) throw new Error('Identificador inválido.');
  return Number(value);
}
export function diaLocal(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function rotaPermitida(path) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || /[\r\n]/.test(path)) throw new Error('Caminho inválido.');
  return path;
}
export class ApiError extends Error {
  constructor(message, status, kind='http') { super(message); this.status=status; this.kind=kind; }
}
export async function apiRequest(token, path, options={}) {
  if (!token || typeof token !== 'string') throw new ApiError('Entre novamente para continuar.', 401, 'session');
  const url = apiBase() + rotaPermitida(path);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 16000);
  const external = options.signal;
  const abort = () => controller.abort();
  if (external?.aborted) controller.abort(); else external?.addEventListener('abort', abort, {once:true});
  try {
    const response = await fetch(url, {
      ...options, signal:controller.signal, cache:'no-store',
      headers:{...options.headers, Authorization:`Bearer ${token}`},
    });
    if (!response.ok) {
      let message = `Falha na API (HTTP ${response.status}).`;
      try { const body = await response.text(); if (body) {const data=JSON.parse(body);message=data.message||data.mensagem||data.detail||message;} } catch {}
      throw new ApiError(message, response.status);
    }
    if (response.status === 204) return null;
    const raw = await response.text();
    if (!raw.trim()) return null;
    try {return JSON.parse(raw);} catch {
      // Algumas mutações do backend respondem HTTP 200 com confirmação textual.
      if (options.method && options.method.toUpperCase() !== 'GET' && !response.headers.get('content-type')?.includes('json')) return raw;
      throw new ApiError('O servidor retornou uma resposta inesperada.', response.status, 'format');
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) throw new ApiError('A requisição expirou ou foi cancelada. Confira o servidor antes de repetir uma alteração.', 0, 'timeout');
    throw new ApiError('Sem conexão com o servidor. Confira a rede e tente novamente.', 0, 'network');
  } finally {clearTimeout(timeout);external?.removeEventListener('abort', abort);}
}
export function pagina(value) {
  if (!value || !Array.isArray(value.itens)) throw new Error('A API retornou uma lista inválida.');
  return value.itens;
}
export function array(value, label='lista') {
  if (!Array.isArray(value)) throw new Error(`A API retornou ${label} inválida.`);
  return value;
}
export const ep = {
  perfil:uid=>`/usuarios/por-uid/${encodeURIComponent(uid)}`,
  turmasMotorista:id=>`/turmas/motorista/${idSeguro(id)}`,
  turmasPassageiro:id=>`/turmas/usuario/${idSeguro(id)}/todas`,
  turmasPendentes:id=>`/turmas/${idSeguro(id)}/pendentes`,
  analisarVinculo:(id,status)=>`/turmas/analisar/${idSeguro(id)}?status=${status}`,
  rotas:'/rotas-publicas/minhas',
  rota:id=>`/rotas-publicas/${idSeguro(id)}`,
  embarques:'/embarques/minhas',
  embarquesRota:(id,data,sentido)=>`/rotas-publicas/${idSeguro(id)}/embarques?${new URLSearchParams({data,sentido})}`,
  analisarEmbarque:id=>`/embarques/${idSeguro(id)}/analise`,
  catalogo:params=>`/rotas-publicas/catalogo?${new URLSearchParams({pagina:'0',tamanho:'20',...params})}`,
  favoritas:id=>`/rotas-publicas/${idSeguro(id)}/favorito`,
  solicitacaoVaga:id=>`/rotas-publicas/${idSeguro(id)}/solicitacoes`,
  solicitarEmbarque:id=>`/rotas-publicas/${idSeguro(id)}/embarques`,
  notificacoes:'/notificacoes?pagina=0&tamanho=20',
  notificacoesNaoLidas:'/notificacoes/nao-lidas',
  notificacaoLida:id=>`/notificacoes/${idSeguro(id)}/leitura`,
  excursoes:'/excursoes?pagina=0&tamanho=20',
  execucoes:id=>`/excursoes/${idSeguro(id)}/execucoes`,
  estadoTurma:id=>`/rota/status-atual?turmaId=${idSeguro(id)}`,
  operacao:(tipo,id,motorista)=>`/operacoes/${tipo==='EXCURSAO'?'EXCURSAO':'VIAGEM'}/${idSeguro(id)}${motorista?'':'/minha'}`,
  estadoOperacional:(tipo,id,pid,motorista)=>`/operacoes/${tipo==='EXCURSAO'?'EXCURSAO':'VIAGEM'}/${idSeguro(id)}${motorista?`/passageiros/${idSeguro(pid)}`:'/minha'}/estado`,
};
