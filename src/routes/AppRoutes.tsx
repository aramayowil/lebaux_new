import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import InicioPge from "@/pages/InicioPge";
import ObrasPage from "@/pages/ObrasPage";
import ObraEditorPage from "@/pages/ObraEditorPage";
import ProductosPage from "@/pages/ProductosPage";
import CatalogosPage from "@/pages/CatalogosPage";
import OpcionesPage from "@/pages/OpcionesPage";
import Login from "@/pages/login/Login"; // 💡 Usando alias @/ para evitar rutas rotas
import Register from "@/pages/login/Register";
import ProtectedRoute from "./ProtectedRoute"; // Relativo porque vive en la misma carpeta

export default function AppRoutes() {
  return (
    <Routes>
      {/* ─── RUTAS PÚBLICAS ─── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ─── RUTAS PROTEGIDAS (Requieren inicio de sesión) ─── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Redirección automática al inicio al entrar a la raíz */}
          <Route path="/" element={<Navigate to="/inicio" replace />} />

          <Route path="/inicio" element={<InicioPge />} />
          <Route path="/obras" element={<ObrasPage />} />
          <Route path="/obras/:id" element={<ObraEditorPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/catalogos" element={<CatalogosPage />} />
          <Route path="/opciones" element={<OpcionesPage />} />
        </Route>
      </Route>

      {/* ─── COMODÍN 404 (Cualquier ruta rota vuelve al login) ─── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
