import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useLineas } from "@/hooks/catalogo/useLineas";
import { useTipos } from "@/hooks/obra/useTipos";
import { useExtrusoras } from "@/hooks/catalogo/useExtrusoras";
import { useInteriores } from "@/hooks/productos/useInteriores";
import { useHojas } from "@/hooks/productos/useHojas";
import { useMarcos } from "@/hooks/productos/useMarco";
import { useProductos } from "@/hooks/productos/useProducto";
import { NumberInput } from "@heroui/react";
import { Progress } from "@heroui/react";
import { useCruces } from "@/hooks/productos/useCruces";
import { useContravidrios } from "@/hooks/productos/useContravidrios";
import { useContravidriosExt } from "@/hooks/productos/useContravidriosExt";
import { useMosquiteros } from "@/hooks/productos/useMosquiteros";

const TW_SM = {
  trigger:
    "bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-9 min-h-unit-9 text-sm",
};

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  onCrear: (
    datos: {
      descripcion: string;
      ancho: number;
      alto: number;
      cantidad: number;
    },
    config: {
      id_tipo?: number | null;
      id_producto?: number | null;
      id_marco?: number | null;
      id_hoja?: number | null;
      id_interior?: number | null;
    },
  ) => void;
}

interface Form {
  descripcion: string;
  ancho: number;
  alto: number;
  cantidad: number;
}

interface Seleccion {
  idExtrusora: number | null;
  idLinea: number | null;
  idTipo: number | null;
  idProducto: number | null;
  idMarco: number | null;
  idHoja: number | null;
  idInterior: number | null;
}

