import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";

// Importaciones de Layout y Rutas
import AppLayout from "@/components/layout/AppLayout";
import InicioPge from "@/pages/InicioPge";
import ObrasPage from "@/pages/ObrasPage";
import ObraEditorPage from "@/pages/ObraEditorPage";
import ProductosPage from "@/pages/ProductosPage";
import CatalogosPage from "@/pages/CatalogosPage";
import OpcionesPage from "@/pages/OpcionesPage";
import Login from "@/pages/login/Login"; // 💡 Corregido el @/ por consistencia
import Register from "@/pages/login/Register";
import ProtectedRoute from "./routes/ProtectedRoute"; // Ajustá si tu carpeta es src/routes/ProtectedRoute

export default function App() {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    // 1. Comprobación síncrona inmediata al arrancar/F5
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session?.user ?? null);
    });

    // 2. Escucha activa de cambios de sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  return (
    <Routes>
      {/* ─── RUTAS PÚBLICAS ─── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ─── RUTAS PROTEGIDAS ─── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Redirección limpia de la raíz a /inicio */}
          <Route path="/" element={<Navigate to="/inicio" replace />} />

          <Route path="/inicio" element={<InicioPge />} />
          <Route path="/obras" element={<ObrasPage />} />
          <Route path="/obras/:id" element={<ObraEditorPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/catalogos" element={<CatalogosPage />} />
          <Route path="/opciones" element={<OpcionesPage />} />
        </Route>
      </Route>

      {/* Comodín por si escriben cualquier ruta rota */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

{
  /* ─── RUTAS SÓLO PARA ADMINISTRADORES ─── */
}
{
  /* <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
    <Route element={<AdminLayout />}>
      <Route path="/admin" element={<PanelAdmin />} />
    </Route>
  </Route> */
}
