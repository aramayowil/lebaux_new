import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Permiso, AccionPermiso, SeccionPermiso } from "@/types/index";
import { SQUEMA_SEGURIDAD } from "./squemaSeguridad";

const TABLE = "permisos";

// --- 1. LISTAR TODOS LOS PERMISOS (todos los roles) ---
export function usePermisos() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA_SEGURIDAD)
        .from(TABLE)
        .select("*");
      if (error) throw error;
      return data as Permiso[];
    },
  });
}

// --- 2. LISTAR PERMISOS DE UN ROL ---
export function usePermisosDeRol(id_rol?: number | null) {
  return useQuery({
    queryKey: [TABLE, "rol", id_rol],
    enabled: !!id_rol,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA_SEGURIDAD)
        .from(TABLE)
        .select("*")
        .eq("id_rol", id_rol as number);
      if (error) throw error;
      return data as Permiso[];
    },
  });
}

// --- 3. ACTUALIZAR (O CREAR) UN PERMISO PUNTUAL: rol + sección + acción ---
export function useSetPermiso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id_rol: number;
      seccion: SeccionPermiso;
      accion: AccionPermiso;
      valor: boolean;
    }) => {
      const { id_rol, seccion, accion, valor } = params;

      const { data, error } = await supabase
        .schema(SQUEMA_SEGURIDAD)
        .from(TABLE)
        .upsert(
          { id_rol, seccion, [accion]: valor },
          { onConflict: "id_rol,seccion" },
        )
        .select()
        .single();

      if (error) throw error;
      return data as Permiso;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}
