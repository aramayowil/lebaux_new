import { Button, Select, SelectItem } from '@heroui/react'
import { Plus, Trash2, Wrench } from 'lucide-react'
import { useProductosStore } from '@/store/productosStore'
import { useCatalogosStore } from '@/store/catalogosStore'
import FormulaInput from '@/components/ui/FormulaInput'
import EmptyState from '@/components/ui/EmptyState'
import type { DespieceAccesorio } from '@/types'

type Nivel = 'marco' | 'hoja' | 'interior' | 'cruces' | 'mosquitero'

interface Props {
  nivel: Nivel
  idParent: number
  label?: string
}

export default function DespieceAccesoriosPanel({ nivel, idParent, label = 'Accesorios' }: Props) {
  const { getDespieceAccesorios, addDespieceAccesorio, updateDespieceAccesorio, deleteDespieceAccesorio } = useProductosStore()
  const { accesorios } = useCatalogosStore()

  const items = getDespieceAccesorios(nivel, idParent)

  function handleAdd() {
    addDespieceAccesorio(nivel, {
      idParent,
      accesorio: accesorios[0]?.codParte ?? '',
      formulaCantidad: '1',
    })
  }

  function update(id: number, data: Partial<DespieceAccesorio>) {
    updateDespieceAccesorio(nivel, id, data)
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
          <EmptyState icon={Wrench} title="Sin accesorios" description="Agregá los accesorios de este elemento" />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_120px_32px] gap-2 px-2">
            <span className="text-[10px] font-semibold text-steel-400 uppercase tracking-wide">Accesorio</span>
            <span className="text-[10px] font-semibold text-steel-400 uppercase tracking-wide">Cantidad (fórmula)</span>
            <span />
          </div>

          {items.map(item => (
            <div key={item.id} className="grid grid-cols-[1fr_120px_32px] gap-2 items-end bg-steel-50 dark:bg-steel-800/40 rounded-lg p-2">
              <Select
                size="sm"
                selectedKeys={item.accesorio ? [item.accesorio] : []}
                onSelectionChange={k => update(item.id, { accesorio: [...k][0] as string })}
                aria-label="Accesorio"
                classNames={{
                  trigger: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-8 min-h-unit-8 text-xs',
                }}
              >
                {accesorios.map(a => (
                  <SelectItem key={a.codParte} textValue={`${a.codParte} - ${a.descri}`}>
                    <span className="font-mono text-xs">{a.codParte}</span>
                    <span className="text-steel-500 ml-2 text-xs">{a.descri}</span>
                  </SelectItem>
                ))}
              </Select>

              <FormulaInput
                label=""
                value={item.formulaCantidad}
                onChange={v => update(item.id, { formulaCantidad: v })}
                size="sm"
              />

              <Button
                isIconOnly size="sm" variant="light" color="danger"
                onPress={() => deleteDespieceAccesorio(nivel, item.id)}
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
