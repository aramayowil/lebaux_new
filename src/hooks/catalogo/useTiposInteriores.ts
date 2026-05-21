import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { TipoInterior } from "@/types/index";
import { SQUEMA } from "./squemaCatalogo";

const TABLE = "tipo_interiores";

// --- 1. LEER (read) ---
export function useTiposInteriores() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");
      if (error) throw error;
      return data as TipoInterior[];
    },
  });
}
