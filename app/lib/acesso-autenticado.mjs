import {ApiError} from './bevans-api.mjs';

export function criarAcesso({contaAtual,sair,request}) {
  const pendentes = new WeakMap();
  function conferir(user) {
    if (!contaAtual(user)) throw Error('A conta mudou. Abra o painel novamente.');
  }
  async function token(user, forcar = false) {
    conferir(user);
    let tarefa = pendentes.get(user);
    if (!tarefa || (forcar && !tarefa.forcar)) {
      tarefa = {forcar, resultado: user.getIdToken(forcar)};
      pendentes.set(user, tarefa);
    }
    try {
      const valor = await tarefa.resultado;
      conferir(user);
      return valor;
    } catch (e) {
      if (['auth/user-disabled','auth/user-token-expired','auth/invalid-refresh-token','auth/invalid-grant','auth/user-not-found'].includes(e.code)) {
        await sair(user);
        throw Error('Sua sessão expirou. Entre novamente.');
      }
      throw Error('Não foi possível renovar o acesso. Confira a conexão e tente novamente.');
    } finally {
      if (pendentes.get(user) === tarefa) pendentes.delete(user);
    }
  }
  async function consultar(user, path, options) {
    const enviar = async credencial => {
      conferir(user);
      const dados = await request(credencial, path, options);
      conferir(user);
      return dados;
    };
    const original = await token(user);
    try { return await enviar(original); }
    catch (e) {
      if (!(e instanceof ApiError) || e.status !== 401) throw e;
      const renovado = await token(user, true);
      // Escritas podem ter efeitos. A repetição exige nova ação do titular.
      if (!['GET','HEAD'].includes(options?.method?.toUpperCase() || 'GET')) throw e;
      return enviar(renovado);
    }
  }
  return {consultar, obterToken:token};
}
