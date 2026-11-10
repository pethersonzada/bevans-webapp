import Link from 'next/link';

export const metadata = {title:'Página não encontrada',robots:{index:false,follow:false}};

export default function NotFound() {
  return <main id="conteudo" className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6"><div className="max-w-md text-center"><p className="text-7xl font-extrabold tracking-tight text-[#007BFF]">404</p><h1 className="text-3xl font-extrabold tracking-tight mt-5 text-[#0056b3]">Essa rota não foi encontrada.</h1><p className="mt-4 text-slate-600 leading-7">Parece que este caminho não existe por aqui. Volte ao início para continuar explorando o BeVans.</p><Link className="button button-dark mt-8" href="/">Voltar ao início ↗</Link></div></main>;
}
