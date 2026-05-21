import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Hoja } from "@/types";
import { SQUEMA } from "./squemaProductos";

const TABLE = "hoja";

// --- 1. LEER ---
export function useHojas() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");

      if (error) throw error;
      return data as Hoja[];
    },
  });
}

// --- 2. EDITAR / ACTUALIZAR ---
export function useUpdateHoja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<Omit<Hoja, "id">>; // Evita que se envíe el ID en el body por error
    }) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Hoja;
    },
    // Recibimos el objeto actualizado en los argumentos de onSuccess
    onSuccess: (data) => {
      // Invalida la lista general de hojas
      queryClient.invalidateQueries({ queryKey: [TABLE] });

      // Si usas una query específica para este marco, la invalidamos también
      if (data.id_marco) {
        queryClient.invalidateQueries({
          queryKey: [TABLE, "marco", data.id_marco],
        });
      }
    },
  });
}

// --- 3. BORRAR ---
export function useDeleteHoja() {
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
export function useCreateHoja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newHoja: Omit<Hoja, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert([newHoja])
        .select()
        .single();

      if (error) throw error;
      return data as Hoja;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useHojasByMarco(id_marco: number) {
  return useQuery({
    // La key debe ser única por cada marco para que no se mezclen los datos
    queryKey: [TABLE, "marco", id_marco],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_marco", id_marco); // Sin .single() para traer todas

      if (error) throw error;
      return data as Hoja[];
    },
    // Solo se ejecuta si tenemos un ID válido
    enabled: !!id_marco,
  });
}
