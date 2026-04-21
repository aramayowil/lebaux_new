import { useState, useCallback } from 'react'
import {
  Button, Select, SelectItem, useDisclosure, Chip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input,
} from '@heroui/react'
import { Trash2, Wrench } from 'lucide-react'
import { useCatalogosStore } from '@/store/catalogosStore'
import { useInlineEdit } from '@/hooks/useInlineEdit'
import EditableCell from '@/components/ui/EditableCell'
import CatalogToolbar from '@/components/ui/CatalogToolbar'
import EmptyState from '@/components/ui/EmptyState'
import { formatPesos } from '@/lib/calculoDespiece'
import type { Accesorio } from '@/types'

const BLANK: Accesorio = { codParte: '', descri: '', precio: 0, unidad: 0, moneda: 1 }

export default function AccesoriosTab() {
  const { accesorios, monedas, setAccesorio, deleteAccesorio, toPesos } = useCatalogosStore()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { isEditing, startEdit, cancelEdit, draft, setDraft } = useInlineEdit()

  const [search, setSearch]   = useState('')
  const [filterUnidad, setFilterUnidad] = useState<string>('all')
  const [newForm, setNewForm] = useState<Accesorio>(BLANK)

  const filtered = accesorios.filter(a => {
    const matchSearch = `${a.codParte} ${a.descri}`.toLowerCase().includes(search.toLowerCase())
    const matchUnidad = filterUnidad === 'all' || String(a.unidad) === filterUnidad
    return matchSearch && matchUnidad
  })

  const commit = useCallback((a: Accesorio, field: keyof Accesorio, raw: string) => {
    const value = field === 'precio' ? (parseFloat(raw) || 0) : raw
    setAccesorio({ ...a, [field]: value })
    cancelEdit()
  }, [setAccesorio, cancelEdit])

  const cell = (a: Accesorio, field: keyof Accesorio, opts?: { type?: 'text' | 'number'; align?: 'left' | 'right'; mono?: boolean }) => (
    <EditableCell
      value={a[field] as string | number}
      isEditing={isEditing(a.codParte, field)}
      draft={draft}
      onDraftChange={setDraft}
      onStartEdit={() => startEdit(a.codParte, field, a[field] as string | number)}
      onCommit={v => commit(a, field, v)}
      onCancel={cancelEdit}
      type={opts?.type} align={opts?.align} mono={opts?.mono}
    />
  )

  function handleNew(close: () => void) {
    if (!newForm.codParte.trim() || !newForm.descri.trim()) return
    setAccesorio(newForm)
    setNewForm(BLANK)
    close()
  }

  const unidadBadge = (u: 0 | 1) => (
    <Chip size="sm" variant="flat"
      classNames={{ base: u === 1 ? 'bg-blue-50 dark:bg-blue-950/40' : 'bg-steel-100 dark:bg-steel-800' }}>
      {u === 1 ? 'Metro' : 'Unidad'}
    </Chip>
  )

  return (
    <>
      <CatalogToolbar
        search={search} onSearch={setSearch}
        onNew={onOpen} newLabel="Nuevo accesorio"
        placeholder="Buscar por código o descripción..."
        extra={
          <Select size="sm" className="w-36" selectedKeys={[filterUnidad]}
            onSelectionChange={k => setFilterUnidad([...k][0] as string)}
            aria-label="Tipo de unidad"
            classNames={{ trigger: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-8 min-h-unit-8' }}>
            <SelectItem key="all">Todas las unidades</SelectItem>
            <SelectItem key="0">Por unidad / bolsa</SelectItem>
            <SelectItem key="1">Por metro lineal</SelectItem>
          </Select>
        }
      />

      <p className="text-xs text-steel-400 mb-2">
        {filtered.length} accesorio{filtered.length !== 1 ? 's' : ''}
        <span className="ml-2 text-steel-300 dark:text-steel-600">· Hacé click en cualquier celda para editar</span>
      </p>

      <div className="card-surface overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-steel-200 dark:border-steel-700 bg-steel-50 dark:bg-steel-800/60">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-steel-500 uppercase tracking-wide w-32">Código</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-steel-500 uppercase tracking-wide">Descripción</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-steel-500 uppercase tracking-wide w-28">Unidad</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-steel-500 uppercase tracking-wide w-32">Precio</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-steel-500 uppercase tracking-wide w-32">Precio ($)</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
            {filtered.length === 0 && (
              <tr><td colSpan={6}>
                <EmptyState icon={Wrench} title="Sin accesorios" />
              </td></tr>
            )}
            {filtered.map(a => (
              <tr key={a.codParte} className="hover:bg-steel-50/70 dark:hover:bg-steel-800/30 transition-colors group">
                <td className="px-3 py-1.5">
                  <span className="font-mono text-xs bg-steel-100 dark:bg-steel-800 text-steel-600 dark:text-steel-300 px-2 py-0.5 rounded">
                    {a.codParte}
                  </span>
                </td>
                <td className="px-3 py-1 min-w-[200px]">{cell(a, 'descri')}</td>
                <td className="px-3 py-1.5 text-center">{unidadBadge(a.unidad)}</td>
                <td className="px-3 py-1">{cell(a, 'precio', { type: 'number', align: 'right', mono: true })}</td>
                <td className="px-3 py-1.5 text-right">
                  <span className="currency-badge">{formatPesos(toPesos(a.precio, a.moneda))}</span>
                </td>
                <td className="px-2 py-1">
                  <Button isIconOnly size="sm" variant="light" color="danger"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onPress={() => deleteAccesorio(a.codParte)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-display">Nuevo accesorio</ModalHeader>
              <ModalBody className="gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Código *" placeholder="ej: TIR-001"
                    value={newForm.codParte}
                    onValueChange={v => setNewForm(f => ({ ...f, codParte: v }))}
                    size="sm" description="Identificador único" />
                  <Select label="Unidad de medida"
                    selectedKeys={[String(newForm.unidad)]}
                    onSelectionChange={k => setNewForm(f => ({ ...f, unidad: parseInt([...k][0] as string) as 0 | 1 }))}
                    size="sm">
                    <SelectItem key="0">Unidad / Bolsa / Kit</SelectItem>
                    <SelectItem key="1">Metro lineal</SelectItem>
                  </Select>
                </div>
                <Input label="Descripción *"
                  value={newForm.descri}
                  onValueChange={v => setNewForm(f => ({ ...f, descri: v }))}
                  size="sm" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Precio" type="number"
                    value={String(newForm.precio)}
                    onValueChange={v => setNewForm(f => ({ ...f, precio: parseFloat(v) || 0 }))}
                    size="sm" />
                  <Select label="Moneda"
                    selectedKeys={[String(newForm.moneda)]}
                    onSelectionChange={k => setNewForm(f => ({ ...f, moneda: parseInt([...k][0] as string) }))}
                    size="sm">
                    {monedas.map(m => <SelectItem key={String(m.id)}>{m.descripcion}</SelectItem>)}
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancelar</Button>
                <Button color="primary" onPress={() => handleNew(onClose)}
                  isDisabled={!newForm.codParte.trim() || !newForm.descri.trim()}>
                  Crear accesorio
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
