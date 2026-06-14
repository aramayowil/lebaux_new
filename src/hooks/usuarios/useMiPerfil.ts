import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  Usuario,
  Rol,
  Permiso,
  SeccionPermiso,
  AccionPermiso,
} from "@/types/index";
import { SQUEMA_SEGURIDAD } from "./squemaSeguridad";

export type PerfilUsuario = Usuario & {
  roles: (Rol & { permisos: Permiso[] }) | null;
};

const TABLE = "usuarios";

// --- Perfil del usuario logueado: datos + rol + permisos del rol ---
export function useMiPerfil() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: [TABLE, "perfil", userId],
    enabled: !!userId,
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA_SEGURIDAD)
        .from(TABLE)
        .select("*, roles(*, permisos(*))")
        .eq("id", userId as string)
        .single();

      if (error) throw error;
      return data as PerfilUsuario;
    },
  });
}

// --- Helper: ¿el usuario actual puede hacer <accion> en <seccion>? ---
export function usePuede(
  seccion: SeccionPermiso,
  accion: AccionPermiso = "ver",
) {
  const { data: perfil, isLoading } = useMiPerfil();

  if (isLoading || !perfil) return false;
  if (!perfil.activo) return false;
  if (perfil.roles?.nombre === "Administrador") return true;

  const permiso = perfil.roles?.permisos?.find((p) => p.seccion === seccion);
  return !!permiso?.[accion];
}

// --- Helper: mapa completo de permisos { seccion: { ver, crear, editar, del } } ---
export function useMisPermisos() {
  const { data: perfil, isLoading } = useMiPerfil();

  const esAdmin = perfil?.roles?.nombre === "Administrador";

  const mapa = new Map<SeccionPermiso, Permiso>();
  perfil?.roles?.permisos?.forEach((p) => mapa.set(p.seccion, p));

  const puede = (seccion: SeccionPermiso, accion: AccionPermiso = "ver") => {
    if (!perfil || !perfil.activo) return false;
    if (esAdmin) return true;
    return !!mapa.get(seccion)?.[accion];
  };

  return { perfil, permisos: mapa, puede, esAdmin, isLoading };
}
