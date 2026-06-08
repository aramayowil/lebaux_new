import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { ObraTipo } from "@/types";

const TABLE = "tipos";
const SCHEMA = "obras";
// --- 1. LEER ---
export function useTipos() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("*");

      if (error) throw error;
      return data as ObraTipo[];
    },
  });
}

export function useTipoById(id: number | undefined) {
  return useQuery({
    queryKey: [TABLE, id],

    queryFn: async () => {
      if (!id) throw new Error("ID requerido para consultar el tipo de obra");

      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      return data as ObraTipo | null;
    },

    enabled: !!id,
  });
}
