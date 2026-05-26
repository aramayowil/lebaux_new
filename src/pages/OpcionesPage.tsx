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

const INITIAL_FORM_STATE: Omit<Opciones, "id"> = {
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

const inputBase = {
  label:
    "font-bold text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1",
  inputWrapper: [
    "border-zinc-200 dark:border-zinc-800",
    "bg-white dark:bg-zinc-900/50",
    "hover:border-amber-500",
    "focus-within:!border-amber-500",
    "rounded-xl transition-colors shadow-none",
  ].join(" "),
  input: "text-sm font-medium text-zinc-800 dark:text-zinc-200",
};

export default function OpcionesPage() {
  const { data: opciones = [], isLoading } = useOpciones();
  const { mutateAsync: createOpcion } = useCreateOpciones();
  const { mutateAsync: updateOpcion } = useUpdateOpciones();

  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Opciones | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (opciones.length > 0) {
        setForm(opciones[0]);
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
      await updateOpcion(form);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error al guardar:", error);
      setSaved(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 px-4 md:px-0 animate-in fade-in duration-400">
      {/* ── Header Profesional (Siempre Fijo y Visible) ───────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight">
            Configuración del Sistema
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 font-medium leading-relaxed">
            Ajustes técnicos globales, coeficientes de ganancia y cómputos de
            taller.
          </p>
        </div>

        {isLoading || !form ? (
          <Skeleton className="w-32 h-9 rounded-xl shadow-none" />
        ) : (
          <Button
            onPress={handleSave}
            startContent={
              saved ? (
                <Check className="w-4 h-4" strokeWidth={2.5} />
              ) : (
                <Save className="w-4 h-4" strokeWidth={2.5} />
              )
            }
            className={`font-bold px-6 rounded-xl transition-all shadow-none text-xs shrink-0 ${
              saved
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            }`}
          >
            {saved ? "Cambios guardados" : "Guardar todo"}
          </Button>
        )}
      </header>

      {/* ── Contenido Dinámico: Esqueleto Modular vs Grid de Datos Real ── */}
      {isLoading || !form ? (
        <OpcionesPageSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Columna Izquierda y Central (Ancha): Datos e Impuestos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bloque 1: Identidad Institucional */}
            <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
              <CardBody className="p-5 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Identidad de Empresa y Documentos
                  </h3>
                </div>

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
                    onValueChange={(v: string) => handleChange("telefono", v)}
                    classNames={inputBase}
                  />
                  <Input
                    label="Dirección Comercial"
                    labelPlacement="outside"
                    placeholder="Calle, número, planta comercial..."
                    variant="bordered"
                    className="md:col-span-2"
                    value={form.direccion}
                    onValueChange={(v: string) => handleChange("direccion", v)}
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
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
                    <Input
                      label="Texto Encabezado (Presupuesto PDF)"
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
                      label="Texto Pie (Presupuesto PDF)"
                      labelPlacement="outside"
                      variant="bordered"
                      placeholder="Cláusulas comerciales por defecto"
                      value={form.pie_pto}
                      onValueChange={(v: string) => handleChange("pie_pto", v)}
                      classNames={inputBase}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Bloque 2: Márgenes y Reglas de Negocio */}
            <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
              <CardBody className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                  <Percent className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Márgenes de Utilidad y Coeficientes Impositivos
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  {[
                    { id: "iva", label: "Alícuota IVA" },
                    {
                      id: "porcentaje_sobre_perfiles",
                      label: "Margen Perfiles",
                    },
                    { id: "porcentaje_sobre_vidrios", label: "Margen Vidrios" },
                    {
                      id: "porcentaje_sobre_accesorios",
                      label: "Margen Accesorios",
                    },
                    {
                      id: "porcentaje_sobre_pinturas",
                      label: "Margen Pinturas",
                    },
                    { id: "porcentaje_sobre_telas", label: "Margen Telas" },
                    { id: "porcentaje_sobre_mano", label: "Margen Mano Obra" },
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
                          "font-bold text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-tight mb-1.5",
                        inputWrapper:
                          "border-zinc-200 dark:border-zinc-800 focus-within:!border-amber-500 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 h-9 shadow-none",
                        input:
                          "text-center font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200",
                      }}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Columna Derecha (Estrecha): Costos y Tiempos de Fabricación */}
          <div className="space-y-6">
            {/* Bloque 3: Costos Operativos Básicos */}
            <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
              <CardBody className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Costo de Mano de Obra
                  </h3>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      {" "}
                      Valor Hora Taller{" "}
                    </span>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Tasa operativa base
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-400 font-mono">
                      $
                    </span>
                    <input
                      type="number"
                      value={form.costo_hora_taller}
                      onChange={(e) =>
                        handleChange("costo_hora_taller", e.target.value)
                      }
                      className="bg-transparent font-mono text-sm font-bold text-zinc-800 dark:text-zinc-100 w-16 outline-none text-center"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Bloque 4: Tiempos Estructurales */}
            <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
              <CardBody className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Matriz de Tiempos (Taller)
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
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
                      className="p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/50 bg-zinc-50/20 dark:bg-zinc-950/10 flex items-center justify-between group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {label}
                      </span>

                      <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0">
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min={0}
                            value={String(form[kh as keyof Opciones])}
                            onChange={(e) =>
                              handleChange(kh as keyof Opciones, e.target.value)
                            }
                            className="w-12 text-center font-mono text-sm sm:text-base font-bold bg-transparent outline-none text-zinc-800 dark:text-zinc-100 focus:text-amber-500"
                          />
                          <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-black tracking-wider mt-0.5">
                            HORAS
                          </span>
                        </div>

                        <span className="text-zinc-300 dark:text-zinc-700 font-bold text-base mb-4">
                          :
                        </span>

                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min={0}
                            max={59}
                            value={String(form[km as keyof Opciones])}
                            onChange={(e) =>
                              handleChange(km as keyof Opciones, e.target.value)
                            }
                            className="w-12 text-center font-mono text-sm sm:text-base font-bold bg-transparent outline-none text-zinc-800 dark:text-zinc-100 focus:text-amber-500"
                          />
                          <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-black tracking-wider mt-0.5">
                            MINS
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
  );
}
