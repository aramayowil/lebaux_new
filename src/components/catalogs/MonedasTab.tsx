import { useState, useCallback } from "react";
import {
  Button,
  useDisclosure,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@heroui/react";
import { Plus, TrendingUp, Lock, Unlock, Trash2 } from "lucide-react";
import { useInlineEdit } from "@/hooks/useInlineEdit";
import EditableCell from "@/components/ui/EditableCell";
import EmptyState from "@/components/ui/EmptyState";
import { formatPesos } from "@/lib/calculoDespiece";
import type { Moneda } from "@/types";
// Hooks de React Query
import {
  useMonedas,
  useCreateMoneda,
  useUpdateMoneda,
  useDeleteMoneda,
} from "@/hooks/catalogo/useMonedas";
import { NumberInput } from "@heroui/react";

export default function MonedasTab() {
  // 1. Queries y Mutaciones
  const { data: monedas = [], isLoading } = useMonedas();
  const { mutateAsync: createMoneda } = useCreateMoneda();
  const { mutateAsync: updateMoneda } = useUpdateMoneda();
  const { mutateAsync: deleteMoneda } = useDeleteMoneda();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isEditing, startEdit, cancelEdit, draft, setDraft } = useInlineEdit();

  const [newForm, setNewForm] = useState<Omit<Moneda, "id">>({
    descripcion: "",
    cotizacion: 1,
    simbolo: "$",
    bloqueado: false,
  });

  // 2. Handlers con Mutaciones
  const commit = useCallback(
    async (m: Moneda, field: keyof Moneda, raw: string) => {
      try {
        const value = field === "cotizacion" ? parseFloat(raw) || 1 : raw;
        await updateMoneda({ ...m, [field]: value });
        cancelEdit();
      } catch (error) {
        console.error("Error al actualizar:", error);
      }
    },
    [updateMoneda, cancelEdit],
  );

  async function handleNew(close: () => void) {
    if (!newForm.descripcion.trim()) return;
    try {
      await createMoneda(newForm as Moneda);
      setNewForm({ descripcion: "", cotizacion: 1, bloqueado: false });
      close();
    } catch (error) {
      console.error("Error al crear:", error);
    }
  }

  const toggleLock = async (m: Moneda) => {
    try {
      await updateMoneda({ ...m, bloqueado: !m.bloqueado });
    } catch (error) {
      console.error("Error al cambiar bloqueo:", error);
    }
  };

  // Helper para celdas editables
  const cell = (
    m: Moneda,
    field: keyof Moneda,
    opts?: {
      type?: "text" | "number";
      align?: "left" | "right";
      mono?: boolean;
    },
  ) => (
    <EditableCell
      value={m[field] as string | number}
      isEditing={isEditing(m.id, field)}
      draft={draft}
      onDraftChange={setDraft}
      onStartEdit={() => startEdit(m.id, field, m[field] as string | number)}
      onCommit={(v) => commit(m, field, v)}
      onCancel={cancelEdit}
      type={opts?.type}
      align={opts?.align}
      mono={opts?.mono}
    />
  );

  const baseCurrency = monedas.find((m) => m.cotizacion === 1);

  if (isLoading)
    return <div className="p-8 text-center text-xs">Cargando monedas...</div>;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-steel-700 dark:text-steel-200 text-sm">
            Monedas y cotizaciones
          </h3>
          <p className="text-xs text-steel-400 mt-0.5">
            La cotización se usa para convertir precios a{" "}
            {baseCurrency?.descripcion ?? "pesos"}
          </p>
        </div>
        <Button
          size="sm"
          variant="flat"
          startContent={<Plus className="w-3.5 h-3.5" />}
          onPress={onOpen}
        >
          Nueva moneda
        </Button>
      </div>

      <div className="card-surface overflow-hidden max-w-full">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-steel-200 dark:border-steel-700 bg-steel-50 dark:bg-steel-800/60">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-steel-500 uppercase tracking-wide">
                Moneda
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-steel-500 uppercase tracking-wide w-40">
                Cotización ($)
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-steel-500 uppercase tracking-wide w-50">
                Equivalente
              </th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
            {monedas.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState icon={TrendingUp} title="Sin monedas" />
                </td>
              </tr>
            ) : (
              monedas.map((m) => (
                <tr
                  key={m.id}
                  className={`hover:bg-steel-50/70 dark:hover:bg-steel-800/30 transition-colors ${m.bloqueado ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-1.5">
                    <div className="flex items-center gap-2">
                      {cell(m, "descripcion", { mono: false })}
                      {m.cotizacion === 1 && (
                        <Chip size="sm" color="success" variant="flat">
                          base
                        </Chip>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-1">
                    {m.cotizacion === 1 ? (
                      <span className="text-right block font-mono text-xs text-steel-400">
                        1.00 (base)
                      </span>
                    ) : (
                      cell(m, "cotizacion", {
                        type: "number",
                        align: "right",
                        mono: true,
                      })
                    )}
                  </td>
                  <td className="px-4 py-1.5 text-right">
                    {m.cotizacion > 1 && (
                      <span className="text-xs text-steel-500 font-mono">
                        1 unidad = {formatPesos(m.cotizacion)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1 text-right">
                    <div className="flex gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => toggleLock(m)}
                        isDisabled={m.cotizacion === 1}
                      >
                        {m.bloqueado ? (
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-steel-300" />
                        )}
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => deleteMoneda(m.id)}
                        isDisabled={m.cotizacion === 1}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xs">
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="font-display">Nueva moneda</ModalHeader>
              <ModalBody className="gap-3">
                <Input
                  label="Nombre"
                  placeholder="ej: Dólar USD"
                  value={newForm.descripcion}
                  onValueChange={(v: string) =>
                    setNewForm((f) => ({ ...f, descripcion: v }))
                  }
                  size="sm"
                />
                <NumberInput
                  label="Cotización (en pesos)"
                  value={newForm.cotizacion}
                  onValueChange={(v: number) =>
                    setNewForm((f) => ({
                      ...f,
                      cotizacion: v,
                    }))
                  }
                  size="sm"
                  description="Cuántos $ vale 1 unidad de esta moneda"
                />
                <Input
                  label="Símbolo"
                  placeholder="Ej: $, U$S, €"
                  value={newForm.simbolo}
                  onValueChange={(v: string) =>
                    setNewForm((f) => ({
                      ...f,
                      simbolo: v,
                    }))
                  }
                  size="sm"
                  description="Símbolo de la moneda (Ej: $, U$S, €)"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleNew(onClose)}
                  isDisabled={!newForm.descripcion.trim()}
                >
                  Crear
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
