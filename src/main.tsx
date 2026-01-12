import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// IMPORTANTE 1: Importar el proveedor
import { AuthProvider } from './context/AuthContext' 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* IMPORTANTE 2: Envolver la App con el AuthProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)