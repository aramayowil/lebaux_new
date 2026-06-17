import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Perfil } from "@/types/index";
import { SQUEMA } from "./squemaCatalogo";

const TABLE = "perfiles";

// --- 1. LEER (read) ---
export function usePerfiles() {
  return useQuery({
    queryKey: [TABLE],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*");
      if (error) throw error;
      return data as Perfil[];
    },
  });
}

export function usePerfilById(id: number) {
  return useQuery({
    queryKey: [TABLE, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Perfil;
    },
  });
}

export function usePerfilesByLinea(lineaId: number | undefined) {
  return useQuery({
    queryKey: [TABLE, lineaId],
    queryFn: async () => {
      if (!lineaId) return [];
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .select("*")
        .eq("id_linea", lineaId);

      if (error) throw error;
      return data as Perfil[];
    },
  });
}

// --- 2. CREAR (insert) ---
export function useCreatePerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (perfil: Omit<Perfil, "id">) => {
      const payload = perfil;
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 3. EDITAR (update) ---
export function useUpdatePerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (perfil: Perfil) => {
      const { id, ...payload } = perfil; // ← separamos id del resto

      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .update(payload)
        .eq("id", id) // ← usamos id en vez de nro_perfil
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
    onError: (error) => {
      console.error("Error al actualizar perfil:", error);
    },
  });
}

// --- 4. BORRAR (delete) ---
export function useDeletePerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // ← recibe number en vez de string
      const { error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .delete()
        .eq("id", id); // ← usamos id en vez de nro_perfil
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 5. INSERCIÓN MASIVA / UPSERT DE PERFILES ---
export function useBulkUpsertPerfiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (perfiles: any[]) => {
      const { data, error } = await supabase
        .schema(SQUEMA)
        .from(TABLE)
        .upsert(perfiles, { onConflict: "nro_perfil" }); // Tu clave de comparación de negocio

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });
}

// --- 6. RESOLUCIÓN INTELIGENTE CON ALTA BAJO DEMANDA ---
export function useResolveImportDependencies() {
  return useMutation({
    mutationFn: async ({
      lineasNames,
      monedasNames,
      crearNuevos = { lineas: [], monedas: [] }, // <-- Recibe qué términos se deben crear
    }: {
      lineasNames: string[];
      monedasNames: string[];
      crearNuevos?: { lineas: string[]; monedas: string[] };
    }) => {
      // 1. Obtener catálogos actuales de la DB
      const { data: dbMonedas = [] } = await supabase
        .schema(SQUEMA)
        .from("monedas")
        .select("id, descripcion");
      const { data: dbLineas = [] } = await supabase
        .schema(SQUEMA)
        .from("lineas")
        .select("id, linea");

      if (!dbMonedas || !dbLineas) {
        throw new Error(
          "No se pudieron obtener los catálogos de la base de datos.",
        );
      }

      const listaMonedasValidas = dbMonedas.filter((m) => m.descripcion);
      const listaLineasValidas = dbLineas.filter((l) => l.linea);

      const monedaMap: Record<string, number> = {};
      listaMonedasValidas.forEach((m) => {
        monedaMap[m.descripcion.toLowerCase().trim()] = m.id;
      });

      const lineaMap: Record<string, number> = {};
      listaLineasValidas.forEach((l) => {
        lineaMap[l.linea.toLowerCase().trim()] = l.id;
      });

      // 2. EJECUTAR CREACIONES BAJO DEMANDA (Si el usuario eligió "Crear nuevo")
      // Monedas nuevas:
      for (const mName of crearNuevos.monedas) {
        const cleanName = mName.trim();
        if (!monedaMap[cleanName.toLowerCase()]) {
          const { data } = await supabase
            .schema(SQUEMA)
            .from("moneda")
            .insert({
              descripcion: cleanName,
              cotizacion: 1,
              bloqueado: false,
            })
            .select()
            .single();
          if (data) monedaMap[cleanName.toLowerCase()] = data.id;
        }
      }

      // Líneas nuevas:
      for (const lName of crearNuevos.lineas) {
        const cleanName = lName.trim();
        if (!lineaMap[cleanName.toLowerCase()]) {
          const { data } = await supabase
            .schema(SQUEMA)
            .from("lineas")
            .insert({
              linea: cleanName,
              id_extrusora: 1,
              bloqueado: false,
            })
            .select()
            .single();
          if (data) lineaMap[cleanName.toLowerCase()] = data.id;
        }
      }

      // 3. DETECTAR CONFLICTOS RESTANTES
      const unmappedMonedas = [...new Set(monedasNames)]
        .filter(Boolean)
        .map((m) => m.trim())
        .filter((m) => !monedaMap[m.toLowerCase()]);
      const unmappedLineas = [...new Set(lineasNames)]
        .filter(Boolean)
        .map((l) => l.trim())
        .filter((l) => !lineaMap[l.toLowerCase()]);

      const sugerenciasMonedas: any[] = [];
      const sugerenciasLineas: any[] = [];

      // Función Levenshtein integrada internamente para calcular scores
      const calcularSimilitud = (s1: string, s2: string) => {
        const m = s1.length,
          n = s2.length;
        const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else
              dp[i][j] =
                1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
          }
        }
        return Math.max(m, n) === 0 ? 1 : 1 - dp[m][n] / Math.max(m, n);
      };

      unmappedMonedas.forEach((mName) => {
        const opciones = listaMonedasValidas
          .map((dbM) => ({
            id: dbM.id,
            descripcion: dbM.descripcion,
            score: calcularSimilitud(
              mName.toLowerCase(),
              dbM.descripcion.toLowerCase(),
            ),
          }))
          .filter((op) => op.score > 0.4)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        sugerenciasMonedas.push({ valorOriginal: mName, opciones });
      });

      unmappedLineas.forEach((lName) => {
        const opciones = listaLineasValidas
          .map((dbL) => ({
            id: dbL.id,
            linea: dbL.linea,
            score: calcularSimilitud(
              lName.toLowerCase(),
              dbL.linea.toLowerCase(),
            ),
          }))
          .filter((op) => op.score > 0.4)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        sugerenciasLineas.push({ valorOriginal: lName, opciones });
      });

      return {
        hasConflicts:
          sugerenciasMonedas.length > 0 || sugerenciasLineas.length > 0,
        monedaMap,
        lineaMap,
        sugerenciasMonedas,
        sugerenciasLineas,
        dbMonedas: listaMonedasValidas,
        dbLineas: listaLineasValidas,
      };
    },
  });
}
