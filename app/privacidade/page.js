import Link from 'next/link';

export const metadata = {
  title: 'Privacidade',
  description: 'Informações sobre o tratamento de dados na página institucional BeVans.',
};

export default function PrivacidadePage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return (
    <main id="conteudo" className="min-h-screen bg-[#F8F9FA] px-6 py-16 text-[#212529]">
      <article className="mx-auto max-w-3xl rounded-2xl border border-[#DEE2E6] bg-white p-7 shadow-sm sm:p-12">
        <Link href="/" className="font-semibold text-[#0056b3] hover:underline">← Voltar ao início</Link>
        <p className="mt-10 text-sm font-bold uppercase tracking-wider text-[#0056b3]">Transparência</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Privacidade no site BeVans</h1>
        <p className="mt-4 text-sm text-slate-500">Informações referentes à página institucional. Revisão: novembro de 2026.</p>
        <div className="mt-10 space-y-9 leading-8 text-slate-700">
          <section><h2 className="mb-2 text-xl font-bold text-slate-900">1. Informações fornecidas pelo visitante</h2>
            <p>A página de contato permite preencher nome, e-mail, plano de interesse e mensagem. Esses dados são utilizados no navegador para preparar um e-mail, que somente será enviado se você confirmar o envio no aplicativo de e-mail. O formulário desta página não transmite esses campos para uma API BeVans nem os grava em banco de dados.</p></section>
          <section><h2 className="mb-2 text-xl font-bold text-slate-900">2. Infraestrutura e serviços externos</h2>
            <p>O serviço de hospedagem pode manter registros técnicos de acesso, como endereço IP, data, hora e informações do navegador, conforme sua configuração. Recursos como fontes e imagens podem ser solicitados a provedores externos. A logo exibida no site é hospedada no GitHub, e seu aplicativo de e-mail opera conforme as políticas do respectivo fornecedor.</p></section>
          <section><h2 className="mb-2 text-xl font-bold text-slate-900">3. Aplicativo BeVans</h2>
            <p>O aplicativo móvel é um produto distinto desta página institucional e possui operações de conta, localização, rotas e passageiros. Esta página não descreve integralmente o tratamento de dados do aplicativo. Uma política específica do aplicativo deve ser publicada antes do uso em produção, especialmente quando houver dados de menores de idade.</p></section>
          <section><h2 className="mb-2 text-xl font-bold text-slate-900">4. Solicitações e contato</h2>
            <p>{email ? <>Para perguntas ou solicitações referentes a esta página, escreva para <a className="font-semibold text-[#0056b3] underline" href={`mailto:${email}`}>{email}</a>.</> : 'O canal de contato para solicitações de privacidade ainda precisa ser configurado antes da disponibilização comercial do serviço.'}</p></section>
          <section><h2 className="mb-2 text-xl font-bold text-slate-900">5. Atualizações</h2>
            <p>Esta página deve ser revista sempre que os serviços, provedores ou fluxos de coleta de dados mudarem. O conteúdo informativo não substitui uma revisão jurídica e técnica do tratamento real de dados.</p></section>
        </div>
        <div className="mt-10 border-t border-slate-200 pt-6"><Link href="/termos" className="font-semibold text-[#0056b3] underline">Consultar termos de uso</Link></div>
      </article>
    </main>
  );
}
