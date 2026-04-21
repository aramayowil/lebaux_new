/**
 * NuevaTipologiaModal
 * Wizard de 2 pasos:
 *   1. Datos básicos (descripción, ancho, alto, cantidad)
 *   2. Producto: extrusora → línea → tipo → apertura → marco → hoja → interior
 */

import { useState } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Select, SelectItem, Chip,
} from "@heroui/react";
import { CheckCircle } from "lucide-react";
import { useProductosStore } from "@/store/productosStore";
import { useCatalogosStore } from "@/store/catalogosStore";
import type { TipologiaConfig } from "@/store/obrasStore";

const TW    = { trigger: "bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700" };
const TW_SM = { trigger: "bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-9 min-h-unit-9 text-sm" };

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  onCrear: (
    datos: { descripcion: string; ancho: number; alto: number; cantidad: number },
    config: Partial<TipologiaConfig>
  ) => void;
}

interface Form {
  descripcion: string;
  ancho:       number;
  alto:        number;
  cantidad:    number;
}

interface Seleccion {
  idExtrusora: number | null;
  idLinea:     number | null;
  idTipo:      number | null;
  idProducto:  number | null;
  idMarco:     number | null;
  idHoja:      number | null;
  idInterior:  number | null;
}

export default function NuevaTipologiaModal({ isOpen, onOpenChange, onCrear }: Props) {
  const { productos, marcos, hojas, interiores, tipos } = useProductosStore();
  const { extrusoras, lineas } = useCatalogosStore();

  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState<Form>({ descripcion: "", ancho: 1200, alto: 1500, cantidad: 1 });
  const [sel, setSel]   = useState<Seleccion>({
    idExtrusora: null, idLinea: null, idTipo: null,
    idProducto: null, idMarco: null, idHoja: null, idInterior: null,
  });

  function upSel(data: Partial<Seleccion>) {
    setSel(prev => ({ ...prev, ...data }));
  }

  // Derived lists
  const lineasDeExtrusora = sel.idExtrusora
    ? lineas.filter(l => l.idExtrusora === sel.idExtrusora && !l.bloqueado)
    : [];

  const productosFiltrados = productos.filter(p => {
    if (sel.idLinea  && p.idLinea  !== sel.idLinea)  return false;
    if (sel.idTipo   && p.idTipo   !== sel.idTipo)   return false;
    return true;
  });

  const marcosDeProducto = sel.idProducto
    ? marcos.filter(m => m.idProducto === sel.idProducto)
    : [];
  const hojasDeMarca = sel.idMarco
    ? hojas.filter(h => h.idMarco === sel.idMarco)
    : [];
  const interioresDeHoja = sel.idHoja
    ? interiores.filter(i => i.idHoja === sel.idHoja)
    : [];

  function handleProductoChange(id: number | null) {
    const m = id
      ? (marcos.find(x => x.idProducto === id && x.predeterminado) ?? marcos.find(x => x.idProducto === id))
      : null;
    const h = m
      ? (hojas.find(x => x.idMarco === m.id && x.predeterminado) ?? hojas.find(x => x.idMarco === m.id))
      : null;
    const i = h
      ? (interiores.find(x => x.idHoja === h.id && x.predeterminado) ?? interiores.find(x => x.idHoja === h.id))
      : null;
    upSel({ idProducto: id, idMarco: m?.id ?? null, idHoja: h?.id ?? null, idInterior: i?.id ?? null });
  }

  function handleMarcoChange(id: number | null) {
    const h = id
      ? (hojas.find(x => x.idMarco === id && x.predeterminado) ?? hojas.find(x => x.idMarco === id))
      : null;
    const i = h
      ? (interiores.find(x => x.idHoja === h.id && x.predeterminado) ?? interiores.find(x => x.idHoja === h.id))
      : null;
    upSel({ idMarco: id, idHoja: h?.id ?? null, idInterior: i?.id ?? null });
  }

  function handleHojaChange(id: number | null) {
    const i = id
      ? (interiores.find(x => x.idHoja === id && x.predeterminado) ?? interiores.find(x => x.idHoja === id))
      : null;
    upSel({ idHoja: id, idInterior: i?.id ?? null });
  }

  function handleCrear(onClose: () => void) {
    if (!form.descripcion.trim()) return;
    const config: Partial<TipologiaConfig> = {
      idProducto:  sel.idProducto,
      idMarco:     sel.idMarco,
      idHoja:      sel.idHoja,
      idInterior:  sel.idInterior,
    };
    onCrear(form, config);
    // Reset
    setPaso(1);
    setForm({ descripcion: "", ancho: 1200, alto: 1500, cantidad: 1 });
    setSel({ idExtrusora: null, idLinea: null, idTipo: null, idProducto: null, idMarco: null, idHoja: null, idInterior: null });
    onClose();
  }

  const productoSel  = sel.idProducto  ? productos.find(p => p.id === sel.idProducto) : null;
  const hojaSelObj   = sel.idHoja      ? hojas.find(h => h.id === sel.idHoja) : null;
  const paso1Valido  = form.descripcion.trim().length > 0;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" scrollBehavior="inside">
      <ModalContent>
        {(onClose: any) => (
          <>
            <ModalHeader className="font-display text-base flex items-center gap-3">
              Nueva tipología
              <div className="flex items-center gap-1 ml-auto">
                <StepDot n={1} active={paso === 1} done={paso > 1} />
                <div className="w-6 h-px bg-steel-200 dark:bg-steel-700" />
                <StepDot n={2} active={paso === 2} done={false} />
              </div>
            </ModalHeader>

            <ModalBody className="gap-4 pb-2">

              {/* ── Paso 1: datos básicos ── */}
              {paso === 1 && (
                <div className="space-y-4">
                  <Input
                    label="Descripción"
                    placeholder="ej: Ventana dormitorio principal"
                    value={form.descripcion}
                    onValueChange={v => setForm(f => ({ ...f, descripcion: v }))}
                    size="sm" autoFocus
                    onKeyDown={(e: any) => e.key === "Enter" && paso1Valido && setPaso(2)}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input label="Ancho" type="number" value={String(form.ancho)}
                      onValueChange={v => setForm(f => ({ ...f, ancho: parseInt(v) || 600 }))}
                      size="sm" endContent={<span className="text-[10px] text-steel-400">mm</span>} />
                    <Input label="Alto" type="number" value={String(form.alto)}
                      onValueChange={v => setForm(f => ({ ...f, alto: parseInt(v) || 600 }))}
                      size="sm" endContent={<span className="text-[10px] text-steel-400">mm</span>} />
                    <Input label="Cantidad" type="number" value={String(form.cantidad)}
                      onValueChange={v => setForm(f => ({ ...f, cantidad: parseInt(v) || 1 }))}
                      size="sm" startContent={<span className="text-[10px] text-steel-400">×</span>} />
                  </div>
                  <div className="bg-steel-50 dark:bg-steel-800/40 rounded-lg p-3 text-xs text-steel-500">
                    <div className="flex justify-between">
                      <span>Superficie:</span>
                      <span className="font-mono">{((form.ancho * form.alto) / 1_000_000).toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Total (×{form.cantidad}):</span>
                      <span className="font-mono">{((form.ancho * form.alto * form.cantidad) / 1_000_000).toFixed(2)} m²</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Paso 2: selección de producto ── */}
              {paso === 2 && (
                <div className="space-y-5">
                  {/* Filtros */}
                  <div>
                    <p className="text-xs font-semibold text-steel-500 uppercase tracking-wide mb-2">
                      Filtrar por fabricante y tipo
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <Select label="Extrusora" placeholder="Todas" size="sm"
                        selectedKeys={sel.idExtrusora ? [String(sel.idExtrusora)] : []}
                        onSelectionChange={(k: any) => {
                          const id = parseInt([...k][0] as string) || null;
                          upSel({ idExtrusora: id, idLinea: null, idProducto: null, idMarco: null, idHoja: null, idInterior: null });
                        }}
                        classNames={TW_SM}
                      >
                        {extrusoras.filter(e => !e.bloqueado).map(e => (
                          <SelectItem key={String(e.id)}>{e.extrusora}</SelectItem>
                        ))}
                      </Select>

                      <Select label="Línea" placeholder="Todas" size="sm"
                        isDisabled={!sel.idExtrusora}
                        selectedKeys={sel.idLinea ? [String(sel.idLinea)] : []}
                        onSelectionChange={(k: any) => {
                          const id = parseInt([...k][0] as string) || null;
                          upSel({ idLinea: id, idProducto: null, idMarco: null, idHoja: null, idInterior: null });
                        }}
                        classNames={TW_SM}
                      >
                        {lineasDeExtrusora.map(l => (
                          <SelectItem key={String(l.id)}>{l.linea}</SelectItem>
                        ))}
                      </Select>

                      <Select label="Tipo de apertura" placeholder="Todos" size="sm"
                        selectedKeys={sel.idTipo ? [String(sel.idTipo)] : []}
                        onSelectionChange={(k: any) => {
                          const id = parseInt([...k][0] as string) || null;
                          upSel({ idTipo: id, idProducto: null, idMarco: null, idHoja: null, idInterior: null });
                        }}
                        classNames={TW_SM}
                      >
                        {tipos.map(t => (
                          <SelectItem key={String(t.id)}>{t.formaTipo}</SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {/* Lista de productos */}
                  <div>
                    <p className="text-xs font-semibold text-steel-500 uppercase tracking-wide mb-2">
                      Apertura — {productosFiltrados.length} disponible{productosFiltrados.length !== 1 ? "s" : ""}
                    </p>
                    {productosFiltrados.length === 0 ? (
                      <p className="text-xs text-steel-400 italic py-3 text-center">
                        No hay productos con esos filtros
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                        {productosFiltrados.map(p => {
                          const tipo = tipos.find(t => t.id === p.idTipo);
                          const isSel = sel.idProducto === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleProductoChange(p.id)}
                              className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                                isSel
                                  ? "border-steel-400 bg-steel-100 dark:bg-steel-700 text-steel-900 dark:text-steel-100"
                                  : "border-steel-200 dark:border-steel-700 hover:border-steel-300 hover:bg-steel-50 dark:hover:bg-steel-800/50 text-steel-700 dark:text-steel-200"
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {isSel && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />}
                                <div>
                                  <p className="font-medium text-xs leading-tight">{p.descripcion}</p>
                                  {tipo && <p className="text-[10px] text-steel-400 mt-0.5">{tipo.formaTipo}</p>}
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
                        <Select label="Marco" size="sm"
                          selectedKeys={sel.idMarco ? [String(sel.idMarco)] : []}
                          onSelectionChange={(k: any) => handleMarcoChange(parseInt([...k][0] as string) || null)}
                          classNames={TW_SM}
                        >
                          {marcosDeProducto.map(m => (
                            <SelectItem key={String(m.id)} textValue={m.descripcion}>
                              {m.descripcion}
                              {m.predeterminado && <span className="text-[10px] text-steel-400 ml-1">(pred.)</span>}
                            </SelectItem>
                          ))}
                        </Select>

                        <Select label="Hoja" size="sm"
                          isDisabled={!sel.idMarco}
                          selectedKeys={sel.idHoja ? [String(sel.idHoja)] : []}
                          onSelectionChange={(k: any) => handleHojaChange(parseInt([...k][0] as string) || null)}
                          classNames={TW_SM}
                        >
                          {hojasDeMarca.map(h => (
                            <SelectItem key={String(h.id)} textValue={h.descripcion}>
                              {h.descripcion} (×{h.cantidad})
                            </SelectItem>
                          ))}
                        </Select>

                        <Select label="Interior" size="sm"
                          isDisabled={!sel.idHoja}
                          selectedKeys={sel.idInterior ? [String(sel.idInterior)] : []}
                          onSelectionChange={(k: any) => upSel({ idInterior: parseInt([...k][0] as string) || null })}
                          classNames={TW_SM}
                        >
                          {interioresDeHoja.map(i => (
                            <SelectItem key={String(i.id)} textValue={i.descripcion}>
                              {i.descripcion}
                              {i.predeterminado && <span className="text-[10px] text-steel-400 ml-1">(pred.)</span>}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>

                      {/* Resumen de lo seleccionado */}
                      {productoSel && hojaSelObj && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>
                            <strong>{productoSel.descripcion}</strong> ·{" "}
                            {hojaSelObj.cantidad} hoja{hojaSelObj.cantidad !== 1 ? "s" : ""} ·{" "}
                            {form.ancho}×{form.alto} mm
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Opción de crear sin producto */}
                  {!sel.idProducto && (
                    <p className="text-[11px] text-steel-400 text-center py-1">
                      También podés crear la tipología sin asignar producto y configurarla después.
                    </p>
                  )}
                </div>
              )}
            </ModalBody>

            <ModalFooter className="gap-2">
              {paso === 1 ? (
                <>
                  <Button variant="light" size="sm" onPress={onClose}>Cancelar</Button>
                  <Button color="primary" size="sm"
                    isDisabled={!paso1Valido}
                    onPress={() => setPaso(2)}>
                    Siguiente →
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="light" size="sm" onPress={() => setPaso(1)}>← Atrás</Button>
                  <Button variant="light" size="sm" onPress={() => handleCrear(onClose)}>
                    Crear sin producto
                  </Button>
                  <Button color="primary" size="sm"
                    isDisabled={!sel.idProducto}
                    onPress={() => handleCrear(onClose)}>
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

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
      active ? "bg-steel-700 text-white dark:bg-steel-300 dark:text-steel-900"
      : done  ? "bg-emerald-500 text-white"
      : "bg-steel-200 dark:bg-steel-700 text-steel-500 dark:text-steel-400"
    }`}>
      {done ? "✓" : n}
    </div>
  );
}
