import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { LoginForm } from "./components/forms/LoginForm";
import { AddProduct } from "./pages/AddProduct";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { Footer } from "./sections/Footer";
import { Contact } from "./pages/Contact";
import { ProductDetail } from "./pages/ProductDetail";
import { EditProduct } from "./pages/EditProduct";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/productos/edit/:id" element={<EditProduct />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/agregar" element={<AddProduct />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;