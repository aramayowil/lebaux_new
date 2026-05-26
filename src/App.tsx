import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";

// Importaciones de Layout y Rutas
import AppLayout from "@/components/layout/AppLayout";
import InicioPge from "@/pages/InicioPage";
import ObrasPage from "@/pages/ObrasPage";
import ObraEditorPage from "@/pages/ObraEditorPage";
import ProductosPage from "@/pages/ProductosPage";
import CatalogosPage from "@/pages/CatalogosPage";
import OpcionesPage from "@/pages/OpcionesPage";
import PresupuestoPage from "@/pages/PresupuestoPage";
import Login from "@/pages/login/Login";
import Register from "@/pages/login/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import ImportarPage from "@/pages/ImportarPage";
import Error404Page from "@/pages/Error404Page";
import ControlAccesoPage from "./pages/ControlAccesoPage";

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
      <Route path="*" element={<Error404Page />} />

      {/* ─── RUTAS PROTEGIDAS ─── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Redirección limpia de la raíz a /inicio */}
          <Route path="/" element={<Navigate to="/inicio" replace />} />

          <Route path="/inicio" element={<InicioPge />} />
          <Route path="/obras" element={<ObrasPage />} />
          <Route path="/obras/:id" element={<ObraEditorPage />} />
          <Route path="/obras/:id/presupuesto" element={<PresupuestoPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/catalogos" element={<CatalogosPage />} />
          <Route path="/importar" element={<ImportarPage />} />
          <Route path="/usuarios" element={<ControlAccesoPage />} />
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
