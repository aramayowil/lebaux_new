import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button, Input, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Chip, useDisclosure,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
} from '@heroui/react'
import { Plus, Search, Folder, Trash2, Pencil, ChevronRight } from 'lucide-react'
import { useObrasStore } from '@/store/obrasStore'
import type { Obra } from '@/types'

export default function ObrasPage() {
  const navigate = useNavigate()
  const { obras, addObra, updateObra, deleteObra } = useObrasStore()
  const [search, setSearch] = useState('')
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [editing, setEditing] = useState<Obra | null>(null)
  const [form, setForm] = useState<Omit<Obra, 'id'>>({
    apellido: '', nombre: '', direccion: '', telefono: '', ciudad: ''
  })

  const filtered = obras.filter(o =>
    `${o.apellido} ${o.nombre} ${o.ciudad}`.toLowerCase().includes(search.toLowerCase())
  )

  function openNew() {
    setEditing(null)
    setForm({ apellido: '', nombre: '', direccion: '', telefono: '', ciudad: '' })
    onOpen()
  }

  function openEdit(o: Obra) {
    setEditing(o)
    setForm({ apellido: o.apellido, nombre: o.nombre, direccion: o.direccion, telefono: o.telefono, ciudad: o.ciudad })
    onOpen()
  }

  function handleSave(close: () => void) {
    if (!form.apellido.trim()) return
    if (editing) {
      updateObra(editing.id, form)
    } else {
      addObra(form)
    }
    close()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-700 text-steel-800 dark:text-steel-100">Obras</h2>
          <p className="text-sm text-steel-400 mt-0.5">{obras.length} proyectos registrados</p>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={openNew}
          size="sm"
        >
          Nueva obra
        </Button>
      </div>

      {/* Buscador */}
      <Input
        placeholder="Buscar por apellido, nombre o ciudad..."
        value={search}
        onValueChange={setSearch}
        startContent={<Search className="w-4 h-4 text-steel-400" />}
        classNames={{ inputWrapper: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 shadow-none' }}
        size="sm"
      />

      {/* Tabla */}
      <div className="card-surface overflow-hidden">
        <Table
          aria-label="Lista de obras"
          removeWrapper
          classNames={{ th: 'bg-steel-50 dark:bg-steel-800/60 text-xs text-steel-500 font-semibold uppercase tracking-wide' }}
        >
          <TableHeader>
            <TableColumn>Cliente</TableColumn>
            <TableColumn>Ciudad</TableColumn>
            <TableColumn>Teléfono</TableColumn>
            <TableColumn>Dirección</TableColumn>
            <TableColumn className="w-24">Acciones</TableColumn>
          </TableHeader>
          <TableBody emptyContent={
            <div className="py-12 text-center text-steel-400">
              <Folder className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No hay obras registradas</p>
            </div>
          }>
            {filtered.map(obra => (
              <TableRow
                key={obra.id}
                className="cursor-pointer hover:bg-steel-50 dark:hover:bg-steel-800/50 transition-colors"
                onClick={() => navigate(`/obras/${obra.id}`)}
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-steel-800 dark:text-steel-100">
                      {obra.apellido}, {obra.nombre}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" classNames={{ base: 'bg-steel-100 dark:bg-steel-800' }}>
                    {obra.ciudad || '—'}
                  </Chip>
                </TableCell>
                <TableCell className="text-steel-500 text-sm">{obra.telefono || '—'}</TableCell>
                <TableCell className="text-steel-500 text-sm max-w-xs truncate">{obra.direccion || '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <Button isIconOnly size="sm" variant="light" onPress={() => openEdit(obra)}>
                      <Pencil className="w-3.5 h-3.5 text-steel-400" />
                    </Button>
                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => deleteObra(obra.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button isIconOnly size="sm" variant="light" onPress={() => navigate(`/obras/${obra.id}`)}>
                      <ChevronRight className="w-3.5 h-3.5 text-steel-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-display">
                {editing ? 'Editar obra' : 'Nueva obra'}
              </ModalHeader>
              <ModalBody className="gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Apellido"
                    value={form.apellido}
                    onValueChange={v => setForm(f => ({ ...f, apellido: v }))}
                    isRequired
                    size="sm"
                  />
                  <Input
                    label="Nombre"
                    value={form.nombre}
                    onValueChange={v => setForm(f => ({ ...f, nombre: v }))}
                    size="sm"
                  />
                </div>
                <Input
                  label="Dirección"
                  value={form.direccion}
                  onValueChange={v => setForm(f => ({ ...f, direccion: v }))}
                  size="sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Ciudad"
                    value={form.ciudad}
                    onValueChange={v => setForm(f => ({ ...f, ciudad: v }))}
                    size="sm"
                  />
                  <Input
                    label="Teléfono"
                    value={form.telefono}
                    onValueChange={v => setForm(f => ({ ...f, telefono: v }))}
                    size="sm"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancelar</Button>
                <Button color="primary" onPress={() => handleSave(onClose)}>
                  {editing ? 'Guardar cambios' : 'Crear obra'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
