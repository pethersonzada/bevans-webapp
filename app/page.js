import './home-product.css';
import ProjectSection from './components/ProjectSection';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Experience from './components/Experience';
import Pricing from './components/Pricing';
import Faq from './components/Faq';
import Footer from './components/Footer';
import AccessRoutes from './components/AccessRoutes';
import PrivacySection from './components/PrivacySection';

export default function Home() {
  return <><Navbar /><main id="conteudo" className="bev-home"><Hero /><Experience /><AccessRoutes /><Features /><Pricing /><PrivacySection /><ProjectSection /><Faq /></main><Footer /></>;
}