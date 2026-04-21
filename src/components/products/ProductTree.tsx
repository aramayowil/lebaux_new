import { useState } from 'react'
import { Button, Chip, Tooltip, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem } from '@heroui/react'
import { ChevronRight, ChevronDown, Plus, Trash2, Layers, Box, Grid2x2, Square } from 'lucide-react'
import { useProductosStore } from '@/store/productosStore'
import { useCatalogosStore } from '@/store/catalogosStore'
import clsx from 'clsx'
import type { Producto, Marco, Hoja, Interior } from '@/types'

export type TreeSelection =
  | { level: 'producto';  id: number }
  | { level: 'marco';     id: number; idProducto: number }
  | { level: 'hoja';      id: number; idMarco: number; idProducto: number }
  | { level: 'interior';  id: number; idHoja: number; idMarco: number; idProducto: number }

interface Props {
  selection: TreeSelection | null
  onSelect: (sel: TreeSelection) => void
}

export default function ProductTree({ selection, onSelect }: Props) {
  const {
    productos, marcos, hojas, interiores, tipos,
    addProducto, deleteProducto,
    addMarco, deleteMarco,
    addHoja, deleteHoja,
    addInterior, deleteInterior,
    getMarcosByProducto, getHojasByMarco, getInterioresByHoja,
  } = useProductosStore()
  const { extrusoras, lineas } = useCatalogosStore()

  // Expansion state: which nodes are open
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['p-1']))
  const toggle = (key: string) => setExpanded(s => {
    const n = new Set(s)
    n.has(key) ? n.delete(key) : n.add(key)
    return n
  })

  // New item modals
  const newProd = useDisclosure()
  const [prodForm, setProdForm] = useState({ descripcion: '', idExtrusora: extrusoras[0]?.id ?? 1, idLinea: lineas[0]?.id ?? 1, idTipo: 1 })

  const newExtId = prodForm.idExtrusora
  const lineasDeExt = lineas.filter(l => l.idExtrusora === newExtId)

  function handleAddProducto(close: () => void) {
    if (!prodForm.descripcion.trim()) return
    const p = addProducto(prodForm)
    onSelect({ level: 'producto', id: p.id })
    setExpanded(s => new Set([...s, `p-${p.id}`]))
    close()
  }

  function handleAddMarco(idProducto: number) {
    const m = addMarco({ idProducto, descripcion: 'Marco nuevo', predeterminado: false })
    setExpanded(s => new Set([...s, `p-${idProducto}`, `m-${m.id}`]))
    onSelect({ level: 'marco', id: m.id, idProducto })
  }

  function handleAddHoja(idMarco: number, idProducto: number) {
    const h = addHoja({ idMarco, descripcion: 'Hoja nueva', cantidad: 1, predeterminado: false })
    setExpanded(s => new Set([...s, `m-${idMarco}`, `h-${h.id}`]))
    onSelect({ level: 'hoja', id: h.id, idMarco, idProducto })
  }

  function handleAddInterior(idHoja: number, idMarco: number, idProducto: number) {
    const i = addInterior({
      idHoja,
      descripcion: 'Interior nuevo',
      predeterminado: false,
      formulaCantidadInteriores: '1',
      formulaAnchoInterior: 'ancho - 20',
      formulaAltoInterior: 'alto - 60',
      descuentoIzquierda: 5, descuentoAbajo: 5, descuentoArriba: 5, descuentoDerecha: 5,
    })
    onSelect({ level: 'interior', id: i.id, idHoja, idMarco, idProducto })
  }

  const isSelected = (level: string, id: number) =>
    selection?.level === level && selection.id === id

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-steel-100 dark:border-steel-800 flex-shrink-0">
        <span className="text-xs font-semibold text-steel-500 uppercase tracking-wide">Productos</span>
        <Tooltip content="Nuevo producto" size="sm">
          <Button isIconOnly size="sm" variant="flat" onPress={newProd.onOpen}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </Tooltip>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
        {productos.length === 0 && (
          <div className="p-4 text-center text-xs text-steel-400">
            Sin productos. Creá uno con el botón +
          </div>
        )}
        {productos.map(p => (
          <ProductNode
            key={p.id}
            producto={p}
            expanded={expanded}
            toggle={toggle}
            selection={selection}
            isSelected={isSelected}
            onSelect={onSelect}
            onAddMarco={handleAddMarco}
            onAddHoja={handleAddHoja}
            onAddInterior={handleAddInterior}
            onDeleteProducto={deleteProducto}
            onDeleteMarco={deleteMarco}
            onDeleteHoja={deleteHoja}
            onDeleteInterior={deleteInterior}
            getMarcos={getMarcosByProducto}
            getHojas={getHojasByMarco}
            getInteriores={getInterioresByHoja}
            tipos={tipos}
          />
        ))}
      </div>

      {/* Modal nuevo producto */}
      <Modal isOpen={newProd.isOpen} onOpenChange={newProd.onOpenChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-display">Nuevo producto</ModalHeader>
              <ModalBody className="gap-3">
                <Input
                  label="Descripción *"
                  placeholder="ej: Ventana corrediza 2 hojas"
                  value={prodForm.descripcion}
                  onValueChange={v => setProdForm(f => ({ ...f, descripcion: v }))}
                  size="sm"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Extrusora"
                    selectedKeys={[String(prodForm.idExtrusora)]}
                    onSelectionChange={k => {
                      const extId = parseInt([...k][0] as string)
                      const primera = lineas.find(l => l.idExtrusora === extId)
                      setProdForm(f => ({ ...f, idExtrusora: extId, idLinea: primera?.id ?? f.idLinea }))
                    }}
                    size="sm"
                  >
                    {extrusoras.map(e => <SelectItem key={String(e.id)}>{e.extrusora}</SelectItem>)}
                  </Select>
                  <Select
                    label="Línea"
                    selectedKeys={[String(prodForm.idLinea)]}
                    onSelectionChange={k => setProdForm(f => ({ ...f, idLinea: parseInt([...k][0] as string) }))}
                    size="sm"
                  >
                    {lineasDeExt.map(l => <SelectItem key={String(l.id)}>{l.linea}</SelectItem>)}
                  </Select>
                </div>
                <Select
                  label="Tipo de producto"
                  selectedKeys={[String(prodForm.idTipo)]}
                  onSelectionChange={k => setProdForm(f => ({ ...f, idTipo: parseInt([...k][0] as string) }))}
                  size="sm"
                >
                  {useProductosStore.getState().tipos.map(t => (
                    <SelectItem key={String(t.id)}>{t.formaTipo}</SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancelar</Button>
                <Button color="primary" onPress={() => handleAddProducto(onClose)}
                  isDisabled={!prodForm.descripcion.trim()}>
                  Crear producto
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

// ── Sub-components for the tree nodes ──────────────────────────────────────

interface NodeProps {
  producto: Producto
  expanded: Set<string>
  toggle: (k: string) => void
  selection: TreeSelection | null
  isSelected: (level: string, id: number) => boolean
  onSelect: (s: TreeSelection) => void
  onAddMarco: (idProducto: number) => void
  onAddHoja: (idMarco: number, idProducto: number) => void
  onAddInterior: (idHoja: number, idMarco: number, idProducto: number) => void
  onDeleteProducto: (id: number) => void
  onDeleteMarco: (id: number) => void
  onDeleteHoja: (id: number) => void
  onDeleteInterior: (id: number) => void
  getMarcos: (id: number) => Marco[]
  getHojas: (id: number) => Hoja[]
  getInteriores: (id: number) => Interior[]
  tipos: { id: number; formaTipo: string; orden: number }[]
}

function ProductNode({ producto, expanded, toggle, selection, isSelected, onSelect, onAddMarco, onAddHoja, onAddInterior, onDeleteProducto, onDeleteMarco, onDeleteHoja, onDeleteInterior, getMarcos, getHojas, getInteriores, tipos }: NodeProps) {
  const pKey    = `p-${producto.id}`
  const isPOpen = expanded.has(pKey)
  const marcos  = getMarcos(producto.id)
  const tipo    = tipos.find(t => t.id === producto.idTipo)

  return (
    <div>
      {/* Producto row */}
      <TreeRow
        depth={0}
        icon={<Layers className="w-3.5 h-3.5 text-steel-500" />}
        label={producto.descripcion}
        badge={tipo?.formaTipo}
        isOpen={isPOpen}
        hasChildren={true}
        isSelected={isSelected('producto', producto.id)}
        onToggle={() => toggle(pKey)}
        onClick={() => onSelect({ level: 'producto', id: producto.id })}
        onAdd={() => onAddMarco(producto.id)}
        onDelete={() => onDeleteProducto(producto.id)}
        addLabel="Marco"
      />

      {isPOpen && (
        <div>
          {marcos.map(m => {
            const mKey   = `m-${m.id}`
            const isMOpen = expanded.has(mKey)
            const hojas  = getHojas(m.id)

            return (
              <div key={m.id}>
                <TreeRow
                  depth={1}
                  icon={<Box className="w-3 h-3 text-steel-400" />}
                  label={m.descripcion}
                  isOpen={isMOpen}
                  hasChildren={true}
                  isSelected={isSelected('marco', m.id)}
                  onToggle={() => toggle(mKey)}
                  onClick={() => onSelect({ level: 'marco', id: m.id, idProducto: producto.id })}
                  onAdd={() => onAddHoja(m.id, producto.id)}
                  onDelete={() => onDeleteMarco(m.id)}
                  addLabel="Hoja"
                />

                {isMOpen && (
                  <div>
                    {hojas.map(h => {
                      const hKey    = `h-${h.id}`
                      const isHOpen = expanded.has(hKey)
                      const interiores = getInteriores(h.id)

                      return (
                        <div key={h.id}>
                          <TreeRow
                            depth={2}
                            icon={<Grid2x2 className="w-3 h-3 text-steel-400" />}
                            label={h.descripcion}
                            badge={`×${h.cantidad}`}
                            isOpen={isHOpen}
                            hasChildren={true}
                            isSelected={isSelected('hoja', h.id)}
                            onToggle={() => toggle(hKey)}
                            onClick={() => onSelect({ level: 'hoja', id: h.id, idMarco: m.id, idProducto: producto.id })}
                            onAdd={() => onAddInterior(h.id, m.id, producto.id)}
                            onDelete={() => onDeleteHoja(h.id)}
                            addLabel="Interior"
                          />

                          {isHOpen && interiores.map(i => (
                            <TreeRow
                              key={i.id}
                              depth={3}
                              icon={<Square className="w-2.5 h-2.5 text-steel-300" />}
                              label={i.descripcion}
                              isOpen={false}
                              hasChildren={false}
                              isSelected={isSelected('interior', i.id)}
                              onToggle={() => {}}
                              onClick={() => onSelect({ level: 'interior', id: i.id, idHoja: h.id, idMarco: m.id, idProducto: producto.id })}
                              onAdd={() => {}}
                              onDelete={() => onDeleteInterior(i.id)}
                              addLabel=""
                            />
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface RowProps {
  depth: number
  icon: React.ReactNode
  label: string
  badge?: string
  isOpen: boolean
  hasChildren: boolean
  isSelected: boolean
  onToggle: () => void
  onClick: () => void
  onAdd: () => void
  onDelete: () => void
  addLabel: string
}

function TreeRow({ depth, icon, label, badge, isOpen, hasChildren, isSelected, onToggle, onClick, onAdd, onDelete, addLabel }: RowProps) {
  const indent = depth * 16 + 8

  return (
    <div
      className={clsx(
        'flex items-center gap-1 pr-1 py-1 cursor-pointer group transition-colors text-sm',
        isSelected
          ? 'bg-steel-100 dark:bg-steel-800 text-steel-900 dark:text-steel-100'
          : 'text-steel-600 dark:text-steel-400 hover:bg-steel-50 dark:hover:bg-steel-800/40',
      )}
      style={{ paddingLeft: `${indent}px` }}
    >
      {/* Chevron */}
      <button
        className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-steel-400"
        onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle() }}
      >
        {hasChildren
          ? isOpen
            ? <ChevronDown className="w-3 h-3" />
            : <ChevronRight className="w-3 h-3" />
          : <span className="w-3" />
        }
      </button>

      {/* Icon */}
      <span className="flex-shrink-0">{icon}</span>

      {/* Label */}
      <span className="flex-1 min-w-0 truncate text-xs leading-none py-0.5" onClick={onClick}>
        {label}
      </span>

      {/* Badge */}
      {badge && (
        <span className="text-[10px] text-steel-400 dark:text-steel-600 flex-shrink-0 font-mono">{badge}</span>
      )}

      {/* Actions (shown on hover) */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {addLabel && (
          <Tooltip content={`+ ${addLabel}`} size="sm">
            <button
              className="w-5 h-5 flex items-center justify-center rounded text-steel-400 hover:text-steel-700 hover:bg-steel-200 dark:hover:bg-steel-700 transition-colors"
              onClick={e => { e.stopPropagation(); onAdd() }}
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </Tooltip>
        )}
        <Tooltip content="Eliminar" size="sm">
          <button
            className="w-5 h-5 flex items-center justify-center rounded text-steel-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            onClick={e => { e.stopPropagation(); onDelete() }}
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
