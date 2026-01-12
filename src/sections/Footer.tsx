import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-neutral-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-400">
        
        {/* Columna 1: Marca */}
        <div>
          <h3 className="text-amber-400 text-xl font-bold mb-4">SHADDAI</h3>
          <p className="mb-4">
            Trayendo la mejor calidad internacional a la puerta de tu casa.
          </p>
          <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div>
          <h4 className="text-white font-bold mb-4">Navegación</h4>
          <ul className="space-y-2">
            <li><Link to="/#" className="hover:text-amber-400 transition">Inicio</Link></li>
            <li><a href="/catalogo" className="hover:text-amber-400 transition">Catálogo</a></li>
            <li><Link to="/login" className="hover:text-amber-400 transition">Admin</Link></li>
          </ul>
        </div>

        {/* Columna 3: Contacto (Ejemplo) */}
        <div>
          <h4 className="text-white font-bold mb-4">Contacto</h4>
          <ul className="space-y-2">
            <li>Córdoba, Argentina</li>
            <li>info@shaddai.com</li>
            <li className="flex space-x-4 mt-4">
              {/* Iconos sociales de ejemplo */}
              <a href="#" className="text-gray-400 hover:text-amber-400"><span className="sr-only">Instagram</span>📷</a>
              <a href="#" className="text-gray-400 hover:text-amber-400"><span className="sr-only">Facebook</span>📘</a>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}