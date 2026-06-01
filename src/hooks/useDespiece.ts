import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useObrasStore } from "@/store/obrasStore";
import {
  calcularDespiece,
  type ResultadoDespiece,
  type EntradaCalculo,
  type DatosProducto,
} from "@/lib/motorDespiece";
import type { ObraTipologia } from "@/types";

// Catálogos
import { usePerfiles } from "./catalogo/usePerfiles";
import { useAccesorios } from "./catalogo/useAccesorios";
import { useVidrios } from "./catalogo/useVidrios";
import { useTratamientos } from "./catalogo/useTratamientos";

// Productos (Los que no dependen de tipología)
import { useMarcos } from "./productos/useMarco";
import { useHojas } from "./productos/useHojas";
import { useInteriores } from "./productos/useInteriores";

interface UseDespieceResult {
  resultado: ResultadoDespiece | null;
  error: string | null;
  configurado: boolean;
}

export function useDespiece(
  tipologia: ObraTipologia | null,
): UseDespieceResult {
  // 1. OBTENER CONFIG DE OBRA (siempre al inicio, sin returns previos)
  const { getConfig } = useObrasStore();
  const cfg = tipologia ? getConfig(tipologia.id) : null;

  // 2. OBTENER CATÁLOGOS BASE
  const { data: perfiles = [] } = usePerfiles();
  const { data: accesorios = [] } = useAccesorios();
  const { data: vidrios = [] } = useVidrios();
  const { data: tratamientos = [] } = useTratamientos();

  // 3. OBTENER PRODUCTOS GLOBALES
  const { data: marcos = [] } = useMarcos();
  const { data: hojas = [] } = useHojas();
  const { data: interiores = [] } = useInteriores();

  // 4. PREPARAR IDs PARA LAS REGLAS DE DESPIECE
  const idMarco = cfg?.id_marco;
  const idHoja = cfg?.id_hoja;
  const interioresIds = Array.from(
    new Set([
      cfg?.id_interior,
      ...(cfg?.modulosConfig?.map((m) => m.id_interior) || []),
    ]),
  ).filter(Boolean) as number[];

  const contravidriosIds = Array.from(
    new Set([
      cfg?.id_contravidrio,
      ...(cfg?.modulosConfig?.map((m) => m.id_contravidrio) || []),
    ]),
  ).filter(Boolean) as number[];

  const contravidriosExtIds = Array.from(
    new Set([
      cfg?.id_contravidrio_ext,
      ...(cfg?.modulosConfig?.map((m) => m.id_contravidrio_ext) || []),
    ]),
  ).filter(Boolean) as number[];

  // 5. QUERY PARA REGLAS DE DESPIECE DEPENDIENTES DE ESTA TIPOLOGÍA
  // Obtenemos en paralelo los productos (cruces, etc) y las fórmulas de despiece
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
        return data || [];
      };
      const fetchIn = async (table: string, col: string, vals: number[]) => {
        if (!vals.length) return [];
        const { data } = await supabase
          .schema(SQUEMA)
          .from(table)
          .select("*")
          .in(col, vals);
        return data || [];
      };

      // 5.1. Traer productos dependientes de los interiores activos
      const [cruces, allContravidrios, allContravidriosExt, vidRepartidos] =
        await Promise.all([
          fetchIn("cruces", "id_interior", interioresIds),
          fetchIn("contravidrio", "id_interior", interioresIds),
          fetchIn("contravidrio_exterior", "id_interior", interioresIds),
          fetchIn("vidrio_repartido", "id_interior", interioresIds),
        ]);

      const crucesIds = cruces.map((c: any) => c.id);

      // 5.2. Traer perfiles y accesorios asociados
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
        // Perfiles
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

        // Accesorios
        fetchEq("despiece_accesorios_marco", "id_marco", idMarco),
        fetchEq("despiece_accesorios_hoja", "id_hoja", idHoja),
        fetchIn("despiece_accesorios_interior", "id_interior", interioresIds),
        fetchIn(
          "despiece_accesorios_contravidrio",
          "id_contravidrio",
          contravidriosIds,
        ),
        fetchIn("despiece_accesorios_cruces", "id_cruces", crucesIds),

        // Interior formulas
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
    enabled: !!cfg,
  });

  // 6. VALIDACIONES Y RETURN MEMOIZADO
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
        ancho: tipologia.ancho,
        alto: tipologia.alto,
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
            return despieceRules.dpCV.filter(
              (x: any) => x.id_contravidrio === idParent,
            );
          if (nivel === "contravidrioExt")
            return despieceRules.dpCVE.filter(
              (x: any) => x.id_contravidrio === idParent,
            );
          if (nivel === "cruces")
            return despieceRules.dpCruces.filter(
              (x: any) => x.id_cruces === idParent,
            );
          return [];
        },

        get_despiece_accesorio: (nivel, idParent) => {
          if (nivel === "marco" && idParent === cfg.id_marco)
            return despieceRules.daMarco;
          if (nivel === "hoja" && idParent === cfg.id_hoja)
            return despieceRules.daHoja;
          if (nivel === "interior")
            return despieceRules.daInt.filter(
              (x: any) => x.id_interior === idParent,
            );
          if (nivel === "contravidrio")
            return despieceRules.daCV.filter(
              (x: any) => x.id_contravidrio === idParent,
            );
          if (nivel === "cruces")
            return despieceRules.daCruces.filter(
              (x: any) => x.id_cruces === idParent,
            );
          return [];
        },

        get_despiece_interior: (idInterior) => {
          const di = despieceRules.dInt.find(
            (x: any) => x.id_interior === idInterior,
          );
          if (!di)
            throw new Error(
              `DespieceInterior no encontrado para interior id=${idInterior}`,
            );
          return di;
        },

        get_despiece_contravidrio: (idContravidrio) => {
          let cv = despieceRules.dpCV.find(
            (x: any) => x.id_contravidrio === idContravidrio,
          );
          if (cv) return cv;
          cv = despieceRules.dpCVE.find(
            (x: any) => x.id_contravidrio === idContravidrio,
          );
          if (cv) return cv;
          throw new Error(
            `DespiecePerfilContravidrio no encontrado para id=${idContravidrio}`,
          );
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
    // Config
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
    // Dependency changes (DB loads)
    marcos.length,
    hojas.length,
    interiores.length,
    perfiles.length,
    accesorios.length,
    vidrios.length,
    despieceRules,
  ]);
}
