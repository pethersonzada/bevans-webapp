import {writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {criarRegistroHomologacao} from '../app/lib/evidencias-staging.mjs';

// Executar somente após o workflow de homologação concluir seus testes com sucesso.
try{
 const registro=criarRegistroHomologacao({
  webUrl:process.env.BEVANS_STAGING_WEB_URL,
  apiUrl:process.env.BEVANS_STAGING_API_URL,
  expectedSha:process.env.BEVANS_STAGING_EXPECTED_SHA,
  runId:process.env.GITHUB_RUN_ID,
  dataIso:new Date().toISOString(),
 });
 const pasta=process.env.RUNNER_TEMP;
 if(!pasta)throw Error('Diretório temporário do runner indisponível.');
 const dir=join(pasta,'evidencias-bevans-staging');
 mkdirSync(dir,{recursive:true});
 writeFileSync(join(dir,'resultado.json'),JSON.stringify(registro,null,2)+'\n',{mode:0o600});
 console.log('Registro de homologação somente leitura gerado para SHA '+registro.sha.slice(0,12)+'.');
 console.log('As evidências NÃO cobrem operações mutáveis nem GPS.');
}catch(e){
 console.error('Não foi possível gerar um registro válido de homologação: '+e.message);
 process.exitCode=1;
}