export default function NuevaTipologiaModal({
  isOpen,
  onOpenChange,
  onCrear,
}: Props) {
  // 1. Hooks de TanStack Query
  const {
    data: productosRaw,
    isLoading: isLoadingProductos,
    isError: isErrorProductos,
  } = useProductos();
  const {
    data: marcosRaw,
    isLoading: isLoadingMarcos,
    isError: isErrorMarcos,
  } = useMarcos();
  const {
    data: hojasRaw,
    isLoading: isLoadingHojas,
    isError: isErrorHojas,
  } = useHojas();
  const {
    data: interioresRaw,
    isLoading: isLoadingInteriores,
    isError: isErrorInteriores,
  } = useInteriores();
  const {
    data: crucesRaw,
    isLoading: isLoadingCruces,
    isError: isErrorCruces,
  } = useCruces();
  const {
    data: contravidriosRaw,
    isLoading: isLoadingContravidrios,
    isError: isErrorContravidrios,
  } = useContravidrios();
  const {
    data: contravidrios_extRaw,
    isLoading: isLoadingContravidriosExt,
    isError: isErrorContravidriosExt,
  } = useContravidriosExt();
  const {
    data: mosquiterosRaw,
    isLoading: isLoadingMosquiteros,
    isError: isErrorMosquiteros,
  } = useMosquiteros();

  const {
    data: tiposRaw,
    isLoading: isLoadingTipos,
    isError: isErrorTipos,
  } = useTipos();
  const {
    data: extrusorasRaw,
    isLoading: isLoadingExtrusoras,
    isError: isErrorExtrusoras,
  } = useExtrusoras();
  const {
    data: lineasRaw,
    isLoading: isLoadingLineas,
    isError: isErrorLineas,
  } = useLineas();

  // 2. Salvaguarda: Si vienen undefined, fallback inmediato a un array vacío
  const productos = productosRaw || [];
  const marcos = marcosRaw || [];
  const hojas = hojasRaw || [];
  const interiores = interioresRaw || [];
  const tipos = tiposRaw || [];
  const extrusoras = extrusorasRaw || [];
  const lineas = lineasRaw || [];
  const mosquiteros = mosquiterosRaw || [];
  const contravidrios = contravidriosRaw || [];
  const contravidrios_ext = contravidrios_extRaw || [];
  const cruces = crucesRaw || [];

  const isLoadingGlobal =
    isLoadingProductos ||
    isLoadingMarcos ||
    isLoadingHojas ||
    isLoadingInteriores ||
    isLoadingTipos ||
    isLoadingExtrusoras ||
    isLoadingLineas ||
    isLoadingMosquiteros ||
    isLoadingContravidrios ||
    isLoadingContravidriosExt ||
    isLoadingCruces;

  const isErrorGlobal =
    isErrorProductos ||
    isErrorMarcos ||
    isErrorHojas ||
    isErrorInteriores ||
    isErrorTipos ||
    isErrorExtrusoras ||
    isErrorLineas ||
    isErrorMosquiteros ||
    isErrorContravidrios ||
    isErrorContravidriosExt ||
    isErrorCruces;

  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState<Form>({
    descripcion: "",
    ancho: 1200,
    alto: 1500,
    cantidad: 1,
  });
  const [sel, setSel] = useState<Seleccion>({
    idExtrusora: null,
    idLinea: null,
    idTipo: null,
    idProducto: null,
    idMarco: null,
    idHoja: null,
    idInterior: null,
  });

  function upSel(data: Partial<Seleccion>) {
    setSel((prev) => ({ ...prev, ...data }));
  }

  // Listas derivadas protegidas
  const lineasDeExtrusora = sel.idExtrusora
    ? lineas.filter((l) => l.id_extrusora === sel.idExtrusora && !l.bloqueado)
    : [];

  // Filtro adaptativo inteligente para evitar listas vacías de entrada
  const productosFiltrados = productos.filter((p) => {
    if (sel.idLinea) {
      if (p.id_linea !== sel.idLinea) return false;
    } else if (sel.idExtrusora) {
      // Si seleccionó extrusora pero aún no una línea, muestra productos de todas las líneas de esa extrusora
      const lineasIds = lineasDeExtrusora.map((l) => l.id);
      if (p.id_linea && !lineasIds.includes(p.id_linea)) return false;
    }
    if (sel.idTipo && p.id_tipo !== sel.idTipo) return false;
    return true;
  });

  const marcosDeProducto = sel.idProducto
    ? marcos.filter((m) => m.id_producto === sel.idProducto)
    : [];
  const hojasDeMarco = sel.idMarco
    ? hojas.filter((h) => h.id_marco === sel.idMarco)
    : [];
  const mosquiterosDeHoja = sel.idHoja
    ? mosquiteros.filter((m) => m.id_hoja === sel.idHoja)
    : [];
  const interioresDeHoja = sel.idHoja
    ? interiores.filter((i) => i.id_hoja === sel.idHoja)
    : [];
  const crucesDeHoja = sel.idInterior
    ? cruces.filter((c) => c.id_interior === sel.idInterior)
    : [];
  const contravidriosDeHoja = sel.idInterior
    ? contravidrios.filter((c) => c.id_interior === sel.idInterior)
    : [];
  const contravidriosExtDeHoja = sel.idInterior
    ? contravidrios_ext.filter((c) => c.id_interior === sel.idInterior)
    : [];

  // Manejadores en cascada usando opcional chaining (?.) seguro
  function handleProductoChange(id: number | null) {
    const prod = id ? productos.find((x) => x.id === id) : null;

    const m = id
      ? (marcos.find((x) => x.id_producto === id && x.predeterminado) ??
        marcos.find((x) => x.id_producto === id))
      : null;
    const h = m
      ? (hojas.find((x) => x.id_marco === m.id && x.predeterminado) ??
        hojas.find((x) => x.id_marco === m.id))
      : null;
    const i = h
      ? (interiores.find((x) => x.id_hoja === h.id && x.predeterminado) ??
        interiores.find((x) => x.id_hoja === h.id))
      : null;

    const t = prod?.id_tipo ? tipos.find((x) => x.id === prod.id_tipo) : null;
    upSel({
      idProducto: id,
      idMarco: m?.id ?? null,
      idHoja: h?.id ?? null,
      idInterior: i?.id ?? null,
      idTipo: t?.id ?? null,
    });
  }

  function handleMarcoChange(id: number | null) {
    const h = id
      ? (hojas.find((x) => x.id_marco === id && x.predeterminado) ??
        hojas.find((x) => x.id_marco === id))
      : null;
    const i = h
      ? (interiores.find((x) => x.id_hoja === h.id && x.predeterminado) ??
        interiores.find((x) => x.id_hoja === h.id))
      : null;
    upSel({ idMarco: id, idHoja: h?.id ?? null, idInterior: i?.id ?? null });
  }

  function handleHojaChange(id: number | null) {
    const i = id
      ? (interiores.find((x) => x.id_hoja === id && x.predeterminado) ??
        interiores.find((x) => x.id_hoja === id))
      : null;
    upSel({ idHoja: id, idInterior: i?.id ?? null });
  }

  function handleCrear(onClose: () => void) {
    if (!form.descripcion.trim()) return;
    const config = {
      id_producto: sel.idProducto,
      id_marco: sel.idMarco,
      id_hoja: sel.idHoja,
      id_interior: sel.idInterior,
      id_tipo: sel.idTipo,
      id_cruce: crucesDeHoja[0]?.id ?? null,
      id_contravidrio: contravidriosDeHoja[0]?.id ?? null,
      id_contravidrio_ext: contravidriosExtDeHoja[0]?.id ?? null,
      id_mosquitero: mosquiterosDeHoja[0]?.id ?? null,
    };
    onCrear(form, config);
    // Reset
    setPaso(1);
    setForm({ descripcion: "", ancho: 1200, alto: 1500, cantidad: 1 });
    setSel({
      idExtrusora: null,
      idLinea: null,
      idTipo: null,
      idProducto: null,
      idMarco: null,
      idHoja: null,
      idInterior: null,
    });
    onClose();
  }

  const productoSel = sel.idProducto
    ? productos.find((p) => p.id === sel.idProducto)
    : null;
  const hojaSelObj = sel.idHoja ? hojas.find((h) => h.id === sel.idHoja) : null;
  const paso1Valido = form.descripcion.trim().length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose: () => void) => (
          <>
            <ModalHeader className="flex flex-col gap-2 pb-3 mb-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">
                  {paso === 1 ? "Nueva tipología" : "Seleccionar producto"}
                </span>
              </div>
              <Progress
                aria-label="Paso del formulario"
                value={paso === 1 ? 50 : 100}
                color="warning"
                size="sm"
                className="w-full"
              />
            </ModalHeader>

            <ModalBody className="gap-4 pb-2">
              {/* Manejo global de estados de carga y error en el Paso 2 */}
              {paso === 2 && isLoadingGlobal && (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-steel-500" />
                  <p className="text-sm text-steel-500">
                    Cargando catálogo de productos...
                  </p>
                </div>
              )}

              {paso === 2 && isErrorGlobal && !isLoadingGlobal && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-danger gap-2 bg-danger-50 dark:bg-danger-900/10 rounded-xl p-4">
                  <AlertTriangle className="w-6 h-6" />
                  <p className="text-sm font-semibold">
                    Error al cargar los datos
                  </p>
                  <p className="text-xs text-steel-500">
                    Por favor, reintentá cerrar y abrir el modal nuevamente.
                  </p>
                </div>
              )}

              {/* Render condicional real basado en que la data esté lista */}
              {paso === 1 && (
                <div className="space-y-4">
                  <Input
                    label="Descripción"
                    placeholder="ej: Ventana dormitorio principal"
                    value={form.descripcion}
                    onValueChange={(v: string) =>
                      setForm((f) => ({ ...f, descripcion: v }))
                    }
                    size="sm"
                    autoFocus
                    onKeyDown={(e: any) =>
                      e.key === "Enter" && paso1Valido && setPaso(2)
                    }
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <NumberInput
                      label="Ancho"
                      value={form.ancho}
                      onValueChange={(v: number) =>
                        setForm((f) => ({ ...f, ancho: v || 0 }))
                      }
                      size="sm"
                      minValue={1}
                      endContent={
                        <span className="text-[11px] text-steel-400">mm</span>
                      }
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
                        e.target.select()
                      }
                    />
                    <NumberInput
                      label="Alto"
                      value={form.alto}
                      onValueChange={(v: number) =>
                        setForm((f) => ({ ...f, alto: v || 0 }))
                      }
                      size="sm"
                      minValue={1}
                      endContent={
                        <span className="text-[11px] text-steel-400">mm</span>
                      }
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
                        e.target.select()
                      }
                    />
                    <NumberInput
                      label="Cantidad"
                      value={form.cantidad}
                      onValueChange={(v: number) =>
                        setForm((f) => ({ ...f, cantidad: v || 1 }))
                      }
                      size="sm"
                      minValue={1}
                      startContent={
                        <span className="text-[11px] text-steel-400">×</span>
                      }
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
                        e.target.select()
                      }
                    />
                  </div>
                  <div className="bg-steel-50 dark:bg-steel-800/40 rounded-lg p-3 text-xs text-steel-500">
                    <div className="flex justify-between">
                      <span>Superficie:</span>
                      <span className="font-mono">
                        {((form.ancho * form.alto) / 1_000_000).toFixed(2)} m²
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {paso === 2 && !isLoadingGlobal && !isErrorGlobal && (
                <div className="space-y-5">
                  {/* Filtros */}
                  <div>
                    <p className="text-xs font-semibold text-steel-500 uppercase tracking-wide mb-2">
                      Filtrar por fabricante y tipo
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <Select
                        label="Extrusora"
                        placeholder="Todas"
                        size="sm"
                        selectedKeys={
                          sel.idExtrusora ? [String(sel.idExtrusora)] : []
                        }
                        onSelectionChange={(k: any) => {
                          const first = [...k][0];
                          const id = first ? parseInt(first as string) : null;
                          upSel({
                            idExtrusora: id,
                            idLinea: null,
                            idProducto: null,
                            idMarco: null,
                            idHoja: null,
                            idInterior: null,
                          });
                        }}
                        classNames={TW_SM}
                      >
                        {extrusoras
                          .filter((e) => e && !e.bloqueado)
                          .map((e) => (
                            <SelectItem key={String(e.id)}>
                              {e.extrusora ?? "Sin nombre"}
                            </SelectItem>
                          ))}
                      </Select>

                      <Select
                        label="Línea"
                        placeholder="Todas"
                        size="sm"
                        isDisabled={!sel.idExtrusora}
                        selectedKeys={sel.idLinea ? [String(sel.idLinea)] : []}
                        onSelectionChange={(k: any) => {
                          const first = [...k][0];
                          const id = first ? parseInt(first as string) : null;
                          upSel({
                            idLinea: id,
                            idProducto: null,
                            idMarco: null,
                            idHoja: null,
                            idInterior: null,
                          });
                        }}
                        classNames={TW_SM}
                      >
                        {lineasDeExtrusora.map((l) => (
                          <SelectItem key={String(l.id)}>
                            {l.linea ?? "Sin línea"}
                          </SelectItem>
                        ))}
                      </Select>

                      <Select
                        label="Tipo de aberturas"
                        placeholder="Todos"
                        size="sm"
                        selectedKeys={sel.idTipo ? [String(sel.idTipo)] : []}
                        onSelectionChange={(k: any) => {
                          const first = [...k][0];
                          const id = first ? parseInt(first as string) : null;
                          upSel({
                            idTipo: id,
                            idProducto: null,
                            idMarco: null,
                            idHoja: null,
                            idInterior: null,
                          });
                        }}
                        classNames={TW_SM}
                      >
                        {tipos.map((t) => (
                          <SelectItem key={String(t.id)}>
                            {t.forma_tipo ?? "Sin tipo"}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {/* Lista de productos */}
                  <div>
                    <p className="text-xs font-semibold text-steel-500 uppercase tracking-wide mb-2">
                      Aberturas — {productosFiltrados.length} disponible
                      {productosFiltrados.length !== 1 ? "s" : ""}
                    </p>
                    {productosFiltrados.length === 0 ? (
                      <p className="text-xs text-steel-400 italic py-3 text-center">
                        No hay productos con esos filtros
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                        {productosFiltrados.map((p) => {
                          const tipo = tipos.find((t) => t.id === p.id_tipo);
                          const isSel = sel.idProducto === p.id;
                          return (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => handleProductoChange(p.id)}
                              className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                                isSel
                                  ? "border-steel-400 bg-steel-100 dark:bg-steel-700 text-steel-900 dark:text-steel-100"
                                  : "border-steel-200 dark:border-steel-700 hover:border-steel-300 hover:bg-steel-50 dark:hover:bg-steel-800/50 text-steel-700 dark:text-steel-200"
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {isSel && (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <p className="font-medium text-xs leading-tight">
                                    {p.descripcion ?? "Sin descripción"}
                                  </p>
                                  {tipo && (
                                    <p className="text-[10px] text-steel-400 mt-0.5">
                                      {tipo.forma_tipo ?? "Sin tipo"}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Marco / Hoja / Interior en cascada */}
                  {sel.idProducto && (
                    <div className="space-y-3 border-t border-steel-100 dark:border-steel-800 pt-4">
                      <p className="text-xs font-semibold text-steel-500 uppercase tracking-wide">
                        Configuración del producto
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <Select
                          label="Marco"
                          size="sm"
                          selectedKeys={
                            sel.idMarco ? [String(sel.idMarco)] : []
                          }
                          onSelectionChange={(k: any) =>
                            handleMarcoChange(
                              parseInt([...k][0] as string) || null,
                            )
                          }
                          classNames={TW_SM}
                        >
                          {marcosDeProducto.map((m) => (
                            <SelectItem
                              key={String(m.id)}
                              textValue={m.descripcion ?? ""}
                            >
                              {m.descripcion ?? "Sin descripción"}
                              {m.predeterminado && (
                                <span className="text-[10px] text-steel-400 ml-1">
                                  (pred.)
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </Select>

                        <Select
                          label="Hoja"
                          size="sm"
                          isDisabled={!sel.idMarco}
                          selectedKeys={sel.idHoja ? [String(sel.idHoja)] : []}
                          onSelectionChange={(k: any) =>
                            handleHojaChange(
                              parseInt([...k][0] as string) || null,
                            )
                          }
                          classNames={TW_SM}
                        >
                          {hojasDeMarco.map((h) => (
                            <SelectItem
                              key={String(h.id)}
                              textValue={h.descripcion ?? ""}
                            >
                              {h.descripcion ?? "Sin descripción"} (×
                              {h.cantidad})
                            </SelectItem>
                          ))}
                        </Select>

                        <Select
                          label="Interior"
                          size="sm"
                          isDisabled={!sel.idHoja}
                          selectedKeys={
                            sel.idInterior ? [String(sel.idInterior)] : []
                          }
                          onSelectionChange={(k: any) =>
                            upSel({
                              idInterior: parseInt([...k][0] as string) || null,
                            })
                          }
                          classNames={TW_SM}
                        >
                          {interioresDeHoja.map((i) => (
                            <SelectItem
                              key={String(i.id)}
                              textValue={i.descripcion ?? ""}
                            >
                              {i.descripcion ?? "Sin descripción"}
                              {i.predeterminado && (
                                <span className="text-[10px] text-steel-400 ml-1">
                                  (pred.)
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>

                      {/* Resumen de lo seleccionado */}
                      {productoSel && hojaSelObj && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>
                            <strong>
                              {productoSel.descripcion ?? "Sin descripción"}
                            </strong>{" "}
                            · {hojaSelObj.cantidad} hoja
                            {hojaSelObj.cantidad !== 1 ? "s" : ""} ·{" "}
                            {form.ancho}×{form.alto} mm
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Opción de crear sin producto */}
                  {!sel.idProducto && (
                    <p className="text-[11px] text-steel-400 text-center py-1">
                      Seleccione un producto para continuar, si no lo encuentra,
                      puede crearlo en la sección de productos.
                    </p>
                  )}
                </div>
              )}
            </ModalBody>

            <ModalFooter className="gap-2 pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800">
              {paso === 1 ? (
                <>
                  <Button
                    variant="bordered"
                    size="sm"
                    className="h-8 px-3 text-xs font-semibold border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-lg"
                    onPress={onClose}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    isDisabled={!paso1Valido}
                    className="h-8 px-4 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40"
                    onPress={() => setPaso(2)}
                  >
                    Siguiente →
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="bordered"
                    size="sm"
                    className="h-8 px-3 text-xs font-semibold border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-lg"
                    onPress={() => setPaso(1)}
                  >
                    ← Atrás
                  </Button>
                  <Button
                    size="sm"
                    isDisabled={!sel.idProducto || isLoadingGlobal}
                    className="h-8 px-4 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40"
                    onPress={() => handleCrear(onClose)}
                  >
                    Crear tipología
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
