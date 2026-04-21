import { useState } from 'react'
import { Input, Tabs, Tab, Switch, Chip } from '@heroui/react'
import { Grid2x2, Square } from 'lucide-react'
import { useProductosStore } from '@/store/productosStore'
import DespiecePerfilesPanel from './DespiecePerfilesPanel'
import DespieceAccesoriosPanel from './DespieceAccesoriosPanel'
import type { Hoja } from '@/types'
import type { TreeSelection } from './ProductTree'

interface Props {
  hoja: Hoja
  idMarco: number
  idProducto: number
  onSelect: (sel: TreeSelection) => void
}

export default function HojaPanel({ hoja, idMarco, idProducto, onSelect }: Props) {
  const { updateHoja, getInterioresByHoja, productos, marcos } = useProductosStore()
  const [tab, setTab] = useState('perfiles')

  const producto   = productos.find(p => p.id === idProducto)
  const marco      = marcos.find(m => m.id === idMarco)
  const interiores = getInterioresByHoja(hoja.id)
  const upd = (data: Partial<Hoja>) => updateHoja(hoja.id, data)

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-steel-400">
        <span className="text-steel-600 dark:text-steel-300 font-medium">{producto?.descripcion}</span>
        <span>›</span>
        <span>{marco?.descripcion}</span>
        <span>›</span>
        <span className="font-semibold text-steel-800 dark:text-steel-100 flex items-center gap-1">
          <Grid2x2 className="w-3.5 h-3.5" /> Hoja
        </span>
      </div>

      {/* Datos */}
      <div className="card-surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="section-label">Hoja</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-steel-400">Predeterminada</span>
            <Switch size="sm" isSelected={hoja.predeterminado}
              onValueChange={v => upd({ predeterminado: v })} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input label="Descripción de la hoja"
              value={hoja.descripcion}
              onValueChange={v => upd({ descripcion: v })}
              size="sm"
              classNames={{ inputWrapper: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700' }} />
          </div>
          <Input label="Cantidad de hojas" type="number"
            value={String(hoja.cantidad)}
            onValueChange={v => upd({ cantidad: parseInt(v) || 1 })}
            size="sm"
            description="Variable 'hojas' en fórmulas"
            classNames={{ inputWrapper: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700' }} />
        </div>
      </div>

      {/* Interiores rápido */}
      {interiores.length > 0 && (
        <div className="card-surface px-4 py-3">
          <p className="section-label mb-2">Interiores ({interiores.length})</p>
          <div className="flex flex-wrap gap-2">
            {interiores.map(i => (
              <button
                key={i.id}
                onClick={() => onSelect({ level: 'interior', id: i.id, idHoja: hoja.id, idMarco, idProducto })}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-steel-50 dark:bg-steel-800 hover:bg-steel-100 dark:hover:bg-steel-700 text-xs text-steel-600 dark:text-steel-300 transition-colors"
              >
                <Square className="w-2.5 h-2.5 text-steel-400" />
                {i.descripcion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Despiece */}
      <div className="card-surface p-4">
        <Tabs selectedKey={tab} onSelectionChange={k => setTab(String(k))}
          size="sm" variant="underlined"
          classNames={{
            tabList: 'border-b border-steel-200 dark:border-steel-700 w-full gap-0 mb-4',
            cursor: 'bg-steel-600 dark:bg-steel-400 h-0.5',
            tab: 'px-3 h-8 text-xs font-medium',
          }}>
          <Tab key="perfiles" title="Despiece de perfiles">
            <DespiecePerfilesPanel nivel="hoja" idParent={hoja.id} label="Perfiles de la hoja" />
          </Tab>
          <Tab key="accesorios" title="Accesorios">
            <DespieceAccesoriosPanel nivel="hoja" idParent={hoja.id} label="Accesorios de la hoja" />
          </Tab>
        </Tabs>
      </div>
    </div>
  )
}
