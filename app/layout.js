import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: { default: 'VanBora | Gestão inteligente de transporte', template: '%s | VanBora' },
  description: 'Organize rotas, acompanhe embarques e simplifique a comunicação no transporte escolar. Conheça o VanBora.',
  applicationName: 'VanBora',
  robots: { index: true, follow: true },
  openGraph: { title: 'VanBora | Vá mais longe, junto', description: 'Mais organização para quem dirige, gerencia e acompanha o transporte.', locale: 'pt_BR', type: 'website' },
};

export default function RootLayout({children}) {
  return <html lang="pt-BR" className={geist.variable}><body><a className="skip-link" href="#conteudo">Pular para o conteúdo</a>{children}</body></html>;
}