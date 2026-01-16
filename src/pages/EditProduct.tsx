import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ProductForm } from "../components/forms/ProductForm";
import { supabase } from "../supabase/client";

interface Product {
  id: number;
  title: string;
  price: number;
  images: string[];
  description: string;
  category: string;
}

export function EditProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Protección de ruta
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Cargar producto existente
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
      } catch (error) {
        console.error("Error cargando producto:", error);
        setNotification({ type: 'error', message: 'Error cargando el producto' });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSuccess = () => {
    setNotification({ type: 'success', message: '¡Producto actualizado con éxito!' });
    setTimeout(() => {
      navigate(`/producto/${id}`); // Volver al detalle del producto
    }, 1500);
  };

  const handleError = (error: string) => {
    setNotification({ type: 'error', message: `Error: ${error}` });
    setTimeout(() => setNotification(null), 5000);
  };

  if (loading) return <div className="text-center mt-20">Cargando producto...</div>;
  if (!product) return <div className="text-center mt-20">Producto no encontrado.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Editar Producto</h2>
      
      {/* Notificaciones */}
      {notification && (
        <div className={`mb-4 p-3 rounded ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}

      <ProductForm 
        initialData={product} 
        isEditMode={true}
        onSuccess={handleSuccess} 
        onError={handleError} 
      />
    </div>
  );
}