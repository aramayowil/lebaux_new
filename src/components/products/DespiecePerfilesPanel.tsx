import { useState } from 'react'
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
  const { perfiles, lineas, extrusoras } = useCatalogosStore()

  const items = getDespiecePerfiles(nivel, idParent)

  const getPerfilLabel = (nro: string) => {
    const p = perfiles.find(x => x.nroPerfil === nro)
    if (!p) return nro
    const l = lineas.find(x => x.id === p.idLinea)
    const e = extrusoras.find(x => x.id === l?.idExtrusora)
    return `${nro} - ${p.descri} (${e?.extrusora ?? '?'}/${l?.linea ?? '?'})`
  }

  function handleAdd() {
    addDespiecePerfil(nivel, {
      idParent,
      perfil: perfiles[0]?.nroPerfil ?? '',
      formulaCantidad: '1',
      formulaMedida: 'ancho',
      angulo: '45',
    })
  }

  function update(id: number, data: Partial<DespiecePerfil>) {
    updateDespiecePerfil(nivel, id, data)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-steel-500 uppercase tracking-wide">{label}</p>
        <Button size="sm" variant="flat" startContent={<Plus className="w-3 h-3" />} onPress={handleAdd}>
          Agregar
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-steel-200 dark:border-steel-700 rounded-lg py-6">
          <EmptyState icon={Layers} title="Sin perfiles de corte" description="Agregá las barras que componen este elemento" />
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[1fr_80px_1fr_60px_32px] gap-2 px-2">
            <span className="text-[10px] font-semibold text-steel-400 uppercase tracking-wide">Perfil</span>
            <span className="text-[10px] font-semibold text-steel-400 uppercase tracking-wide">Cantidad</span>
            <span className="text-[10px] font-semibold text-steel-400 uppercase tracking-wide">Medida</span>
            <span className="text-[10px] font-semibold text-steel-400 uppercase tracking-wide">Ángulo</span>
            <span />
          </div>

          {items.map(item => (
            <div key={item.id} className="grid grid-cols-[1fr_80px_1fr_60px_32px] gap-2 items-end bg-steel-50 dark:bg-steel-800/40 rounded-lg p-2">
              {/* Perfil selector */}
              <Select
                size="sm"
                selectedKeys={item.perfil ? [item.perfil] : []}
                onSelectionChange={k => update(item.id, { perfil: [...k][0] as string })}
                aria-label="Perfil"
                classNames={{
                  trigger: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-8 min-h-unit-8 font-mono text-xs',
                }}
              >
                {perfiles.map(p => (
                  <SelectItem key={p.nroPerfil} textValue={`${p.nroPerfil} - ${p.descri}`}>
                    <span className="font-mono text-xs">{p.nroPerfil}</span>
                    <span className="text-steel-500 ml-2 text-xs">{p.descri}</span>
                  </SelectItem>
                ))}
              </Select>

              {/* Cantidad */}
              <FormulaInput
                label=""
                value={item.formulaCantidad}
                onChange={v => update(item.id, { formulaCantidad: v })}
                size="sm"
              />

              {/* Medida */}
              <FormulaInput
                label=""
                value={item.formulaMedida}
                onChange={v => update(item.id, { formulaMedida: v })}
                size="sm"
              />

              {/* Ángulo */}
              <Select
                size="sm"
                selectedKeys={item.angulo !== undefined ? [item.angulo] : ['45']}
                onSelectionChange={k => update(item.id, { angulo: [...k][0] as string })}
                aria-label="Ángulo"
                classNames={{
                  trigger: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-8 min-h-unit-8 font-mono text-xs',
                }}
              >
                {ANGULOS.map(a => <SelectItem key={a}>{a || '—'}</SelectItem>)}
              </Select>

              {/* Eliminar */}
              <Button
                isIconOnly size="sm" variant="light" color="danger"
                onPress={() => deleteDespiecePerfil(nivel, item.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
