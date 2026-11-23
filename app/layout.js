import { Geist } from 'next/font/google';
import './globals.css';
import './globals-access.css';
import './theme.css';
import ThemeToggle from './components/ThemeToggle';
import {metadadosRobots} from './lib/seo-visibility.mjs';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'], display: 'swap' });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bevans-webapp.vercel.app';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'BeVans | Rotas e transporte mais organizados', template: '%s | BeVans' },
  description: 'BeVans conecta motoristas e passageiros, com rotas, excursões e gestão de turmas. Conheça a plataforma.',
  applicationName: 'BeVans',
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/images/vetor-tema-claro.png', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/images/vetor-tema-escuro.png', type: 'image/png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/images/vetor-tema-claro.png',
  },
  robots: metadadosRobots(process.env),
  openGraph: { title: 'BeVans | Rotas e transporte mais organizados', description: 'Turmas, confirmação de presença e navegação no app. Conheça o projeto BeVans.', siteName: 'BeVans', locale: 'pt_BR', type: 'website', url: '/', images:[{url:'/images/vetor-com-nome-tema-claro.png',alt:'BeVans'}] },
  twitter: { card: 'summary', title: 'BeVans | Rotas e transporte mais organizados', description: 'Conheça as funcionalidades atuais e futuras do BeVans.',images:['/images/vetor-com-nome-tema-claro.png'] },
};

export default function RootLayout({children}) {
  return <html lang="pt-BR" className={geist.variable} suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{__html:`try{var t=localStorage.getItem('bevans-theme');if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){document.documentElement.dataset.theme='light'}`}} /></head>
    <body><a className="skip-link" href="#conteudo">Pular para o conteúdo</a>{children}<ThemeToggle/></body>
  </html>;
}
