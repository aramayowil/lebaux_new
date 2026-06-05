/**
 * useDespiece.ts — REFACTORIZADO
 *
 * Cambios respecto a la versión anterior:
 * - Eliminada la dependencia de useObrasStore.
 * - Acepta `config: TipologiaConfig | null` como segundo parámetro,
 *   construido externamente con obraDetalleToConfig() desde los datos de DB.
 * - La firma del hook es retrocompatible: el segundo parámetro es opcional
 *   para no romper usos existentes que todavía no hayan migrado.
 * - Todos los campos de cfg se leen del parámetro recibido, no del store.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import {
  calcularDespiece,
  type ResultadoDespiece,
  type EntradaCalculo,
  type DatosProducto,
} from "@/lib/motorDespiece";
import type { ObraTipologia } from "@/types";
import type { TipologiaConfig } from "@/types/canvasTypes";

// Catálogos
import { usePerfiles } from "./catalogo/usePerfiles";
import { useAccesorios } from "./catalogo/useAccesorios";
import { useVidrios } from "./catalogo/useVidrios";
import { useTratamientos } from "./catalogo/useTratamientos";

// Productos globales
import { useMarcos } from "./productos/useMarco";
import { useHojas } from "./productos/useHojas";
import { useInteriores } from "./productos/useInteriores";

export interface UseDespieceResult {
  resultado: ResultadoDespiece | null;
  error: string | null;
  /** true cuando hay suficiente config para calcular (aunque el resultado sea null por error) */
  configurado: boolean;
}

/**
 * Calcula el despiece de una tipología dado:
 * @param tipologia  — datos dimensionales (ancho, alto, cantidad)
 * @param config     — configuración del producto (producto, marco, hoja, cruces…)
 *                    obtenida con obraDetalleToConfig() desde DB.
 *
 * Todos los hooks de catálogo y productos se invocan incondicionalmente
 * (regla de hooks de React) y los datos se usan solo dentro del useMemo.
 */
