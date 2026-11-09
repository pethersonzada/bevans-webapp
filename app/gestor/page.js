import Link from 'next/link';

export const metadata = {title:'Área do gestor',robots:{index:false,follow:false}};

export default function GestorPage() {
  return <main id="conteudo" className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-5 py-14">
    <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-8 sm:p-12 text-center">
      <Link href="/" className="inline-flex items-center justify-center rounded-2xl w-16 h-16 bg-[#14233c] text-white text-3xl font-extrabold" aria-label="Voltar ao início">v<span className="text-[#ffc344]">.</span></Link>
      <p className="mt-9 text-xs font-bold tracking-widest text-[#ba8423]">ÁREA DO GESTOR</p>
      <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#14233c]">Estamos preparando seu painel.</h1>
      <p className="mt-5 text-slate-600 leading-7">O acesso autenticado ainda não está disponível nesta versão do site. Estamos construindo uma experiência segura para acompanhar a operação.</p>
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3"><Link href="/contato" className="button button-yellow">Conhecer a plataforma ↗</Link><Link href="/" className="button button-outline">Voltar ao início</Link></div>
    </div>
  </main>;
}