import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../../supabase/client";
import { globalInfo } from "../../data";
import { useState } from "react";
import { Upload, X } from "lucide-react";

// ✅ VALIDACIONES MEJORADAS
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGES = 5;

const createProductSchema = (isEditMode: boolean = false) => {
  return z.object({
    title: z.string().min(1, "El título es obligatorio"),
    description: z.string().max(1000, "Máximo 1000 caracteres"),
    price: z.number().positive("El precio debe ser positivo"),
    category: z.enum(globalInfo.categories, {
      message: "Seleccione una categoría válida",
    }),
    files: isEditMode
      ? z
          .instanceof(FileList)
          .optional()
          .refine((files) => {
            if (!files || files.length === 0) return true;
            return Array.from(files).every(
              (file) => ACCEPTED_IMAGE_TYPES.includes(file.type)
            );
          }, "Solo se permiten archivos de imagen (JPG, PNG, WebP)")
          .refine((files) => {
            if (!files || files.length === 0) return true;
            return Array.from(files).every((file) => file.size <= MAX_FILE_SIZE);
          }, "Cada imagen debe pesar menos de 5MB")
      : z
          .instanceof(FileList, { message: "Se requiere al menos una imagen" })
          .refine((files) => files.length > 0, "Debe subir al menos una imagen")
          .refine((files) => files.length <= MAX_IMAGES, `Máximo ${MAX_IMAGES} imágenes`)
          .refine(
            (files) =>
              Array.from(files).every((file) =>
                ACCEPTED_IMAGE_TYPES.includes(file.type)
              ),
            "Solo se permiten archivos de imagen (JPG, PNG, WebP)"
          )
          .refine(
            (files) =>
              Array.from(files).every((file) => file.size <= MAX_FILE_SIZE),
            "Cada imagen debe pesar menos de 5MB"
          ),
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
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newImagesPreviews, setNewImagesPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
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

  // Watch para preview de nuevos archivos
  const watchedFiles = watch("files");
  
  // Actualizar previews cuando cambian los archivos
  useState(() => {
    if (watchedFiles && watchedFiles.length > 0) {
      const files = Array.from(watchedFiles);
      const previews: string[] = [];
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            previews.push(e.target.result as string);
            if (previews.length === files.length) {
              setNewImagesPreviews(previews);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      setNewImagesPreviews([]);
    }
  });

  // ✅ FUNCIÓN MEJORADA PARA ELIMINAR IMÁGENES EXISTENTES
  const removeExistingImage = (indexToRemove: number) => {
    const imageUrl = currentImages[indexToRemove];
    setCurrentImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagesToDelete(prev => [...prev, imageUrl]);
  };

  // ✅ FUNCIÓN PARA EXTRAER PATH DEL URL DE SUPABASE
  const extractPathFromUrl = (url: string): string | null => {
    try {
      const urlParts = url.split('/');
      const storageIndex = urlParts.findIndex(part => part === 'storage');
      if (storageIndex !== -1 && urlParts[storageIndex + 3]) {
        return urlParts.slice(storageIndex + 3).join('/');
      }
      return null;
    } catch {
      return null;
    }
  };

  // ✅ FUNCIÓN PARA ELIMINAR ARCHIVOS DEL STORAGE
  const deleteImagesFromStorage = async (imageUrls: string[]) => {
    const pathsToDelete = imageUrls
      .map(url => extractPathFromUrl(url))
      .filter(path => path !== null) as string[];
    
    if (pathsToDelete.length > 0) {
      const { error } = await supabase.storage
        .from('products')
        .remove(pathsToDelete);
      
      if (error) {
        console.error('Error eliminando imágenes del storage:', error);
      }
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setUploadProgress(0);
    
    try {
      let uploadedImageUrls: string[] = [];
      const uploadedPaths: string[] = []; // Para rollback

      // Conservamos las imágenes existentes (no marcadas para eliminar)
      if (isEditMode && initialData?.images) {
        uploadedImageUrls = [...currentImages];
      }

      // ✅ SUBIDA DE NUEVAS IMÁGENES CON PROGRESO
      if (data.files && data.files.length > 0) {
        const files = Array.from(data.files);
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `products/${fileName}`;

          setUploadProgress(Math.round(((i + 1) / files.length) * 100));

          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, file);

          if (uploadError) {
            // Rollback: eliminar archivos ya subidos
            if (uploadedPaths.length > 0) {
              await supabase.storage
                .from("products")
                .remove(uploadedPaths);
            }
            throw new Error(`Error subiendo ${file.name}: ${uploadError.message}`);
          }

          uploadedPaths.push(filePath);

          const { data: { publicUrl } } = supabase.storage
            .from("products")
            .getPublicUrl(filePath);

          uploadedImageUrls.push(publicUrl);
        }
      }

      // Verificar que tengamos al menos una imagen
      if (uploadedImageUrls.length === 0) {
        throw new Error("Debe tener al menos una imagen");
      }

      // Datos del producto
      const productData = {
        title: data.title,
        price: data.price,
        description: data.description,
        category: data.category,
        images: uploadedImageUrls,
      };

      if (isEditMode && initialData) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', initialData.id);

        if (error) throw error;

        // ✅ ELIMINAR IMÁGENES MARCADAS PARA ELIMINAR
        if (imagesToDelete.length > 0) {
          await deleteImagesFromStorage(imagesToDelete);
        }
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) {
          // Rollback: eliminar imágenes subidas
          if (uploadedPaths.length > 0) {
            await supabase.storage
              .from("products")
              .remove(uploadedPaths);
          }
          throw error;
        }
        reset();
        setNewImagesPreviews([]);
      }

      setUploadProgress(0);
      onSuccess?.();

    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      onError?.(errorMessage);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">Nombre</label>
        <input
          {...register("title")} 
          type="text" 
          placeholder="Ej: Termo Stanley 1.2L"
          className={`w-full p-3 border rounded focus:outline-none focus:border-amber-500 bg-white
          ${errors.title ? "border-red-500" : "border-gray-300"}`} 
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">
          Descripción del Producto
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Los saltos de línea se respetarán)
          </span>
        </label>
        <textarea
          {...register("description")} 
          rows={6}  // Más alto para mejor edición
          placeholder="Vaso térmico de acero inoxidable...

Características:
* Capacidad: 500 ml
* Conserva frío y calor 
* Pantalla digital..." 
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-amber-500 bg-white resize-none font-mono text-sm" 
        />
        <p className="text-xs text-gray-500 mt-1">
          Tip: Usa Enter para crear saltos de línea y * para listas
        </p>
      </div>

      {/* Precio y Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Precio ($)</label>
          <input
            {...register("price", { valueAsNumber: true })} 
            type="number" 
            step="0.01" 
            min="0"
            className={`w-full p-3 border rounded focus:outline-none focus:border-amber-500 bg-white
            ${errors.price ? "border-red-500" : "border-gray-300"}`} 
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Categoría</label>
          <select
            {...register("category")}
            className={`w-full p-3 border rounded focus:outline-none focus:border-amber-500 bg-white cursor-pointer 
            ${errors.category ? "border-red-500" : "border-gray-300"}`}
          >
            {globalInfo.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>
      </div>

      {/* ✅ SECCIÓN DE IMÁGENES MEJORADA */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">
          Fotos del Producto
          <span className="text-sm font-normal text-gray-500 ml-2">
            (JPG, PNG, WebP - Máx. 5MB cada una)
          </span>
        </label>

        {/* Imágenes Existentes */}
        {isEditMode && currentImages.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Imágenes actuales:</h4>
            <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
              {currentImages.map((img, idx) => (
                <div key={idx} className="relative group shrink-0">
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-10"
                    title="Eliminar imagen"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <img 
                    src={img} 
                    className="h-24 w-24 object-cover rounded border-2 border-gray-200 hover:border-red-300 transition-colors" 
                    alt="preview" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview de Nuevas Imágenes */}
        {newImagesPreviews.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Nuevas imágenes a subir:</h4>
            <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
              {newImagesPreviews.map((preview, idx) => (
                <div key={idx} className="relative shrink-0">
                  <img 
                    src={preview} 
                    className="h-24 w-24 object-cover rounded border-2 border-green-300" 
                    alt="preview" 
                  />
                  <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded flex items-center justify-center">
                    <Upload className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input de Archivos */}
        <input
          type="file"
          accept="image/*"
          multiple
          className="w-full p-3 border rounded bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
          {...register("files")}
        />
        
        <div className="text-sm text-gray-500 mt-2 space-y-1">
          <p>• Formatos permitidos: JPG, PNG, WebP</p>
          <p>• Tamaño máximo: 5MB por imagen</p>
          <p>• Máximo {MAX_IMAGES} imágenes por producto</p>
          {isEditMode && <p>• Las nuevas imágenes se agregarán a las existentes</p>}
        </div>

        {errors.files && (
          <p className="text-red-500 text-sm mt-2">{String(errors.files.message)}</p>
        )}

        {/* Barra de Progreso */}
        {uploadProgress > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Subiendo imágenes...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 rounded font-bold text-white bg-neutral-900 hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {isEditMode ? "Actualizando..." : "Guardando..."}
          </span>
        ) : (
          isEditMode ? "Actualizar Producto" : "Agregar Producto"
        )}
      </button>
    </form>
  );
}
