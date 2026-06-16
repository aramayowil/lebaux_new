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
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import RecuperarPasswordPage from "@/pages/auth/RecuperarPasswordPage";
import NuevaPasswordPage from "@/pages/auth/NuevaPasswordPage";
import AuthConfirmarPage from "@/pages/auth/AuthConfirmarPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import SinPermisosPage from "@/pages/SinPermisosPage";
import ImportarPage from "@/pages/ImportarPage";
import Error404Page from "@/pages/Error404Page";
import ControlAccesoPage from "./pages/ControlAccesoPage";
import AuthPendientePage from "./pages/auth/AuthPendientePage";
import ProfilePage from "./pages/profile/ProfilePage";
import ProfileAvatarPage from "./pages/profile/ProfileAvatarPage";

export default function App() {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session?.user ?? null);
    });
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
          <Route path="/opciones" element={<OpcionesPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/perfil/avatar" element={<ProfileAvatarPage />} />
        </Route>
      </Route>

      {/* Comodín por si escriben cualquier ruta rota */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// import { useEffect, Suspense, lazy } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { supabase } from "@/lib/supabaseClient";
// import { useAuthStore } from "@/store/useAuthStore";

// // ─── Layout y rutas (síncronos: son livianos y siempre necesarios) ───────────
// import AppLayout from "@/components/layout/AppLayout";
// import ProtectedRoute from "./routes/ProtectedRoute";
// import PublicRoute from "./routes/PublicRoute";

// // ─── Skeletons para el fallback de Suspense ──────────────────────────────────
// import ObrasPageSkeleton from "@/components/obras/skeletons/ObrasPageSkeleton";
// import ObraEditorPageSkeleton from "@/components/obras/skeletons/ObrasEditorPageSkeleton";
// import InicioPageSkeleton from "./components/ui/skeletons/InicioPageSkeleton";

// // ─── Fallback genérico para páginas sin skeleton propio ──────────────────────
// function PageLoader() {
//   return (
//     <div className="flex items-center justify-center w-full h-full min-h-[40vh]">
//       <div className="w-8 h-8 border-4 border-zinc-300 dark:border-zinc-700 border-t-primary rounded-full animate-spin" />
//     </div>
//   );
// }

// // ─── Importaciones lazy (cada una genera su propio chunk) ────────────────────

// // Auth (accesibles sin sesión → se cargan solo al navegar a esas rutas)
// const Login = lazy(() => import("@/pages/auth/Login"));
// const Register = lazy(() => import("@/pages/auth/Register"));
// const RecuperarPasswordPage = lazy(
//   () => import("@/pages/auth/RecuperarPasswordPage"),
// );
// const NuevaPasswordPage = lazy(() => import("@/pages/auth/NuevaPasswordPage"));
// const AuthConfirmarPage = lazy(() => import("@/pages/auth/AuthConfirmarPage"));
// const AuthPendientePage = lazy(() => import("@/pages/auth/AuthPendientePage"));

// // Sin permisos / 404
// const SinPermisosPage = lazy(() => import("@/pages/SinPermisosPage"));
// const Error404Page = lazy(() => import("@/pages/Error404Page"));

// // Páginas protegidas — las más pesadas se cargan bajo demanda
// const InicioPage = lazy(() => import("@/pages/InicioPage"));
// const ObrasPage = lazy(() => import("@/pages/ObrasPage"));
// const ObraEditorPage = lazy(() => import("@/pages/ObraEditorPage"));
// const PresupuestoPage = lazy(() => import("@/pages/PresupuestoPage"));
// const ProductosPage = lazy(() => import("@/pages/ProductosPage"));
// const CatalogosPage = lazy(() => import("@/pages/CatalogosPage"));
// const ImportarPage = lazy(() => import("@/pages/ImportarPage"));
// const ControlAccesoPage = lazy(() => import("./pages/ControlAccesoPage"));
// const OpcionesPage = lazy(() => import("@/pages/OpcionesPage"));

// export default function App() {
//   const setSession = useAuthStore((state) => state.setSession);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session?.user ?? null);
//     });
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session?.user ?? null);
//     });

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [setSession]);

