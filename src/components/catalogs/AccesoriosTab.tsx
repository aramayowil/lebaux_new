import { useState, useCallback, useEffect } from "react";
import {
  Button,
  Select,
  SelectItem,
  useDisclosure,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@heroui/react";
import { Trash2, Wrench } from "lucide-react";
import { useCatalogosStore } from "@/store/catalogosStore";
import { useInlineEdit } from "@/hooks/useInlineEdit";
import EditableCell from "@/components/ui/EditableCell";
import CatalogToolbar from "@/components/ui/CatalogToolbar";
import EmptyState from "@/components/ui/EmptyState";
import type { Accesorio } from "@/types";
import {
  useAccesorios,
  useCreateAccesorio,
  useDeleteAccesorio,
  useUpdateAccesorio,
} from "@/hooks/catalogo/useAccesorios";
import { useMonedas } from "@/hooks/catalogo/useMonedas";
import { formatPesos } from "@/lib/calculoDespiece";
import { Skeleton } from "@heroui/react";

export default function AccesoriosTab() {
  // 1. Data Fetching
  const { data: accesorios = [], isLoading: isLoadingAccesorios } =
    useAccesorios();
  const { data: monedas = [] } = useMonedas();

  // 2. Mutations
  const { mutateAsync: createAccesorio } = useCreateAccesorio();
  const { mutateAsync: updateAccesorio } = useUpdateAccesorio();
  const { mutateAsync: deleteAccesorio } = useDeleteAccesorio();

  const toPesos = useCatalogosStore((s) => s.toPesos);

  const BLANK: Omit<Accesorio, "id"> = {
    cod_parte: "",
    descri: "",
    precio: 0,
    unidad: 0,
    id_moneda: monedas[0]?.id ?? 1,
  };

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isEditing, startEdit, cancelEdit, draft, setDraft } = useInlineEdit();

  const [search, setSearch] = useState("");
  const [filterUnidad, setFilterUnidad] = useState<string>("all");
  const [newForm, setNewForm] = useState<Omit<Accesorio, "id">>(BLANK);

  // Efecto para resetear el id_moneda cuando las monedas cargan
  useEffect(() => {
    if (monedas.length > 0 && !newForm.id_moneda) {
      setNewForm((prev) => ({ ...prev, id_moneda: monedas[0].id }));
    }
  }, [monedas]);

  const filtered = accesorios.filter((a) => {
    const matchSearch = `${a.cod_parte} ${a.descri}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchUnidad =
      filterUnidad === "all" || String(a.unidad) === filterUnidad;
    return matchSearch && matchUnidad;
  });

  // 3. Lógica de Actualización (Commit)
  const commit = useCallback(
    async (a: Accesorio, field: keyof Accesorio, raw: string) => {
      const value = field === "precio" ? parseFloat(raw) || 0 : raw;
      const updatedData = { ...a, [field]: value };

      try {
        await updateAccesorio(updatedData);
      } catch (err) {
        console.error("Error al actualizar:", err);
      } finally {
        cancelEdit();
      }
    },
    [updateAccesorio, cancelEdit],
  );

  const cell = (
    a: Accesorio,
    field: keyof Accesorio,
    opts?: {
      type?: "text" | "number";
      align?: "left" | "right";
      mono?: boolean;
    },
  ) => (
    <EditableCell
      value={a[field] as string | number}
      isEditing={isEditing(a.cod_parte, field)}
      draft={draft}
      onDraftChange={setDraft}
      onStartEdit={() =>
        startEdit(a.cod_parte, field, a[field] as string | number)
      }
      onCommit={(v) => commit(a, field, v)}
      onCancel={cancelEdit}
      type={opts?.type}
      align={opts?.align}
      mono={opts?.mono}
    />
  );

  // 4. Lógica de Creación
  async function handleNew(close: () => void) {
    if (!newForm.cod_parte.trim() || !newForm.descri.trim()) return;
    try {
      await createAccesorio(newForm);
      setNewForm(BLANK);
      close();
    } catch (err) {
      console.error("Error al crear:", err);
    }
  }

  const unidadBadge = (u: number) => (
    <Chip
      size="sm"
      variant="flat"
      classNames={{
        base:
          u === 1
            ? "bg-blue-50 dark:bg-blue-950/40"
            : "bg-steel-100 dark:bg-steel-800",
      }}
    >
      {u === 1 ? "Metro" : "Unidad"}
    </Chip>
  );

  return (
    <>
      <CatalogToolbar
        search={search}
        onSearch={setSearch}
        onNew={onOpen}
        newLabel="Nuevo accesorio"
        placeholder="Buscar por código o descripción..."
        extra={
          <Select
            size="sm"
            className="w-42"
            selectedKeys={[filterUnidad]}
            onSelectionChange={(k: any) =>
              setFilterUnidad(String(Array.from(k)[0]))
            }
            aria-label="Tipo de unidad"
            classNames={{
              trigger:
                "bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-8 min-h-unit-8",
            }}
          >
            <SelectItem key="all">Todas las unidades</SelectItem>
            <SelectItem key="0">Por unidad / bolsa</SelectItem>
            <SelectItem key="1">Por metro lineal</SelectItem>
          </Select>
        }
      />

      <p className="text-xs text-steel-400 mb-2">
        {isLoadingAccesorios
          ? "Cargando..."
          : `${filtered.length} accesorio${filtered.length !== 1 ? "s" : ""}`}
        <span className="ml-2 text-steel-300 dark:text-steel-600">
          · Hacé click en cualquier celda para editar
        </span>
      </p>

      <div className="card-surface overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-steel-200 dark:border-steel-700 bg-steel-50 dark:bg-steel-800/60">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-steel-500 uppercase w-32">
                Código
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-steel-500 uppercase">
                Descripción
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-steel-500 uppercase w-28">
                Unidad
              </th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-steel-500 uppercase w-32">
                Precio Orig.
              </th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-steel-500 uppercase w-32">
                Precio ($)
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
            {isLoadingAccesorios
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[0, 1, 2, 3, 4].map((col) => (
                      <td key={col} className="px-3 py-3">
                        <Skeleton className="h-4 w-full rounded-md" />
                      </td>
                    ))}
                    <td className="px-2 py-3 text-center">
                      <Skeleton className="w-6 h-6 rounded-md" />
                    </td>
                  </tr>
                ))
              : null}
            {filtered.length === 0 && !isLoadingAccesorios && (
              <tr>
                <td colSpan={6}>
                  <EmptyState icon={Wrench} title="Sin accesorios" />
                </td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr
                key={a.id}
                className="hover:bg-steel-50/70 dark:hover:bg-steel-800/30 transition-colors group"
              >
                <td className="px-3 py-1">
                  <span className="font-mono bg-steel-100 dark:bg-steel-800 text-steel-600 dark:text-steel-300 py-2">
                    {cell(a, "cod_parte", { type: "text", align: "left" })}
                  </span>
                </td>
                <td className="px-3 py-1 min-w-[200px]">{cell(a, "descri")}</td>
                <td className="px-3 py-1.5 text-center">
                  {unidadBadge(a.unidad)}
                </td>
                <td className="px-3 py-1">
                  {cell(a, "precio", {
                    type: "number",
                    align: "right",
                    mono: true,
                  })}
                </td>
                <td className="px-3 py-1.5 text-right">
                  <span className="currency-badge">
                    {formatPesos(toPesos(a.precio, a.id_moneda))}
                  </span>
                </td>
                <td className="px-2 py-1">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onPress={() => deleteAccesorio(a.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Creación */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="font-display">
                Nuevo accesorio
              </ModalHeader>
              <ModalBody className="gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Código *"
                    placeholder="ej: TIR-001"
                    value={newForm.cod_parte}
                    onValueChange={(v: string) =>
                      setNewForm((f) => ({ ...f, cod_parte: v }))
                    }
                    size="sm"
                  />
                  <Select
                    label="Unidad"
                    selectedKeys={[String(newForm.unidad)]}
                    onSelectionChange={(k: any) =>
                      setNewForm((f) => ({
                        ...f,
                        unidad: Number(Array.from(k)[0]) as 0 | 1,
                      }))
                    }
                    size="sm"
                  >
                    <SelectItem key="0">Unidad / Bolsa</SelectItem>
                    <SelectItem key="1">Metro lineal</SelectItem>
                  </Select>
                </div>
                <Input
                  label="Descripción *"
                  value={newForm.descri}
                  onValueChange={(v: string) =>
                    setNewForm((f) => ({ ...f, descri: v }))
                  }
                  size="sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Precio"
                    type="number"
                    value={String(newForm.precio)}
                    onValueChange={(v: string) =>
                      setNewForm((f) => ({ ...f, precio: parseFloat(v) || 0 }))
                    }
                    size="sm"
                  />
                  <Select
                    label="Moneda"
                    selectedKeys={[String(newForm.id_moneda)]}
                    onSelectionChange={(k: any) =>
                      setNewForm((f) => ({
                        ...f,
                        id_moneda: Number(Array.from(k)[0]),
                      }))
                    }
                    size="sm"
                  >
                    {monedas.map((m) => (
                      <SelectItem key={String(m.id)}>
                        {m.descripcion}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={() => handleNew(onClose)}>
                  Crear accesorio
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