export function useDespiece(
  tipologia: ObraTipologia | null,
  config: TipologiaConfig | null = null,
): UseDespieceResult {
  // El alias `cfg` se mantiene del código original para facilitar la lectura
  const cfg = config;

  // ── 1. Catálogos base ──────────────────────────────────────────────────────
  const { data: perfiles = [] } = usePerfiles();
  const { data: accesorios = [] } = useAccesorios();
  const { data: vidrios = [] } = useVidrios();
  const { data: tratamientos = [] } = useTratamientos();

  // ── 2. Productos globales ──────────────────────────────────────────────────
  const { data: marcos = [] } = useMarcos();
  const { data: hojas = [] } = useHojas();
  const { data: interiores = [] } = useInteriores();

  // ── 3. IDs para las queries de reglas de despiece ─────────────────────────
  const idMarco = cfg?.id_marco;
  const idHoja = cfg?.id_hoja;

  const interioresIds = Array.from(
    new Set([
      cfg?.id_interior,
      ...(cfg?.modulosConfig?.map((m) => m.id_interior) ?? []),
    ]),
  ).filter((v): v is number => typeof v === "number" && v > 0);

  const contravidriosIds = Array.from(
    new Set([
      cfg?.id_contravidrio,
      ...(cfg?.modulosConfig?.map((m) => m.id_contravidrio) ?? []),
    ]),
  ).filter((v): v is number => typeof v === "number" && v > 0);

  const contravidriosExtIds = Array.from(
    new Set([
      cfg?.id_contravidrio_ext,
      ...(cfg?.modulosConfig?.map((m) => m.id_contravidrio_ext) ?? []),
    ]),
  ).filter((v): v is number => typeof v === "number" && v > 0);

  // ── 4. Query de reglas de despiece (fórmulas, perfiles, accesorios) ────────
  const { data: despieceRules } = useQuery({
    queryKey: [
      "despiece_rules_tipologia",
      idMarco,
      idHoja,
      interioresIds,
      contravidriosIds,
      contravidriosExtIds,
    ],
    queryFn: async () => {
      const SQUEMA = "opendata";

      const fetchEq = async (
        table: string,
        col: string,
        val: number | null | undefined,
      ) => {
        if (!val) return [];
        const { data } = await supabase
          .schema(SQUEMA)
          .from(table)
          .select("*")
          .eq(col, val);
        return data ?? [];
      };

      const fetchIn = async (table: string, col: string, vals: number[]) => {
        if (!vals.length) return [];
        const { data } = await supabase
          .schema(SQUEMA)
          .from(table)
          .select("*")
          .in(col, vals);
        return data ?? [];
      };

      // 4.1 Productos dependientes de los interiores activos
      const [cruces, allContravidrios, allContravidriosExt, vidRepartidos] =
        await Promise.all([
          fetchIn("cruces", "id_interior", interioresIds),
          fetchIn("contravidrio", "id_interior", interioresIds),
          fetchIn("contravidrio_exterior", "id_interior", interioresIds),
          fetchIn("vidrio_repartido", "id_interior", interioresIds),
        ]);

      const crucesIds = (cruces as any[]).map((c) => c.id);

      // 4.2 Perfiles y accesorios asociados
      const [
        dpMarco,
        dpHoja,
        dpCV,
        dpCVE,
        dpCruces,
        daMarco,
        daHoja,
        daInt,
        daCV,
        daCruces,
        dInt,
      ] = await Promise.all([
        fetchEq("despiece_perfiles_marco", "id_marco", idMarco),
        fetchEq("despiece_perfiles_hoja", "id_hoja", idHoja),
        fetchIn(
          "despiece_perfiles_contravidrio",
          "id_contravidrio",
          contravidriosIds,
        ),
        fetchIn(
          "despiece_perfiles_contravidrioExt",
          "id_contravidrio",
          contravidriosExtIds,
        ),
        fetchIn("despiece_cruces", "id_cruces", crucesIds),
        fetchEq("despiece_accesorios_marco", "id_marco", idMarco),
        fetchEq("despiece_accesorios_hoja", "id_hoja", idHoja),
        fetchIn("despiece_accesorios_interior", "id_interior", interioresIds),
        fetchIn(
          "despiece_accesorios_contravidrio",
          "id_contravidrio",
          contravidriosIds,
        ),
        fetchIn("despiece_accesorios_cruces", "id_cruces", crucesIds),
        fetchIn("despiece_interior", "id_interior", interioresIds),
      ]);

      return {
        cruces,
        allContravidrios,
        allContravidriosExt,
        vidRepartidos,
        dpMarco,
        dpHoja,
        dpCV,
        dpCVE,
        dpCruces,
        daMarco,
        daHoja,
        daInt,
        daCV,
        daCruces,
        dInt,
      };
    },
    // Solo ejecutar si hay al menos marco o hoja configurados
    enabled: !!cfg?.id_marco || !!cfg?.id_hoja,
  });

  // ── 5. Cálculo memoizado ───────────────────────────────────────────────────
  return useMemo(() => {
    if (!tipologia || !cfg?.id_marco || !despieceRules) {
      return { resultado: null, error: null, configurado: false };
    }

    if (!perfiles.length || !accesorios.length || !vidrios.length) {
      return {
        resultado: null,
        error: "Cargando catálogos básicos...",
        configurado: false,
      };
    }

    try {
      const marco = marcos.find((m) => m.id === cfg.id_marco);
      const hoja = hojas.find((h) => h.id === cfg.id_hoja);

      const entrada: EntradaCalculo = {
        ancho: tipologia.ancho ?? 0,
        alto: tipologia.alto ?? 0,
        cantidad_tipologias: tipologia.cantidad ?? 1,
        id_marco: cfg.id_marco,
        id_hoja: cfg.id_hoja,
        id_interior: cfg.id_interior,
        id_contravidrio: cfg.id_contravidrio,
        id_contravidrio_ext: cfg.id_contravidrio_ext,
        id_tratamiento: cfg.id_tratamiento,
        id_vidrio: cfg.id_vidrio,
        tipo_cruce: cfg.tipo_cruce,
        cruces_h: cfg.cruces_h,
        cruces_v: cfg.cruces_v,
        pos_h: cfg.pos_h ?? [],
        pos_v: cfg.pos_v ?? [],
        modulosConfig: cfg.modulosConfig ?? [],
      };

      const datos: DatosProducto = {
        marco,
        hoja,
        all_interiores: interiores,
        all_contravidrios: despieceRules.allContravidrios,
        all_contravidrios_ext: despieceRules.allContravidriosExt,
        all_cruces: despieceRules.cruces,
        all_vid_repartidos: despieceRules.vidRepartidos,

        despiece_perfiles_marco: despieceRules.dpMarco,
        despiece_perfiles_hoja: despieceRules.dpHoja,

        get_despiece_perfil: (nivel, idParent) => {
          if (nivel === "marco" && idParent === cfg.id_marco)
            return despieceRules.dpMarco;
          if (nivel === "hoja" && idParent === cfg.id_hoja)
            return despieceRules.dpHoja;
          if (nivel === "contravidrio")
            return (despieceRules.dpCV as any[]).filter(
              (x) => x.id_contravidrio === idParent,
            );
          if (nivel === "contravidrioExt")
            return (despieceRules.dpCVE as any[]).filter(
              (x) => x.id_contravidrio === idParent,
            );
          if (nivel === "cruces")
            return (despieceRules.dpCruces as any[]).filter(
              (x) => x.id_cruces === idParent,
            );
          return [];
        },

        get_despiece_accesorio: (nivel, idParent) => {
          if (nivel === "marco" && idParent === cfg.id_marco)
            return despieceRules.daMarco;
          if (nivel === "hoja" && idParent === cfg.id_hoja)
            return despieceRules.daHoja;
          if (nivel === "interior")
            return (despieceRules.daInt as any[]).filter(
              (x) => x.id_interior === idParent,
            );
          if (nivel === "contravidrio")
            return (despieceRules.daCV as any[]).filter(
              (x) => x.id_contravidrio === idParent,
            );
          if (nivel === "cruces")
            return (despieceRules.daCruces as any[]).filter(
              (x) => x.id_cruces === idParent,
            );
          return [];
        },

        get_despiece_interior: (idInterior) => {
          const di = (despieceRules.dInt as any[]).find(
            (x) => x.id_interior === idInterior,
          );
          if (!di)
            throw new Error(
              `DespieceInterior no encontrado para interior id=${idInterior}`,
            );
          return di;
        },

        get_despiece_contravidrio: (idContravidrio) => {
          const cv =
            (despieceRules.dpCV as any[]).find(
              (x) => x.id_contravidrio === idContravidrio,
            ) ??
            (despieceRules.dpCVE as any[]).find(
              (x) => x.id_contravidrio === idContravidrio,
            );
          if (!cv)
            throw new Error(
              `DespiecePerfilContravidrio no encontrado para id=${idContravidrio}`,
            );
          return cv;
        },

        catalog_perfiles: perfiles,
        catalog_accesorios: accesorios,
        catalog_vidrios: vidrios,
        catalog_tratamientos: tratamientos,
      };

      const resultado = calcularDespiece(entrada, datos);
      return { resultado, error: null, configurado: true };
    } catch (e) {
      return { resultado: null, error: String(e), configurado: true };
    }
  }, [
    // Tipología
    tipologia?.id,
    tipologia?.ancho,
    tipologia?.alto,
    tipologia?.cantidad,
    // Config (ahora viene del parámetro, no del store)
    cfg?.tipo_cruce,
    cfg?.cruces_h,
    cfg?.cruces_v,
    cfg?.pos_h?.length,
    cfg?.pos_v?.length,
    cfg?.id_marco,
    cfg?.id_hoja,
    cfg?.id_interior,
    cfg?.id_contravidrio,
    cfg?.id_contravidrio_ext,
    cfg?.id_vidrio,
    cfg?.modulosConfig?.length,
    // Datos de catálogo y productos
    marcos.length,
    hojas.length,
    interiores.length,
    perfiles.length,
    accesorios.length,
    vidrios.length,
    despieceRules,
  ]);
}
