import { Link } from "react-router";
import { IoLogoWhatsapp } from "react-icons/io5";
import { IoLogoFacebook } from "react-icons/io5";
import { IoLogoInstagram } from "react-icons/io5";
import { IoLogoTwitter } from "react-icons/io5";
import { IoLogoTiktok } from "react-icons/io5";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-[var(--pakal-gray)]">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Columna 1: Logo + Descripción */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="./images/favicon-sinfondo.png" alt="PakalPets" className="h-8" />
              <span className="text-xl font-bold text-white">P A K A L</span>
            </div>
            <p className="text-sm mb-4 max-w-md">
              Cuidamos a tus mascotas como si fueran nuestras. Paseos, entrenamiento 
              y bienestar animal en Querétaro.
            </p>
            {/* Redes sociales */}
            <p className="text-sm text-[var(--pakal-graay)] mb-4 max-w-md">  
              Visítanos en nuestras redes sociales.
            </p>
            <div className="flex gap-4 text-cyan-400">
              <a href="https://wa.me/524421234567" target="_blank" rel="noopener noreferrer" 
                 className="hover:text-[var(--pakal-blue)] transition-colors "><IoLogoWhatsapp size={30} /></a>
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer"
                 className="hover:text-[var(--pakal-blue)] transition-colors"><IoLogoFacebook size={30} /></a>
              <a href="https://tiktok.com/" target="_blank" rel="noopener noreferrer"
                 className="hover:text-[var(--pakal-blue)] transition-colors"><IoLogoTiktok size={30} /></a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer"
                 className="hover:text-[var(--pakal-blue)] transition-colors"><IoLogoTwitter size={30} /></a>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer"
                 className="hover:text-[var(--pakal-blue)] transition-colors"><IoLogoInstagram size={30} /></a>
            </div>
          </div>

          {/* Columna 2: Servicios */}
          <div>
            <h3 className="text-white font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/servicios/paseo" className="hover:text-[var(--pakal-lavender)] transition-colors">Paseo</Link></li>
              <li><Link to="/servicios/entrenamiento" className="hover:text-[var(--pakal-lavender)] transition-colors">Entrenamiento</Link></li>
              <li><Link to="/servicios/guarderia" className="hover:text-[var(--pakal-lavender)] transition-colors">Guardería</Link></li>
            </ul>
          </div>

          {/* Columna 3: Compañía */}
          <div>
            <h3 className="text-white font-semibold mb-4">Compañía</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/nosotros" className="hover:text-[var(--pakal-lavender)] transition-colors">Nosotros</Link></li>
              <li><Link to="/contacto" className="hover:text-[var(--pakal-lavender)] transition-colors">Contacto</Link></li>
              <li><Link to="/faq" className="hover:text-[var(--pakal-lavender)] transition-colors">Preguntas frecuentes</Link></li>
            </ul>
          </div>
        </div>

        {/* Línea divisora */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© {currentYear} PakalPets. Todos los derechos reservados.</p>
          <Link to="/cookies" className="hover:text-[#FF6A1F] transition-colors">Designer & Developer</Link>
          <div className="flex gap-6">
            <Link to="/privacidad" className="hover:text-[#FF6A1F] transition-colors">Privacidad</Link>
            <Link to="/terminos" className="hover:text-[#FF6A1F] transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}