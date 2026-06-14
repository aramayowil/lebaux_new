import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Rol } from "@/types/index";
import { SQUEMA_SEGURIDAD } from "./squemaSeguridad";

const TABLE = "roles";

// --- 1. LISTAR ROLES ---
export function useRoles() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA_SEGURIDAD)
        .from(TABLE)
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;
      return data as Rol[];
    },
  });
}

// --- 2. CREAR ROL ---
export function useCreateRol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rol: Omit<Rol, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA_SEGURIDAD)
        .from(TABLE)
        .insert(rol)
        .select()
        .single();

      if (error) throw error;
      return data as Rol;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 3. ACTUALIZAR ROL ---
export function useUpdateRol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rol: Partial<Rol> & { id: number }) => {
      const { data, error } = await supabase
        .schema(SQUEMA_SEGURIDAD)
        .from(TABLE)
        .update(rol)
        .eq("id", rol.id)
        .select()
        .single();

      if (error) throw error;
      return data as Rol;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 4. ELIMINAR ROL ---
export function useDeleteRol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .schema(SQUEMA_SEGURIDAD)
        .from(TABLE)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
      queryClient.invalidateQueries({ queryKey: ["permisos"] });
    },
  });
}
