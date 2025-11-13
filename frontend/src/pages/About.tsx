import imagen_daniel from "../assets/imagen_daniel.png";
import imagen_jean from "../assets/imagen_jean.png";
import imagen_arun from "../assets/imagen_arun.png";

export default function About() {
  return (
    <section className="overflow-hidden pt-20 pb-12 lg:pt-[120px] lg:pb-[90px] bg-white dark:bg-dark">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-between -mx-4">
          <div className="w-full px-4 lg:w-6/12">
            <div className="flex items-center -mx-3 sm:-mx-4">
              <div className="w-full px-3 sm:px-4 xl:w-1/2">
                <div className="py-3 sm:py-4">
                  <img
                    src={imagen_jean}
                    alt="Imagen Jean"
                    className="w-full rounded-2xl"
                  />
                </div>
                <div className="py-3 sm:py-4">
                  <img
                    src={imagen_arun}
                    alt="Imagen Arun"
                    className="w-full rounded-2xl"
                  />
                </div>
              </div>
              <div className="w-full px-3 sm:px-4 xl:w-1/2">
                <div className="relative z-10 my-4">
                  <img
                    src={imagen_daniel}
                    alt="Imagen Daniel"
                    className="w-full rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full px-4 lg:w-1/2 xl:w-5/12">
            <div className="mt-10 lg:mt-0">
              <span className="block mb-4 text-lg font-semibold text-primary">
                Quienes somos
              </span>
              <h2 className="mb-5 text-3xl font-bold text-dark text-black sm:text-[40px]/[48px]">
                Somos estudiantes de la Universidad de La Laguna
              </h2>
              <p className="mb-5 text-base text-body-color dark:text-dark-6">
                Somos un grupo de estudiantes comprometidos con mejorar la movilidad urbana en Santa Cruz.
                Nuestro objetivo es optimizar la gestión del parking mediante soluciones innovadoras y accesibles para todos.
              </p>
              <a
                href="javascript:void(0)"
                className="inline-flex items-center justify-center py-3 text-base font-medium text-center text-white border border-transparent rounded-md px-7 bg-primary hover:bg-opacity-90"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
