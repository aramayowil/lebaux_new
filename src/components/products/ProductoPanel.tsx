import { Input, Select, SelectItem, Chip, Tabs, Tab } from '@heroui/react'
import { useProductosStore } from '@/store/productosStore'
import { useCatalogosStore } from '@/store/catalogosStore'
import DespiecePerfilesPanel from './DespiecePerfilesPanel'
import DespieceAccesoriosPanel from './DespieceAccesoriosPanel'
import type { Producto } from '@/types'

interface Props {
  producto: Producto
}

export default function ProductoPanel({ producto }: Props) {
  const { updateProducto, tipos } = useProductosStore()
  const { extrusoras, lineas } = useCatalogosStore()

  const upd = (data: Partial<Producto>) => updateProducto(producto.id, data)
  const lineasDeExt = lineas.filter(l => l.idExtrusora === producto.idExtrusora)
  const ext  = extrusoras.find(e => e.id === producto.idExtrusora)
  const linea = lineas.find(l => l.id === producto.idLinea)
  const tipo  = tipos.find(t => t.id === producto.idTipo)

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-steel-400 uppercase tracking-wide">Producto</span>
        <Chip size="sm" variant="flat">{tipo?.formaTipo ?? '?'}</Chip>
        <span className="text-xs text-steel-300">·</span>
        <span className="text-xs text-steel-500">{ext?.extrusora} / {linea?.linea}</span>
      </div>

      {/* Datos básicos */}
      <div className="card-surface p-4 space-y-3">
        <p className="section-label">Datos del producto</p>
        <Input
          label="Descripción"
          value={producto.descripcion}
          onValueChange={v => upd({ descripcion: v })}
          size="sm"
          classNames={{ inputWrapper: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700' }}
        />
        <div className="grid grid-cols-3 gap-3">
          <Select label="Extrusora" selectedKeys={[String(producto.idExtrusora)]}
            onSelectionChange={k => {
              const extId = parseInt([...k][0] as string)
              const primera = lineas.find(l => l.idExtrusora === extId)
              upd({ idExtrusora: extId, idLinea: primera?.id ?? producto.idLinea })
            }} size="sm">
            {extrusoras.map(e => <SelectItem key={String(e.id)}>{e.extrusora}</SelectItem>)}
          </Select>
          <Select label="Línea" selectedKeys={[String(producto.idLinea)]}
            onSelectionChange={k => upd({ idLinea: parseInt([...k][0] as string) })} size="sm">
            {lineasDeExt.map(l => <SelectItem key={String(l.id)}>{l.linea}</SelectItem>)}
          </Select>
          <Select label="Tipo" selectedKeys={[String(producto.idTipo)]}
            onSelectionChange={k => upd({ idTipo: parseInt([...k][0] as string) })} size="sm">
            {tipos.map(t => <SelectItem key={String(t.id)}>{t.formaTipo}</SelectItem>)}
          </Select>
        </div>
      </div>

      <div className="text-xs text-steel-400 bg-steel-50 dark:bg-steel-800/40 rounded-lg px-3 py-2">
        Seleccioná un <strong>Marco</strong> en el árbol para configurar sus perfiles y accesorios de corte.
      </div>
    </div>
  )
}
