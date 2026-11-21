import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const project=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const lock=JSON.parse(readFileSync(new URL('../package-lock.json',import.meta.url),'utf8'));
const next=project.dependencies.next;
const eslintNext=project.devDependencies['eslint-config-next'];

test('Next e ESLint Next estão na mesma versão fixada e com patch de segurança',()=>{
 assert.match(next,/^\d+\.\d+\.\d+$/);
 assert.equal(eslintNext,next);
 const [major,minor,patch]=next.split('.').map(Number);
 assert.ok(major>16||(major===16&&(minor>4||(minor===4&&patch>=1))),
  'Versões 16.4.0 e anteriores possuem advisories críticos conhecidos.');
});

test('package-lock contém exatamente as versões declaradas',()=>{
 assert.equal(lock.lockfileVersion,3);
 assert.equal(lock.packages[''].dependencies.next,next);
 assert.equal(lock.packages[''].devDependencies['eslint-config-next'],eslintNext);
 assert.equal(lock.packages['node_modules/next'].version,next);
 assert.equal(lock.packages['node_modules/eslint-config-next'].version,eslintNext);
 assert.match(lock.packages['node_modules/next'].integrity,/^sha512-/);
 assert.match(lock.packages['node_modules/eslint-config-next'].integrity,/^sha512-/);
});
