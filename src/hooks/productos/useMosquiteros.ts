import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Mosquitero } from "@/types";

const TABLE = "mosquitero";
const SQUEMA = "opendata"; // Ajustado a tu esquema configurado

// --- 1. LEER TODO (CATÁLOGO) ---
export function useMosquiteros() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .order("descripcion", { ascending: true });

      if (error) throw error;
      return data as Mosquitero[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos de datos "frescos"
  });
}

// --- 2. EDITAR / ACTUALIZAR ---
export function useUpdateMosquitero() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<Omit<Mosquitero, "id">>; // Evita enviar el ID en el body por error
    }) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Mosquitero;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 3. BORRAR ---
export function useDeleteMosquitero() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 4. CREAR ---
export function useCreateMosquitero() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMosquitero: Omit<Mosquitero, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert([newMosquitero])
        .select()
        .single();

      if (error) throw error;
      return data as Mosquitero;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 5. LEER FILTRADO (POR HOJA O PREDETERMINADO) ---
export function useMosquiterosByHoja(idHoja: number | undefined) {
  return useQuery({
    queryKey: [TABLE, "by-hoja", idHoja],
    queryFn: async () => {
      let query = supabase.schema(SQUEMA).from(TABLE).select("*");

      if (idHoja) {
        // Trae los mosquiteros de esa hoja O los que sean globales/predeterminados
        query = query.or(`id_hoja.eq.${idHoja},predeterminado.eq.true`);
      } else {
        // Si no hay hoja, solo trae los predeterminados globales
        query = query.eq("predeterminado", true);
      }

      const { data, error } = await query.order("predeterminado", {
        ascending: false,
      });

      if (error) throw error;
      return data as Mosquitero[];
    },
  });
}
