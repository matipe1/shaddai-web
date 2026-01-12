import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../../supabase/client";
import { globalInfo } from "../../data";


const productSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres"),
  price: z
    .number()
    .positive("El precio debe ser positivo")
    .max(999999, "Precio demasiado alto"),
  category: z.enum(globalInfo.categories, {
    message: "Seleccione una categoría válida",
  }),
  file: z
    .instanceof(File, { message: "Debe seleccionar una imagen" })
    .refine(
      (file) => file.size <= 4 * 1024 * 1024,
      "La imagen debe ser menor a 4MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          file.type
        ),
      "Solo se permiten imágenes JPG, PNG o WebP"
    ),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function ProductForm({ onSuccess, onError }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: globalInfo.categories[0],
    },
  });

  const selectedFile = watch("file");

  const onSubmit = async (data: ProductFormData) => {
    try {
      // 1. Subir imagen al Bucket 'products'
      const fileExt = data.file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, data.file);

      if (uploadError) throw uploadError;

      // 2. Obtener la URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      // 3. Guardar en la base de datos
      const { error: dbError } = await supabase.from("products").insert([
        {
          title: data.title,
          price: data.price,
          image_url: publicUrl,
          category: data.category,
        },
      ]);

      if (dbError) throw dbError;

      reset(); // Limpiar formulario
      onSuccess?.(); // Callback de éxito
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      onError?.(errorMessage); // Callback de error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Campo Título */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">Nombre</label>
        <input
          {...register("title")}
          type="text"
          placeholder="Ej: Termo Stanley 1.2L"
          className={`w-full p-3 border rounded focus:outline-none focus:border-amber-500 bg-white ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Campo Descripción */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">
          Descripción del Producto
        </label>
        <textarea
        {...register("description")}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-amber-500 bg-white resize-none"
          placeholder="Detalles técnicos, capacidad, material..."
        ></textarea>
      </div>

      {/* Grid para Precio y Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campo Precio */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Precio ($)
          </label>
          <input
            {...register("price", { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            className={`w-full p-3 border rounded focus:outline-none focus:border-amber-500 bg-white ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        {/* Campo Categoría (NUEVO) */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Categoría
          </label>
          <select
            {...register("category")}
            className={`w-full p-3 border rounded focus:outline-none focus:border-amber-500 bg-white cursor-pointer ${
              errors.category ? "border-red-500" : "border-gray-300"
            }`}
          >
            {globalInfo.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      {/* Campo Archivo */}
      <div>
        <label className="block text-gray-700 font-bold mb-2">Foto</label>
        <input
          type="file"
          accept="image/*"
          className={`w-full p-2 border rounded bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 ${
            errors.file ? "border-red-500" : "border-gray-300"
          }`}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setValue("file", file, { shouldValidate: true });
            }
          }}
        />
        {errors.file && (
          <p className="text-red-500 text-sm mt-1">{errors.file.message}</p>
        )}

        {selectedFile && (
          <div className="mt-2 text-sm text-green-600 font-medium">
            ✅ Archivo listo: {selectedFile.name}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded font-bold text-white transition shadow-md ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-neutral-900 hover:bg-neutral-800 hover:shadow-lg"
        }`}
      >
        {isSubmitting ? "Subiendo..." : "Guardar Producto"}
      </button>
    </form>
  );
}
