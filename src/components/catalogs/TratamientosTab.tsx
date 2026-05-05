import { useState, useCallback } from "react";
import {
  Button,
  Select,
  SelectItem,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@heroui/react";
import { Trash2, Palette } from "lucide-react";
import { useCatalogosStore } from "@/store/catalogosStore";
import { useInlineEdit } from "@/hooks/useInlineEdit";
import EditableCell from "@/components/ui/EditableCell";
import CatalogToolbar from "@/components/ui/CatalogToolbar";
import EmptyState from "@/components/ui/EmptyState";
import { formatPesos } from "@/lib/calculoDespiece";
import type { Tratamiento } from "@/types";
import {
  useCreateTratamiento,
  useDeleteTratamiento,
  useTratamientos,
  useUpdateTratamiento,
} from "@/hooks/catalogo/useTratamientos";
import { useMonedas } from "@/hooks/catalogo/useMonedas";

const BLANK: Omit<Tratamiento, "id"> = {
  descripcion: "",
  precio_por_kilo: 0,
  color: "#9fb3c8",
  id_moneda: 1, // Asegúrate de usar id_moneda si así está en tu DB
  bloqueado: false,
};

export default function TratamientosTab() {
  const { data: tratamientos = [] } = useTratamientos();
  const { data: monedas = [] } = useMonedas();

  const { mutateAsync: createTratamiento } = useCreateTratamiento();
  const { mutateAsync: deleteTratamiento } = useDeleteTratamiento();
  const { mutateAsync: updateTratamiento } = useUpdateTratamiento();

  const { toPesos } = useCatalogosStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Usamos el ID numérico para rastrear la edición
  const { isEditing, startEdit, cancelEdit, draft, setDraft } = useInlineEdit();

  const [search, setSearch] = useState("");
  const [newForm, setNewForm] = useState<Omit<Tratamiento, "id">>(BLANK);

  const filtered = tratamientos.filter((t) =>
    t.descripcion.toLowerCase().includes(search.toLowerCase()),
  );

  const commit = useCallback(
    (t: Tratamiento, field: keyof Tratamiento, raw: string) => {
      const numFields: (keyof Tratamiento)[] = ["precio_por_kilo", "id_moneda"];
      const value = numFields.includes(field) ? parseFloat(raw) || 0 : raw;

      // CAMBIO: Llamamos a la mutación para persistir en la DB
      updateTratamiento({ ...t, [field]: value });
      cancelEdit();
    },
    [updateTratamiento, cancelEdit],
  );

  const cell = (
    t: Tratamiento,
    field: keyof Tratamiento,
    opts?: {
      type?: "text" | "number";
      align?: "left" | "right";
      mono?: boolean;
    },
  ) => (
    <EditableCell
      value={t[field] as string | number}
      isEditing={isEditing(t.id, field)}
      draft={draft}
      onDraftChange={setDraft}
      onStartEdit={() => startEdit(t.id, field, t[field] as string | number)}
      onCommit={(v) => commit(t, field, v)}
      onCancel={cancelEdit}
      type={opts?.type}
      align={opts?.align}
      mono={opts?.mono}
    />
  );

  function handleNew(close: () => void) {
    if (!newForm.descripcion.trim()) return;
    createTratamiento(newForm);
    setNewForm(BLANK);
    close();
  }

  return (
    <>
      <CatalogToolbar
        search={search}
        onSearch={setSearch}
        onNew={onOpen}
        newLabel="Nuevo tratamiento"
        placeholder="Buscar tratamiento..."
      />

      <p className="text-xs text-steel-400 mb-2">
        {filtered.length} tratamiento{filtered.length !== 1 ? "s" : ""}
        <span className="ml-2 text-steel-300 dark:text-steel-600">
          · Hacé click para editar
        </span>
      </p>

      <div className="card-surface overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-steel-200 dark:border-steel-700 bg-steel-50 dark:bg-steel-800/60">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-steel-500 uppercase tracking-wide w-14">
                Color
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-steel-500 uppercase tracking-wide">
                Descripción
              </th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-steel-500 uppercase tracking-wide w-32">
                $/kg
              </th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-steel-500 uppercase tracking-wide w-32">
                $/kg (ARS)
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState icon={Palette} title="Sin tratamientos" />
                </td>
              </tr>
            )}
            {filtered.map((t) => (
              <tr
                key={t.id}
                className={`hover:bg-steel-50/70 dark:hover:bg-steel-800/30 transition-colors group ${t.bloqueado ? "opacity-50" : ""}`}
              >
                <td className="px-3 py-1.5">
                  <label
                    className="cursor-pointer block w-8 h-8 rounded-lg border-2 border-steel-200 dark:border-steel-600 shadow-sm hover:scale-110 transition-transform"
                    style={{ background: t.color }}
                    title={t.color}
                  >
                    <input
                      type="color"
                      value={t.color}
                      // CAMBIO: Al cambiar el color, disparamos la mutación directamente
                      onChange={(e) =>
                        updateTratamiento({ ...t, color: e.target.value })
                      }
                      className="sr-only"
                    />
                  </label>
                </td>
                <td className="px-3 py-1 min-w-[200px]">
                  {cell(t, "descripcion")}
                </td>
                <td className="px-3 py-1">
                  {cell(t, "precio_por_kilo", {
                    type: "number",
                    align: "right",
                    mono: true,
                  })}
                </td>
                <td className="px-3 py-1.5 text-right">
                  {/* Asegúrate de que el campo en el objeto sea t.id_moneda o t.moneda según tu tipo */}
                  <span className="currency-badge">
                    {formatPesos(toPesos(t.precio_por_kilo, t.id_moneda))}
                    /kg
                  </span>
                </td>
                <td className="px-2 py-1">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onPress={() => deleteTratamiento(t.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="font-display">
                Nuevo tratamiento
              </ModalHeader>
              <ModalBody className="gap-3">
                <Input
                  label="Descripción *"
                  value={newForm.descripcion}
                  onValueChange={(v: string) =>
                    setNewForm((f) => ({ ...f, descripcion: v }))
                  }
                  size="sm"
                  placeholder="ej: Anodizado negro"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Precio / kg"
                    type="number"
                    value={String(newForm.precio_por_kilo)}
                    onValueChange={(v: string) =>
                      setNewForm((f) => ({
                        ...f,
                        precio_por_kilo: parseFloat(v) || 0,
                      }))
                    }
                    size="sm"
                  />
                  <Select
                    label="Moneda"
                    selectedKeys={[String(newForm.id_moneda)]}
                    onSelectionChange={(k: any) => {
                      const val = parseInt([...k][0] as string);
                      setNewForm((f) => ({
                        ...f,
                        id_moneda: val,
                        moneda: val,
                      }));
                    }}
                    size="sm"
                  >
                    {monedas.map((m) => (
                      <SelectItem key={String(m.id)}>
                        {m.descripcion}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-steel-500 mb-1.5">
                      Color de referencia
                    </p>
                    <label
                      className="cursor-pointer block w-10 h-10 rounded-xl border-2 border-steel-200 shadow-sm"
                      style={{ background: newForm.color }}
                    >
                      <input
                        type="color"
                        value={newForm.color}
                        onChange={(e) =>
                          setNewForm((f) => ({ ...f, color: e.target.value }))
                        }
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Hex"
                      value={newForm.color}
                      onValueChange={(v: string) =>
                        setNewForm((f) => ({ ...f, color: v }))
                      }
                      size="sm"
                      classNames={{ inputWrapper: "font-mono" }}
                    />
                  </div>
                </div>
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
