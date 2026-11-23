import {getApps, initializeApp} from '@firebase/app';
import {
  browserLocalPersistence, indexedDBLocalPersistence, initializeAuth,
  onAuthStateChanged, signInWithEmailAndPassword, signOut,
} from '@firebase/auth';
import {useSyncExternalStore} from 'react';
import {firebaseApiKey} from './bevans-auth.mjs';
import {criarAcesso} from './acesso-autenticado.mjs';
import {apiRequest} from './bevans-api.mjs';

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

export const {consultar, obterToken} = criarAcesso({contaAtual, sair, request:apiRequest});
