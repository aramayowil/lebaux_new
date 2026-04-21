import { useState, useCallback } from 'react'
import {
  Button, Select, SelectItem, useDisclosure,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Tooltip,
} from '@heroui/react'
import { Trash2, Package } from 'lucide-react'
import { useCatalogosStore } from '@/store/catalogosStore'
import { useInlineEdit } from '@/hooks/useInlineEdit'
import EditableCell from '@/components/ui/EditableCell'
import CatalogToolbar from '@/components/ui/CatalogToolbar'
import EmptyState from '@/components/ui/EmptyState'
import { formatPesos } from '@/lib/calculoDespiece'
import type { Perfil } from '@/types'

const BLANK: Perfil = {
  nroPerfil: '', descri: '', pesoMetro: 0, longTira: 6000,
  precioKg: 0, moneda: 1, cubre: 0, idLinea: 1,
}

export default function PerfilesTab() {
  const { perfiles, lineas, extrusoras, monedas, setPerfil, deletePerfil, toPesos } = useCatalogosStore()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { isEditing, startEdit, cancelEdit, draft, setDraft } = useInlineEdit()

  const [search, setSearch]           = useState('')
  const [filterExt, setFilterExt]     = useState<string>('all')
  const [filterLinea, setFilterLinea] = useState<string>('all')
  const [newForm, setNewForm]         = useState<Perfil>(BLANK)
  const [newExtId, setNewExtId]       = useState<number>(extrusoras[0]?.id ?? 1)

  const lineasDeExt = (extId: number) => lineas.filter(l => l.idExtrusora === extId)

  const filtered = perfiles.filter(p => {
    const linea = lineas.find(l => l.id === p.idLinea)
    const matchSearch = `${p.nroPerfil} ${p.descri}`.toLowerCase().includes(search.toLowerCase())
    const matchExt    = filterExt   === 'all' || linea?.idExtrusora === Number(filterExt)
    const matchLinea  = filterLinea === 'all' || p.idLinea === Number(filterLinea)
    return matchSearch && matchExt && matchLinea
  })

  const getLinea  = (id: number) => lineas.find(l => l.id === id)
  const getExt    = (id: number) => extrusoras.find(e => e.id === id)
  const pesoTira  = (p: Perfil)  => (p.pesoMetro * p.longTira / 1000)
  const precioTira = (p: Perfil) => toPesos(p.precioKg * pesoTira(p), p.moneda)

  const commit = useCallback((p: Perfil, field: keyof Perfil, raw: string) => {
    const numFields: (keyof Perfil)[] = ['pesoMetro', 'longTira', 'precioKg', 'cubre']
    const value = numFields.includes(field) ? (parseFloat(raw) || 0) : raw
    setPerfil({ ...p, [field]: value })
    cancelEdit()
  }, [setPerfil, cancelEdit])

  const cell = (p: Perfil, field: keyof Perfil, opts?: { type?: 'text' | 'number'; align?: 'left' | 'right'; mono?: boolean }) => (
    <EditableCell
      value={p[field] as string | number}
      isEditing={isEditing(p.nroPerfil, field)}
      draft={draft}
      onDraftChange={setDraft}
      onStartEdit={() => startEdit(p.nroPerfil, field, p[field] as string | number)}
      onCommit={v => commit(p, field, v)}
      onCancel={cancelEdit}
      type={opts?.type}
      align={opts?.align}
      mono={opts?.mono}
    />
  )

  function handleNew(close: () => void) {
    if (!newForm.nroPerfil.trim() || !newForm.descri.trim()) return
    setPerfil(newForm)
    setNewForm(BLANK)
    close()
  }

  return (
    <>
      <CatalogToolbar
        search={search}
        onSearch={setSearch}
        onNew={onOpen}
        newLabel="Nuevo perfil"
        placeholder="Buscar por N° o descripción..."
        extra={
          <div className="flex gap-2">
            <Select
              size="sm" className="w-44"
              selectedKeys={[filterExt]}
              onSelectionChange={k => { setFilterExt([...k][0] as string); setFilterLinea('all') }}
              aria-label="Extrusora"
              classNames={{ trigger: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-8 min-h-unit-8' }}
            >
              <SelectItem key="all">Todas las extrusoras</SelectItem>
              {extrusoras.map(e => <SelectItem key={String(e.id)}>{e.extrusora}</SelectItem>)}
            </Select>
            <Select
              size="sm" className="w-36"
              selectedKeys={[filterLinea]}
              onSelectionChange={k => setFilterLinea([...k][0] as string)}
              aria-label="Línea"
              isDisabled={filterExt === 'all'}
              classNames={{ trigger: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-8 min-h-unit-8' }}
            >
              <SelectItem key="all">Todas las líneas</SelectItem>
              {lineasDeExt(Number(filterExt)).map(l => <SelectItem key={String(l.id)}>{l.linea}</SelectItem>)}
            </Select>
          </div>
        }
      />

      <p className="text-xs text-steel-400 mb-2">
        {filtered.length} perfil{filtered.length !== 1 ? 'es' : ''}
        {(filterExt !== 'all' || filterLinea !== 'all' || search) ? ' · filtrado' : ''}
        <span className="ml-2 text-steel-300 dark:text-steel-600">· Hacé click en cualquier celda para editar</span>
      </p>

      <div className="card-surface overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-steel-200 dark:border-steel-700 bg-steel-50 dark:bg-steel-800/60">
              {['N° Perfil', 'Descripción', 'Extrusora / Línea', 'kg/m', 'Tira mm', 'Peso tira', '$/kg', '$/tira', 'Cubre', ''].map((h, i) => (
                <th key={i} className={`px-3 py-2.5 text-xs font-semibold text-steel-500 uppercase tracking-wide whitespace-nowrap ${
                  i >= 3 && i <= 8 ? 'text-right' : 'text-left'
                } ${i === 0 ? 'w-24' : ''} ${i === 2 ? 'w-40' : ''} ${[3,4,5,6,7,8].includes(i) ? 'w-24' : ''} ${i === 9 ? 'w-10' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
            {filtered.length === 0 && (
              <tr><td colSpan={10}>
                <EmptyState icon={Package} title="Sin perfiles" description="Usá el botón 'Nuevo perfil' para agregar" />
              </td></tr>
            )}
            {filtered.map(p => {
              const linea = getLinea(p.idLinea)
              const ext   = getExt(linea?.idExtrusora ?? 0)
              const pt    = pesoTira(p)
              const preciT = precioTira(p)
              return (
                <tr key={p.nroPerfil} className="hover:bg-steel-50/70 dark:hover:bg-steel-800/30 transition-colors group">

                  <td className="px-3 py-1.5">
                    <span className="font-mono text-xs bg-steel-100 dark:bg-steel-800 text-steel-600 dark:text-steel-300 px-2 py-0.5 rounded">
                      {p.nroPerfil}
                    </span>
                  </td>

                  <td className="px-3 py-1 min-w-[180px]">{cell(p, 'descri')}</td>

                  <td className="px-3 py-1.5">
                    <span className="text-xs text-steel-500">
                      <span className="text-steel-700 dark:text-steel-300 font-medium">{ext?.extrusora ?? '?'}</span>
                      <span className="text-steel-300 dark:text-steel-600"> / </span>
                      {linea?.linea ?? '?'}
                    </span>
                  </td>

                  <td className="px-3 py-1">{cell(p, 'pesoMetro', { type: 'number', align: 'right', mono: true })}</td>
                  <td className="px-3 py-1">{cell(p, 'longTira',  { type: 'number', align: 'right', mono: true })}</td>

                  <td className="px-3 py-1.5 text-right">
                    <span className="font-mono text-xs text-steel-500">{pt.toFixed(3)} kg</span>
                  </td>

                  <td className="px-3 py-1">{cell(p, 'precioKg', { type: 'number', align: 'right', mono: true })}</td>

                  <td className="px-3 py-1.5 text-right">
                    <span className="currency-badge">{formatPesos(preciT)}</span>
                  </td>

                  <td className="px-3 py-1">
                    <div className="flex items-center justify-end gap-0.5">
                      {cell(p, 'cubre', { type: 'number', align: 'right', mono: true })}
                      <span className="text-[10px] text-steel-400 flex-shrink-0">mm</span>
                    </div>
                  </td>

                  <td className="px-2 py-1 text-right">
                    <Button isIconOnly size="sm" variant="light" color="danger"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onPress={() => deletePerfil(p.nroPerfil)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-steel-200 dark:border-steel-700 bg-steel-50 dark:bg-steel-800/40">
                <td colSpan={5} className="px-3 py-2 text-xs text-steel-400 font-medium">
                  Total ({filtered.length} perfiles)
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs font-semibold text-steel-600 dark:text-steel-300">
                  — kg
                </td>
                <td colSpan={2} className="px-3 py-2 text-right font-mono text-xs font-semibold text-steel-600 dark:text-steel-300">
                  {formatPesos(filtered.reduce((s, p) => s + precioTira(p), 0))} (stock completo)
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Modal nuevo */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-display">Nuevo perfil</ModalHeader>
              <ModalBody className="gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="N° Perfil *" placeholder="ej: 001"
                    value={newForm.nroPerfil}
                    onValueChange={v => setNewForm(f => ({ ...f, nroPerfil: v }))}
                    size="sm" description="Identificador único" />
                  <Input label="Descripción *" placeholder="ej: Marco inferior"
                    value={newForm.descri}
                    onValueChange={v => setNewForm(f => ({ ...f, descri: v }))}
                    size="sm" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Peso (kg/m)" type="number" value={String(newForm.pesoMetro)}
                    onValueChange={v => setNewForm(f => ({ ...f, pesoMetro: parseFloat(v) || 0 }))}
                    size="sm" endContent={<span className="text-xs text-steel-400">kg/m</span>} />
                  <Input label="Long. tira" type="number" value={String(newForm.longTira)}
                    onValueChange={v => setNewForm(f => ({ ...f, longTira: parseInt(v) || 6000 }))}
                    size="sm" endContent={<span className="text-xs text-steel-400">mm</span>} />
                  <Input label="Cubre" type="number" value={String(newForm.cubre)}
                    onValueChange={v => setNewForm(f => ({ ...f, cubre: parseInt(v) || 0 }))}
                    size="sm" endContent={<span className="text-xs text-steel-400">mm</span>} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Precio / kg" type="number" value={String(newForm.precioKg)}
                    onValueChange={v => setNewForm(f => ({ ...f, precioKg: parseFloat(v) || 0 }))}
                    size="sm" />
                  <Select label="Moneda" selectedKeys={[String(newForm.moneda)]}
                    onSelectionChange={k => setNewForm(f => ({ ...f, moneda: parseInt([...k][0] as string) }))}
                    size="sm">
                    {monedas.map(m => <SelectItem key={String(m.id)}>{m.descripcion}</SelectItem>)}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Extrusora" selectedKeys={[String(newExtId)]}
                    onSelectionChange={k => {
                      const extId = parseInt([...k][0] as string)
                      setNewExtId(extId)
                      const primera = lineas.find(l => l.idExtrusora === extId)
                      if (primera) setNewForm(f => ({ ...f, idLinea: primera.id }))
                    }} size="sm">
                    {extrusoras.map(e => <SelectItem key={String(e.id)}>{e.extrusora}</SelectItem>)}
                  </Select>
                  <Select label="Línea" selectedKeys={[String(newForm.idLinea)]}
                    onSelectionChange={k => setNewForm(f => ({ ...f, idLinea: parseInt([...k][0] as string) }))}
                    size="sm">
                    {lineasDeExt(newExtId).map(l => <SelectItem key={String(l.id)}>{l.linea}</SelectItem>)}
                  </Select>
                </div>
                {newForm.pesoMetro > 0 && newForm.longTira > 0 && (
                  <div className="bg-steel-50 dark:bg-steel-800/60 rounded-lg px-4 py-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-steel-400 mb-0.5">Peso de tira completa</p>
                      <p className="font-mono font-semibold text-steel-700 dark:text-steel-200">
                        {(newForm.pesoMetro * newForm.longTira / 1000).toFixed(3)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-steel-400 mb-0.5">Precio de tira completa</p>
                      <p className="font-mono font-semibold text-steel-700 dark:text-steel-200">
                        {formatPesos(toPesos(newForm.precioKg * newForm.pesoMetro * newForm.longTira / 1000, newForm.moneda))}
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancelar</Button>
                <Button color="primary" onPress={() => handleNew(onClose)}
                  isDisabled={!newForm.nroPerfil.trim() || !newForm.descri.trim()}>
                  Crear perfil
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
