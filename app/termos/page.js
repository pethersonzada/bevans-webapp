import Link from 'next/link';

export const metadata = {
  title: 'Termos de uso',
  description: 'Condições de uso da página institucional BeVans.',
};

export default function TermosPage() {
  return (
    <main id="conteudo" className="min-h-screen bg-[#F8F9FA] px-6 py-16 text-[#212529]">
      <article className="mx-auto max-w-3xl rounded-2xl border border-[#DEE2E6] bg-white p-7 shadow-sm sm:p-12">
        <Link href="/" className="font-semibold text-[#0056b3] hover:underline">← Voltar ao início</Link>
        <p className="mt-10 text-sm font-bold uppercase tracking-wider text-[#0056b3]">Informações institucionais</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Termos de uso do site</h1>
        <p className="mt-4 text-sm text-slate-500">Revisão: novembro de 2026.</p>
        <div className="mt-10 space-y-9 leading-8 text-slate-700">
          <section><h2 className="mb-2 text-xl font-bold text-slate-900">1. Finalidade</h2><p>Este site apresenta o projeto BeVans, suas propostas de funcionalidades e possibilidades de contato comercial. A apresentação de uma funcionalidade não garante sua disponibilidade imediata. Excursões e gestão de frotas são evoluções planejadas; não existe painel administrativo operacional neste site.</p></section>
          <section><h2 className="mb-2 text-xl font-bold text-slate-900">2. Informações comerciais</h2><p>As modalidades descritas são informativas. O site não oferece contratação online nem apresenta preços confirmados. Recursos, condições de atendimento e integrações precisam ser validados com a equipe antes de qualquer compromisso.</p></section>
          <section><h2 className="mb-2 text-xl font-bold text-slate-900">3. Ilustrações</h2><p>As imagens do painel, números, nomes, registros e trajetos apresentados na página inicial são demonstrativos e não representam dados operacionais reais.</p></section>
          <section><h2 className="mb-2 text-xl font-bold text-slate-900">4. Conteúdo e propriedade intelectual</h2><p>Elementos de identidade visual, textos e código do projeto são apresentados para consulta. Direitos sobre marcas e materiais de terceiros permanecem com seus respectivos titulares.</p></section>
          <section><h2 className="mb-2 text-xl font-bold text-slate-900">5. Privacidade</h2><p>As práticas informadas para a página institucional estão descritas na <Link className="font-semibold text-[#0056b3] underline" href="/privacidade">Política de Privacidade</Link>. As regras operacionais do aplicativo móvel exigem documentação própria.</p></section>
        </div>
      </article>
    </main>
  );
}
