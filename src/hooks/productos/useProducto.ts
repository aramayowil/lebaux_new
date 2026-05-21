import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Producto } from "@/types";
import { SQUEMA } from "./squemaProductos";

const TABLE = "productos";

// --- 1. LEER ---
export function useProductos() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");

      if (error) throw error;
      return data as Producto[];
    },
  });
}

// --- 2. EDITAR / ACTUALIZAR ---
export function useUpdateProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Producto) => {
      // Usamos cod_parte para identificar la fila y actualizar el resto
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(updates)
        .eq("id", updates.id)
        .select()
        .single();

      if (error) throw error;
      return data as Producto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 3. BORRAR ---
export function useDeleteProducto() {
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
export function useCreateProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProducto: Omit<Producto, "id">) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert([newProducto])
        .select()
        .single();

      if (error) throw error;
      return data as Producto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}
