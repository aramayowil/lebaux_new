import { useState, useEffect } from "react";
import { Button, Input, Card, CardBody, Skeleton } from "@heroui/react";
import {
  Save,
  Check,
  Building2,
  Percent,
  Clock,
  DollarSign,
  ReceiptText,
} from "lucide-react";
import type { Opciones } from "@/types";
import {
  useCreateOpciones,
  useOpciones,
  useUpdateOpciones,
} from "@/hooks/catalogo/useOpciones";
import OpcionesPageSkeleton from "@/components/ui/skeletons/OpcionesPageSkeleton";

const INITIAL_FORM_STATE: Partial<Opciones> = {
  nombre: "Bienvenido",
  email: "EMAIL_ADDRESS",
  telefono: "PHONE_NUMBER",
  direccion: "DIRECCION",
  encabezado_pto: "PRESUPUESTO",
  pie_pto: "Precios sujetos a variación sin previo aviso.",
  iva: 21,
  porcentaje_sobre_perfiles: 30,
  porcentaje_sobre_vidrios: 20,
  porcentaje_sobre_accesorios: 25,
  porcentaje_sobre_pinturas: 20,
  porcentaje_sobre_telas: 20,
  porcentaje_sobre_mano: 15,
  porcentaje_sobre_mano_colocacion: 10,
  porcentaje_sobre_items_manuales: 0,
  costo_hora_taller: 2500,
  tiempo_marco_horas: 0,
  tiempo_marco_minutos: 12,
  tiempo_hoja_horas: 0,
  tiempo_hoja_minutos: 8,
  tiempo_interior_horas: 0,
  tiempo_interior_minutos: 5,
  tiempo_cruce_horas: 0,
  tiempo_cruce_minutos: 6,
  tiempo_contravidrio_horas: 0,
  tiempo_contravidrio_minutos: 4,
  tiempo_mosquitero_horas: 0,
  tiempo_mosquitero_minutos: 10,
};

// Unified input style aligned with AppLayout zinc/steel palette
const inputBase = {
  label:
    "font-bold text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1",
  inputWrapper: [
    "border-zinc-200 dark:border-zinc-800",
    "bg-white dark:bg-zinc-900",
    "hover:border-lebaux-amber/60 dark:hover:border-lebaux-amber/40",
    "focus-within:!border-lebaux-amber",
    "rounded-xl transition-colors shadow-none",
  ].join(" "),
  input: "text-sm font-medium text-zinc-800 dark:text-zinc-200",
};

// Unified section header used in every card block
function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-lebaux-amber/10">
        <Icon className="w-3.5 h-3.5 text-lebaux-amber" strokeWidth={2} />
      </div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
        {title}
      </h3>
    </div>
  );
}

