import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabase/client";
import { Footer } from "../sections/Footer";
import { ArrowLeft, MessageCircle, ShieldCheck, Truck } from "lucide-react";

interface Product {
  id: number;
  title: string;
  price: number;
  image_url: string;
  description: string;
  category: string;
}

export function ProductDetail() {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        // Buscamos UN solo producto (.single()) que coincida con el ID
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', minimumFractionDigits: 0
    }).format(price);
  };

  // Función para generar link de WhatsApp
  const handleWhatsAppClick = () => {
    if (!product) return;
    const message = `Hola SHADDAI! Me interesa el producto: *${product.title}*. ¿Tienen stock?`;
    const url = `https://wa.me/5493513462243?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="text-center mt-20">Cargando producto...</div>;
  if (!product) return <div className="text-center mt-20">Producto no encontrado.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Botón Volver */}
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-amber-600 mb-8 transition">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver al catálogo
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Columna Izquierda: Imagen */}
            <div className="h-96 md:h-150 bg-gray-100 relative">
              <img 
                src={product.image_url} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Columna Derecha: Información */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <span className="text-amber-600 font-bold tracking-wider text-sm uppercase mb-2">
                {product.category || "Importado"}
              </span>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>

              <div className="text-4xl font-bold text-gray-900 mb-6">
                {formatPrice(product.price)}
              </div>

              <div className="prose prose-gray mb-8 text-gray-600">
                <p>{product.description || "Sin descripción detallada disponible."}</p>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-4">
                <button 
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1"
                >
                  <MessageCircle className="h-6 w-6" />
                  Comprar por WhatsApp
                </button>
              </div>

              {/* Badges de Confianza */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <Truck className="h-8 w-8 text-amber-500" />
                  <span className="text-sm text-gray-600 font-medium">Envíos a Córdoba Capital</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-amber-500" />
                  <span className="text-sm text-gray-600 font-medium">Garantizá la calidad</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}