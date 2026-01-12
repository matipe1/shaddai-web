import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.email({ message: "Formato de email inválido" }),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      navigate("/");
    } catch (err) {
      setError("root", {
        message: "Usuario o contraseña incorrectos",
      });
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-t-4 border-amber-500">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Acceso Admin
        </h2>

        {errors.root && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm text-center">
            {errors.root.message}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              {...register("email")}
              type="email"
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.email ? "border-red-500" : "" }`}
            />
            {
              errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )
            }
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {
              errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )
            }
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-bold py-2 px-4 rounded transition ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-neutral-900 text-amber-500 hover:bg-neutral-800'}`}
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
