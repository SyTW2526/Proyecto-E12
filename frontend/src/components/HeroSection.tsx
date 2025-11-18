import Porsche from "../assets/porsche.png"

export default function HeroSection() {
  return (
    <section className="bg-linear-to-br from-blue-50 via-white to-indigo-50 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Texto */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Encuentra parking<br className="hidden md:block" />
              <span className="text-blue-600"> sin estrés</span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-xl mx-auto md:mx-0">
              ¡Olvídate de dar vueltas! Tu plaza ideal te espera en un toque.
              Reserva y ahorra tiempo y dinero.
            </p>
            <div className="flex justify-center md:justify-start">
              <a
                href="#buscar"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Buscar parking
              </a>
            </div>
          </div>

          {/* Imagen */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
              <img
                src={Porsche}
                alt="Coche deportivo"
                className="relative w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
