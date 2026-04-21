/**
 * ModulosGrid — grilla de paños para cruces variables
 *
 * Cuando tipoCruce === 2, las posV dividen el ancho en columnas
 * y las posH dividen el alto en filas. Cada celda de la grilla
 * es un "módulo" que puede configurarse independientemente.
 *
 * Layout visual: fila 0 = abajo, col 0 = izquierda
 * (igual que la convención de posH/posV del TipologiaCanvas)
 */

import { useState } from 'react'
import { Select, SelectItem, Chip, Button } from '@heroui/react'
import { Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { useObrasStore, type ModuloConfig, type TipoModulo } from '@/store/obrasStore'
import { useCatalogosStore } from '@/store/catalogosStore'
import { useProductosStore } from '@/store/productosStore'

const TIPO_LABELS: Record<TipoModulo, string> = {
  vidrio:    'Vidrio',
  panel:     'Panel',
  persiana:  'Persiana',
  vacio:     'Vacío',
}

const TIPO_COLORS: Record<TipoModulo, string> = {
  vidrio:   'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-700',
  panel:    'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700',
  persiana: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700',
  vacio:    'bg-steel-50 border-steel-200 dark:bg-steel-800/40 dark:border-steel-700',
}

const TIPO_CHIP: Record<TipoModulo, 'primary' | 'warning' | 'secondary' | 'default'> = {
  vidrio:   'primary',
  panel:    'warning',
  persiana: 'secondary',
  vacio:    'default',
}

interface Props {
  idTipologia: number
  ancho:       number  // mm total
  alto:        number  // mm total
  posV:        number[]  // posiciones verticales en mm (de izq a der)
  posH:        number[]  // posiciones horizontales en mm (de abajo a arriba)
}

/** Calcula los tamaños de cada segmento dadas las posiciones de corte */
function segmentos(total: number, posiciones: number[]): number[] {
  const sorted = [...posiciones].sort((a, b) => a - b)
  const pts = [0, ...sorted, total]
  return pts.slice(1).map((v, i) => v - pts[i]!)
}

export default function ModulosGrid({ idTipologia, ancho, alto, posV, posH }: Props) {
  const { getModulo, patchModulo } = useObrasStore()
  const { vidrios } = useCatalogosStore()
  const { productos, marcos, interiores } = useProductosStore()

  // Los segmentos son las columnas (anchos) y filas (altos)
  const cols = segmentos(ancho, posV)   // col 0 = izquierda
  const rows = segmentos(alto, posH)    // row 0 = abajo (invertido para display)

  const nCols = cols.length
  const nRows = rows.length

  const [openCell, setOpenCell] = useState<string | null>(null)

  function toggleCell(key: string) {
    setOpenCell(prev => prev === key ? null : key)
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-steel-500 uppercase tracking-wide">
        Módulos — {nRows} fila{nRows !== 1 ? 's' : ''} × {nCols} col{nCols !== 1 ? 'umnas' : 'umna'}
      </p>

      {/* Grilla visual: mostramos filas de arriba a abajo (fila nRows-1 primero) */}
      <div className="space-y-1">
        {Array.from({ length: nRows }, (_, displayRow) => {
          const fila = nRows - 1 - displayRow  // fila 0 = abajo
          const altoFila = rows[fila]!

          return (
            <div key={fila} className="flex gap-1 items-stretch">
              {/* Etiqueta de fila */}
              <div className="flex items-center justify-center w-6 flex-shrink-0">
                <span className="text-[10px] text-steel-400 font-mono">{fila}</span>
              </div>

              {/* Celdas de la fila */}
              {Array.from({ length: nCols }, (_, col) => {
                const anchoCelda = cols[col]!
                const modulo = getModulo(idTipologia, fila, col)
                const cellKey = `${fila}-${col}`
                const isOpen = openCell === cellKey

                // Peso visual proporcional al ancho del módulo
                const flex = Math.max(1, Math.round(anchoCelda / 100))

                return (
                  <div
                    key={col}
                    className={`flex-${flex} min-w-0 border rounded-lg overflow-hidden transition-colors ${TIPO_COLORS[modulo.tipo]}`}
                    style={{ flex }}
                  >
                    {/* Header de celda */}
                    <button
                      className="w-full flex items-center justify-between px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      onClick={() => toggleCell(cellKey)}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Chip size="sm" color={TIPO_CHIP[modulo.tipo]} variant="flat"
                          className="h-4 text-[10px] px-1">
                          {TIPO_LABELS[modulo.tipo]}
                        </Chip>
                        <span className="text-[10px] text-steel-400 font-mono whitespace-nowrap">
                          {Math.round(anchoCelda)}×{Math.round(altoFila)}
                        </span>
                      </div>
                      {isOpen
                        ? <ChevronUp className="w-3 h-3 text-steel-400 flex-shrink-0" />
                        : <ChevronDown className="w-3 h-3 text-steel-400 flex-shrink-0" />
                      }
                    </button>

                    {/* Panel de configuración */}
                    {isOpen && (
                      <ModuloCellEditor
                        modulo={modulo}
                        anchoCelda={anchoCelda}
                        altoFila={altoFila}
                        vidrios={vidrios}
                        productos={productos}
                        marcos={marcos}
                        interiores={interiores}
                        onUpdate={data => patchModulo(idTipologia, fila, col, data)}
                      />
                    )}
                  </div>
                )
              })}

              {/* Etiqueta de alto de fila */}
              <div className="flex items-center w-12 flex-shrink-0">
                <span className="text-[10px] text-steel-400 font-mono">{Math.round(altoFila)} mm</span>
              </div>
            </div>
          )
        })}

        {/* Etiquetas de ancho de columnas */}
        <div className="flex gap-1 pl-7 pr-14">
          {cols.map((w, col) => (
            <div key={col} className="text-center" style={{ flex: Math.max(1, Math.round(w / 100)) }}>
              <span className="text-[10px] text-steel-400 font-mono">{Math.round(w)} mm</span>
            </div>
          ))}
        </div>
      </div>

      {/* Acción rápida: aplicar tipo a toda la grilla */}
      <QuickFill
        nRows={nRows} nCols={nCols}
        onFill={(tipo) => {
          for (let f = 0; f < nRows; f++)
            for (let c = 0; c < nCols; c++)
              patchModulo(idTipologia, f, c, { tipo })
        }}
      />
    </div>
  )
}

// ── Editor de celda individual ────────────────────────────────────────────────

function ModuloCellEditor({ modulo, anchoCelda, altoFila, vidrios, productos, marcos, interiores, onUpdate }: {
  modulo:      ModuloConfig
  anchoCelda:  number
  altoFila:    number
  vidrios:     ReturnType<typeof useCatalogosStore>['vidrios']
  productos:   ReturnType<typeof useProductosStore>['productos']
  marcos:      ReturnType<typeof useProductosStore>['marcos']
  interiores:  ReturnType<typeof useProductosStore>['interiores']
  onUpdate:    (data: Partial<ModuloConfig>) => void
}) {
  const marcosDeProducto = marcos.filter(m => m.idProducto === modulo.idProducto)

  return (
    <div className="px-2 pb-3 pt-1 space-y-2 border-t border-black/10 dark:border-white/10">
      {/* Dimensiones del módulo */}
      <div className="bg-black/5 dark:bg-white/5 rounded px-2 py-1 text-[10px] text-steel-500 font-mono">
        {Math.round(anchoCelda)} × {Math.round(altoFila)} mm
        &nbsp;·&nbsp;
        {((anchoCelda / 1000) * (altoFila / 1000)).toFixed(3)} m²
      </div>

      {/* Tipo de módulo */}
      <Select
        label="Tipo de módulo"
        size="sm"
        selectedKeys={[modulo.tipo]}
        onSelectionChange={k => onUpdate({ tipo: [...k][0] as TipoModulo })}
        classNames={{
          trigger: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-8 min-h-unit-8 text-xs',
        }}
      >
        {Object.entries(TIPO_LABELS).map(([k, v]) => (
          <SelectItem key={k}>{v}</SelectItem>
        ))}
      </Select>

      {/* Vidrio — solo si tipo es vidrio */}
      {modulo.tipo === 'vidrio' && (
        <Select
          label="Vidrio"
          placeholder="Sin asignar"
          size="sm"
          selectedKeys={modulo.idVidrio ? [modulo.idVidrio] : []}
          onSelectionChange={k => onUpdate({ idVidrio: ([...k][0] as string) || null })}
          classNames={{
            trigger: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-8 min-h-unit-8 text-xs',
          }}
        >
          {vidrios.map(v => (
            <SelectItem key={v.codigo} textValue={v.descri}>
              <span className="text-xs">{v.descri}</span>
              <span className="text-[10px] text-steel-400 ml-2">{v.espesor}mm</span>
            </SelectItem>
          ))}
        </Select>
      )}

      {/* Producto (sub-apertura) — para panel o persiana */}
      {(modulo.tipo === 'panel' || modulo.tipo === 'persiana') && (
        <>
          <Select
            label="Producto / apertura"
            placeholder="Sin asignar"
            size="sm"
            selectedKeys={modulo.idProducto ? [String(modulo.idProducto)] : []}
            onSelectionChange={k => {
              const id = parseInt([...k][0] as string) || null
              onUpdate({ idProducto: id, idMarco: null, idInterior: null })
            }}
            classNames={{
              trigger: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-8 min-h-unit-8 text-xs',
            }}
          >
            {productos.map(p => (
              <SelectItem key={String(p.id)} textValue={p.descripcion}>
                <span className="text-xs">{p.descripcion}</span>
              </SelectItem>
            ))}
          </Select>

          {modulo.idProducto && (
            <Select
              label="Marco"
              placeholder="Sin asignar"
              size="sm"
              selectedKeys={modulo.idMarco ? [String(modulo.idMarco)] : []}
              onSelectionChange={k => onUpdate({ idMarco: parseInt([...k][0] as string) || null })}
              classNames={{
                trigger: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-8 min-h-unit-8 text-xs',
              }}
            >
              {marcosDeProducto.map(m => (
                <SelectItem key={String(m.id)}>{m.descripcion}</SelectItem>
              ))}
            </Select>
          )}
        </>
      )}

      {/* Notas */}
      {modulo.tipo !== 'vacio' && (
        <input
          type="text"
          placeholder="Notas..."
          value={modulo.notas}
          onChange={e => onUpdate({ notas: e.target.value })}
          className="w-full text-xs px-2 py-1.5 rounded border border-steel-200 dark:border-steel-700 bg-white dark:bg-steel-900 text-steel-700 dark:text-steel-200 placeholder-steel-400"
        />
      )}
    </div>
  )
}

// ── QuickFill ─────────────────────────────────────────────────────────────────

function QuickFill({ nRows, nCols, onFill }: {
  nRows: number; nCols: number; onFill: (tipo: TipoModulo) => void
}) {
  if (nRows * nCols <= 1) return null
  return (
    <div className="flex items-center gap-2 pt-1 flex-wrap">
      <span className="text-[10px] text-steel-400">Llenar todo:</span>
      {(Object.keys(TIPO_LABELS) as TipoModulo[]).map(tipo => (
        <Button
          key={tipo}
          size="sm"
          variant="flat"
          className="h-6 text-[10px] px-2"
          onPress={() => onFill(tipo)}
        >
          {TIPO_LABELS[tipo]}
        </Button>
      ))}
    </div>
  )
}
