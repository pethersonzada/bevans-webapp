import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Experience from './components/Experience';
import Pricing from './components/Pricing';
import Faq from './components/Faq';
import Footer from './components/Footer';

export default function Home() {
  return <><Navbar /><main id="conteudo"><Hero /><Experience /><Features /><Pricing /><Faq /></main><Footer /></>;
}