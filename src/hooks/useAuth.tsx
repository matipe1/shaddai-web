import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

// 1. Definimos qué datos vamos a compartir
interface AuthContextType {
  session: Session | null;
  user: User | null;
  logout: () => Promise<void>;
}

// 2. Creamos el contexto vacío
export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}