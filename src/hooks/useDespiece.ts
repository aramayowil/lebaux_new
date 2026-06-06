import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import {
  calcularDespiece,
  type ResultadoDespiece,
  type EntradaCalculo,
  type DatosProducto,
} from "@/lib/motorDespiece";
import type { ObraTipologia, ObraDetalle } from "@/types";

// Catálogos Generales
import { usePerfiles } from "./catalogo/usePerfiles";
import { useAccesorios } from "./catalogo/useAccesorios";
import { useVidrios } from "./catalogo/useVidrios";
import { useTratamientos } from "./catalogo/useTratamientos";

// Productos globales (Aquí consumimos tus hooks de productos)
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

  const { data: despieceRules, isLoading: rulesLoading } = useQuery({
    queryKey: ["despiece_rules_direct", idMarco, idHoja, idInterior],
    queryFn: async () => {
      if (!idMarco && !idHoja) return null;

      const [rMarco, rHoja, rInt, rCV, rCVE, rVR] = await Promise.all([
        idMarco
          ? supabase
              .from("despiece_perfiles_marco")
              .select("*")
              .eq("id_marco", idMarco)
          : null,
        idHoja
          ? supabase
              .from("despiece_perfiles_hoja")
              .select("*")
              .eq("id_hoja", idHoja)
          : null,
        idInterior
          ? supabase
              .from("despiece_perfiles_interior")
              .select("*")
              .eq("id_interior", idInterior)
          : null,
        idInterior
          ? supabase
              .from("despiece_perfiles_contravidrio")
              .select("*")
              .eq("id_interior", idInterior)
          : null,
        idInterior
          ? supabase
              .from("despiece_perfiles_contravidrio_ext")
              .select("*")
              .eq("id_interior", idInterior)
          : null,
        idInterior
          ? supabase
              .from("despiece_perfiles_vidrio_repartido")
              .select("*")
              .eq("id_interior", idInterior)
          : null,
      ]);

      return {
        dpMarco: rMarco?.data ?? [],
        dpHoja: rHoja?.data ?? [],
        dpInt: rInt?.data ?? [],
        dpCV: rCV?.data ?? [],
        dpCVE: rCVE?.data ?? [],
        dpVR: rVR?.data ?? [],
      };
    },
    enabled: !!detalle && (!!idMarco || !!idHoja),
  });

  const catalogosLoading =
    loadPerfiles ||
    loadAccesorios ||
    loadVidrios ||
    loadTratamientos ||
    lkHoja ||
    rulesLoading;

  // 3. Ejecución en caliente del Motor de Despiece por cada cambio en el panel
  const memoResult = useMemo(() => {
    if (!tipologia || !detalle || !despieceRules) {
      return { resultado: null, error: null, configurado: false };
    }

    if (!detalle.marco || !detalle.hoja) {
      return { resultado: null, error: null, configurado: false };
    }
    try {
      const cantidadHojasEfectiva = productoHoja?.cantidad ?? 0;

      const entrada: EntradaCalculo = {
        ancho: detalle.ancho ?? tipologia.ancho ?? 0,
        alto: detalle.alto ?? tipologia.alto ?? 0,
        cantidad_tipologias: tipologia.cantidad ?? 1,
        detalle: detalle,
        tipologia: tipologia,
        cant_hojas_calculo: cantidadHojasEfectiva,
      };

      const datos: DatosProducto = {
        // Buscamos las entidades de cabecera en los catálogos
        marco: perfiles.find((x) => x.id === idMarco),
        hoja: perfiles.find((x) => x.id === idHoja),
        interior: perfiles.find((x) => x.id === idInterior),

        // Inyectamos las reglas recuperadas desde Supabase
        rules_perfiles_marco: despieceRules.dpMarco,
        rules_perfiles_hoja: despieceRules.dpHoja,
        rules_perfiles_interior: despieceRules.dpInt,
        rules_perfiles_contravidrio: despieceRules.dpCV,

        // Resolutores dinámicos analógicos a la base de datos
        find_despiece_contravidrio: (idContravidrio) => {
          const cv =
            despieceRules.dpCV.find(
              (x: any) => x.id_contravidrio === idContravidrio,
            ) ??
            despieceRules.dpCVE.find(
              (x: any) => x.id_contravidrio === idContravidrio,
            );
          if (!cv)
            throw new Error(
              `Regla no encontrada para contravidrio: ${idContravidrio}`,
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
      console.error("Error en motor de despiece:", e);
      return { resultado: null, error: String(e), configurado: true };
    }
  }, [
    tipologia?.id,
    tipologia?.cantidad,
    detalle,
    despieceRules,
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
