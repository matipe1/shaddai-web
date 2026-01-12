import { Link } from "react-router-dom";

export function Hero() {
    return(
        <div className="relative bg-neutral-900 h-125">
      {/* Imagen de fondo oscurecida */}
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover opacity-40"
          src="https://images.unsplash.com/photo-1674506458439-65441effe779?q=80&w=1588&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Fondo de mate"
        />
      </div>
      
      {/* Contenido centrado */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Calidad Importada <span className="text-amber-400">Directo a tu Hogar</span>
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-lg">
            Descubre nuestra selección exclusiva de termos, mates y accesorios.
          </p>
          <div className="mt-10">
            {/* Este botón scrolleará hacia abajo (por ahora no hace nada) */}
            <Link
                to="/catalogo" 
                className="inline-block bg-amber-500 border border-transparent py-3 px-8 rounded-md font-bold text-neutral-900 hover:bg-amber-400 transition"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
    );
}