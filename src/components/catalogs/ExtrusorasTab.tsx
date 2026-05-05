import { useState, useCallback, useEffect } from "react";
import {
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@heroui/react";
import {
  Trash2,
  Plus,
  Factory,
  Lock,
  Unlock,
  ChevronRight,
} from "lucide-react";
import { useInlineEdit } from "@/hooks/useInlineEdit";
import EditableCell from "@/components/ui/EditableCell";
import EmptyState from "@/components/ui/EmptyState";
import type { Extrusora, Linea } from "@/types";
import clsx from "clsx";
// Importamos todos los hooks necesarios
import {
  useExtrusoras,
  useUpdateExtrusora,
  useDeleteExtrusora,
  useCreateExtrusora,
} from "@/hooks/catalogo/useExtrusoras";
import {
  useLineas,
  useUpdateLinea,
  useDeleteLinea,
  useCreateLinea,
} from "@/hooks/catalogo/useLineas";

export default function ExtrusorasTab() {
  // 1. Queries
  const { data: extrusoras = [], isLoading: isLoadingExt } = useExtrusoras();
  const { data: lineas = [], isLoading: isLoadingLin } = useLineas();

  // 2. Mutations (Hooks)
  const { mutateAsync: createExtrusora } = useCreateExtrusora();
  const { mutateAsync: updateExtrusora } = useUpdateExtrusora();
  const { mutateAsync: deleteExtrusora } = useDeleteExtrusora();

  const { mutateAsync: createLinea } = useCreateLinea();
  const { mutateAsync: updateLinea } = useUpdateLinea();
  const { mutateAsync: deleteLinea } = useDeleteLinea();

  // 3. States & Disclosures
  const {
    isOpen: isOpenExt,
    onOpen: onOpenExt,
    onOpenChange: onOpenChangeExt,
  } = useDisclosure();
  const {
    isOpen: isOpenLin,
    onOpen: onOpenLin,
    onOpenChange: onOpenChangeLin,
  } = useDisclosure();

  const extEdit = useInlineEdit();
  const lineEdit = useInlineEdit();

  const [selectedExt, setSelectedExt] = useState<number | null>(null);
  const [newExtName, setNewExtName] = useState("");
  const [newLinName, setNewLinName] = useState("");

  // Efecto para seleccionar la primera extrusora por defecto al cargar
  useEffect(() => {
    if (extrusoras.length > 0 && selectedExt === null) {
      setSelectedExt(extrusoras[0].id);
    }
  }, [extrusoras, selectedExt]);

  const extSel = extrusoras.find((e) => e.id === selectedExt);
  const lineasDeExt = lineas.filter((l) => l.id_extrusora === selectedExt);

  // 4. Handlers (Usando las mutaciones de los hooks)

  const commitExt = useCallback(
    async (e: Extrusora, field: keyof Extrusora, raw: string) => {
      await updateExtrusora({ ...e, [field]: raw });
      extEdit.cancelEdit();
    },
    [updateExtrusora, extEdit],
  );

  const commitLin = useCallback(
    async (l: Linea, field: keyof Linea, raw: string) => {
      await updateLinea({ ...l, [field]: raw });
      lineEdit.cancelEdit();
    },
    [updateLinea, lineEdit],
  );

  async function handleAddExtrusora(close: () => void) {
    try {
      await createExtrusora({
        extrusora: newExtName.trim(),
        bloqueado: false,
      });
      setNewExtName("");
      close();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function handleAddLinea(close: () => void) {
    if (!selectedExt) return;
    try {
      await createLinea({
        linea: newLinName.trim(),
        bloqueado: false,
        id_extrusora: selectedExt,
      });
      setNewLinName("");
      close();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function handleDeleteExtrusora(e: Extrusora) {
    if (selectedExt === e.id) {
      const otra = extrusoras.find((x) => x.id !== e.id);
      setSelectedExt(otra ? otra.id : null);
    }
    deleteExtrusora(e.id);
  }

  const toggleExtLock = (e: Extrusora) =>
    updateExtrusora({ ...e, bloqueado: !e.bloqueado });
  const toggleLinLock = (l: Linea) =>
    updateLinea({ ...l, bloqueado: !l.bloqueado });

  if (isLoadingExt || isLoadingLin)
    return <div className="p-8 text-center text-xs">Cargando catálogo...</div>;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[1fr_1fr] gap-4 min-h-[420px]">
        {/* Master: Extrusoras */}
        <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-steel-200 dark:border-steel-800 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-steel-50 dark:bg-steel-900/40 border-b border-steel-100 dark:border-steel-800">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-lebaux-amber" />
              <span className="text-[10px] font-bold text-steel-500 uppercase tracking-widest">
                Extrusoras
              </span>
              <span className="text-[9px] font-mono text-steel-400 bg-steel-100 dark:bg-steel-800 px-1.5 py-0.5 rounded">
                {extrusoras.length}
              </span>
            </div>
            <button
              onClick={onOpenExt}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-lebaux-amber hover:bg-lebaux-amber-hover text-white transition-colors"
            >
              <Plus className="w-3 h-3" /> Nueva
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {extrusoras.length === 0 ? (
              <div className="py-8">
                <EmptyState icon={Factory} title="Sin extrusoras" />
              </div>
            ) : (
              <ul className="divide-y divide-steel-50 dark:divide-steel-800/60">
                {extrusoras.map((e) => {
                  const nL = lineas.filter(
                    (l) => l.id_extrusora === e.id,
                  ).length;
                  const isSel = selectedExt === e.id;
                  return (
                    <li
                      key={e.id}
                      onClick={() => setSelectedExt(e.id)}
                      className={clsx(
                        "group relative flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-all",
                        isSel
                          ? "bg-lebaux-amber/10"
                          : "hover:bg-steel-50 dark:hover:bg-steel-800/40",
                      )}
                    >
                      {isSel && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-lebaux-amber" />
                      )}
                      <Factory
                        className={clsx(
                          "w-3.5 h-3.5 shrink-0",
                          isSel ? "text-lebaux-amber" : "text-steel-300",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <EditableCell
                          value={e.extrusora}
                          isEditing={extEdit.isEditing(e.id, "extrusora")}
                          draft={extEdit.draft}
                          onDraftChange={extEdit.setDraft}
                          onStartEdit={() =>
                            extEdit.startEdit(e.id, "extrusora", e.extrusora)
                          }
                          onCommit={(v) => commitExt(e, "extrusora", v)}
                          onCancel={extEdit.cancelEdit}
                          className={clsx(
                            "text-sm",
                            isSel
                              ? "font-semibold text-steel-800 dark:text-steel-100"
                              : "text-steel-600",
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span
                          className={clsx(
                            "text-[9px] font-mono px-1.5 py-0.5 rounded",
                            isSel
                              ? "bg-lebaux-amber/15 text-lebaux-amber"
                              : "bg-steel-100 text-steel-400",
                          )}
                        >
                          {nL}L
                        </span>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            toggleExtLock(e);
                          }}
                          className="p-1 hover:text-lebaux-amber"
                        >
                          {e.bloqueado ? (
                            <Lock className="w-3 h-3 text-lebaux-amber" />
                          ) : (
                            <Unlock className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleDeleteExtrusora(e);
                          }}
                          className="p-1 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {isSel && (
                        <ChevronRight className="w-3.5 h-3.5 text-lebaux-amber" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Detail: Líneas */}
        <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-steel-200 dark:border-steel-800 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-steel-50 dark:bg-steel-900/40 border-b border-steel-100 dark:border-steel-800">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-blue-400" />
              <span className="text-[10px] font-bold text-steel-500 uppercase tracking-widest">
                Líneas de
              </span>
              <span className="text-[11px] font-bold text-lebaux-amber">
                {extSel?.extrusora ?? "—"}
              </span>
            </div>
            <button
              onClick={onOpenLin}
              disabled={!selectedExt}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-lebaux-amber text-white disabled:opacity-40"
            >
              <Plus className="w-3 h-3" /> Nueva línea
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {lineasDeExt.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  icon={Factory}
                  title="Sin líneas"
                  description={
                    extSel
                      ? `Agregá líneas para ${extSel.extrusora}`
                      : "Seleccioná una extrusora"
                  }
                />
              </div>
            ) : (
              <ul className="divide-y divide-steel-50 dark:divide-steel-800/60">
                {lineasDeExt.map((l) => (
                  <li
                    key={l.id}
                    className="group flex items-center gap-3 px-4 py-2.5 hover:bg-steel-50 dark:hover:bg-steel-800/40 transition-all"
                  >
                    <div
                      className={clsx(
                        "w-1.5 h-1.5 rounded-full",
                        l.bloqueado ? "bg-lebaux-amber" : "bg-steel-200",
                      )}
                    />
                    <div className="flex-1">
                      <EditableCell
                        value={l.linea}
                        isEditing={lineEdit.isEditing(l.id, "linea")}
                        draft={lineEdit.draft}
                        onDraftChange={lineEdit.setDraft}
                        onStartEdit={() =>
                          lineEdit.startEdit(l.id, "linea", l.linea)
                        }
                        onCommit={(v) => commitLin(l, "linea", v)}
                        onCancel={lineEdit.cancelEdit}
                        className="text-sm font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleLinLock(l)}
                        className="p-1 hover:text-lebaux-amber"
                      >
                        {l.bloqueado ? (
                          <Lock className="w-3 h-3 text-lebaux-amber" />
                        ) : (
                          <Unlock className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteLinea(l.id)}
                        className="p-1 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <Modal isOpen={isOpenExt} onOpenChange={onOpenChangeExt} size="xs">
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="text-sm">Nueva extrusora</ModalHeader>
              <ModalBody>
                <Input
                  label="Nombre"
                  placeholder="Ej: Aluar, Hydro, Elypson"
                  value={newExtName}
                  onValueChange={setNewExtName}
                  size="sm"
                  autoFocus
                />
              </ModalBody>
              <ModalFooter>
                <button onClick={onClose} className="text-xs text-steel-500">
                  Cancelar
                </button>
                <button
                  onClick={() => handleAddExtrusora(onClose)}
                  disabled={!newExtName.trim()}
                  className="px-4 py-1.5 rounded-full text-xs bg-lebaux-amber text-white"
                >
                  Crear
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenLin} onOpenChange={onOpenChangeLin} size="xs">
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="text-sm">
                Nueva línea —{" "}
                <span className="text-lebaux-amber">{extSel?.extrusora}</span>
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Nombre"
                  placeholder="Ej: Modena, A30, Rotonda"
                  value={newLinName}
                  onValueChange={setNewLinName}
                  size="sm"
                  autoFocus
                />
              </ModalBody>
              <ModalFooter>
                <button onClick={onClose} className="text-xs text-steel-500">
                  Cancelar
                </button>
                <button
                  onClick={() => handleAddLinea(onClose)}
                  disabled={!newLinName.trim()}
                  className="px-4 py-1.5 rounded-full text-xs bg-lebaux-amber text-white"
                >
                  Crear
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
