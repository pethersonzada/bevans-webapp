import Image from 'next/image';
import Link from 'next/link';

export const metadata = {title:'Área do gestor',robots:{index:false,follow:false}};

export default function GestorPage() {
  return <main id="conteudo" className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-5 py-14">
    <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-8 sm:p-12 text-center">
      <Link href="/" className="inline-flex items-center justify-center w-24 h-24" aria-label="Voltar ao início"><Image src="https://raw.githubusercontent.com/pethersonzada/bevans-frontend/main/assets/images/logo-app-sem-fundo-sem-titulo.png" width="96" height="96" alt="Logo BeVans" className="object-contain" unoptimized /></Link>
      <p className="mt-9 text-xs font-bold tracking-widest text-[#007BFF]">ÁREA DO GESTOR</p>
      <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0056b3]">Estamos preparando seu painel.</h1>
      <p className="mt-5 text-slate-600 leading-7">O acesso autenticado ainda não está disponível nesta versão do site. Estamos construindo uma experiência segura para acompanhar a operação.</p>
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3"><Link href="/contato" className="button button-yellow">Conhecer a plataforma ↗</Link><Link href="/" className="button button-outline">Voltar ao início</Link></div>
    </div>
  </main>;
}