import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Opciones } from "@/types/index";
import { SQUEMA } from "./squemaCatalogo";

const TABLE = "opciones";

// --- 1. HOOK PARA LEER LAS CONFIGURACIONES GLOBAL ---
export function useOpciones() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .maybeSingle(); // 👈 Trae el único registro como objeto directo, evita manejar arrays [0]

      if (error) throw error;
      return data as Opciones;
    },
  });
}

// --- 2. HOOK PARA ACTUALIZAR LAS CONFIGURACIONES ---
export function useUpdateOpciones() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Opciones>;
    }) => {
      const { data: updatedData, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedData as Opciones;
    },
    // Invalidamos la query para que toda la app se entere del cambio (ej. cambio de IVA o Márgenes)
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useCreateOpciones() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Opciones>) => {
      const { data: newOpcion, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert([data]) // 👈 Insertamos un array con un objeto
        .select()
        .single(); // 👈 Seleccionamos el registro creado

      if (error) throw error;
      return newOpcion as Opciones;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}
