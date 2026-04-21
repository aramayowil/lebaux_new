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
  } = useProductosStore()

  const { perfiles, accesorios, vidrios, tratamientos } = useCatalogosStore()
  const { getConfig } = useObrasStore()

  return useMemo(() => {
    if (!tipologia) return { resultado: null, error: null, configurado: false }

    const cfg = getConfig(tipologia.id)
    if (!cfg.idMarco) return { resultado: null, error: null, configurado: false }

    try {
      const marco = marcos.find(m => m.id === cfg.idMarco)
      const hoja  = hojas.find(h => h.id === cfg.idHoja)

      const entrada: EntradaCalculo = {
        ancho:              tipologia.ancho,
        alto:               tipologia.alto,
        cantidadTipologias: tipologia.cantidad ?? 1,
        idMarco:       cfg.idMarco,
        idHoja:        cfg.idHoja,
        idInterior:    cfg.idInterior,
        idContravidrio:    cfg.idContravidrio,
        idContravidrioExt: cfg.idContravidrioExt,
        idTratamiento:  cfg.idTratamiento,
        idVidrio:       cfg.idVidrio,
        tipoCruce:      cfg.tipoCruce,
        crucesH:        cfg.crucesH,
        crucesV:        cfg.crucesV,
        posH:           cfg.posH ?? [],
        posV:           cfg.posV ?? [],
        modulosConfig:  cfg.modulosConfig ?? [],
      }

      const datos: DatosProducto = {
        marco, hoja,
        allInteriores:       interiores,
        allContravidrios:    contravidrios,
        allContravidriosExt: contravidriosExt,
        allCruces:           cruces,
        allVidRepartidos:    vidRepartidos,
        despiecePerfilesMarco: marco ? getDespiecePerfiles('marco', marco.id) : [],
        despiecePerfilesHoja:  hoja  ? getDespiecePerfiles('hoja',  hoja.id)  : [],
        getDespiecePerfil:  (nivel, idParent) => getDespiecePerfiles(nivel as any, idParent),
        getDespieceAccesorio: (nivel, idParent) => getDespieceAccesorios(nivel as any, idParent),
        catalogPerfiles:     perfiles,
        catalogAccesorios:   accesorios,
        catalogVidrios:      vidrios,
        catalogTratamientos: tratamientos,
      }

      const resultado = calcularDespiece(entrada, datos)
      return { resultado, error: null, configurado: true }
    } catch (e) {
      return { resultado: null, error: String(e), configurado: true }
    }
  }, [
    tipologia?.id, tipologia?.ancho, tipologia?.alto, tipologia?.cantidad,
    cfg?.tipoCruce, cfg?.crucesH, cfg?.crucesV,
    cfg?.posH?.length, cfg?.posV?.length,
    cfg?.idMarco, cfg?.idHoja, cfg?.idInterior,
    cfg?.idContravidrio, cfg?.idContravidrioExt,
    cfg?.idVidrio, cfg?.modulosConfig?.length,
    marcos.length, hojas.length, interiores.length,
    contravidrios.length, cruces.length,
    perfiles.length, accesorios.length, vidrios.length,
  ])

  // Helper to read cfg inside useMemo dependencies
  function cfg() { return getConfig(tipologia?.id ?? 0) }
}
