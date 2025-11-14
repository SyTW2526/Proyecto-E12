import Porsche from "../assets/porsche.png"

export default function HeroSection() {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center overflow-hidden bg-white">
      {/* Texto */}
      <div className="w-full md:w-1/2 px-8 md:px-16 lg:px-24 py-16">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Encuentra parking<br />en Santa Cruz sin<br />estrés
          </h1>
          <p className="text-gray-700 text-lg">
            ¡Olvídate de dar vueltas! Tu plaza ideal te espera en un toque.
            Reserva y ahorra tiempo y dinero.
          </p>
        </div>
      </div>

      {/* Imagen - ocupa toda la mitad derecha hasta el borde */}
      <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end">
        <img
          src={Porsche}
          alt="Coche deportivo"
          className="w-full h-auto object-contain scale-150 md:translate-x-1/4"
        />
      </div>
    </section>
  )
}
