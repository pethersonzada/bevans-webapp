import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: { default: 'BeVans | Gestão inteligente de transporte', template: '%s | BeVans' },
  description: 'Organize rotas, acompanhe embarques e simplifique a comunicação no transporte escolar. Conheça o BeVans.',
  applicationName: 'BeVans',
  icons: { icon: 'https://raw.githubusercontent.com/pethersonzada/bevans-frontend/main/assets/images/logo-app-sem-fundo-sem-titulo.png', apple: 'https://raw.githubusercontent.com/pethersonzada/bevans-frontend/main/assets/images/logo-app-sem-fundo-sem-titulo.png' },
  robots: { index: true, follow: true },
  openGraph: { title: 'BeVans | Vá mais longe, junto', description: 'Mais organização para quem dirige, gerencia e acompanha o transporte.', locale: 'pt_BR', type: 'website' },
};

export default function RootLayout({children}) {
  return <html lang="pt-BR" className={geist.variable}><body><a className="skip-link" href="#conteudo">Pular para o conteúdo</a>{children}</body></html>;
}