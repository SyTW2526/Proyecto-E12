import { Footer } from '../components/Footer.js';
import WelcomeBanner from '../components/WelcomeBanner';
import HeroSection from '../components/HeroSection.js';

interface HomeProps {
  user?: any;
}

export default function Home({ user }: HomeProps) {
  return (
    <div>
      {/* Banner discreto debajo del navbar */}
      <WelcomeBanner user={user} />
      {/* Contenido principal */}
      <main className="flex-1 px-6 py-12">
        <HeroSection />
        <div>
          {/* Aquí puedes agregar más secciones o componentes para la página de inicio */}
          
        </div>
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  )
}
