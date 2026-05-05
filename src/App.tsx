import { Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import InicioPge from "@/pages/InicioPge";
import ObrasPage from "@/pages/ObrasPage";
import ObraEditorPage from "@/pages/ObraEditorPage";
import ProductosPage from "@/pages/ProductosPage";
import CatalogosPage from "@/pages/CatalogosPage";
import OpcionesPage from "@/pages/OpcionesPage";
import Login from "./pages/login/Login";
import Register from "./pages/login/Register";

export default function App() {
  return (
    <Routes>
      {/*rutas publicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<AppLayout />}>
        {/*rutas protegidas */}
        <Route path="/inicio" element={<InicioPge />} />
        <Route path="/obras" element={<ObrasPage />} />
        <Route path="/obras/:id" element={<ObraEditorPage />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/catalogos" element={<CatalogosPage />} />
        <Route path="/opciones" element={<OpcionesPage />} />
      </Route>
    </Routes>
  );
}
