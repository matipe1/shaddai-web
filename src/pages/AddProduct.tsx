import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ProductForm } from "../components/forms/ProductForm";

export function AddProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Protección de ruta
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSuccess = () => {
    setNotification({ type: 'success', message: '¡Producto agregado con éxito!' });
    // Auto-ocultar notificación después de 3 segundos
    setTimeout(() => setNotification(null), 3000);
  };

  const handleError = (error: string) => {
    setNotification({ type: 'error', message: `Error: ${error}` });
    // Auto-ocultar notificación después de 5 segundos
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Agregar Nuevo Producto</h2>
      
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

      <ProductForm onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}