import {test,expect} from '@playwright/test';

const cors={
 'Access-Control-Allow-Origin':'*',
 'Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS',
 'Access-Control-Allow-Headers':'Authorization,Content-Type,X-Convite,X-Inscricao',
 'Cache-Control':'no-store',
};
const respond=(route,body,status=200)=>route.fulfill({status,headers:{...cors,'Content-Type':'application/json'},body:JSON.stringify(body)});
const person=role=>role==='MOTORISTA'?{id:7,nome:'Condutor Homologação',tipo:'MOTORISTA'}:{id:8,nome:'Passageiro Homologação',tipo:'PASSAGEIRO'};

async function mockedLogin(page,role='MOTORISTA'){
 const fakeProfile=person(role);
 await page.route('https://identitytoolkit.googleapis.com/**',async route=>{
  if(!route.request().url().includes('signInWithPassword'))return respond(route,{},404);
  await respond(route,{idToken:'synthetic-test-token',refreshToken:'synthetic-refresh',localId:'uid-homologacao',expiresIn:'3600'});
 });
 await page.route('https://api.bevans.invalid/**',async route=>{
  const request=route.request();
  if(request.method()==='OPTIONS')return route.fulfill({status:204,headers:cors});
  const url=new URL(request.url()),path=url.pathname;
  if(request.headers().authorization!=='Bearer synthetic-test-token')return respond(route,{message:'Sem sessão'},401);
  if(path==='/usuarios/por-uid/uid-homologacao')return respond(route,fakeProfile);
  if(path==='/turmas/motorista/7')return respond(route,[{id:41,nome:'Turma QA',origemNome:'Origem teste',origemLatitude:-8.1,origemLongitude:-35.1,destinoNome:'Destino teste',destinoLatitude:-8.12,destinoLongitude:-35.12}]);
  if(path==='/turmas/usuario/8/todas')return respond(route,[]);
  if(path==='/turmas/41/passageiros')return respond(route,[]);
  if(path==='/rota/status-atual')return respond(route,{status:'INATIVA'});
  if(path==='/notificacoes/preferencias')return respond(route,{pushOperacional:true,pushInformativo:true});
  if(path==='/notificacoes/nao-lidas')return respond(route,0);
  if(path==='/excursoes'||path==='/rotas-publicas/catalogo'||path==='/notificacoes')return respond(route,{itens:[],content:[]});
  return respond(route,[]);
 });
 await page.goto('/painel');
 await page.getByLabel('E-mail').fill('qa@exemplo.invalid');
 await page.getByLabel('Senha',{exact:true}).fill('senha-sintetica');
 await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await expect(page.getByRole('navigation',{name:'Áreas do painel'})).toBeVisible();
}

test('login exige autenticação e aplica política de geolocalização própria',async ({page})=>{
 const response=await page.goto('/painel');
 expect(response.status()).toBe(200);
 await expect(page.getByRole('heading',{name:'Acessar minha conta'})).toBeVisible();
 const policy=response.headers()['permissions-policy'];
 expect(policy).toContain('camera=()');
 expect(policy).toContain('microphone=()');
 expect(policy).toContain('geolocation=(self)');
 await expect(page.getByRole('navigation',{name:'Áreas do painel'})).toHaveCount(0);
});

test('mapa do motorista não quebra sem token Mapbox e operações permanecem protegidas',async ({page})=>{
 const failures=[];
 page.on('pageerror',error=>failures.push(error.message));
 await mockedLogin(page);
 const nav=page.getByRole('navigation',{name:'Áreas do painel'});
 await nav.getByRole('button',{name:'Mapa e viagens'}).click();
 await page.getByRole('combobox',{name:'Turma'}).selectOption('41');
 await expect(page.getByRole('heading',{name:'Mapa da operação'})).toBeVisible();
 await expect(page.getByRole('alert').filter({hasText:'Configure NEXT_PUBLIC_BEVANS_MAPBOX_TOKEN'})).toBeVisible();
 await expect(page.getByText('Sem viagem ativa')).toBeVisible();
 expect(failures).toEqual([]);
});

