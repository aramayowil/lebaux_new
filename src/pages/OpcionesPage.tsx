import { useState } from "react";
import { Button, Input } from "@heroui/react";
import {
  Save,
  Check,
  Building2,
  Percent,
  Clock,
  DollarSign,
  ReceiptText,
} from "lucide-react";
import { useCatalogosStore } from "@/store/catalogosStore";
import type { Opciones } from "@/types";

export default function OpcionesPage() {
  const { opciones, setOpciones } = useCatalogosStore();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Opciones>({ ...opciones });

  const f = <K extends keyof Opciones>(key: K) => ({
    value: String(form[key]),
    onValueChange: (v: string) =>
      setForm((prev) => ({
        ...prev,
        [key]: isNaN(Number(v))
          ? v
          : (Number.isInteger(Number(v)) ? parseInt(v) : parseFloat(v)) ||
            prev[key],
      })),
  });

  function handleSave() {
    setOpciones(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Encabezado Principal */}
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

      {/* Grid de Configuración */}
      <div className="grid grid-cols-1 gap-12">
        {/* Bloque 1: Empresa */}
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
              {...f("nombre")}
              variant="bordered"
              className="font-sans"
            />
            <Input
              label="Teléfono de contacto"
              labelPlacement="outside"
              placeholder="+54..."
              {...f("telefono")}
              variant="bordered"
            />
            <Input
              label="Dirección Comercial"
              labelPlacement="outside"
              className="md:col-span-2"
              {...f("direccion")}
              variant="bordered"
            />
            <Input
              label="Correo Electrónico"
              labelPlacement="outside"
              type="email"
              {...f("email")}
              variant="bordered"
            />
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
              <Input
                label="Texto Encabezado (PDF)"
                labelPlacement="outside"
                {...f("encabezadoDePto")}
                variant="bordered"
                startContent={<ReceiptText className="w-4 h-4 text-zinc-300" />}
              />
              <Input
                label="Texto Pie (PDF)"
                labelPlacement="outside"
                {...f("pieDePto")}
                variant="bordered"
              />
            </div>
          </div>
        </section>

        {/* Bloque 2: Finanzas */}
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
              { id: "porcentajeSobrePerfiles", label: "Perfiles" },
              { id: "porcentajeSobreVidrios", label: "Vidrios" },
              { id: "porcentajeSobreAccesorios", label: "Accesorios" },
              { id: "porcentajeSobrePinturas", label: "Pinturas" },
              { id: "porcentajeSobreTelas", label: "Telas" },
              { id: "porcentajeSobreMano", label: "Mano Obra" },
              { id: "porcentajeSobreManoColocacion", label: "Colocación" },
              { id: "porcentajeSobreItemsManuales", label: "Manuales" },
            ].map((item) => (
              <Input
                key={item.id}
                label={item.label}
                labelPlacement="outside"
                {...f(item.id as keyof Opciones)}
                type="number"
                variant="faded"
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

        {/* Bloque 3: Producción */}
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
                {...f("costoHoraTaller")}
                className="bg-transparent font-mono text-base font-bold text-white w-20 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ["Marco", "tiempoMarcoHoras", "tiempoMarcoMinutos"],
              ["Hoja", "tiempoHojaHoras", "tiempoHojaMinutos"],
              ["Interior", "tiempoInteriorHoras", "tiempoInteriorMinutos"],
              ["Cruce", "tiempoCruceHoras", "tiempoCruceMinutos"],
              [
                "Contravidrio",
                "tiempoContravidrioHoras",
                "tiempoContravidrioMinutos",
              ],
              [
                "Mosquitero",
                "tiempoMosquiteroHoras",
                "tiempoMosquiteroMinutos",
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
                      {...f(kh as keyof Opciones)}
                      type="number"
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
                      {...f(km as keyof Opciones)}
                      type="number"
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
