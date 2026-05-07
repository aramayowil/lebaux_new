import { useState, useEffect } from "react";
import { Button, Input, Spinner } from "@heroui/react";
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

  if (isLoading || !form) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner color="warning" label="Cargando configuración..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Encabezado */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-8">
        <div className="space-y-1">
          <h2 className="font-sans text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Opciones
          </h2>
          <p className="text-zinc-500 font-sans text-sm">
            Configura los parámetros globales de Lebaux.
          </p>
        </div>
        <Button
          variant="flat"
          startContent={
            saved ? (
              <Check className="w-4 h-4" strokeWidth={2.5} />
            ) : (
              <Save className="w-4 h-4" strokeWidth={2.5} />
            )
          }
          onPress={handleSave}
          className={`font-sans font-bold px-8 rounded-full transition-all active:scale-95 ${
            saved
              ? "bg-success/20 text-success"
              : "bg-lebaux-amber-dark text-white dark:text-black"
          }`}
        >
          {saved ? "Cambios guardados" : "Guardar todo"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Bloque 1: Identidad */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Building2 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              Identidad
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white dark:bg-zinc-900/30 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
            <Input
              label="Razón Social"
              labelPlacement="outside"
              placeholder="Nombre de la empresa"
              variant="bordered"
              className="font-sans"
              value={form.nombre}
              onValueChange={(v: string) => handleChange("nombre", v)}
            />
            <Input
              label="Teléfono de contacto"
              labelPlacement="outside"
              placeholder="+54..."
              variant="bordered"
              value={form.telefono}
              onValueChange={(v: string) => handleChange("telefono", v)}
            />
            <Input
              label="Dirección Comercial"
              labelPlacement="outside"
              className="md:col-span-2"
              variant="bordered"
              value={form.direccion}
              onValueChange={(v: string) => handleChange("direccion", v)}
            />
            <Input
              label="Correo Electrónico"
              labelPlacement="outside"
              type="email"
              variant="bordered"
              value={form.email}
              onValueChange={(v: string) => handleChange("email", v)}
            />
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
              <Input
                label="Texto Encabezado (PDF)"
                labelPlacement="outside"
                variant="bordered"
                startContent={<ReceiptText className="w-4 h-4 text-zinc-300" />}
                value={form.encabezado_pto}
                onValueChange={(v: string) => handleChange("encabezado_pto", v)}
              />
              <Input
                label="Texto Pie (PDF)"
                labelPlacement="outside"
                variant="bordered"
                value={form.pie_pto}
                onValueChange={(v: string) => handleChange("pie_pto", v)}
              />
            </div>
          </div>
        </section>

        {/* Bloque 2: Márgenes */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Percent className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              Márgenes y Ganancias
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { id: "iva", label: "IVA" },
              { id: "porcentaje_sobre_perfiles", label: "Perfiles" },
              { id: "porcentaje_sobre_vidrios", label: "Vidrios" },
              { id: "porcentaje_sobre_accesorios", label: "Accesorios" },
              { id: "porcentaje_sobre_pinturas", label: "Pinturas" },
              { id: "porcentaje_sobre_telas", label: "Telas" },
              { id: "porcentaje_sobre_mano", label: "Mano Obra" },
              { id: "porcentaje_sobre_mano_colocacion", label: "Colocación" },
              { id: "porcentaje_sobre_items_manuales", label: "Manuales" },
            ].map((item) => (
              <Input
                key={item.id}
                label={item.label}
                labelPlacement="outside"
                type="number"
                variant="faded"
                value={String(form[item.id as keyof Opciones])}
                onValueChange={(v: string) =>
                  handleChange(item.id as keyof Opciones, v)
                }
                endContent={
                  <span className="text-[10px] font-bold text-zinc-400">%</span>
                }
                classNames={{
                  input: "text-center font-mono font-bold",
                  label: "text-xs text-zinc-500 mb-2",
                }}
              />
            ))}
          </div>
        </section>

        {/* Bloque 3: Tiempos */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <Clock className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
                Tiempos de Taller
              </h3>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900 text-white px-5 py-2.5 rounded-2xl border border-zinc-700 shadow-xl">
              <DollarSign className="w-4 h-4 text-primary" strokeWidth={3} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Costo Hora:
              </span>
              <input
                type="number"
                value={form.costo_hora_taller}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("costo_hora_taller", e.target.value)
                }
                className="bg-transparent font-mono text-base font-bold text-white w-20 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ["Marco", "tiempo_marco_horas", "tiempo_marco_minutos"],
              ["Hoja", "tiempo_hoja_horas", "tiempo_hoja_minutos"],
              ["Interior", "tiempo_interior_horas", "tiempo_interior_minutos"],
              ["Cruce", "tiempo_cruce_horas", "tiempo_cruce_minutos"],
              [
                "Contravidrio",
                "tiempo_contravidrio_horas",
                "tiempo_contravidrio_minutos",
              ],
              [
                "Mosquitero",
                "tiempo_mosquitero_horas",
                "tiempo_mosquitero_minutos",
              ],
            ].map(([label, kh, km]) => (
              <div
                key={label}
                className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all flex items-center justify-between group"
              >
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  {label}
                </span>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex flex-col items-center px-2">
                    <input
                      type="number"
                      value={String(form[kh as keyof Opciones])}
                      onChange={(e) =>
                        handleChange(kh as keyof Opciones, e.target.value)
                      }
                      className="w-8 text-center font-mono text-sm font-bold bg-transparent outline-none text-zinc-800 dark:text-zinc-200"
                    />
                    <span className="text-[8px] text-zinc-400 uppercase font-black">
                      H
                    </span>
                  </div>
                  <span className="text-zinc-300 dark:text-zinc-700 font-bold">
                    :
                  </span>
                  <div className="flex flex-col items-center px-2">
                    <input
                      type="number"
                      value={String(form[km as keyof Opciones])}
                      onChange={(e) =>
                        handleChange(km as keyof Opciones, e.target.value)
                      }
                      className="w-8 text-center font-mono text-sm font-bold bg-transparent outline-none text-zinc-800 dark:text-zinc-200"
                    />
                    <span className="text-[8px] text-zinc-400 uppercase font-black">
                      M
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
