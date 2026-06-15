import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";

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
import RecuperarPasswordPage from "@/pages/login/RecuperarPasswordPage";
import NuevaPasswordPage from "@/pages/login/NuevaPasswordPage";
import AuthConfirmarPage from "@/pages/login/AuthConfirmarPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import SinPermisosPage from "@/pages/SinPermisosPage";
import ImportarPage from "@/pages/ImportarPage";
import Error404Page from "@/pages/Error404Page";
import ControlAccesoPage from "./pages/ControlAccesoPage";
import CalculadoraPage from "./pages/CalculadoraPage";
import AuthPendientePage from "./pages/login/AuthPendientePage";

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
      {/* ─── RUTAS PÚBLICAS (redirigen a /inicio si ya hay sesión) ─── */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Recuperación de contraseña: accesibles sin sesión */}
        <Route path="/password/reset" element={<RecuperarPasswordPage />} />
        {/* /password/nueva necesita la sesión temporal que Supabase inyecta
            desde el link del email, por eso va fuera de PublicRoute */}
      </Route>

      {/* Nueva contraseña y confirmación de email: Supabase las abre con una
          sesión temporal, no deben redirigir aunque haya sesión activa */}
      <Route path="/password/nueva" element={<NuevaPasswordPage />} />
      <Route path="/auth/confirmar" element={<AuthConfirmarPage />} />
      <Route path="/auth/pendiente" element={<AuthPendientePage />} />

      <Route path="*" element={<Error404Page />} />

      {/* ─── RUTAS PROTEGIDAS ─── */}
      <Route element={<ProtectedRoute />}>
        {/* /sin-permisos FUERA del AppLayout para que no haya nav */}
        <Route path="/sin-permisos" element={<SinPermisosPage />} />

        <Route element={<AppLayout />}>
          {/* Raíz → ProtectedRoute decide a dónde ir según permisos */}
          <Route path="/" element={null} />

          <Route path="/inicio" element={<InicioPge />} />
          <Route path="/obras" element={<ObrasPage />} />
          <Route path="/obras/:id" element={<ObraEditorPage />} />
          <Route path="/obras/:id/presupuesto" element={<PresupuestoPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/catalogos" element={<CatalogosPage />} />
          <Route path="/importar" element={<ImportarPage />} />
          <Route path="/usuarios" element={<ControlAccesoPage />} />
          <Route path="/calculadora" element={<CalculadoraPage />} />
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
