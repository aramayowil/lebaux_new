import { Button, Select, SelectItem } from '@heroui/react'
import { Plus, Trash2, Layers } from 'lucide-react'
import { useProductosStore } from '@/store/productosStore'
import { useCatalogosStore } from '@/store/catalogosStore'
import FormulaInput from '@/components/ui/FormulaInput'
import EmptyState from '@/components/ui/EmptyState'
import type { DespiecePerfil } from '@/types'

type Nivel = 'marco' | 'hoja' | 'contravidrio' | 'contravidrioExt' | 'cruces' | 'mosquitero'

const ANGULOS = ['45', '90', '0', '']

interface Props {
  nivel: Nivel
  idParent: number
  label?: string
}

export default function DespiecePerfilesPanel({ nivel, idParent, label = 'Perfiles' }: Props) {
  const { getDespiecePerfiles, addDespiecePerfil, updateDespiecePerfil, deleteDespiecePerfil } = useProductosStore()
  const { perfiles } = useCatalogosStore()

  const items = getDespiecePerfiles(nivel, idParent)

  function handleAdd() {
    addDespiecePerfil(nivel, {
      idParent, perfil: perfiles[0]?.nroPerfil ?? '',
      formulaCantidad: '1', formulaMedida: 'ancho', angulo: '45',
    })
  }

  function update(id: number, data: Partial<DespiecePerfil>) {
    updateDespiecePerfil(nivel, id, data)
  }

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
          {items.length > 0 && (
            <span className="text-[9px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{items.length}</span>
          )}
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-400 hover:bg-amber-500 text-white transition-colors shadow-sm"
        >
          <Plus className="w-3 h-3" /> Agregar
        </button>
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl py-6">
          <EmptyState icon={Layers} title="Sin perfiles de corte" description="Agregá las barras que componen este elemento" />
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Cabecera de columnas */}
          <div className="grid grid-cols-[1fr_80px_1fr_60px_32px] gap-2 px-2">
            {['Perfil', 'Cantidad', 'Medida', 'Ángulo', ''].map((h, i) => (
              <span key={i} className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{h}</span>
            ))}
          </div>

          {items.map(item => (
            <div key={item.id}
              className="grid grid-cols-[1fr_80px_1fr_60px_32px] gap-2 items-end bg-zinc-50 dark:bg-zinc-900/40 rounded-xl p-2 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
            >
              <Select size="sm"
                selectedKeys={item.perfil ? [item.perfil] : []}
                onSelectionChange={k => update(item.id, { perfil: [...k][0] as string })}
                aria-label="Perfil"
                classNames={{ trigger: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 h-8 min-h-unit-8 font-mono text-xs hover:border-zinc-400 transition-colors' }}
              >
                {perfiles.map(p => (
                  <SelectItem key={p.nroPerfil} textValue={`${p.nroPerfil} - ${p.descri}`}>
                    <span className="font-mono text-xs font-bold text-amber-500">{p.nroPerfil}</span>
                    <span className="text-zinc-500 ml-2 text-xs">{p.descri}</span>
                  </SelectItem>
                ))}
              </Select>

              <FormulaInput label="" value={item.formulaCantidad}
                onChange={v => update(item.id, { formulaCantidad: v })} size="sm" />

              <FormulaInput label="" value={item.formulaMedida}
                onChange={v => update(item.id, { formulaMedida: v })} size="sm" />

              <Select size="sm"
                selectedKeys={item.angulo !== undefined ? [item.angulo] : ['45']}
                onSelectionChange={k => update(item.id, { angulo: [...k][0] as string })}
                aria-label="Ángulo"
                classNames={{ trigger: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 h-8 min-h-unit-8 font-mono text-xs' }}
              >
                {ANGULOS.map(a => <SelectItem key={a}>{a || '—'}</SelectItem>)}
              </Select>

              <button
                onClick={() => deleteDespiecePerfil(nivel, item.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
