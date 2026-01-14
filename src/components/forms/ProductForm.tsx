import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../../supabase/client";
import { globalInfo } from "../../data";
import { useState } from "react";
import { Trash2 } from "lucide-react";

// ✅ Schema dinámico según el modo
const createProductSchema = (isEditMode: boolean = false) => {
  return z.object({
    title: z.string()
      .min(1, "El título es obligatorio"),
    description: z.string().max(1000, "Máximo 1000 caracteres"),
    price: z.number()
      .positive("El precio debe ser positivo"),
    category: z.enum(globalInfo.categories, {
      message: "Seleccione una categoría válida",
    }),
    files: isEditMode
      ? z.any().optional()
      : z.instanceof(FileList, { message: "Se requiere al menos una imagen" })
          .refine((files) => files.length > 0, "Debe subir al menos una imagen"),
  });
};

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

interface ProductFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  initialData?: Product | null;
  isEditMode?: boolean;
}

export function ProductForm({ onSuccess, onError, initialData, isEditMode = false }: ProductFormProps) {
  const productSchema = createProductSchema(isEditMode);
  type ProductFormData = z.infer<typeof productSchema>;

  const [currentImages, setCurrentImages] = useState<string[]>(
    initialData?.images || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      price: initialData.price,
      description: initialData.description,
      category: initialData.category,
    } : {
      category: globalInfo.categories[0],
    }
  });

  const removeImage = (indexToRemove: number) => {
    setCurrentImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      let uploadedImageUrls: string[] = [];

      // Por defecto conservamos las fotos viejas
      if (isEditMode && initialData?.images) {
        uploadedImageUrls = [...currentImages];
      }

      if (data.files && data.files.length > 0) {
        // Si subimos nuevos, se puede reemplazar o agregar nuevas fotos
        for (let i = 0; i < data.files.length; i++) {
          const file = data.files[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;  

          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
              .from("products")
              .getPublicUrl(filePath);

          uploadedImageUrls.push(publicUrl);
        }
      }

      // Datos en limpio
      const productData = {
        title: data.title,
        price: data.price,
        description: data.description,
        category: data.category,
        images: uploadedImageUrls,
      }

      if (isEditMode && initialData) {
        // SOLO actualizamos (no insertamos)
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        // SOLO creamos un nuevo producto
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        reset();
      }

      onSuccess?.();

    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      onError?.(errorMessage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6">
      <div>
        {/* Nombre */}
        <label className="block text-gray-700 font-bold mb-2">Nombre</label>
        <input
          {...register("title")} type="text" placeholder="Ej: Termo Stanley 1.2L"
          className={`w-full p-3 border rounded focus:outline-none focus:border-amber-500 bg-white
          ${ errors.title ? "border-red-500" : "border-gray-300"}`} />
        {
          errors.title && (<p className="text-red-500 text-sm mt-1">{errors.title.message}</p>)
        }
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">Descripción del Producto</label>
        <textarea
          {...register("description")} rows={4} placeholder="Detalles técnicos, capacidad, material..." 
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-amber-500 bg-white resize-none" />
      </div>

      {/* Precio y Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Precio */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Precio ($)</label>
          <input
            {...register("price", { valueAsNumber: true })} type="number" step="0.01" min="0"
            className={`w-full p-3 border rounded focus:outline-none focus:border-amber-500 bg-white
            ${ errors.price ? "border-red-500" : "border-gray-300" }`} />
          {
            errors.price && (<p className="text-red-500 text-sm mt-1">{errors.price.message}</p>)
          }
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Categoría</label>
          <select
            {...register("category")}
            className={`w-full p-3 border rounded focus:outline-none focus:border-amber-500 bg-white cursor-pointer 
            ${errors.category ? "border-red-500" : "border-gray-300"}`} >
            {
              globalInfo.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))
            }
          </select>
          {
            errors.category && (<p className="text-red-500 text-sm mt-1">{errors.category.message}</p>)
          }
        </div>
      </div>

      {/* Archivos */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">
          Fotos {isEditMode && <span className="text-sm font-normal text-gray-500">(Deja vacío para mantener las actuales)</span>}
        </label>

        {/* Previsualización */}
        {isEditMode && initialData?.images && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {currentImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                  title="Eliminar imagen">
                    <Trash2 className="h-4 w-4" />
                </button>
                <img key={idx} src={img} className="h-20 w-20 object-cover rounded border cursor-pointer" alt="preview" />
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          className="w-full p-2 border rounded bg-gray-50"
          {...register("files")}
        />
        <p className="text-sm text-gray-500 mt-1">Puedes seleccionar varias imágenes a la vez.</p>
        {errors.files && <p className="text-red-500 text-sm">{String(errors.files.message)}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 rounded font-bold text-white bg-neutral-900 hover:bg-neutral-800 transition disabled:opacity-50"
      >
        {isSubmitting ? "Guardando..." : (isEditMode ? "Actualizar" : "Agregar")}
      </button>
    </form>
  );
}
