import { useState, useCallback } from 'react'
import {
  Button, useDisclosure, Chip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input,
} from '@heroui/react'
import { Trash2, Plus, Factory, Lock, Unlock } from 'lucide-react'
import { useCatalogosStore } from '@/store/catalogosStore'
import { useInlineEdit } from '@/hooks/useInlineEdit'
import EditableCell from '@/components/ui/EditableCell'
import EmptyState from '@/components/ui/EmptyState'
import type { Extrusora, Linea } from '@/types'

let nextExtId  = 20
let nextLineId = 20

export default function ExtrusorasTab() {
  const { extrusoras, lineas, setExtrusora, setLinea } = useCatalogosStore()
  const { isOpen: isOpenExt, onOpen: onOpenExt, onOpenChange: onOpenChangeExt } = useDisclosure()
  const { isOpen: isOpenLin, onOpen: onOpenLin, onOpenChange: onOpenChangeLin } = useDisclosure()

  const extEdit  = useInlineEdit()
  const lineEdit = useInlineEdit()

  const [selectedExt, setSelectedExt] = useState<number>(extrusoras[0]?.id ?? 1)
  const [newExtName,  setNewExtName]  = useState('')
  const [newLinName,  setNewLinName]  = useState('')

  const lineasDeExt = lineas.filter(l => l.idExtrusora === selectedExt)

  // Inline extrusora
  const commitExt = useCallback((e: Extrusora, field: keyof Extrusora, raw: string) => {
    setExtrusora({ ...e, [field]: raw })
    extEdit.cancelEdit()
  }, [setExtrusora, extEdit])

  // Inline linea
  const commitLin = useCallback((l: Linea, field: keyof Linea, raw: string) => {
    setLinea({ ...l, [field]: raw })
    lineEdit.cancelEdit()
  }, [setLinea, lineEdit])

  function addExtrusora(close: () => void) {
    if (!newExtName.trim()) return
    setExtrusora({ id: ++nextExtId, extrusora: newExtName.trim(), bloqueado: false })
    setNewExtName('')
    close()
  }

  function addLinea(close: () => void) {
    if (!newLinName.trim()) return
    setLinea({ id: ++nextLineId, idExtrusora: selectedExt, linea: newLinName.trim(), bloqueado: false })
    setNewLinName('')
    close()
  }

  const toggleExtLock = (e: Extrusora) => setExtrusora({ ...e, bloqueado: !e.bloqueado })
  const toggleLinLock = (l: Linea)    => setLinea({ ...l, bloqueado: !l.bloqueado })

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* ── Panel extrusoras ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-steel-700 dark:text-steel-200 text-sm">Extrusoras / Fabricantes</h3>
          <Button size="sm" variant="flat" startContent={<Plus className="w-3 h-3" />} onPress={onOpenExt}>
            Nueva
          </Button>
        </div>

        <div className="card-surface overflow-hidden">
          {extrusoras.length === 0
            ? <EmptyState icon={Factory} title="Sin extrusoras" />
            : (
              <ul className="divide-y divide-steel-100 dark:divide-steel-800">
                {extrusoras.map(e => (
                  <li
                    key={e.id}
                    onClick={() => setSelectedExt(e.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors ${
                      selectedExt === e.id
                        ? 'bg-steel-100 dark:bg-steel-800'
                        : 'hover:bg-steel-50 dark:hover:bg-steel-800/40'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <EditableCell
                        value={e.extrusora}
                        isEditing={extEdit.isEditing(e.id, 'extrusora')}
                        draft={extEdit.draft}
                        onDraftChange={extEdit.setDraft}
                        onStartEdit={() => extEdit.startEdit(e.id, 'extrusora', e.extrusora)}
                        onCommit={v => commitExt(e, 'extrusora', v)}
                        onCancel={extEdit.cancelEdit}
                        className="font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Chip size="sm" variant="flat" classNames={{ base: 'bg-steel-100 dark:bg-steel-800' }}>
                        {lineas.filter(l => l.idExtrusora === e.id).length} líneas
                      </Chip>
                      <Button isIconOnly size="sm" variant="light"
                        onPress={() => toggleExtLock(e)}
                        onClick={ev => ev.stopPropagation()}>
                        {e.bloqueado
                          ? <Lock className="w-3 h-3 text-amber-500" />
                          : <Unlock className="w-3 h-3 text-steel-300" />}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </div>
      </div>

      {/* ── Panel líneas ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-steel-700 dark:text-steel-200 text-sm">
            Líneas de{' '}
            <span className="text-steel-500">{extrusoras.find(e => e.id === selectedExt)?.extrusora ?? '?'}</span>
          </h3>
          <Button size="sm" variant="flat" startContent={<Plus className="w-3 h-3" />}
            onPress={onOpenLin} isDisabled={!selectedExt}>
            Nueva línea
          </Button>
        </div>

        <div className="card-surface overflow-hidden">
          {lineasDeExt.length === 0
            ? <EmptyState icon={Factory} title="Sin líneas" description="Seleccioná una extrusora y agregá líneas" />
            : (
              <ul className="divide-y divide-steel-100 dark:divide-steel-800">
                {lineasDeExt.map(l => (
                  <li key={l.id} className="flex items-center gap-2 px-4 py-2.5 group hover:bg-steel-50 dark:hover:bg-steel-800/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <EditableCell
                        value={l.linea}
                        isEditing={lineEdit.isEditing(l.id, 'linea')}
                        draft={lineEdit.draft}
                        onDraftChange={lineEdit.setDraft}
                        onStartEdit={() => lineEdit.startEdit(l.id, 'linea', l.linea)}
                        onCommit={v => commitLin(l, 'linea', v)}
                        onCancel={lineEdit.cancelEdit}
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button isIconOnly size="sm" variant="light" onPress={() => toggleLinLock(l)}>
                        {l.bloqueado
                          ? <Lock className="w-3 h-3 text-amber-500" />
                          : <Unlock className="w-3 h-3 text-steel-300 group-hover:text-steel-400" />}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </div>
      </div>

      {/* Modal nueva extrusora */}
      <Modal isOpen={isOpenExt} onOpenChange={onOpenChangeExt} size="xs">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-display">Nueva extrusora</ModalHeader>
              <ModalBody>
                <Input label="Nombre" placeholder="ej: Aluar"
                  value={newExtName} onValueChange={setNewExtName} size="sm"
                  autoFocus onKeyDown={e => e.key === 'Enter' && addExtrusora(onClose)} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancelar</Button>
                <Button color="primary" onPress={() => addExtrusora(onClose)}
                  isDisabled={!newExtName.trim()}>Crear</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal nueva línea */}
      <Modal isOpen={isOpenLin} onOpenChange={onOpenChangeLin} size="xs">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-display">Nueva línea</ModalHeader>
              <ModalBody>
                <Input label="Nombre de la línea" placeholder="ej: Modena"
                  value={newLinName} onValueChange={setNewLinName} size="sm"
                  autoFocus onKeyDown={e => e.key === 'Enter' && addLinea(onClose)} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancelar</Button>
                <Button color="primary" onPress={() => addLinea(onClose)}
                  isDisabled={!newLinName.trim()}>Crear</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
