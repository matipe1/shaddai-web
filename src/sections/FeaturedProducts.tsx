import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { ProductCard } from "../components/ProductCard";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6); // Ultimos 6 productos

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section
      id="productos"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Productos Destacados</h2>
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando... 🧉</div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">Pronto tendremos novedades.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                image_url={product.images[0]} />
          ))}
        </div>
      )}

      {/* Botón para ir al catálogo completo (futuro) */}
      {products.length > 0 && (
        <div className="text-center mt-12">
          <Link
                to="/catalogo" 
                className="inline-block bg-amber-500 border border-transparent py-3 px-8 rounded-md font-bold text-neutral-900 hover:bg-amber-400 transition"
            >
              Ver todos los productos →
            </Link>
        </div>
      )}
    </section>
  );
}