//   return (
//     <Routes>
//       {/* ─── RUTAS PÚBLICAS ─────────────────────────────────────────────── */}
//       <Route element={<PublicRoute />}>
//         <Route
//           path="/login"
//           element={
//             <Suspense fallback={<PageLoader />}>
//               <Login />
//             </Suspense>
//           }
//         />
//         <Route
//           path="/register"
//           element={
//             <Suspense fallback={<PageLoader />}>
//               <Register />
//             </Suspense>
//           }
//         />
//         <Route
//           path="/password/reset"
//           element={
//             <Suspense fallback={<PageLoader />}>
//               <RecuperarPasswordPage />
//             </Suspense>
//           }
//         />
//       </Route>

//       {/* Supabase inyecta sesión temporal en estas rutas → fuera de PublicRoute */}
//       <Route
//         path="/password/nueva"
//         element={
//           <Suspense fallback={<PageLoader />}>
//             <NuevaPasswordPage />
//           </Suspense>
//         }
//       />
//       <Route
//         path="/auth/confirmar"
//         element={
//           <Suspense fallback={<PageLoader />}>
//             <AuthConfirmarPage />
//           </Suspense>
//         }
//       />
//       <Route
//         path="/auth/pendiente"
//         element={
//           <Suspense fallback={<PageLoader />}>
//             <AuthPendientePage />
//           </Suspense>
//         }
//       />

//       <Route
//         path="*"
//         element={
//           <Suspense fallback={<PageLoader />}>
//             <Error404Page />
//           </Suspense>
//         }
//       />

//       {/* ─── RUTAS PROTEGIDAS ───────────────────────────────────────────── */}
//       <Route element={<ProtectedRoute />}>
//         <Route
//           path="/sin-permisos"
//           element={
//             <Suspense fallback={<PageLoader />}>
//               <SinPermisosPage />
//             </Suspense>
//           }
//         />

//         <Route element={<AppLayout />}>
//           <Route path="/" element={null} />

//           <Route
//             path="/inicio"
//             element={
//               <Suspense fallback={<InicioPageSkeleton />}>
//                 <InicioPage />
//               </Suspense>
//             }
//           />
//           <Route
//             path="/obras"
//             element={
//               <Suspense fallback={<ObrasPageSkeleton />}>
//                 <ObrasPage />
//               </Suspense>
//             }
//           />
//           <Route
//             path="/obras/:id"
//             element={
//               <Suspense fallback={<ObraEditorPageSkeleton />}>
//                 <ObraEditorPage />
//               </Suspense>
//             }
//           />
//           <Route
//             path="/obras/:id/presupuesto"
//             element={
//               <Suspense fallback={<PageLoader />}>
//                 <PresupuestoPage />
//               </Suspense>
//             }
//           />
//           <Route
//             path="/productos"
//             element={
//               <Suspense fallback={<PageLoader />}>
//                 <ProductosPage />
//               </Suspense>
//             }
//           />
//           <Route
//             path="/catalogos"
//             element={
//               <Suspense fallback={<PageLoader />}>
//                 <CatalogosPage />
//               </Suspense>
//             }
//           />
//           <Route
//             path="/importar"
//             element={
//               <Suspense fallback={<PageLoader />}>
//                 <ImportarPage />
//               </Suspense>
//             }
//           />
//           <Route
//             path="/usuarios"
//             element={
//               <Suspense fallback={<PageLoader />}>
//                 <ControlAccesoPage />
//               </Suspense>
//             }
//           />
//           <Route
//             path="/opciones"
//             element={
//               <Suspense fallback={<PageLoader />}>
//                 <OpcionesPage />
//               </Suspense>
//             }
//           />
//         </Route>
//       </Route>

//       <Route path="*" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }
