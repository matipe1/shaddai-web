import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { ArrowLeft, MessageCircle, ShieldCheck, Truck, Edit3, Trash2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
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

  const handleWhatsAppClick = () => {
    if (!product) return;
    const message = `Hola SHADDAI! Me interesa el producto: *${product.title}*. ¿Tienen stock?`;
    const url = `https://wa.me/5493513462243?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEdit = () => {
    navigate(`/productos/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!product) return;
    
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar "${product.title}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      alert('Producto eliminado correctamente');
      navigate('/'); 
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('Error al eliminar el producto. Intenta nuevamente.');
    } finally {
      setDeleting(false);
    }
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
          {/* APERTURA DEL GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* === COLUMNA IZQUIERDA: Galería === */}
            <div className="bg-gray-100 flex flex-col">
              <div className="h-96 md:h-150 relative w-full">
                {user && (
                    <div className="absolute top-3 right-3 flex gap-2 z-20">
                      <button
                        onClick={handleEdit}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>

                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className={`text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 ${deleting 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-red-500 hover:bg-red-600' }`} >
                        {deleting
                          ? (<div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>)
                          : (<Trash2 className="h-5 w-5" />)
                        }
                      </button>
                    </div>
                )}

                {/* Imagen Grande */}
                <img 
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Tira de Miniaturas */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto bg-white border-t scrollbar-hide">
                  {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(img)}
                        className={`relative w-20 h-20 shrink-0 rounded-md overflow-hidden border-2 transition-all
                        ${selectedImage === img ? "border-amber-500 ring-2 ring-amber-200" : "border-transparent opacity-70 hover:opacity-100"}`}>
                          <img
                            src={img}
                            alt={`thumb-${index}`}
                            className="w-full h-full object-cover"
                          />
                      </button>
                    ))}
                </div>
              )}
            </div>
            
            {/* === COLUMNA DERECHA: Info del producto === */}
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

              <div className="space-y-4">
                <button 
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1"
                >
                  <MessageCircle className="h-6 w-6" />
                  Comprar por WhatsApp
                </button>
              </div>

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

          </div> {/* <--- AQUÍ CIERRA EL GRID AHORA (Correcto) */}
        </div>
      </main>
    </div>
  );
}