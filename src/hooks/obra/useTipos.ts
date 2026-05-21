import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Tipos } from "@/types";

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
      return data as Tipos[];
    },
  });
}
