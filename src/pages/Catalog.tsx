import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import { ProductCard } from "../components/ProductCard";
import { Search, ArrowUpDown, FilterX, ChevronLeft, ChevronRight } from "lucide-react";
import { globalInfo } from "../data";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

type SortOption = 'newest' | 'price-asc' | 'price-desc';

const CATEGORIES = ["Todos"].concat(globalInfo.categories);
const PRODUCTS_PER_PAGE = 6;

export function Catalog() {
  // Estado de los productos de la página ACTUAL
  const [products, setProducts] = useState<Product[]>([]);
  
  // Estados de control
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');

  // Estados de Paginación
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Cada vez que cambiamos un filtro, volvemos a la página 1
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, sortOrder]);

  // EFECTO PRINCIPAL: Carga de datos desde Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // 1. Construimos la consulta base
        // { count: 'exact' } nos dice cuántos productos hay en total (para saber cuántas páginas hay)
        let query = supabase
          .from('products')
          .select('*', { count: 'exact' });

        // 2. Aplicamos filtros (Server-Side)
        if (selectedCategory !== "Todos") {
          query = query.eq('category', selectedCategory);
        }

        if (searchTerm) {
          // ilike es "case-insensitive like" (busca sin importar mayúsculas)
          query = query.ilike('title', `%${searchTerm}%`);
        }

        // 3. Aplicamos ordenamiento
        switch (sortOrder) {
          case 'price-asc':
            query = query.order('price', { ascending: true });
            break;
          case 'price-desc':
            query = query.order('price', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
        }

        // 4. Aplicamos PAGINACIÓN (El truco de la velocidad)
        const from = (page - 1) * PRODUCTS_PER_PAGE;
        const to = from + PRODUCTS_PER_PAGE - 1;
        
        query = query.range(from, to);

        // 5. Ejecutamos la consulta
        const { data, error, count } = await query;

        if (error) throw error;
        
        setProducts(data || []);
        setTotalProducts(count || 0);

      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };

    // Usamos un pequeño timeout (debounce) para la búsqueda si el usuario escribe rápido
    const timeoutId = setTimeout(() => {
        fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);

  }, [page, searchTerm, selectedCategory, sortOrder]);

  // Cálculo de páginas totales
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  return (
    <section className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Catálogo Completo</h2>
            <p className="text-gray-500 mt-1">
                {totalProducts} productos encontrados
            </p>
          </div>

          {/* Filtros Categoría */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                        selectedCategory === cat
                            ? "bg-neutral-900 text-white border-neutral-900 shadow-md transform scale-105"
                            : "bg-white text-gray-600 border-gray-200 hover:border-amber-500 hover:text-amber-600"
                    }`}
                >
                    {cat}
                </button>
            ))}
          </div>

          {/* Barra de Herramientas (Search + Sort) */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative group w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500"
                >
                  <FilterX className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOption)}
                    className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-lg bg-white cursor-pointer"
                >
                    <option value="newest">Más Nuevos</option>
                    <option value="price-asc">Menor Precio</option>
                    <option value="price-desc">Mayor Precio</option>
                </select>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
          // Skeleton Loading
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          // Estado Vacío
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <Search className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron productos</h3>
            <button 
                onClick={() => { setSearchTerm(""); setSelectedCategory("Todos"); }}
                className="mt-6 text-amber-600 hover:text-amber-500 font-medium"
            >
                Limpiar filtros
            </button>
          </div>
        ) : (
          // Grilla de Productos
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {products.map((product) => (
                <ProductCard 
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image_url={product.images[0]}
                />
                ))}
            </div>

            {/* CONTROLES DE PAGINACIÓN */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 py-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <span className="text-gray-600 font-medium">
                        Página {page} de {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}