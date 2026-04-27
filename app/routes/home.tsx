import { Link } from "react-router";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[100vh] min-h-[600px] overflow-hidden">
        {/* Imagen de fondo optimizada */}
        <picture>
          {/* Imagen para móvil */}
          <source 
            srcSet="/images/inicial-480.webp" 
            media="(max-width: 768px)"
            width="800"
            height="600"
          />
          {/* Imagen para desktop - fallback */}
          <img
            src="/images/inicial-1920.webp"
            alt="Paseo de perros en Querétaro"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            width="1920"
            height="1080"
          />
        </picture>

        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Contenido encima */}
        <div className="relative z-10 h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full">
            {/* Texto arriba a la izquierda */}
            <div className="absolute top-16 md:top-24 left-4 sm:left-6 lg:left-8 max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Cuidamos a tu mascota como si fuera nuestra 🐾
              </h1>
              <p className="text-lg md:text-xl text-gray-200">
                ¿Sales de la ciudad y no tienes donde dejar a tu mejor amigo? 
              </p>  
              <p className="text-lg md:text-xl text-gray-200">
                guardería y paseos en Querétaro.
              </p>  
              <p className="text-lg md:text-xl text-gray-200">
                Agenda hoy mismo.
              </p>
            </div>

            {/* Botón abajo a la derecha */}
            <div className="absolute bottom-48 md:bottom-48 right-4 sm:right-6 lg:right-8">
              <Link
                to="/registro-usuario"
                className="inline-block bg-[var(--pakal-cyan)] hover:bg-[var(--pakal-blue)] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
              >Agendar Estancia
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}