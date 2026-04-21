import { useState } from 'react'
import { Input, Tabs, Tab, Chip, Switch } from '@heroui/react'
import { Box } from 'lucide-react'
import { useProductosStore } from '@/store/productosStore'
import DespiecePerfilesPanel from './DespiecePerfilesPanel'
import DespieceAccesoriosPanel from './DespieceAccesoriosPanel'
import type { Marco } from '@/types'

interface Props {
  marco: Marco
  idProducto: number
}

export default function MarcoPanel({ marco, idProducto }: Props) {
  const { updateMarco, getHojasByMarco, productos } = useProductosStore()
  const [tab, setTab] = useState('perfiles')

  const producto = productos.find(p => p.id === idProducto)
  const hojas    = getHojasByMarco(marco.id)
  const upd = (data: Partial<Marco>) => updateMarco(marco.id, data)

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-steel-400">
        <span className="text-steel-600 dark:text-steel-300 font-medium">{producto?.descripcion}</span>
        <span>›</span>
        <span className="font-semibold text-steel-800 dark:text-steel-100 flex items-center gap-1">
          <Box className="w-3.5 h-3.5" /> Marco
        </span>
      </div>

      {/* Datos */}
      <div className="card-surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="section-label">Marco</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-steel-400">Predeterminado</span>
            <Switch
              size="sm"
              isSelected={marco.predeterminado}
              onValueChange={v => upd({ predeterminado: v })}
            />
          </div>
        </div>
        <Input
          label="Descripción del marco"
          value={marco.descripcion}
          onValueChange={v => upd({ descripcion: v })}
          size="sm"
          classNames={{ inputWrapper: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700' }}
        />
        <div className="flex items-center gap-2 text-xs text-steel-400">
          <Chip size="sm" variant="flat">{hojas.length} hoja{hojas.length !== 1 ? 's' : ''}</Chip>
        </div>
      </div>

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
            <DespiecePerfilesPanel nivel="marco" idParent={marco.id} label="Perfiles del marco" />
          </Tab>
          <Tab key="accesorios" title="Accesorios">
            <DespieceAccesoriosPanel nivel="marco" idParent={marco.id} label="Accesorios del marco" />
          </Tab>
        </Tabs>
      </div>
    </div>
  )
}
