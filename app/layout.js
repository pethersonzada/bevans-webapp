import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'], display: 'swap' });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bevans-webapp.vercel.app';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'BeVans | Rotas e transporte mais organizados', template: '%s | BeVans' },
  description: 'Conheça o BeVans: aplicativo para motoristas e passageiros com turmas, presença, mapas e navegação. Veja também as próximas modalidades de excursões e gestão de frotas.',
  applicationName: 'BeVans',
  alternates: { canonical: '/' },
  icons: { icon: '/images/vetor-tema-claro.png', apple: '/images/vetor-tema-claro.png' },
  robots: { index: true, follow: true },
  openGraph: { title: 'BeVans | Rotas e transporte mais organizados', description: 'Turmas, confirmação de presença e navegação no app. Conheça o projeto BeVans.', siteName: 'BeVans', locale: 'pt_BR', type: 'website', url: '/' },
  twitter: { card: 'summary', title: 'BeVans | Rotas e transporte mais organizados', description: 'Conheça as funcionalidades atuais e futuras do BeVans.' },
};

export default function RootLayout({children}) {
  return <html lang="pt-BR" className={geist.variable}><body><a className="skip-link" href="#conteudo">Pular para o conteúdo</a>{children}</body></html>;
}
