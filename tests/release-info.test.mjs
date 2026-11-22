import {test} from 'node:test';
import assert from 'node:assert/strict';
import {releaseInfo,checkExpectedRelease} from '../app/lib/release-info.mjs';

const sha='a1b2c3d4e5f60123456789abcdeffedcba987654';
const other='f'.repeat(40);

test('a proveniência do build só é exibida quando o SHA é válido',()=>{
  assert.deepEqual(releaseInfo({VERCEL_GIT_COMMIT_SHA:sha.toUpperCase(),VERCEL_ENV:'production'}),{
    commit:sha,environment:'production',
  });
  assert.deepEqual(releaseInfo({}),{commit:null,environment:'unknown'});
  for(const candidate of ['main','1234567','x'.repeat(40),'a'.repeat(41),'a'.repeat(39)+'\n']){
    assert.equal(releaseInfo({VERCEL_GIT_COMMIT_SHA:candidate}).commit,null);
  }
});

test('somente ambientes declarados são exibidos, sem aceitar dados arbitrários',()=>{
  for(const name of ['production','preview','development'])assert.equal(releaseInfo({VERCEL_ENV:name}).environment,name);
  for(const name of ['Production','preview;token=private','staging','localhost',''])assert.equal(releaseInfo({VERCEL_ENV:name}).environment,'unknown');
});

test('endpoint público não incorpora tokens, informações de usuário ou coordenadas',()=>{
  const info=releaseInfo({
    VERCEL_GIT_COMMIT_SHA:sha,VERCEL_ENV:'preview',
    SECRET:'private-secret',FIREBASE_PRIVATE_KEY:'another-secret',
    NEXT_PUBLIC_BEVANS_API_URL:'https://private.example.invalid',
    latitude:-8.1,longitude:-35.2,
  });
  assert.deepEqual(Object.keys(info).sort(),['commit','environment']);
  const serialized=JSON.stringify(info);
  for(const fragment of ['private-secret','another-secret','private.example.invalid','-8.1','-35.2'])assert.equal(serialized.includes(fragment),false);
});

test('verificação de release falha fechada em SHA ausente, inválido ou divergente',()=>{
  assert.equal(checkExpectedRelease({commit:sha,environment:'preview'},sha.toUpperCase()),true);
  assert.throws(()=>checkExpectedRelease({commit:sha,environment:'production'},other),/não executa o commit esperado/);
  assert.throws(()=>checkExpectedRelease({commit:null,environment:'preview'},sha),/SHA verificável/);
  assert.throws(()=>checkExpectedRelease({commit:sha,environment:'unknown'},sha),/não identificado/);
  assert.throws(()=>checkExpectedRelease({commit:sha,environment:'preview'},'main'),/40 dígitos/);
});
