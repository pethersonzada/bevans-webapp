import {getApps, initializeApp} from '@firebase/app';
import {
  browserLocalPersistence, indexedDBLocalPersistence, initializeAuth,
  onAuthStateChanged, signInWithEmailAndPassword, signOut,
} from '@firebase/auth';
import {useSyncExternalStore} from 'react';
import {firebaseApiKey} from './bevans-auth.mjs';
import {apiRequest, ApiError} from './bevans-api.mjs';

let auth;
function autenticacao() {
  if (!firebaseApiKey()) throw Error('O acesso por conta está indisponível neste ambiente.');
  if (!auth) {
    const nome = 'bevans-web';
    const app = getApps().find(item => item.name === nome) || initializeApp({apiKey: firebaseApiKey()}, nome);
    auth = initializeAuth(app, {persistence: [indexedDBLocalPersistence, browserLocalPersistence]});
  }
  return auth;
}

let identidade;
const ouvintes = new Set();
let observar;
function assinar(listener) {
  ouvintes.add(listener);
  if (!observar) {
    const atualizar = user => {
      identidade = user;
      for (const notify of ouvintes) notify();
    };
    if (firebaseApiKey()) observar = onAuthStateChanged(autenticacao(), atualizar);
    else atualizar(null);
  }
  return () => ouvintes.delete(listener);
}
export function useIdentidade() {
  return useSyncExternalStore(assinar, () => identidade, () => undefined);
}
export async function entrar(email, senha) {
  const provider = autenticacao();
  try { await signInWithEmailAndPassword(provider, email, senha); }
  catch (e) {
    if (e.code === 'auth/network-request-failed') throw Error('Sem conexão com o serviço de acesso. Tente novamente.');
    if (e.code === 'auth/too-many-requests') throw Error('Muitas tentativas. Aguarde antes de tentar novamente.');
    throw Error('Não foi possível entrar. Confira o e-mail e a senha.');
  }
}
export const contaAtual = user => !!user && autenticacao().currentUser === user;
export async function sair(user) {
  if (contaAtual(user)) await signOut(autenticacao());
}

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
export async function consultar(user, path, options) {
  const enviar = async credencial => {
    conferir(user);
    const dados = await apiRequest(credencial, path, options);
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
export {token as obterToken};
