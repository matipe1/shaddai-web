import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // Asegurate que la ruta sea correcta
import { ShoppingBag, Phone, PlusCircle, LogOut, Package } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    // Agregamos sticky y backdrop-blur para que el navbar se quede fijo y semi-transparente al hacer scroll
    <nav className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 text-gray-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* LOGO SHADDAI - Versión compacta para móviles */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            {/* Icono más pequeño en móviles */}
            <div className="bg-amber-500/10 p-1.5 md:p-2 rounded-full group-hover:bg-amber-500/20 transition duration-300">
              <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
            </div>
            <div className="flex flex-col">
              {/* Texto principal más pequeño en móviles */}
              <span className="text-lg md:text-2xl font-bold tracking-[0.15em] md:tracking-[0.2em] text-white leading-none">
                SHADDAI
              </span>
              {/* Subtítulo oculto en móviles muy pequeños, visible desde sm */}
              <span className="hidden sm:block text-[8px] md:text-[10px] font-medium tracking-[0.3em] md:tracking-[0.4em] text-amber-500 uppercase mt-0.5 md:mt-1 ml-0.5">
                Importado
              </span>
            </div>
          </Link>

          {/* MENU DERECHA */}
          <div className="flex items-center gap-6">
            
            {/* Enlace Catálogo siempre visible */}
            <Link 
                to="/catalogo" 
                className="flex items-center gap-2 text-sm font-medium hover:text-amber-400 transition-colors duration-200"
            >
              <Package className="h-4 w-4" />
              Catálogo
            </Link>

            {/* Separador vertical */}
            <div className="h-6 w-px bg-neutral-700 hidden sm:block"></div>

            {user ? (
              // VISTA DE ADMIN
              <div className="flex items-center gap-4">
                <Link 
                    to="/agregar" 
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black text-sm font-bold rounded-full hover:bg-amber-500 transition-all shadow hover:shadow-amber-500/20 transform hover:-translate-y-0.5"
                >
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Agregar</span>
                </Link>
                
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors ml-2"
                    title="Cerrar Sesión"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              // VISTA DE CLIENTE
              <Link 
                to="/contacto" 
                className="flex items-center gap-2 px-5 py-2 border border-amber-500/50 text-amber-500 text-sm font-medium rounded-full hover:bg-amber-500 hover:text-black transition-all duration-300"
              >
                <Phone className="h-4 w-4" />
                Contacto
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}