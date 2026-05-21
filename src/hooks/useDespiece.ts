import { useMemo } from 'react'
import { useProductosStore } from '@/store/productosStore'
import { useCatalogosStore } from '@/store/catalogosStore'
import { useObrasStore } from '@/store/obrasStore'
import { calcularDespiece, type ResultadoDespiece, type EntradaCalculo, type DatosProducto } from '@/lib/motorDespiece'
import type { ObraTipologia } from '@/types'

interface UseDespieceResult {
  resultado:   ResultadoDespiece | null
  error:       string | null
  configurado: boolean
}

export function useDespiece(tipologia: ObraTipologia | null): UseDespieceResult {
  const {
    marcos, hojas,
    interiores, contravidrios, contravidriosExt, cruces, vidRepartidos,
    getDespiecePerfiles, getDespieceAccesorios,
    getDespieceInteriorByInterior, getDespiecePerfilesContravidrio,
  } = useProductosStore()

  const { perfiles, accesorios, vidrios, tratamientos } = useCatalogosStore()
  const { getConfig } = useObrasStore()

  return useMemo(() => {
    if (!tipologia) return { resultado: null, error: null, configurado: false }

    const cfg = getConfig(tipologia.id)
    if (!cfg.id_marco) return { resultado: null, error: null, configurado: false }

    try {
      const marco = marcos.find(m => m.id === cfg.id_marco)
      const hoja  = hojas.find(h => h.id === cfg.id_hoja)

      const entrada: EntradaCalculo = {
        ancho:              tipologia.ancho,
        alto:               tipologia.alto,
        cantidad_tipologias: tipologia.cantidad ?? 1,
        id_marco:       cfg.id_marco,
        id_hoja:        cfg.id_hoja,
        id_interior:    cfg.id_interior,
        id_contravidrio:    cfg.id_contravidrio,
        id_contravidrio_ext: cfg.id_contravidrio_ext,
        id_tratamiento:  cfg.id_tratamiento,
        id_vidrio:       cfg.id_vidrio,
        tipo_cruce:      cfg.tipo_cruce,
        cruces_h:        cfg.cruces_h,
        cruces_v:        cfg.cruces_v,
        pos_h:           cfg.pos_h ?? [],
        pos_v:           cfg.pos_v ?? [],
        modulosConfig:  cfg.modulosConfig ?? [],
      }

      const datos: DatosProducto = {
        marco, hoja,
        all_interiores:       interiores,
        all_contravidrios:    contravidrios,
        all_contravidrios_ext: contravidriosExt,
        all_cruces:           cruces,
        all_vid_repartidos:    vidRepartidos,
        despiece_perfiles_marco: marco ? getDespiecePerfiles('marco', marco.id) : [],
        despiece_perfiles_hoja:  hoja  ? getDespiecePerfiles('hoja',  hoja.id)  : [],
        get_despiece_perfil:  (nivel, idParent) => getDespiecePerfiles(nivel as any, idParent),
        get_despiece_accesorio: (nivel, idParent) => getDespieceAccesorios(nivel as any, idParent),
        get_despiece_interior: (idParent) => getDespieceInteriorByInterior(idParent)!,
        get_despiece_contravidrio: (idParent) => getDespiecePerfilesContravidrio('contravidrio', idParent)[0] || getDespiecePerfilesContravidrio('contravidrioExt', idParent)[0],
        catalog_perfiles:     perfiles,
        catalog_accesorios:   accesorios,
        catalog_vidrios:      vidrios,
        catalog_tratamientos: tratamientos,
      }

      const resultado = calcularDespiece(entrada, datos)
      return { resultado, error: null, configurado: true }
    } catch (e) {
      return { resultado: null, error: String(e), configurado: true }
    }
  }, [
    tipologia?.id, tipologia?.ancho, tipologia?.alto, tipologia?.cantidad,
    cfg()?.tipo_cruce, cfg()?.cruces_h, cfg()?.cruces_v,
    cfg()?.pos_h?.length, cfg()?.pos_v?.length,
    cfg()?.id_marco, cfg()?.id_hoja, cfg()?.id_interior,
    cfg()?.id_contravidrio, cfg()?.id_contravidrio_ext,
    cfg()?.id_vidrio, cfg()?.modulosConfig?.length,
    marcos.length, hojas.length, interiores.length,
    contravidrios.length, cruces.length,
    perfiles.length, accesorios.length, vidrios.length,
  ])

  // Helper to read cfg inside useMemo dependencies
  function cfg() { return getConfig(tipologia?.id ?? 0) }
}
