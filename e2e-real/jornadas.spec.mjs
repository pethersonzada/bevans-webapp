import {test,expect} from '@playwright/test';
import {validarStagingReal} from '../app/lib/evidencias-staging.mjs';

const contexto=validarStagingReal({
 webUrl:process.env.BEVANS_STAGING_WEB_URL,
 apiUrl:process.env.BEVANS_STAGING_API_URL,
 expectedSha:process.env.BEVANS_STAGING_EXPECTED_SHA,
});
if(process.env.BEVANS_FIXTURES_DESCARTAVEIS!=='confirmado')
 throw Error('Confirme o uso exclusivo de contas e banco descartáveis de homologação.');

function conta(perfil){
 const email=process.env['BEVANS_STAGING_'+perfil+'_EMAIL'];
 const senha=process.env['BEVANS_STAGING_'+perfil+'_PASSWORD'];
 if(!email||!senha||!email.includes('@'))throw Error('Credenciais descartáveis ausentes para '+perfil+'.');
 return {email,senha};
}
const motorista=conta('MOTORISTA');
const passageiro=conta('PASSAGEIRO');
if(motorista.email===passageiro.email)throw Error('Use identidades separadas por perfil.');

test.beforeEach(async({page})=>{
 const chave=process.env.BEVANS_STAGING_VERCEL_BYPASS;
 if(!chave)return;
 // O bypass opcional vale SOMENTE para a origem exata do Preview.
 // Não encaminhar o header para Firebase, backend, Streamlit ou Mapbox.
 await page.route('**/*',route=>{
  if(new URL(route.request().url()).origin!==contexto.webOrigin)return route.continue();
  return route.continue({headers:{
   ...route.request().headers(),
   'x-vercel-protection-bypass':chave,
  }});
 });
});

async function entrar(page,identidade){
 await page.goto('/login',{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'Acessar minha conta'})).toBeVisible();
 await page.getByLabel('E-mail').fill(identidade.email);
 await page.getByLabel('Senha',{exact:true}).fill(identidade.senha);
 await page.getByRole('button',{name:'Entrar',exact:true}).click();
}

test('visitante sem autenticação recebe login, sem acessar painel privado',async({page,request})=>{
 await page.goto('/painel');
 await expect(page.getByRole('heading',{name:'Acessar minha conta'})).toBeVisible();
 const res=await request.get(contexto.apiOrigin+'/notificacoes',{failOnStatusCode:false});
 expect([401,403]).toContain(res.status());
});

test('motorista real acessa somente menu autorizado e encerra sessão',async({page})=>{
 await entrar(page,motorista);
 const menu=page.getByRole('navigation',{name:'Áreas do painel'});
 await expect(menu).toBeVisible();
 for(const area of ['Início','Turmas','Viagens','Rotas','Mais'])
  await expect(menu.getByRole('button',{name:area,exact:true})).toBeVisible();
 await menu.getByRole('button',{name:'Mais',exact:true}).click();
 await expect(page.getByRole('button',{name:'Embarques e operações',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Sair da conta'}).click();
 await expect(page.getByRole('heading',{name:'Acessar minha conta'})).toBeVisible();
});

test('passageiro real em celular não acessa ferramentas do motorista e sai com segurança',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await entrar(page,passageiro);
 const menu=page.getByRole('navigation',{name:'Navegação do painel'});
 await expect(menu).toBeVisible();
 for(const area of ['Início','Rotas','Pedidos','Viagens','Mais'])
  await expect(menu.getByRole('button',{name:area,exact:true})).toBeVisible();
 await menu.getByRole('button',{name:'Mais',exact:true}).click();
 await expect(page.getByRole('button',{name:'Meu embarque',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Editor de rotas',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Gestão de excursões',exact:true})).toHaveCount(0);
 const tamanho=await page.evaluate(()=>({largura:innerWidth,documento:document.documentElement.scrollWidth}));
 expect(tamanho.documento).toBeLessThanOrEqual(tamanho.largura+2);
 await page.getByRole('button',{name:'Sair da conta'}).click();
 await expect(page.getByRole('heading',{name:'Acessar minha conta'})).toBeVisible();
});
