'use client';

import {useEffect,useState} from 'react';

const escolha=[['AMBOS','Vou e volto'],['IDA','Só ida'],['VOLTA','Só volta'],['NAO_VOU','Não vou'],['LIMPAR','Limpar confirmação']];
export default function PresencaWeb({api,turmaId,usuarioId,viagem}) {
  const [enderecos,setEnderecos]=useState([]),[status,setStatus]=useState(''),[ida,setIda]=useState(''),[volta,setVolta]=useState(''),[coletas,setColetas]=useState(null);
  const [carregando,setCarregando]=useState(true),[ocupado,setOcupado]=useState(false),[erro,setErro]=useState(''),[mensagem,setMensagem]=useState('');
  useEffect(()=>{
    if(!turmaId||!usuarioId)return;
    let vivo=true;
    Promise.resolve().then(async()=>{
      if(!vivo)return;
      setCarregando(true);setErro('');setMensagem('');
      try{
        const [enderecosResp,confirmacao,coletaIda,coletaVolta]=await Promise.all([
          api(`/enderecos/usuario/${usuarioId}`),api(`/rota/minha-confirmacao?usuarioId=${usuarioId}&turmaId=${turmaId}`),
          api(`/turmas/${turmaId}/coleta/IDA`),api(`/turmas/${turmaId}/coleta/VOLTA`)
        ]);
        if(!Array.isArray(enderecosResp)||!confirmacao||typeof confirmacao.status!=='string')throw Error('Dados da confirmação inválidos.');
        if(vivo){setEnderecos(enderecosResp);setColetas({IDA:coletaIda,VOLTA:coletaVolta});setStatus(confirmacao.status);setIda(String(confirmacao.enderecoIda?.id||''));setVolta(String(confirmacao.enderecoVolta?.id||''));}
      }catch(e){if(vivo)setErro(e.message);}finally{if(vivo)setCarregando(false);}
    });
    return()=>{vivo=false;};
  },[api,turmaId,usuarioId]);
  async function salvar(e){
    e.preventDefault();if(ocupado)return;
    if(viagem?.status==='ATIVA'){setErro('Há uma viagem ativa. Confira as regras de presença com o motorista.');return;}
    if(!coletas){setErro('Consulte a configuração da coleta da turma antes de confirmar.');return;}
    if(['IDA','AMBOS'].includes(status)&&(coletas.IDA?.modo==='PARADAS_DEFINIDAS'?!coletas.IDA.escolhidaId:!ida) || ['VOLTA','AMBOS'].includes(status)&&(coletas.VOLTA?.modo==='PARADAS_DEFINIDAS'?!coletas.VOLTA.escolhidaId:!volta)){
      setErro('Escolha os endereços ou pontos necessários para cada sentido. Use a aba Turmas para escolher paradas fixas.');return;
    }
    if(!status){setErro('Escolha uma resposta.');return;}
    if(!window.confirm('Confirmar a resposta da presença de hoje?'))return;
    setOcupado(true);setErro('');setMensagem('');
    try{
      const p=new URLSearchParams({usuarioId:String(usuarioId),turmaId:String(turmaId),status});
      if(['IDA','AMBOS'].includes(status)&&coletas.IDA?.modo!=='PARADAS_DEFINIDAS')p.set('enderecoIda',ida);
      if(['VOLTA','AMBOS'].includes(status)&&coletas.VOLTA?.modo!=='PARADAS_DEFINIDAS')p.set('enderecoVolta',volta);
      const resposta=await api(`/rota/confirmar?${p.toString()}`,{method:'POST'});
      if(resposta!=='SUCESSO')throw Error('Confirmação não reconhecida. Consulte o estado antes de repetir.');
      const atual=await api(`/rota/minha-confirmacao?usuarioId=${usuarioId}&turmaId=${turmaId}`);
      setStatus(atual.status||'');setIda(String(atual.enderecoIda?.id||''));setVolta(String(atual.enderecoVolta?.id||''));
      setMensagem('Presença de hoje atualizada no servidor.');
    }catch(e){setErro(e.message);}finally{setOcupado(false);}
  }
  if(!turmaId||!usuarioId)return null;
  return <section className="be-card" aria-label="Confirmação de presença">
    <h2>Presença de hoje</h2><p className="be-muted">Escolha a participação na ida, na volta ou em ambos os sentidos. A confirmação só é registrada após resposta da API.</p>
    {erro&&<p role="alert" className="be-error">{erro}</p>}
    {mensagem&&<p role="status">{mensagem}</p>}
    {carregando?<p>Carregando presença e endereços…</p>:<form className="be-form" onSubmit={salvar}>
      <div className="be-fieldset"><label>Vou viajar?<select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Selecione</option>{escolha.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      {['IDA','AMBOS'].includes(status)&&coletas?.IDA?.modo==='PARADAS_DEFINIDAS'?<p>Ida: {coletas.IDA.escolhidaId?'Parada escolhida.':'Nenhuma parada escolhida. Selecione na aba Turmas.'}</p>:null}
      {['IDA','AMBOS'].includes(status)&&coletas?.IDA?.modo!=='PARADAS_DEFINIDAS'&&<label>Endereço de ida<select value={ida} onChange={e=>setIda(e.target.value)}><option value="">Selecione</option>{enderecos.map(p=><option key={p.id} value={p.id}>{p.apelido||p.rua}</option>)}</select></label>}
      {['VOLTA','AMBOS'].includes(status)&&coletas?.VOLTA?.modo==='PARADAS_DEFINIDAS'?<p>Volta: {coletas.VOLTA.escolhidaId?'Parada escolhida.':'Nenhuma parada escolhida. Selecione na aba Turmas.'}</p>:null}
      {['VOLTA','AMBOS'].includes(status)&&coletas?.VOLTA?.modo!=='PARADAS_DEFINIDAS'&&<label>Endereço de volta<select value={volta} onChange={e=>setVolta(e.target.value)}><option value="">Selecione</option>{enderecos.map(p=><option key={p.id} value={p.id}>{p.apelido||p.rua}</option>)}</select></label>}</div>
      <div className="be-actions"><button type="submit" className="be-btn primary" disabled={ocupado||viagem?.status==='ATIVA'}>{ocupado?'Enviando…':'Salvar presença'}</button></div>
      {enderecos.length===0&&<p className="be-footnote">Cadastre um endereço na seção “Endereços” do painel antes de confirmar ida ou volta.</p>}
    </form>}
  </section>;
}
