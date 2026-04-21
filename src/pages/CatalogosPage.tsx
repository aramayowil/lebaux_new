import { useState } from 'react'
import { Tabs, Tab } from '@heroui/react'
import PerfilesTab     from '@/components/catalogs/PerfilesTab'
import AccesoriosTab   from '@/components/catalogs/AccesoriosTab'
import VidriosTab      from '@/components/catalogs/VidriosTab'
import TratamientosTab from '@/components/catalogs/TratamientosTab'
import ExtrusorasTab   from '@/components/catalogs/ExtrusorasTab'
import MonedasTab      from '@/components/catalogs/MonedasTab'

export default function CatalogosPage() {
  const [tab, setTab] = useState('perfiles')

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <div className="mb-5">
        <h2 className="font-display text-xl font-700 text-steel-800 dark:text-steel-100">Catálogos</h2>
        <p className="text-sm text-steel-400 mt-0.5">Materiales, accesorios y configuraciones maestras</p>
      </div>

      <Tabs
        selectedKey={tab}
        onSelectionChange={k => setTab(String(k))}
        variant="underlined"
        classNames={{
          tabList: 'border-b border-steel-200 dark:border-steel-700 w-full gap-0 px-0',
          cursor:  'bg-steel-700 dark:bg-steel-400 h-0.5',
          tab:     'text-sm font-medium px-4 h-10',
          tabContent: 'group-data-[selected=true]:text-steel-800 dark:group-data-[selected=true]:text-steel-100',
        }}
      >
        <Tab key="perfiles"     title="Perfiles">
          <div className="mt-5"><PerfilesTab /></div>
        </Tab>
        <Tab key="accesorios"   title="Accesorios">
          <div className="mt-5"><AccesoriosTab /></div>
        </Tab>
        <Tab key="vidrios"      title="Vidrios / Interiores">
          <div className="mt-5"><VidriosTab /></div>
        </Tab>
        <Tab key="tratamientos" title="Tratamientos">
          <div className="mt-5"><TratamientosTab /></div>
        </Tab>
        <Tab key="extrusoras"   title="Extrusoras y Líneas">
          <div className="mt-5"><ExtrusorasTab /></div>
        </Tab>
        <Tab key="monedas"      title="Monedas">
          <div className="mt-5"><MonedasTab /></div>
        </Tab>
      </Tabs>
    </div>
  )
}
