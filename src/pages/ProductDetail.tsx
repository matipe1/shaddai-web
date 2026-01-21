import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Agregar useLocation
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
  const location = useLocation(); // Agregar esta línea

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

  // Agregar este useEffect en ProductDetail.tsx después del useEffect existente
  useEffect(() => {
    // Limpiar el origen después de un tiempo (por si el usuario no usa el botón volver)
    const timer = setTimeout(() => {
      sessionStorage.removeItem('productDetailOrigin');
    }, 30000); // 30 segundos

    return () => clearTimeout(timer);
  }, []);

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

  const handleBack = () => {
    // 1. PRIORIDAD ALTA: Origen explícito desde navegación de admin
    const origin = sessionStorage.getItem('productDetailOrigin');
    
    if (origin === 'edit' || origin === 'add') {
      sessionStorage.removeItem('productDetailOrigin');
      navigate('/catalogo');
      return;
    }

    // 2. PRIORIDAD ALTA: Estado del catálogo preservado
    if (location.state?.from === 'catalog' && location.state?.catalogParams) {
      navigate(`/catalogo${location.state.catalogParams}`);
      return;
    }

    // 3. PRIORIDAD MEDIA: Detectar si viene de admin por sessionStorage
    const lastAdminPage = sessionStorage.getItem('lastAdminPage');
    if (lastAdminPage === 'add' || lastAdminPage === 'edit') {
      sessionStorage.removeItem('lastAdminPage');
      navigate('/catalogo');
      return;
    }

    // 4. PRIORIDAD BAJA: Verificar historial corto (URL directa)
    if (window.history.length <= 2) {
      navigate('/catalogo');
      return;
    }

    // 5. FALLBACK: Navegación atrás normal
    navigate(-1);
  };

  if (loading) return <div className="text-center mt-20">Cargando producto...</div>;
  if (!product) return <div className="text-center mt-20">Producto no encontrado.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Botón Volver */}
        <button 
          onClick={handleBack}
          className="inline-flex items-center text-gray-500 hover:text-amber-600 mb-8 transition" >
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver al catálogo
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* === COLUMNA IZQUIERDA: Galería === */}
            {/* Quitamos bg-gray-100 para eliminar el bloque gris de abajo */}
            <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100">
              
              {/* IMAGEN PRINCIPAL */}
              {/* Usamos 'aspect-square' o una altura fija controlada para mantener proporción */}
              <div className="relative w-full aspect-square md:aspect-4/3 lg:h-150 lg:aspect-auto overflow-hidden group">
                
                {/* FONDO DIFUMINADO (Solo visible si la imagen no llena todo) */}
                <div className="absolute inset-0">
                   <img 
                    src={selectedImage || product.images?.[0]}
                    alt=""
                    className="w-full h-full object-cover blur-xl scale-110 opacity-50"
                  />
                </div>

                {/* IMAGEN REAL (Flotando encima, centrada y sin recortar) */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <img 
                    src={selectedImage || product.images?.[0]}
                    alt={product.title}
                    className="max-w-full max-h-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>

                {/* Botones Admin */}
                {user && (
                    <div className="absolute top-4 right-4 flex gap-2 z-30">
                      <button
                        onClick={handleEdit}
                        className="bg-white/90 backdrop-blur-sm hover:bg-blue-50 text-blue-600 hover:text-blue-800 p-2 rounded-full shadow-lg transition-all hover:scale-110"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>

                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className={`p-2 rounded-full shadow-lg transition-all hover:scale-110 
                          ${deleting ? 'bg-gray-200 cursor-not-allowed' : 'bg-white/90 backdrop-blur-sm hover:bg-red-50 text-red-500 hover:text-red-700'}`}
                      >
                        {deleting ? <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : <Trash2 className="h-5 w-5" />}
                      </button>
                    </div>
                )}
              </div>

              {/* Tira de Miniaturas */}
              {product.images && product.images.length > 1 && (
                <div className="p-4 bg-white">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center md:justify-start">
                    {product.images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(img)}
                          className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer
                          ${selectedImage === img 
                              ? "border-amber-500 ring-2 ring-amber-100 opacity-100" 
                              : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300"}`}
                        >
                            <img
                              src={img}
                              alt={`thumb-${index}`}
                              className="w-full h-full object-cover"
                            />
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* === COLUMNA DERECHA: Info === */}
            <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
              <span className="text-amber-600 font-bold tracking-wider text-sm uppercase mb-2">
                {product.category || "Importado"}
              </span>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {product.title}
              </h1>

              <div className="text-4xl font-bold text-gray-900 mb-6">
                {formatPrice(product.price)}
              </div>

              <div className="prose prose-gray mb-8 text-gray-600 leading-relaxed">
                <p className="whitespace-pre-line">
                  {product.description || "Sin descripción detallada disponible."}
                </p>
              </div>

              <div className="space-y-4 mt-auto">
                <button 
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1"
                >
                  <MessageCircle className="h-6 w-6" />
                  Comprar por WhatsApp
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Truck className="h-6 w-6 text-amber-500" />
                  <span className="text-sm text-gray-700 font-medium">Envíos a Córdoba Capital</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <ShieldCheck className="h-6 w-6 text-amber-500" />
                  <span className="text-sm text-gray-700 font-medium">Garantizá la calidad</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}