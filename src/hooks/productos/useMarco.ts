import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Marco } from "@/types";
import { SQUEMA } from "./squemaProductos";

const TABLE = "marco";

// --- 1. LEER ---
export function useMarcos() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");

      if (error) throw error;
      return data as Marco[];
    },
  });
}

// --- 2. EDITAR / ACTUALIZAR ---

export function useUpdateMarco() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<Omit<Marco, "id">>; // Evita que se envíe el ID en el body por error
    }) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Marco;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 3. BORRAR ---
export function useDeleteMarco() {
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
export function useCreateMarco() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMarco: Omit<Marco, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert([newMarco])
        .select()
        .single();

      if (error) throw error;
      return data as Marco;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

export function useMarcosByProducto(id_producto: number) {
  return useQuery({
    queryKey: [TABLE, "producto", id_producto],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_producto", id_producto);

      if (error) throw error;
      return data as Marco[];
    },
  });
}
