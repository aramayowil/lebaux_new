import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import {
  calcularDespiece,
  type ResultadoDespiece,
  type EntradaCalculo,
  type DatosProducto,
} from "@/lib/motorDespiece";
import type {
  ObraTipologia,
  ObraDetalle,
  DespieceCruce,
  DespiecePerfilContravidrio,
  DespiecePerfilHoja,
  DespiecePerfilMarco,
  DespieceInterior,
  DespieceAccesorioMarco,
  DespieceAccesorioHoja,
  DespieceAccesorioInterior,
  DespieceAccesorioCruce,
} from "@/types";

// Catálogos generales
import { usePerfiles } from "./catalogo/usePerfiles";
import { useAccesorios } from "./catalogo/useAccesorios";
import { useVidrios } from "./catalogo/useVidrios";
import { useTratamientos } from "./catalogo/useTratamientos";

// Productos globales
import { useHojasById } from "./productos/useHojas";

export interface UseDespieceResult {
  resultado: ResultadoDespiece | null;
  error: string | null;
  isLoading: boolean;
  configurado: boolean;
}

export function useDespiece(
  tipologia: ObraTipologia | null,
  detalle: ObraDetalle | null,
): UseDespieceResult {
  const { data: perfiles = [], isLoading: loadPerfiles } = usePerfiles();
  const { data: accesorios = [], isLoading: loadAccesorios } = useAccesorios();
  const { data: vidrios = [], isLoading: loadVidrios } = useVidrios();
  const { data: tratamientos = [], isLoading: loadTratamientos } =
    useTratamientos();

  const idHojaAsignada = detalle?.hoja ?? undefined;
  const { data: productoHoja, isLoading: lkHoja } =
    useHojasById(idHojaAsignada);

  const idMarco = detalle?.marco;
  const idHoja = detalle?.hoja;
  const idInterior = detalle?.interior;
  const idContravidrio = detalle?.contravidrios;
  const idContravidrioExt = detalle?.contravidrios_ext;
  const idCruce = detalle?.cruce;
  const idMosquitero = detalle?.mosquitero;

  // Contravidrio específico o fallback al interior
  const idContravidrioEspecifico = detalle?.contravidrios ?? idInterior;

  const { data: despieceRules, isLoading: rulesLoading } = useQuery({
    queryKey: [
      "despiece_rules_direct",
      idMarco,
      idHoja,
      idInterior,
      idContravidrioEspecifico,
      idCruce,
    ],
    queryFn: async () => {
      if (!idMarco && !idHoja) return null;

      const [
        rMarco,
        rHoja,
        rMosquitero,
        rInterior,
        rCruce,
        rCV,
        rCVE,
        rVR,
        rAccMarco,
        rAccHoja,
        rAccInterior,
        rAccCruces,
      ] = await Promise.all([
        // ── Perfiles ──────────────────────────────────────────────────────────
        idMarco
          ? supabase
              .schema("opendata")
              .from("despiece_perfiles_marco")
              .select("*")
              .eq("id_marco", idMarco)
          : null,
        idHoja
          ? supabase
              .schema("opendata")
              .from("despiece_perfiles_hoja")
              .select("*")
              .eq("id_hoja", idHoja)
          : null,
        idMosquitero
          ? supabase
              .schema("opendata")
              .from("despiece_perfiles_mosquitero")
              .select("*")
              .eq("id_mosquitero", idMosquitero)
          : null,
        idInterior
          ? supabase
              .schema("opendata")
              .from("despiece_interior")
              .select("*")
              .eq("id_interior", idInterior)
          : null,
        idCruce
          ? supabase
              .schema("opendata")
              .from("despiece_cruces")
              .select("*")
              .eq("id_cruces", idCruce)
          : null,
        idContravidrio
          ? supabase
              .schema("opendata")
              .from("despiece_perfiles_contravidrio")
              .select("*")
              .eq("id_contravidrio", idContravidrio)
          : null,
        idContravidrioExt
          ? supabase
              .schema("opendata")
              .from("despiece_perfiles_contravidrio_ext")
              .select("*")
              .eq("id_contravidrio", idContravidrioExt)
          : null,
        idInterior
          ? supabase
              .schema("opendata")
              .from("despiece_perfiles_vidrio_repartido")
              .select("*")
              .eq("id_vr", idInterior)
          : null,
        // ── Accesorios ────────────────────────────────────────────────────────
        idMarco
          ? supabase
              .schema("opendata")
              .from("despiece_accesorios_marco")
              .select("*")
              .eq("id_marco", idMarco)
          : null,
        idHoja
          ? supabase
              .schema("opendata")
              .from("despiece_accesorios_hoja")
              .select("*")
              .eq("id_hoja", idHoja)
          : null,
        idInterior
          ? supabase
              .schema("opendata")
              .from("despiece_accesorios_interior")
              .select("*")
              .eq("id_interior", idInterior)
          : null,
        idCruce
          ? supabase
              .schema("opendata")
              .from("despiece_accesorios_cruces")
              .select("*")
              .eq("id_cruces", idCruce)
          : null,
      ]);

      return {
        dpMarco: (rMarco?.data ?? []) as DespiecePerfilMarco[],
        dpHoja: (rHoja?.data ?? []) as DespiecePerfilHoja[],
        dpMosquitero: rMosquitero?.data ?? [],
        dpInterior: (rInterior?.data?.[0] ?? null) as DespieceInterior | null,
        dpCruces: (rCruce?.data?.[0] ?? null) as DespieceCruce | null,
        dpCV: (rCV?.data ?? []) as DespiecePerfilContravidrio[],
        dpCVE: (rCVE?.data ?? []) as DespiecePerfilContravidrio[],
        dpVR: rVR?.data ?? [],
        // Accesorios
        dpAccMarco: (rAccMarco?.data ?? []) as DespieceAccesorioMarco[],
        dpAccHoja: (rAccHoja?.data ?? []) as DespieceAccesorioHoja[],
        dpAccInterior: (rAccInterior?.data ??
          []) as DespieceAccesorioInterior[],
        dpAccCruces: (rAccCruces?.data ?? []) as DespieceAccesorioCruce[],
      };
    },
    enabled: !!detalle && (!!idMarco || !!idHoja),
  });

  console.log("Despiece Rules", despieceRules);

  const catalogosLoading =
    loadPerfiles ||
    loadAccesorios ||
    loadVidrios ||
    loadTratamientos ||
    lkHoja ||
    rulesLoading;

  // Mapa de contravidrios para lookup O(1)
  const cvMap = useMemo<Map<number, DespiecePerfilContravidrio>>(() => {
    if (!despieceRules) return new Map();
    const allCV = [
      ...(despieceRules.dpCV as DespiecePerfilContravidrio[]),
      ...(despieceRules.dpCVE as DespiecePerfilContravidrio[]),
    ];
    return new Map(allCV.map((cv) => [cv.id_contravidrio, cv]));
  }, [despieceRules]);

  const memoResult = useMemo(() => {
    if (!tipologia || !detalle || !despieceRules) {
      return { resultado: null, error: null, configurado: false };
    }

    if (!detalle.marco) {
      return { resultado: null, error: null, configurado: false };
    }

    try {
      const cantidadHojasEfectiva = productoHoja?.cantidad ?? 0;

      const entrada: EntradaCalculo = {
        ancho: detalle.ancho ?? tipologia.ancho ?? 0,
        alto: detalle.alto ?? tipologia.alto ?? 0,
        cantidad_tipologias: tipologia.cantidad ?? 1,
        detalle,
        tipologia,
        cant_hojas_calculo: cantidadHojasEfectiva,
      };

      const datos: DatosProducto = {
        marco: perfiles.find((x) => x.id === idMarco),
        hoja: perfiles.find((x) => x.id === idHoja),
        interior: perfiles.find((x) => x.id === idInterior),

        rules_perfiles_marco: despieceRules.dpMarco,
        rules_perfiles_hoja: despieceRules.dpHoja,
        rules_interior: despieceRules.dpInterior,
        rules_cruces: despieceRules.dpCruces,

        rules_perfiles_contravidrio: [
          ...despieceRules.dpCV,
          ...despieceRules.dpCVE,
        ] as DespiecePerfilContravidrio[],

        rules_accesorios_marco: despieceRules.dpAccMarco,
        rules_accesorios_hoja: despieceRules.dpAccHoja,
        rules_accesorios_interior: despieceRules.dpAccInterior,
        rules_accesorios_cruces: despieceRules.dpAccCruces,

        // Lookup O(1) usando Map preconstruido
        find_despiece_contravidrio: (idContravidrio) => {
          const cv = cvMap.get(idContravidrio);
          if (!cv) {
            throw new Error(
              `Regla no encontrada para contravidrio: ${idContravidrio}`,
            );
          }
          return cv;
        },

        catalog_perfiles: perfiles,
        catalog_accesorios: accesorios,
        catalog_vidrios: vidrios,
        catalog_tratamientos: tratamientos,
      };

      const resultado = calcularDespiece(entrada, datos);

      // Mostrar warns/errors del motor en consola de dev
      const isDev =
        (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV ??
        false;
      if (isDev) {
        const problemas = resultado.logs.filter(
          (l) => l.nivel === "warn" || l.nivel === "error",
        );
        if (problemas.length > 0) {
          console.groupCollapsed(
            `[useDespiece] ${problemas.length} avisos en despiece (detalle #${detalle.id})`,
          );
          problemas.forEach((l) =>
            console.warn(`[${l.fase}]`, l.mensaje, l.valor ?? ""),
          );
          console.groupEnd();
        }
      }

      return { resultado, error: null, configurado: true };
    } catch (e) {
      console.error("Error en motor de despiece:", e);
      return { resultado: null, error: String(e), configurado: true };
    }
  }, [
    tipologia?.id,
    tipologia?.cantidad,
    detalle,
    despieceRules,
    cvMap,
    perfiles,
    accesorios,
    vidrios,
    tratamientos,
  ]);

  return {
    resultado: memoResult.resultado,
    error: memoResult.error,
    isLoading: catalogosLoading || rulesLoading,
    configurado: memoResult.configurado,
  };
}
