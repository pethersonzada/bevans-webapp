const TIPOS=new Set(['ORIGEM','DESTINO','PARADA','INDIVIDUAL','EXCEPCIONAL']);
const falha=()=>new Error('Roteiro operacional incompleto ou inconsistente. Nenhum ponto obrigatório pode ser omitido.');
const idValido=n=>Number.isSafeInteger(n)&&n>0;
export function coordenadaRoteiroValida(p){
 return !!p&&Number.isFinite(p.latitude)&&Math.abs(p.latitude)<=90&&Number.isFinite(p.longitude)&&Math.abs(p.longitude)<=180&&!(p.latitude===0&&p.longitude===0);
}
export function validarRoteiroOperacional(pontos){
 if(!Array.isArray(pontos)||pontos.length<2)throw falha();
 const vistos=new Set();
 return pontos.map((p,i)=>{
  if(!p||!TIPOS.has(p.tipo)||i===0&&p.tipo!=='ORIGEM'||i===pontos.length-1&&p.tipo!=='DESTINO'||
     i>0&&i<pontos.length-1&&['ORIGEM','DESTINO'].includes(p.tipo)||
     !(p.paradaId===null||idValido(p.paradaId))||
     p.tipo==='PARADA'&&!idValido(p.paradaId)||
     typeof p.nome!=='string'||!p.nome.trim()||!coordenadaRoteiroValida(p)||!Array.isArray(p.passageiros))throw falha();
  const people=p.passageiros.map(a=>{
   if(!a||!idValido(a.id)||vistos.has(a.id)||typeof a.nome!=='string'||!a.nome.trim()||!coordenadaRoteiroValida(a))throw falha();
   vistos.add(a.id);return {...a};
  });
  return {...p,passageiros:people,chave:i+':'+p.tipo+':'+(p.paradaId??'')};
 });
}
export function conferirSnapshotRoteiro(pontos,operacao,viagemId,sentido){
 const assigned=pontos.flatMap((p,ordem)=>p.passageiros.map(a=>({id:a.id,ordem,paradaId:p.paradaId})));
 if(!idValido(viagemId)||!['IDA','VOLTA'].includes(sentido)||
  !operacao||operacao.tipo!=='VIAGEM'||operacao.referenciaId!==viagemId||operacao.sentido!==sentido||
  !Array.isArray(operacao.registros)||operacao.contadores?.esperados!==assigned.length||
  operacao.registros.length!==assigned.length||
  new Set(operacao.registros.map(r=>r.alunoId)).size!==assigned.length||
  assigned.some(a=>!operacao.registros.some(r=>r.alunoId===a.id&&r.ordem===a.ordem&&r.paradaId===a.paradaId)))
   throw new Error('O roteiro não corresponde à operação atual. Atualize antes de traçar o percurso.');
 return true;
}
export function assinaturaRoteiroWeb({usuarioId,turmaId,viagemId,sentido},pontos){
 if(!idValido(usuarioId)||!idValido(turmaId)||!idValido(viagemId)||!['IDA','VOLTA'].includes(sentido)||!Array.isArray(pontos))
  throw falha();
 return JSON.stringify([usuarioId,turmaId,viagemId,sentido,pontos.map(p=>[p.chave,p.nome,p.latitude,p.longitude,p.passageiros.map(a=>a.id)])]);
}
export function conferirContextoRoteiro(selo,contexto,pontos){
 return typeof selo==='string'&&selo===assinaturaRoteiroWeb(contexto,pontos);
}