export default function OpcionesPage() {
  const { data: opciones, isLoading } = useOpciones();
  const { mutateAsync: createOpcion } = useCreateOpciones();
  const { mutateAsync: updateOpcion } = useUpdateOpciones();

  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Opciones | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (opciones) {
        setForm(opciones);
      } else {
        createOpcion(INITIAL_FORM_STATE);
      }
    }
  }, [opciones, isLoading, createOpcion]);

  const handleChange = (key: keyof Opciones, v: string) => {
    if (!form) return;
    const isNumber =
      typeof INITIAL_FORM_STATE[key as keyof typeof INITIAL_FORM_STATE] ===
      "number";
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: isNumber ? (v === "" ? 0 : Number(v)) : v,
      };
    });
  };

  async function handleSave() {
    if (!form) return;
    setSaved(true);
    try {
      await updateOpcion({ id: form.id, data: form });
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error al guardar:", error);
      setSaved(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-steel-900 shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight">
            Configuración del Sistema
          </h2>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5 font-medium">
            Ajustes globales, coeficientes de ganancia y cómputos de taller.
          </p>
        </div>

        {isLoading || !form ? (
          <Skeleton className="w-32 h-9 rounded-xl" />
        ) : (
          <Button
            onPress={handleSave}
            size="sm"
            startContent={
              saved ? (
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              ) : (
                <Save className="w-3.5 h-3.5" strokeWidth={2.5} />
              )
            }
            className={`font-bold px-4 rounded-xl text-xs shrink-0 shadow-none transition-all ${
              saved
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-lebaux-amber hover:bg-amber-500 text-white"
            }`}
          >
            {saved ? "Cambios guardados" : "Guardar todo"}
          </Button>
        )}
      </header>

      {/* ── Scrollable content area — matches AppLayout zinc-50 tint ── */}
      <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-5">
        <div className="max-w-7xl mx-auto space-y-5 pb-10">
          {isLoading || !form ? (
            <OpcionesPageSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
              {/* ── Left + Center column (2/3 width) ── */}
              <div className="lg:col-span-2 space-y-5">
                {/* Block 1: Identidad Institucional */}
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-xl">
                  <CardBody className="p-5 space-y-5">
                    <SectionHeader
                      icon={Building2}
                      title="Identidad de Empresa y Documentos"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Razón Social"
                        labelPlacement="outside"
                        placeholder="Nombre comercial"
                        variant="bordered"
                        value={form.nombre}
                        onValueChange={(v: string) => handleChange("nombre", v)}
                        classNames={inputBase}
                      />
                      <Input
                        label="Teléfono de contacto"
                        labelPlacement="outside"
                        placeholder="Ej: +54 381..."
                        variant="bordered"
                        value={form.telefono}
                        onValueChange={(v: string) =>
                          handleChange("telefono", v)
                        }
                        classNames={inputBase}
                      />
                      <Input
                        label="Dirección Comercial"
                        labelPlacement="outside"
                        placeholder="Calle, número, planta comercial..."
                        variant="bordered"
                        className="md:col-span-2"
                        value={form.direccion}
                        onValueChange={(v: string) =>
                          handleChange("direccion", v)
                        }
                        classNames={inputBase}
                      />
                      <Input
                        label="Correo Electrónico"
                        labelPlacement="outside"
                        type="email"
                        placeholder="administracion@empresa.com"
                        variant="bordered"
                        className="md:col-span-2"
                        value={form.email}
                        onValueChange={(v: string) => handleChange("email", v)}
                        classNames={inputBase}
                      />

                      {/* PDF document fields — subtle divider */}
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <Input
                          label="Encabezado (Presupuesto PDF)"
                          labelPlacement="outside"
                          variant="bordered"
                          placeholder="Encabezado del documento técnico"
                          startContent={
                            <ReceiptText className="w-3.5 h-3.5 text-zinc-400" />
                          }
                          value={form.encabezado_pto}
                          onValueChange={(v: string) =>
                            handleChange("encabezado_pto", v)
                          }
                          classNames={inputBase}
                        />
                        <Input
                          label="Pie de Página (Presupuesto PDF)"
                          labelPlacement="outside"
                          variant="bordered"
                          placeholder="Cláusulas comerciales por defecto"
                          value={form.pie_pto}
                          onValueChange={(v: string) =>
                            handleChange("pie_pto", v)
                          }
                          classNames={inputBase}
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Block 2: Márgenes y Reglas de Negocio */}
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-xl">
                  <CardBody className="p-5 space-y-4">
                    <SectionHeader
                      icon={Percent}
                      title="Márgenes de Utilidad y Coeficientes Impositivos"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      {[
                        { id: "iva", label: "Alícuota IVA" },
                        {
                          id: "porcentaje_sobre_perfiles",
                          label: "Margen Perfiles",
                        },
                        {
                          id: "porcentaje_sobre_vidrios",
                          label: "Margen Vidrios",
                        },
                        {
                          id: "porcentaje_sobre_accesorios",
                          label: "Margen Accesorios",
                        },
                        {
                          id: "porcentaje_sobre_pinturas",
                          label: "Margen Pinturas",
                        },
                        { id: "porcentaje_sobre_telas", label: "Margen Telas" },
                        {
                          id: "porcentaje_sobre_mano",
                          label: "Margen Mano Obra",
                        },
                        {
                          id: "porcentaje_sobre_mano_colocacion",
                          label: "M. Colocación",
                        },
                        {
                          id: "porcentaje_sobre_items_manuales",
                          label: "Ítems Manuales",
                        },
                      ].map((item) => (
                        <Input
                          key={item.id}
                          label={item.label}
                          labelPlacement="outside"
                          type="number"
                          variant="bordered"
                          value={String(form[item.id as keyof Opciones])}
                          onValueChange={(v: string) =>
                            handleChange(item.id as keyof Opciones, v)
                          }
                          endContent={
                            <span className="text-[10px] font-mono font-bold text-zinc-400">
                              %
                            </span>
                          }
                          classNames={{
                            label:
                              "font-bold text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-tight mb-1.5",
                            inputWrapper:
                              "border-zinc-200 dark:border-zinc-800 hover:border-lebaux-amber/60 focus-within:!border-lebaux-amber rounded-xl bg-zinc-50 dark:bg-zinc-950/40 h-9 shadow-none transition-colors",
                            input:
                              "text-center font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200",
                          }}
                        />
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* ── Right column (1/3 width) — Costs & Time ── */}
              <div className="space-y-5">
                {/* Block 3: Costo Operativo */}
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-xl">
                  <CardBody className="p-5 space-y-4">
                    <SectionHeader
                      icon={DollarSign}
                      title="Costo de Mano de Obra"
                    />

                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                          Valor Hora Taller
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          Tasa operativa base
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus-within:border-lebaux-amber transition-colors">
                        <span className="text-xs font-bold text-zinc-400 font-mono">
                          $
                        </span>
                        <input
                          type="number"
                          value={form.costo_hora_taller ?? ""}
                          onChange={(e) =>
                            handleChange("costo_hora_taller", e.target.value)
                          }
                          className="bg-transparent font-mono text-sm font-bold text-zinc-800 dark:text-zinc-100 w-16 outline-none text-center focus:text-lebaux-amber transition-colors"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Block 4: Tiempos Estructurales */}
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-xl">
                  <CardBody className="p-5 space-y-4">
                    <SectionHeader
                      icon={Clock}
                      title="Matriz de Tiempos (Taller)"
                    />

                    <div className="grid grid-cols-1 gap-2">
                      {[
                        [
                          "Cómputo Marco",
                          "tiempo_marco_horas",
                          "tiempo_marco_minutos",
                        ],
                        [
                          "Cómputo Hoja",
                          "tiempo_hoja_horas",
                          "tiempo_hoja_minutos",
                        ],
                        [
                          "Cómputo Interior",
                          "tiempo_interior_horas",
                          "tiempo_interior_minutos",
                        ],
                        [
                          "Cómputo Cruce",
                          "tiempo_cruce_horas",
                          "tiempo_cruce_minutos",
                        ],
                        [
                          "Cómputo Contravidrio",
                          "tiempo_contravidrio_horas",
                          "tiempo_contravidrio_minutos",
                        ],
                        [
                          "Cómputo Mosquitero",
                          "tiempo_mosquitero_horas",
                          "tiempo_mosquitero_minutos",
                        ],
                      ].map(([label, kh, km]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/30 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-950/60 transition-all group"
                        >
                          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                            {label}
                          </span>

                          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors shrink-0">
                            <div className="flex flex-col items-center">
                              <input
                                type="number"
                                min={0}
                                value={String(form[kh as keyof Opciones])}
                                onChange={(e) =>
                                  handleChange(
                                    kh as keyof Opciones,
                                    e.target.value,
                                  )
                                }
                                className="w-10 text-center font-mono text-sm font-bold bg-transparent outline-none text-zinc-700 dark:text-zinc-200 focus:text-lebaux-amber transition-colors"
                              />
                              <span className="text-[8px] text-zinc-400 dark:text-zinc-600 font-black tracking-wider">
                                HS
                              </span>
                            </div>

                            <span className="text-zinc-300 dark:text-zinc-700 font-bold text-sm pb-3">
                              :
                            </span>

                            <div className="flex flex-col items-center">
                              <input
                                type="number"
                                min={0}
                                max={59}
                                value={String(form[km as keyof Opciones])}
                                onChange={(e) =>
                                  handleChange(
                                    km as keyof Opciones,
                                    e.target.value,
                                  )
                                }
                                className="w-10 text-center font-mono text-sm font-bold bg-transparent outline-none text-zinc-700 dark:text-zinc-200 focus:text-lebaux-amber transition-colors"
                              />
                              <span className="text-[8px] text-zinc-400 dark:text-zinc-600 font-black tracking-wider">
                                MIN
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
