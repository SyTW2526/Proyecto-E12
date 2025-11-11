import Porsche from "../assets/porsche.png"

export default function HeroSection() {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center justify-between px-8 md:px-16 lg:px-24 py-16 bg-white">
      {/* Texto */}
      <div className="max-w-xl text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
          Encuentra parking<br />en Santa Cruz sin<br />estrés
        </h1>
        <p className="text-gray-700 text-lg pr-20">
          ¡Olvídate de dar vueltas! Tu plaza ideal te espera en un toque.
          Reserva y ahorra tiempo y dinero.
        </p>
      </div>

      {/* Imagen */}
      <div className="right-0 top-0 bottom-0 w-1/2 flex items-center justify-center">
        <img
          src={Porsche}
          alt="Coche deportivo"
          className="w-[250%] object-cover translate-x-1/3 scale-150"
        />
      </div>
    </section>
  )
}
