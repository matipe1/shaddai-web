import { Navbar } from "../components/Navbar";
import { Footer } from "../sections/Footer";
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Clock } from "lucide-react";

// 1. Importamos las librerías necesarias
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// 2. Definimos el esquema de validación
const contactSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 letras"),
  email: z.string().email("Ingresa un email válido"),
  subject: z.string().min(1, "Por favor selecciona un asunto"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres")
});

// Inferimos el tipo de datos
type ContactForm = z.infer<typeof contactSchema>;

export function Contact() {
  // 3. Inicializamos el Hook
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema)
  });

  // 4. Función de envío (Solo se ejecuta si la validación pasa)
  const onSubmit = async (data: ContactForm) => {
    // Simulamos una promesa para que isSubmitting funcione automágicamente
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    alert(`¡Gracias ${data.name}! Hemos recibido tu mensaje sobre "${data.subject}".`);
    reset(); // Limpia el formulario
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="grow">
        {/* Encabezado */}
        <div className="bg-neutral-900 py-16 text-center">
          <h1 className="text-4xl font-bold text-white tracking-wider mb-2">CONTÁCTANOS</h1>
          <p className="text-amber-500 font-medium tracking-widest text-sm uppercase">
            Estamos para asesorarte
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* COLUMNA IZQUIERDA (Info estática - Sin cambios) */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Hablemos</h2>
                <p className="text-gray-600 leading-relaxed">
                  ¿Tienes dudas sobre algún termo Stanley? ¿Buscas equipar tu local? 
                  Escríbenos y un asesor de SHADDAI se pondrá en contacto contigo.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-amber-200 transition-colors">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Ubicación</h3>
                    <p className="text-gray-600">Córdoba Capital, Argentina</p>
                    <p className="text-sm text-gray-500">Envíos a todo el país</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-amber-200 transition-colors">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">WhatsApp Ventas</h3>
                    <p className="text-gray-600">+54 9 351 123-4567</p>
                    <p className="text-sm text-gray-500">Respuesta inmediata</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-amber-200 transition-colors">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Email</h3>
                    <p className="text-gray-600">ventas@shaddaistore.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-amber-200 transition-colors">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Horario de Atención</h3>
                    <p className="text-gray-600">Lunes a Viernes: 9:00 - 18:00 hs</p>
                    <p className="text-gray-600">Sábados: 9:00 - 13:00 hs</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Síguenos</h3>
                <div className="flex gap-4">
                  <a href="#" className="bg-neutral-900 text-white p-3 rounded-full hover:bg-amber-500 hover:text-white transition-all transform hover:-translate-y-1">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="bg-neutral-900 text-white p-3 rounded-full hover:bg-amber-500 hover:text-white transition-all transform hover:-translate-y-1">
                    <Facebook className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Formulario con Zod */}
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 border-t-4 border-amber-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Envíanos un mensaje</h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      {...register("name")}
                      className={`w-full px-4 py-3 rounded-lg border outline-none transition-all bg-gray-50 focus:bg-white
                        ${errors.name ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"}`}
                      placeholder="Tu nombre"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      {...register("email")}
                      className={`w-full px-4 py-3 rounded-lg border outline-none transition-all bg-gray-50 focus:bg-white
                        ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"}`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                {/* Asunto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
                  <select
                    {...register("subject")}
                    className={`w-full px-4 py-3 rounded-lg border outline-none transition-all bg-gray-50 focus:bg-white
                        ${errors.subject ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"}`}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Consulta General">Consulta General</option>
                    <option value="Ventas Mayoristas">Ventas Mayoristas</option>
                    <option value="Estado de mi pedido">Estado de mi pedido</option>
                    <option value="Reclamo">Garantía / Reclamo</option>
                  </select>
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                  <textarea
                    {...register("message")}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border outline-none transition-all bg-gray-50 focus:bg-white resize-none
                        ${errors.message ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"}`}
                    placeholder="Hola, quisiera saber si tienen stock de..."
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                {/* Botón Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting} // Usamos isSubmitting de hook-form
                  className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg text-white font-bold text-lg transition-all transform hover:-translate-y-1 shadow-lg
                    ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-neutral-900 hover:bg-neutral-800'}`}
                >
                  {isSubmitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      Enviar Mensaje <Send className="h-5 w-5 ml-1" />
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}