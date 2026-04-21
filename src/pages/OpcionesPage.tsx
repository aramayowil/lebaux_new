import { useState } from 'react'
import { Button, Input, Divider } from '@heroui/react'
import { Save, Check } from 'lucide-react'
import { useCatalogosStore } from '@/store/catalogosStore'
import type { Opciones } from '@/types'

export default function OpcionesPage() {
  const { opciones, setOpciones } = useCatalogosStore()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<Opciones>({ ...opciones })

  const f = <K extends keyof Opciones>(key: K) => ({
    value: String(form[key]),
    onValueChange: (v: string) => setForm(prev => ({ ...prev, [key]: isNaN(Number(v)) ? v : (Number.isInteger(Number(v)) ? parseInt(v) : parseFloat(v)) || prev[key] })),
  })

  function handleSave() {
    setOpciones(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-700 text-steel-800 dark:text-steel-100">Opciones</h2>
          <p className="text-sm text-steel-400 mt-0.5">Configuración general del sistema</p>
        </div>
        <Button
          color={saved ? 'success' : 'primary'}
          startContent={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          onPress={handleSave}
          size="sm"
        >
          {saved ? 'Guardado' : 'Guardar cambios'}
        </Button>
      </div>

      {/* Empresa */}
      <section className="card-surface p-5 space-y-4">
        <p className="section-label">Datos de la empresa</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre / Razón social" {...f('nombre')} size="sm" />
          <Input label="Teléfono" {...f('telefono')} size="sm" />
        </div>
        <Input label="Dirección" {...f('direccion')} size="sm" />
        <Input label="Email" {...f('email')} size="sm" type="email" />
        <Divider />
        <Input label="Encabezado de presupuesto" {...f('encabezadoDePto')} size="sm" />
        <Input label="Pie de presupuesto" {...f('pieDePto')} size="sm" />
      </section>

      {/* Márgenes */}
      <section className="card-surface p-5 space-y-4">
        <p className="section-label">IVA y márgenes de ganancia (%)</p>
        <div className="grid grid-cols-3 gap-3">
          <Input label="IVA" {...f('iva')} size="sm" type="number" endContent={<span className="text-steel-400 text-sm">%</span>} />
          <Input label="Sobre perfiles" {...f('porcentajeSobrePerfiles')} size="sm" type="number" endContent={<span className="text-steel-400 text-sm">%</span>} />
          <Input label="Sobre vidrios" {...f('porcentajeSobreVidrios')} size="sm" type="number" endContent={<span className="text-steel-400 text-sm">%</span>} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Sobre accesorios" {...f('porcentajeSobreAccesorios')} size="sm" type="number" endContent={<span className="text-steel-400 text-sm">%</span>} />
          <Input label="Sobre pinturas" {...f('porcentajeSobrePinturas')} size="sm" type="number" endContent={<span className="text-steel-400 text-sm">%</span>} />
          <Input label="Sobre telas" {...f('porcentajeSobreTelas')} size="sm" type="number" endContent={<span className="text-steel-400 text-sm">%</span>} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Sobre mano de obra" {...f('porcentajeSobreMano')} size="sm" type="number" endContent={<span className="text-steel-400 text-sm">%</span>} />
          <Input label="Sobre colocación" {...f('porcentajeSobreManoColocacion')} size="sm" type="number" endContent={<span className="text-steel-400 text-sm">%</span>} />
          <Input label="Sobre ítems manuales" {...f('porcentajeSobreItemsManuales')} size="sm" type="number" endContent={<span className="text-steel-400 text-sm">%</span>} />
        </div>
      </section>

      {/* Mano de obra */}
      <section className="card-surface p-5 space-y-4">
        <p className="section-label">Mano de obra taller</p>
        <Input label="Costo hora taller ($)" {...f('costoHoraTaller')} size="sm" type="number" className="max-w-xs" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {([
            ['Marco',       'tiempoMarcoHoras',       'tiempoMarcoMinutos'],
            ['Hoja',        'tiempoHojaHoras',        'tiempoHojaMinutos'],
            ['Interior',    'tiempoInteriorHoras',    'tiempoInteriorMinutos'],
            ['Cruce',       'tiempoCruceHoras',       'tiempoCruceMinutos'],
            ['Contravidrio','tiempoContravidrioHoras','tiempoContravidrioMinutos'],
            ['Mosquitero',  'tiempoMosquiteroHoras',  'tiempoMosquiteroMinutos'],
          ] as [string, keyof Opciones, keyof Opciones][]).map(([label, kh, km]) => (
            <div key={label} className="card-surface p-3 space-y-2">
              <p className="text-xs font-semibold text-steel-500">{label}</p>
              <div className="flex gap-2">
                <Input label="h" {...f(kh)} size="sm" type="number" className="w-full" />
                <Input label="min" {...f(km)} size="sm" type="number" className="w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
