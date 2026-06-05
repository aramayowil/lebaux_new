import { useState, useCallback } from "react";
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
import { Trash2, Square } from "lucide-react";
import { useInlineEdit } from "@/hooks/useInlineEdit";
import EditableCell from "@/components/ui/EditableCell";
import CatalogToolbar from "@/components/ui/CatalogToolbar";
import EmptyState from "@/components/ui/EmptyState";
import { formatPesos } from "@/lib/calculoDespiece";
import type { Vidrio } from "@/types";
import {
  useCreateVidrio,
  useDeleteVidrio,
  useUpdateVidrio,
  useVidrios,
} from "@/hooks/catalogo/useVidrios";
import { useMonedas } from "@/hooks/catalogo/useMonedas";
import { useTiposInteriores } from "@/hooks/catalogo/useTiposInteriores";
import { capitalizeFirstLetter } from "@/utils/capitalize";

// Helpers para conversión de colores (Access BGR <-> CSS Hex)
function rgbNumToHex(n: number): string {
  if (!n && n !== 0) return "#ffffff";
  const r = n & 0xff;
  const g = (n >> 8) & 0xff;
  const b = (n >> 16) & 0xff;
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function hexToRgbNum(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return r | (g << 8) | (b << 16);
}

const BLANK: Omit<Vidrio, "id"> = {
  codigo: "",
  descri: "",
  precio: 0,
  base: 3600,
  altura: 2500,
  espesor: 4,
  tipo_rev: 1,
  id_moneda: 1,
  color: 16575173, // rgb(159 157 165)
  bloqueado: false,
};

export default function VidriosTab() {
  const { data: vidrios = [] } = useVidrios();
  const { data: monedas = [] } = useMonedas();
  const { data: tiposInterior = [] } = useTiposInteriores();

  const { mutateAsync: createVidrio } = useCreateVidrio();
  const { mutateAsync: updateVidrio } = useUpdateVidrio();
  const { mutateAsync: deleteVidrio } = useDeleteVidrio();

  const toPesos = (precio: number, monedaId: number) => {
    const m = monedas.find((x) => x.id === monedaId);
    return precio * (m?.cotizacion ?? 1);
  };
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Ahora el hook de edición rastrea por el ID numérico de la fila
  const { isEditing, startEdit, cancelEdit, draft, setDraft } = useInlineEdit();

  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [newForm, setNewForm] = useState<Omit<Vidrio, "id">>(BLANK);

  const filtered = vidrios.filter((v) => {
    const matchSearch = `${v.codigo} ${v.descri}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchTipo = filterTipo === "all" || String(v.tipo_rev) === filterTipo;
    return matchSearch && matchTipo;
  });

  const getTipo = (id: number | null | undefined) => id ? tiposInterior.find((t) => t.id === id) : undefined;

  const areaM2 = (v: Vidrio) => (((v.base ?? 0) * (v.altura ?? 0)) / 1_000_000).toFixed(2);
  const precioM2 = (v: Vidrio) => {
    const area = ((v.base ?? 0) * (v.altura ?? 0)) / 1_000_000;
    return area > 0 ? toPesos((v.precio ?? 0) / area, v.id_moneda ?? 1) : 0;
  };

  const commit = useCallback(
    (v: Vidrio, field: keyof Vidrio, raw: string) => {
      const numFields: (keyof Vidrio)[] = [
        "precio",
        "base",
        "altura",
        "espesor",
        "tipo_rev",
        "id_moneda",
        "color",
      ];
      const value = numFields.includes(field) ? parseFloat(raw) || 0 : raw;

      // Actualizamos enviando el objeto con su ID único
      updateVidrio({ ...v, [field]: value });
      cancelEdit();
    },
    [updateVidrio, cancelEdit],
  );

  const cell = (
    v: Vidrio,
    field: keyof Vidrio,
    opts?: {
      type?: "text" | "number";
      align?: "left" | "right";
      mono?: boolean;
    },
  ) => (
    <EditableCell
      value={v[field] as string | number}
      isEditing={isEditing(v.id, field)} // Uso de ID
      draft={draft}
      onDraftChange={setDraft}
      onStartEdit={() => startEdit(v.id, field, v[field] as string | number)}
      onCommit={(r) => commit(v, field, r)}
      onCancel={cancelEdit}
      type={opts?.type}
      align={opts?.align}
      mono={opts?.mono}
    />
  );

  function handleNew(close: () => void) {
    if (!(newForm.codigo ?? "").trim() || !(newForm.descri ?? "").trim()) return;
    createVidrio(newForm);
    setNewForm(BLANK);
    close();
  }

  return (
    <>
      <CatalogToolbar
        search={search}
        onSearch={setSearch}
        onNew={onOpen}
        newLabel="Nuevo vidrio"
        placeholder="Buscar por código, descripción o color..."
        extra={
          <Select
            size="sm"
            className="w-44"
            selectedKeys={[filterTipo]}
            onSelectionChange={(k: any) => setFilterTipo([...k][0] as string)}
            aria-label="Tipo de interior"
            classNames={{
              trigger:
                "bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-8 min-h-unit-8",
            }}
          >
            <SelectItem key="all">Todos los tipos</SelectItem>
            {tiposInterior.map((t) => (
              <SelectItem key={String(t.id)}>
                {capitalizeFirstLetter(t.descripcion ?? "")}
              </SelectItem>
            ))}
          </Select>
        }
      />

      <p className="text-xs text-steel-400 mb-2">
        {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        <span className="ml-2 text-steel-300 dark:text-steel-600">
          · Hacé click para editar
        </span>
      </p>

      <div className="card-surface overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-steel-200 dark:border-steel-700 bg-steel-50 dark:bg-steel-800/60">
              {[
                ["Código", "w-24 text-left"],
                ["Descripción", "text-left"],
                ["Tipo", "w-36 text-left"],
                ["Esp.", "w-16 text-right"],
                ["Color", "w-24 text-left"],
                ["Plancha (mm)", "w-32 text-right"],
                ["Área m²", "w-20 text-right"],
                ["Precio plancha", "w-32 text-right"],
                ["$/m²", "w-28 text-right"],
                ["", "w-10"],
              ].map(([h, cls], i) => (
                <th
                  key={i}
                  className={`px-3 py-2.5 text-xs font-semibold text-steel-500 uppercase tracking-wide ${cls}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10}>
                  <EmptyState icon={Square} title="Sin vidrios / interiores" />
                </td>
              </tr>
            )}
            {filtered.map((v) => {
              const tipo = getTipo(v.tipo_rev);
              return (
                <tr
                  key={v.id}
                  className={`hover:bg-steel-50/70 dark:hover:bg-steel-800/30 transition-colors group ${v.bloqueado ? "opacity-50" : ""}`}
                >
                  <td className="px-3 py-1.5">
                    <span className="font-mono text-xs bg-steel-100 dark:bg-steel-800 text-steel-600 dark:text-steel-300 px-2 py-0.5 rounded">
                      {v.codigo}
                    </span>
                  </td>
                  <td className="px-3 py-1 min-w-[160px]">
                    {cell(v, "descri")}
                  </td>
                  <td className="px-3 py-1.5">
                    <Chip
                      size="sm"
                      variant="flat"
                      classNames={{
                        base: "bg-steel-100 dark:bg-steel-800 text-steel-600 dark:text-steel-300",
                      }}
                    >
                      {tipo?.descripcion ?? "?"}
                    </Chip>
                  </td>
                  <td className="px-3 py-1 text-right">
                    <span className="font-mono text-xs">{v.espesor}mm</span>
                  </td>
                  <td className="px-3 py-1">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-steel-200 dark:border-steel-600 shrink-0"
                        style={{ background: rgbNumToHex(v.color ?? 0) }}
                      />
                      <span className="font-mono text-xs text-steel-500">
                        {v.color}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-1 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      {cell(v, "base", {
                        type: "number",
                        align: "right",
                        mono: true,
                      })}
                      <span className="text-[10px] text-steel-400">×</span>
                      {cell(v, "altura", {
                        type: "number",
                        align: "right",
                        mono: true,
                      })}
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-xs text-steel-500">
                    {areaM2(v)}
                  </td>
                  <td className="px-3 py-1">
                    {cell(v, "precio", {
                      type: "number",
                      align: "right",
                      mono: true,
                    })}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <span className="currency-badge">
                      {formatPesos(precioM2(v))}/m²
                    </span>
                  </td>
                  <td className="px-2 py-1">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onPress={() => deleteVidrio(v.id)} // Borrado por ID
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="font-display">
                Nuevo vidrio / interior
              </ModalHeader>
              <ModalBody className="gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Código *"
                    value={newForm.codigo}
                    onValueChange={(v: string) =>
                      setNewForm((f) => ({ ...f, codigo: v }))
                    }
                    size="sm"
                  />
                  <Input
                    label="Descripción *"
                    value={newForm.descri}
                    onValueChange={(v: string) =>
                      setNewForm((f) => ({ ...f, descri: v }))
                    }
                    size="sm"
                  />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <Input
                    label="Base (mm)"
                    type="number"
                    value={String(newForm.base)}
                    onValueChange={(v: string) =>
                      setNewForm((f) => ({ ...f, base: parseInt(v) || 0 }))
                    }
                    size="sm"
                  />
                  <Input
                    label="Altura (mm)"
                    type="number"
                    value={String(newForm.altura)}
                    onValueChange={(v: string) =>
                      setNewForm((f) => ({ ...f, altura: parseInt(v) || 0 }))
                    }
                    size="sm"
                  />
                  <Input
                    label="Espesor (mm)"
                    type="number"
                    value={String(newForm.espesor)}
                    onValueChange={(v: string) =>
                      setNewForm((f) => ({ ...f, espesor: parseInt(v) || 0 }))
                    }
                    size="sm"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-steel-500">Color</p>
                    <div className="flex items-center gap-2">
                      <label
                        className="cursor-pointer w-8 h-8 rounded-lg border-2 border-steel-200 dark:border-steel-600 shadow-sm hover:scale-110 transition-transform shrink-0"
                        style={{ background: rgbNumToHex(newForm.color ?? 0) }}
                      >
                        <input
                          type="color"
                          value={rgbNumToHex(newForm.color ?? 0)}
                          onChange={(e) =>
                            setNewForm((f) => ({
                              ...f,
                              color: hexToRgbNum(e.target.value),
                            }))
                          }
                          className="sr-only"
                        />
                      </label>
                      <span className="font-mono text-xs text-steel-400">
                        {newForm.color}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Precio plancha"
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
                        id_moneda: parseInt([...k][0] as string),
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
                  <Select
                    label="Tipo de interior"
                    selectedKeys={[String(newForm.tipo_rev)]}
                    onSelectionChange={(k: any) =>
                      setNewForm((f) => ({
                        ...f,
                        tipo_rev: parseInt([...k][0] as string),
                      }))
                    }
                    size="sm"
                  >
                    {tiposInterior.map((t) => (
                      <SelectItem key={String(t.id)}>
                        {capitalizeFirstLetter(t.descripcion ?? "")}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {newForm.precio !== undefined && newForm.precio !== null && newForm.precio > 0 &&
                  newForm.base !== undefined && newForm.base !== null && newForm.base > 0 &&
                  newForm.altura !== undefined && newForm.altura !== null && newForm.altura > 0 && (
                    <div className="bg-steel-50 dark:bg-steel-800/60 rounded-lg px-4 py-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-steel-400 mb-0.5">
                          Área de plancha
                        </p>
                        <p className="font-mono font-semibold text-steel-700 dark:text-steel-200">
                          {(
                            ((newForm.base ?? 0) * (newForm.altura ?? 0)) /
                            1_000_000
                          ).toFixed(3)}{" "}
                          m²
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-steel-400 mb-0.5">
                          Precio por m²
                        </p>
                        <p className="font-mono font-semibold text-steel-700 dark:text-steel-200">
                          {formatPesos(
                            toPesos(
                              (newForm.precio ?? 0) /
                                (((newForm.base ?? 0) * (newForm.altura ?? 0)) / 1_000_000),
                              newForm.id_moneda ?? 1,
                            ),
                          )}
                        </p>
                      </div>
                    </div>
                  )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleNew(onClose)}
                  isDisabled={!newForm.codigo.trim() || !(newForm.descri ?? "").trim()}
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
