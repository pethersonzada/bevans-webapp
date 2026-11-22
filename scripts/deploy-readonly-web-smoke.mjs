import {validarWebPublica} from '../app/lib/deploy-readonly-web.mjs';

const target=process.env.BEVANS_DEPLOY_TARGET||'production';
const baseUrl=process.env.BEVANS_DEPLOY_BASE_URL||'https://bevans-webapp.vercel.app';
const expectedSha=process.env.BEVANS_EXPECTED_SHA;

validarWebPublica({target,baseUrl,expectedSha}).then(result=>{
 console.log('PASS: versão '+result.sha.slice(0,12)+', ambiente '+result.target+
  ', HTTP de '+result.verifiedPaths.join(', ')+'.');
 console.log('Nenhum token ou endpoint privado foi utilizado. Integração Firebase/API/Mapbox permanece não homologada.');
}).catch(e=>{
 console.error('FAIL: verificação somente leitura: '+e.message);
 process.exitCode=1;
});