test('passageiro não recebe controles exclusivos de motorista e perde sessão ao sair',async ({page})=>{
 await mockedLogin(page,'PASSAGEIRO');
 const nav=page.getByRole('navigation',{name:'Áreas do painel'});
 await expect(nav.getByRole('button',{name:'Editor de rotas'})).toHaveCount(0);
 await expect(nav.getByRole('button',{name:'Gestão de excursões'})).toHaveCount(0);
 await nav.getByRole('button',{name:'Configurações'}).click();
 await expect(page.getByRole('heading',{name:'Preferências de notificações'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Falar com motorista autorizado'})).toBeVisible();
 await page.getByRole('button',{name:'Sair da conta'}).click();
 await expect(page.getByRole('heading',{name:'Acessar minha conta'})).toBeVisible();
 const localData=await page.evaluate(()=>JSON.stringify(Object.entries(localStorage)));
 expect(localData).not.toContain('synthetic-test-token');
 expect(localData).not.toContain('synthetic-refresh');
});

test('convite público nunca deixa segredo na URL e usa cabeçalho X-Convite',async ({page})=>{
 const invite='token-sintetico-123';
 const captured=[];
 await page.route('https://api.bevans.invalid/**',async route=>{
  if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:cors});
  captured.push({path:new URL(route.request().url()).pathname,token:route.request().headers()['x-convite']});
  return respond(route,{
   titulo:'Viagem de homologação',destinoNome:'Centro teste',destinoLatitude:-8.1,destinoLongitude:-35.1,
   partidaEm:'2027-01-05T08:00:00Z',vagasDisponiveis:10,modoColeta:'PARADA_UNICA',
   paradas:[{id:15,nome:'Ponto principal',latitude:-8.11,longitude:-35.11}],
  });
 });
 await page.goto('/convite#'+invite);
 await expect(page.getByRole('heading',{name:'Viagem de homologação'})).toBeVisible();
 await expect(page).toHaveURL(/\/convite$/);
 expect(captured.some(x=>x.path==='/publico/excursoes/convite'&&x.token===invite)).toBeTruthy();
 await expect(page.locator('body')).not.toContainText(invite);
});

test('login permanece utilizável em largura mobile',async ({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/painel');
 await expect(page.getByLabel('E-mail')).toBeVisible();
 await expect(page.getByLabel('Senha',{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Entrar',exact:true})).toBeVisible();
 const {scrollWidth,viewportWidth}=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewportWidth:window.innerWidth}));
 expect(scrollWidth).toBeLessThanOrEqual(viewportWidth+4);
});

test('identidade do build é pública, sem cache e não divulga ambiente privado',async ({request})=>{
 const r=await request.get('/api/build-info');
 expect(r.status()).toBe(200);
 expect(r.headers()['cache-control']).toContain('no-store');
 expect(r.headers()['x-robots-tag']).toContain('noindex');
 const body=await r.json();
 expect(Object.keys(body).sort()).toEqual(['commit','environment']);
 expect(['production','preview','development','unknown']).toContain(body.environment);
 if(body.commit!==null)expect(body.commit).toMatch(/^[a-f0-9]{40}$/);
});

test('motorista consulta histórico e corrige ausência somente com motivo e versão',async ({page})=>{
 await mockedLogin(page);
 const initial={id:15,alunoId:8,nome:'Passageiro de teste',estado:'NAO_EMBARCOU',versao:4};
 let stored=initial;
 const calls=[];
 await page.route('https://api.bevans.invalid/rota/status-atual?turmaId=41',route=>respond(route,{status:'ATIVA',viagemId:77,sentido:'IDA'}));
 await page.route('https://api.bevans.invalid/operacoes/VIAGEM/77',route=>respond(route,{
  referenciaId:77,tipo:'VIAGEM',sentido:'IDA',
  contadores:{esperados:1,aguardando:stored.estado==='AGUARDANDO'?1:0,naVan:0,naoEmbarcaram:stored.estado==='NAO_EMBARCOU'?1:0,desembarcados:0},
  registros:[stored]
 }));
 await page.route('https://api.bevans.invalid/operacoes/VIAGEM/77/passageiros/15/historico',route=>respond(route,[{
  id:9,anterior:'AGUARDANDO',novo:'NAO_EMBARCOU',versaoRegistro:4,criadoEm:'2026-11-21T10:00:00Z',correcao:false,
 }]));
 await page.route('https://api.bevans.invalid/operacoes/VIAGEM/77/passageiros/15/estado',route=>{
  const payload=route.request().postDataJSON();calls.push(payload);
  stored={...stored,estado:payload.estado,versao:5};
  return respond(route,stored);
 });
 page.on('dialog',d=>d.accept());
 await page.getByRole('navigation',{name:'Áreas do painel'}).getByRole('button',{name:'Operações'}).click();
 await page.getByRole('combobox',{name:'Turma'}).selectOption('41');
 await page.getByRole('button',{name:'Consultar estado oficial'}).click();
 await expect(page.getByText('Passageiro de teste')).toBeVisible();
 await page.getByRole('button',{name:'Histórico do registro'}).click();
 await expect(page.getByRole('heading',{name:'Histórico do registro'})).toBeVisible();
 await expect(page.getByText('Aguardando → Não embarcou')).toBeVisible();
 await page.getByRole('button',{name:'Corrigir para aguardando'}).click();
 await expect(page.getByRole('button',{name:'Confirmar correção'})).toBeDisabled();
 await page.getByRole('textbox',{name:'Motivo da correção'}).fill('Ausência lançada por engano.');
 await page.getByRole('button',{name:'Confirmar correção'}).click();
 await expect(page.getByText('Alteração confirmada pelo servidor. Estado e contadores atualizados.')).toBeVisible();
 expect(calls).toEqual([{estado:'AGUARDANDO',versao:4,correcao:true,motivo:'Ausência lançada por engano.'}]);
 await expect(page.getByText('Estado: Aguardando · Versão: 5')).toBeVisible();
});

test('passageiro acessa somente o próprio registro e histórico da viagem',async ({page})=>{
 await mockedLogin(page,'PASSAGEIRO');
 await page.route('https://api.bevans.invalid/turmas/usuario/8/todas',route=>respond(route,[{id:41,nome:'Turma QA'}]));
 await page.route('https://api.bevans.invalid/rota/status-atual?turmaId=41',route=>respond(route,{status:'ATIVA',viagemId:77,sentido:'IDA'}));
 await page.route('https://api.bevans.invalid/operacoes/VIAGEM/77/minha',route=>respond(route,{id:15,alunoId:8,estado:'AGUARDANDO',versao:0}));
 await page.route('https://api.bevans.invalid/operacoes/VIAGEM/77/minha/historico',route=>respond(route,[]));
 await page.getByRole('navigation',{name:'Áreas do painel'}).getByRole('button',{name:'Operações'}).click();
 await page.getByRole('combobox',{name:'Turma'}).selectOption('41');
 await page.getByRole('button',{name:'Consultar estado oficial'}).click();
 await expect(page.getByText('Meu estado:')).toBeVisible();
 await expect(page.getByRole('button',{name:'Corrigir para aguardando'})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Histórico do registro'})).toHaveCount(0);
 await page.getByRole('button',{name:'Meu histórico'}).click();
 await expect(page.getByText('Nenhum evento registrado.')).toBeVisible();
});
