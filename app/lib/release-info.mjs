// Exposição pública mínima: somente a proveniência do build informada pela Vercel.
// Nunca inclua IDs de conta, URLs privadas, headers, tokens ou coordenadas neste contrato.
const SHA=/^[0-9a-f]{40}$/i;
const environments=new Set(['production','preview','development']);

export function releaseInfo(env={}){
  const raw=typeof env.VERCEL_GIT_COMMIT_SHA==='string'?env.VERCEL_GIT_COMMIT_SHA:'';
  const commit=SHA.test(raw)?raw.toLowerCase():null;
  const name=typeof env.VERCEL_ENV==='string'?env.VERCEL_ENV:'';
  return {
    commit,
    environment:environments.has(name)?name:'unknown',
  };
}

export function checkExpectedRelease(actual,expected){
  if(typeof expected!=='string'||!SHA.test(expected))throw new Error('O SHA esperado precisa ter 40 dígitos hexadecimais.');
  if(!actual||typeof actual!=='object'||typeof actual.commit!=='string'||!SHA.test(actual.commit)){
    throw new Error('O deploy não fornece um SHA verificável: confira as variáveis de build da Vercel.');
  }
  if(actual.commit.toLowerCase()!==expected.toLowerCase()){
    throw new Error('O ambiente não executa o commit esperado.');
  }
  if(!environments.has(actual.environment))throw new Error('Ambiente de deploy não identificado.');
  return true;
}
