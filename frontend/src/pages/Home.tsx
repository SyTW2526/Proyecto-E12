import { Footer } from '../components/Footer.js';
import WelcomeBanner from '../components/WelcomeBanner';
import HeroSection from '../components/HeroSection.js';
import SearchForm from '../components/SearchForm';
import type { SearchData } from '../components/SearchForm';

interface HomeProps {
  user?: any;
}

export default function Home({ user }: HomeProps) {
  const handleSearch = (data: SearchData) => {
    console.log('Búsqueda realizada:', data);
    // Aquí puedes agregar la lógica para filtrar parkings según las fechas y tipo de vehículo
    // Por ejemplo, redirigir a una página de resultados o mostrar parkings filtrados
  };

  return (
    <div>
      {/* Banner discreto debajo del navbar */}
      <WelcomeBanner user={user} />
      
      {/* Contenido principal */}
      <main className="flex-1">
        <HeroSection />
        
        {/* Formulario de búsqueda */}
        <div id="buscar" className="w-full px-6 py-12 bg-gray-50 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <SearchForm onSearch={handleSearch} user={user} />
          </div>
        </div>

        <div className="px-6 py-12">
          {/* Aquí puedes agregar más secciones o componentes para la página de inicio */}
        </div>
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  )
}
