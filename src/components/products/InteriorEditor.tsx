/**
 * InteriorEditor — fiel a la DB Access
 *
 * Interior: solo datos base (id, descripcion, predeterminado)
 * DespieceInterior: fórmulas y descuentos (tabla separada en DB)
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────┐
 * │ [Descripción]                    [Predeterminado ○]     │
 * ├──────────────────────┬──────────────────────────────────┤
 * │  DIMENSIONES          │  SUB-ELEMENTOS (tabs)           │
 * │  (DespieceInterior)   │  [CV Int.][CV Ext.][Cruces][VR] │
 * │  Cantidad             │                                 │
 * │  Ancho                │                                 │
 * │  Alto                 │                                 │
 * │  Descuentos           │                                 │
 * ├──────────────────────┴──────────────────────────────────┤
 * │  DESPIECE DE PERFILES (tabla inline)                    │
 * │  ACCESORIOS (tabla inline)                              │
 * └─────────────────────────────────────────────────────────┘
 */

import { useState } from 'react'
import { Button, Input, Switch, Tabs, Tab, Chip } from '@heroui/react'
import { Plus, Trash2, Check } from 'lucide-react'
import { useProductosStore } from '@/store/productosStore'
import { useCatalogosStore } from '@/store/catalogosStore'
import FormulaInput from '@/components/ui/FormulaInput'
import DespiecePerfilesPanel from './DespiecePerfilesPanel'
import DespieceAccesoriosPanel from './DespieceAccesoriosPanel'
import type {
  Interior, DespieceInterior, Contravidrio, ContravidrioExterior, Cruces, VidRepartido,
} from '@/types'
import clsx from 'clsx'

interface Props { interior: Interior }

const IW  = { inputWrapper: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700' }

export default function InteriorEditor({ interior }: Props) {
  const {
    updateInterior,
    getDespieceInteriorByInterior, addDespieceInterior, updateDespieceInterior,
    getContravidriosByInterior,    addContravidrio,    updateContravidrio,    deleteContravidrio,
    getContravidriosExtByInterior, addContravidrioExt, updateContravidrioExt, deleteContravidrioExt,
    getCrucesByInterior,           addCruces,          updateCruces,          deleteCruces,
    getVidRepartidosByInterior,    addVidRepartido,    updateVidRepartido,    deleteVidRepartido,
    getDespiecePerfilesContravidrio, addDespiecePerfilContravidrio, updateDespiecePerfilContravidrio, deleteDespiecePerfilContravidrio,
    getDespieceCrucesByCruces,       addDespieceCruces,              updateDespieceCruces,              deleteDespieceCruces,
    getDespieceVRByVR,               addDespieceVR,                  updateDespieceVR,                  deleteDespieceVR,
  } = useProductosStore()

  const despInt = getDespieceInteriorByInterior(interior.id)
  const cvs  = getContravidriosByInterior(interior.id)
  const cves = getContravidriosExtByInterior(interior.id)
  const crcs = getCrucesByInterior(interior.id)
  const vrs  = getVidRepartidosByInterior(interior.id)

  const [subTab, setSubTab] = useState('cv-int')
  const upd = (d: Partial<Interior>) => updateInterior(interior.id, d)

  // Asegurar que exista el DespieceInterior para este interior
  function ensureDespInt() {
    if (!despInt) {
      return addDespieceInterior({
        idInterior: interior.id,
        formulaCantidadInteriores: '1',
        formulaAnchoInterior: 'ancho - 20',
        formulaAltoInterior: 'alto - 60',
        descuentoIzquierda: 5, descuentoDerecha: 5,
        descuentoAbajo: 5, descuentoArriba: 5,
      })
    }
    return despInt
  }

  function updDespInt(data: Partial<DespieceInterior>) {
    const di = ensureDespInt()
    updateDespieceInterior(di.id, data)
  }

  return (
    <div className="flex flex-col gap-0 border border-steel-200 dark:border-steel-700 rounded-lg overflow-hidden bg-white dark:bg-steel-900">

      {/* ── Cabecera ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-steel-50 dark:bg-steel-800/60 border-b border-steel-200 dark:border-steel-700">
        <Input
          value={interior.descripcion}
          onValueChange={v => upd({ descripcion: v })}
          size="sm" aria-label="Descripción del interior"
          placeholder="Descripción del interior"
          classNames={{ inputWrapper: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 h-8 min-h-unit-8' }}
          className="max-w-xs"
        />
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-steel-500">Predeterminado</span>
          <Switch
            isSelected={interior.predeterminado}
            onValueChange={v => upd({ predeterminado: v })}
            size="sm"
          />
        </div>
      </div>

      {/* ── Cuerpo dividido ── */}
      <div className="flex min-h-0 divide-x divide-steel-200 dark:divide-steel-700">

        {/* ── Panel izquierdo: dimensiones (DespieceInterior) ── */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-4 p-4">
          <div>
            <SectionTitle>Dimensiones del interior</SectionTitle>
            <div className="space-y-3 mt-2">
              <FormulaInput
                label="Cantidad"
                value={despInt?.formulaCantidadInteriores ?? '1'}
                onChange={v => updDespInt({ formulaCantidadInteriores: v })}
                description="ej: 1, hojas"
              />
              <FormulaInput
                label="Ancho"
                value={despInt?.formulaAnchoInterior ?? ''}
                onChange={v => updDespInt({ formulaAnchoInterior: v })}
                description="ej: ancho/hojas - 40"
              />
              <FormulaInput
                label="Alto"
                value={despInt?.formulaAltoInterior ?? ''}
                onChange={v => updDespInt({ formulaAltoInterior: v })}
                description="ej: alto - 80"
              />
            </div>
          </div>

          <div>
            <SectionTitle>Descuentos de rebaje (mm)</SectionTitle>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {([
                ['Izquierda', 'descuentoIzquierda'],
                ['Derecha',   'descuentoDerecha'],
                ['Arriba',    'descuentoArriba'],
                ['Abajo',     'descuentoAbajo'],
              ] as [string, keyof DespieceInterior][]).map(([label, field]) => (
                <Input key={field} label={label} type="number"
                  value={String(despInt?.[field] ?? 0)}
                  onValueChange={v => updDespInt({ [field]: parseFloat(v) || 0 } as Partial<DespieceInterior>)}
                  size="sm"
                  endContent={<span className="text-[10px] text-steel-400">mm</span>}
                  classNames={IW}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Panel derecho: sub-elementos ── */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Tabs
            selectedKey={subTab}
            onSelectionChange={k => setSubTab(String(k))}
            size="sm"
            variant="underlined"
            classNames={{
              base: 'w-full',
              tabList: 'border-b border-steel-200 dark:border-steel-700 w-full gap-0 px-2',
              cursor: 'bg-steel-600 dark:bg-steel-400 h-0.5',
              tab: 'px-3 h-9 text-xs',
              panel: 'p-0',
            }}
          >
            <Tab key="cv-int" title={<TabBadge label="CV Int." count={cvs.length} />}>
              <SubElementPanel
                items={cvs}
                emptyLabel="Sin contravidrios interiores"
                onAdd={() => addContravidrio({
                  idInterior: interior.id,
                  descripcion: `Contravidrio ${cvs.length + 1}`,
                  predeterminado: cvs.length === 0,
                })}
                renderRow={(cv, sel) => (
                  <ItemRow
                    key={cv.id}
                    label={cv.descripcion}
                    pred={cv.predeterminado}
                    selected={sel === cv.id}
                  />
                )}
                renderEditor={(cv: Contravidrio) => (
                  <ContravidrioForm
                    cv={cv} nivel="contravidrio"
                    onUpdate={d => updateContravidrio(cv.id, d)}
                    onDelete={() => deleteContravidrio(cv.id)}
                    getDespiecePerfiles={getDespiecePerfilesContravidrio}
                    addDespiecePerfil={addDespiecePerfilContravidrio}
                    updateDespiecePerfil={updateDespiecePerfilContravidrio}
                    deleteDespiecePerfil={deleteDespiecePerfilContravidrio}
                  />
                )}
                getItemId={cv => cv.id}
              />
            </Tab>

            <Tab key="cv-ext" title={<TabBadge label="CV Ext." count={cves.length} />}>
              <SubElementPanel
                items={cves}
                emptyLabel="Sin contravidrios exteriores"
                onAdd={() => addContravidrioExt({
                  idInterior: interior.id,
                  descripcion: `CV Ext. ${cves.length + 1}`,
                  predeterminado: cves.length === 0,
                })}
                renderRow={(cv, sel) => (
                  <ItemRow
                    key={cv.id}
                    label={cv.descripcion}
                    pred={cv.predeterminado}
                    selected={sel === cv.id}
                  />
                )}
                renderEditor={(cv: ContravidrioExterior) => (
                  <ContravidrioForm
                    cv={cv} nivel="contravidrioExt"
                    onUpdate={d => updateContravidrioExt(cv.id, d)}
                    onDelete={() => deleteContravidrioExt(cv.id)}
                    getDespiecePerfiles={getDespiecePerfilesContravidrio}
                    addDespiecePerfil={addDespiecePerfilContravidrio}
                    updateDespiecePerfil={updateDespiecePerfilContravidrio}
                    deleteDespiecePerfil={deleteDespiecePerfilContravidrio}
                  />
                )}
                getItemId={cv => cv.id}
              />
            </Tab>

            <Tab key="cruces" title={<TabBadge label="Cruces" count={crcs.length} />}>
              <SubElementPanel
                items={crcs}
                emptyLabel="Sin cruces definidos"
                onAdd={() => addCruces({
                  idInterior: interior.id,
                  descripcion: `Cruces ${crcs.length + 1}`,
                  predeterminado: crcs.length === 0,
                })}
                renderRow={(c, sel) => (
                  <ItemRow
                    key={c.id}
                    label={c.descripcion}
                    pred={c.predeterminado}
                    selected={sel === c.id}
                  />
                )}
                renderEditor={(c: Cruces) => (
                  <CrucesForm
                    cruces={c}
                    onUpdate={d => updateCruces(c.id, d)}
                    onDelete={() => deleteCruces(c.id)}
                    getDespieceCruces={getDespieceCrucesByCruces}
                    addDespieceCruces={addDespieceCruces}
                    updateDespieceCruces={updateDespieceCruces}
                    deleteDespieceCruces={deleteDespieceCruces}
                  />
                )}
                getItemId={c => c.id}
              />
            </Tab>

            <Tab key="vr" title={<TabBadge label="Vid. Repartido" count={vrs.length} />}>
              <SubElementPanel
                items={vrs}
                emptyLabel="Sin vidrios repartidos"
                onAdd={() => addVidRepartido({
                  idInterior: interior.id,
                  descripcion: `VR ${vrs.length + 1}`,
                  predeterminado: vrs.length === 0,
                })}
                renderRow={(vr, sel) => (
                  <ItemRow
                    key={vr.id}
                    label={vr.descripcion}
                    pred={vr.predeterminado}
                    selected={sel === vr.id}
                  />
                )}
                renderEditor={(vr: VidRepartido) => (
                  <VidRepartidoForm
                    vr={vr}
                    onUpdate={d => updateVidRepartido(vr.id, d)}
                    onDelete={() => deleteVidRepartido(vr.id)}
                    getDespieceVR={getDespieceVRByVR}
                    addDespieceVR={addDespieceVR}
                    updateDespieceVR={updateDespieceVR}
                    deleteDespieceVR={deleteDespieceVR}
                  />
                )}
                getItemId={vr => vr.id}
              />
            </Tab>
          </Tabs>
        </div>
      </div>

      {/* ── Despiece del interior ── */}
      <div className="border-t border-steel-200 dark:border-steel-700 divide-y divide-steel-100 dark:divide-steel-800">
        <div className="p-4">
          <DespiecePerfilesPanel nivel="hoja" idParent={interior.id} label="Perfiles del interior" />
        </div>
        <div className="p-4">
          <DespieceAccesoriosPanel nivel="interior" idParent={interior.id} label="Accesorios del interior" />
        </div>
      </div>
    </div>
  )
}

// ── SubElementPanel genérico ──────────────────────────────────────────────────

function SubElementPanel<T extends { id: number }>({
  items, emptyLabel, onAdd, renderRow, renderEditor, getItemId,
}: {
  items: T[]
  emptyLabel: string
  onAdd: () => void
  renderRow: (item: T, selectedId: number | null) => React.ReactNode
  renderEditor: (item: T) => React.ReactNode
  getItemId: (item: T) => number
}) {
  const [selectedId, setSelectedId] = useState<number | null>(
    items.length > 0 ? getItemId(items[0]!) : null
  )

  const sel = items.find(i => getItemId(i) === selectedId) ?? items[0] ?? null

  return (
    <div className="flex min-h-[200px] max-h-[340px]">
      {/* Lista izquierda */}
      <div className="w-48 flex-shrink-0 border-r border-steel-200 dark:border-steel-700 flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-steel-100 dark:border-steel-800">
          <span className="text-[10px] font-semibold text-steel-400 uppercase tracking-wide">
            {items.length} ítem{items.length !== 1 ? 's' : ''}
          </span>
          <Button isIconOnly size="sm" variant="flat" onPress={onAdd}
            className="h-6 w-6 min-w-6">
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {items.length === 0 && (
            <li className="px-3 py-4 text-[11px] text-steel-400 text-center italic">{emptyLabel}</li>
          )}
          {items.map(item => (
            <li
              key={getItemId(item)}
              className={clsx(
                'cursor-pointer border-b border-steel-50 dark:border-steel-800/50 transition-colors',
                sel && getItemId(sel) === getItemId(item)
                  ? 'bg-steel-100 dark:bg-steel-700/60'
                  : 'hover:bg-steel-50 dark:hover:bg-steel-800/40'
              )}
              onClick={() => setSelectedId(getItemId(item))}
            >
              {renderRow(item, sel ? getItemId(sel) : null)}
            </li>
          ))}
        </ul>
      </div>

      {/* Editor derecho */}
      <div className="flex-1 min-w-0 overflow-y-auto p-4">
        {sel ? (
          renderEditor(sel)
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-steel-400">
            <p className="text-xs">{emptyLabel}</p>
            <Button size="sm" variant="flat" startContent={<Plus className="w-3 h-3" />} onPress={onAdd}>
              Agregar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── ItemRow ───────────────────────────────────────────────────────────────────

function ItemRow({ label, pred, selected }: { label: string; pred: boolean; selected: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {pred && <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
      {!pred && <span className="w-3 flex-shrink-0" />}
      <span className={clsx(
        'text-xs truncate',
        selected ? 'font-semibold text-steel-900 dark:text-steel-100' : 'text-steel-600 dark:text-steel-300'
      )}>
        {label}
      </span>
    </div>
  )
}

// ── ContravidrioForm ──────────────────────────────────────────────────────────
// Las fórmulas del contravidrio están en DespiecePerfilContravidrio (tabla separada en DB)

import type { DespiecePerfilContravidrio } from '@/types'
import { useCatalogosStore as useCat } from '@/store/catalogosStore'

function ContravidrioForm({ cv, nivel, onUpdate, onDelete, getDespiecePerfiles, addDespiecePerfil, updateDespiecePerfil, deleteDespiecePerfil }: {
  cv: Contravidrio | ContravidrioExterior
  nivel: 'contravidrio' | 'contravidrioExt'
  onUpdate: (d: Partial<Contravidrio>) => void
  onDelete: () => void
  getDespiecePerfiles: (nivel: 'contravidrio' | 'contravidrioExt', idCV: number) => DespiecePerfilContravidrio[]
  addDespiecePerfil: (nivel: 'contravidrio' | 'contravidrioExt', d: Omit<DespiecePerfilContravidrio, 'id'>) => void
  updateDespiecePerfil: (nivel: 'contravidrio' | 'contravidrioExt', id: number, d: Partial<DespiecePerfilContravidrio>) => void
  deleteDespiecePerfil: (nivel: 'contravidrio' | 'contravidrioExt', id: number) => void
}) {
  const { perfiles } = useCat()
  const items = getDespiecePerfiles(nivel, cv.id)
  const ANGULOS = ['45', '90', '0', '']

  return (
    <div className="space-y-4">
      <FormHeader
        name={cv.descripcion} pred={cv.predeterminado}
        onName={v => onUpdate({ descripcion: v })}
        onPred={v => onUpdate({ predeterminado: v })}
        onDelete={onDelete}
      />

      <FieldGroup title="Perfil y fórmulas del contravidrio">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-steel-400 uppercase font-semibold tracking-wide">Perfiles</span>
            <Button size="sm" variant="flat" startContent={<Plus className="w-3 h-3" />}
              onPress={() => addDespiecePerfil(nivel, {
                idContravidrio: cv.id,
                perfil: perfiles[0]?.nroPerfil ?? '',
                formulaCantidadAncho: 'hojas*2',
                formulaCantidadAlto: 'hojas*2',
                formulaContravidrioAncho: 'ancho - 20',
                formulaContravidrioAlto: 'alto - 10',
                angulo: '90',
              })}>
              Agregar
            </Button>
          </div>

          {items.map(item => (
            <div key={item.id} className="bg-steel-50 dark:bg-steel-800/40 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <select
                  value={item.perfil}
                  onChange={e => updateDespiecePerfil(nivel, item.id, { perfil: e.target.value })}
                  className="flex-1 text-xs bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 rounded px-2 py-1"
                >
                  {perfiles.map(p => (
                    <option key={p.nroPerfil} value={p.nroPerfil}>{p.nroPerfil} - {p.descri}</option>
                  ))}
                </select>
                <select
                  value={item.angulo}
                  onChange={e => updateDespiecePerfil(nivel, item.id, { angulo: e.target.value })}
                  className="w-16 text-xs bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 rounded px-2 py-1"
                >
                  {ANGULOS.map(a => <option key={a} value={a}>{a || '—'}</option>)}
                </select>
                <Button isIconOnly size="sm" variant="light" color="danger"
                  onPress={() => deleteDespiecePerfil(nivel, item.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormulaInput label="Cant. horizontal"
                  value={item.formulaCantidadAncho}
                  onChange={v => updateDespiecePerfil(nivel, item.id, { formulaCantidadAncho: v })}
                  description="ej: hojas*2" />
                <FormulaInput label="Cant. vertical"
                  value={item.formulaCantidadAlto}
                  onChange={v => updateDespiecePerfil(nivel, item.id, { formulaCantidadAlto: v })}
                  description="ej: hojas*2" />
                <FormulaInput label="Largo horizontal"
                  value={item.formulaContravidrioAncho}
                  onChange={v => updateDespiecePerfil(nivel, item.id, { formulaContravidrioAncho: v })}
                  description="ej: ancho - 20" />
                <FormulaInput label="Largo vertical"
                  value={item.formulaContravidrioAlto}
                  onChange={v => updateDespiecePerfil(nivel, item.id, { formulaContravidrioAlto: v })}
                  description="ej: alto - 10" />
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-xs text-steel-400 italic text-center py-3">Sin perfiles definidos</p>
          )}
        </div>
      </FieldGroup>
    </div>
  )
}

// ── CrucesForm ────────────────────────────────────────────────────────────────
// Las fórmulas del cruce están en DespieceCruces (tabla separada en DB)

import type { DespieceCruces } from '@/types'

function CrucesForm({ cruces, onUpdate, onDelete, getDespieceCruces, addDespieceCruces, updateDespieceCruces, deleteDespieceCruces }: {
  cruces: Cruces
  onUpdate: (d: Partial<Cruces>) => void
  onDelete: () => void
  getDespieceCruces: (idCruces: number) => DespieceCruces | undefined
  addDespieceCruces: (d: Omit<DespieceCruces, 'id'>) => DespieceCruces
  updateDespieceCruces: (id: number, d: Partial<DespieceCruces>) => void
  deleteDespieceCruces: (id: number) => void
}) {
  const { perfiles } = useCat()
  const dc = getDespieceCruces(cruces.id)
  const ANGULOS = ['45', '90', '0', '']

  function ensureDC() {
    if (!dc) {
      return addDespieceCruces({
        idCruces: cruces.id,
        perfil: perfiles[0]?.nroPerfil ?? '',
        formulaCantidad: '1',
        formulaAnchoEntero: 'ancho - 20',
        formulaAltoEntero: 'alto - 20',
        descuentoDeVidrio: 0,
        descuentoDeSiMismo: 0,
        angulo: '90',
      })
    }
    return dc
  }

  function updDC(data: Partial<DespieceCruces>) {
    const d = ensureDC()
    updateDespieceCruces(d.id, data)
  }

  return (
    <div className="space-y-4">
      <FormHeader
        name={cruces.descripcion} pred={cruces.predeterminado}
        onName={v => onUpdate({ descripcion: v })}
        onPred={v => onUpdate({ predeterminado: v })}
        onDelete={onDelete}
      />

      <FieldGroup title="Perfil del cruce">
        <div className="flex gap-2">
          <select
            value={dc?.perfil ?? ''}
            onChange={e => updDC({ perfil: e.target.value })}
            className="flex-1 text-xs bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 rounded px-2 py-1"
          >
            {perfiles.map(p => (
              <option key={p.nroPerfil} value={p.nroPerfil}>{p.nroPerfil} - {p.descri}</option>
            ))}
          </select>
          <select
            value={dc?.angulo ?? '90'}
            onChange={e => updDC({ angulo: e.target.value })}
            className="w-16 text-xs bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 rounded px-2 py-1"
          >
            {ANGULOS.map(a => <option key={a} value={a}>{a || '—'}</option>)}
          </select>
        </div>
      </FieldGroup>

      <FieldGroup title="Medidas de los perfiles de cruce">
        <div className="grid grid-cols-2 gap-3">
          <FormulaInput label="Cant. perfiles"
            value={dc?.formulaCantidad ?? '1'}
            onChange={v => updDC({ formulaCantidad: v })}
            description="ej: 1" />
          <div />
          <FormulaInput label="Largo horizontal"
            value={dc?.formulaAnchoEntero ?? ''}
            onChange={v => updDC({ formulaAnchoEntero: v })}
            description="ej: ancho - 20" />
          <FormulaInput label="Largo vertical"
            value={dc?.formulaAltoEntero ?? ''}
            onChange={v => updDC({ formulaAltoEntero: v })}
            description="ej: alto - 20" />
        </div>
      </FieldGroup>

      <FieldGroup title="Descuentos en intersecciones">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Desc. de sí mismo" type="number"
            value={String(dc?.descuentoDeSiMismo ?? 0)}
            onValueChange={v => updDC({ descuentoDeSiMismo: parseFloat(v) || 0 })}
            size="sm" endContent={<span className="text-[10px] text-steel-400">mm</span>}
            description="El cruce se corta a sí mismo"
            classNames={IW} />
          <Input label="Desc. de vidrio" type="number"
            value={String(dc?.descuentoDeVidrio ?? 0)}
            onValueChange={v => updDC({ descuentoDeVidrio: parseFloat(v) || 0 })}
            size="sm" endContent={<span className="text-[10px] text-steel-400">mm</span>}
            description="Rebaje sobre el vidrio"
            classNames={IW} />
        </div>
      </FieldGroup>

      <FieldGroup title="Accesorios del cruce">
        <DespieceAccesoriosPanel nivel="cruces" idParent={cruces.id} />
      </FieldGroup>
    </div>
  )
}

// ── VidRepartidoForm ──────────────────────────────────────────────────────────
// Las fórmulas del VR están en DespieceVR (tabla "Despiece perfiles vidrio repartido" en DB)

import type { DespieceVR } from '@/types'

function VidRepartidoForm({ vr, onUpdate, onDelete, getDespieceVR, addDespieceVR, updateDespieceVR, deleteDespieceVR }: {
  vr: VidRepartido
  onUpdate: (d: Partial<VidRepartido>) => void
  onDelete: () => void
  getDespieceVR: (idVR: number) => DespieceVR | undefined
  addDespieceVR: (d: Omit<DespieceVR, 'id'>) => DespieceVR
  updateDespieceVR: (id: number, d: Partial<DespieceVR>) => void
  deleteDespieceVR: (id: number) => void
}) {
  const { perfiles } = useCat()
  const dv = getDespieceVR(vr.id)
  const ANGULOS = ['45', '90', '0', '']

  function ensureDV() {
    if (!dv) {
      return addDespieceVR({
        idVR: vr.id,
        perfilDeContorno: perfiles[0]?.nroPerfil ?? '',
        formulaCantidadContornoAncho: 'hojas*2',
        formulaCantidadContornoAlto: 'hojas*2',
        formulaContornoAncho: 'ancho - 20',
        formulaContornoAlto: 'alto - 20',
        angulo: '45',
        perfilDeCruce: perfiles[0]?.nroPerfil ?? '',
        formulaCruceAncho: 'ancho - 20',
        formulaCruceAlto: 'alto - 20',
        descuentoDeVidrio: 0,
        descuentoDeSi: 0,
        anguloCruce: '45',
        formulaCantidadInteriores: '(crucesH+1)*(crucesV+1)',
        formulaAnchoInterior: '(ancho-10)/(crucesV+1)',
        formulaAltoInterior: '(alto-10)/(crucesH+1)',
        descuentoIzquierda: 5, descuentoDerecha: 5,
        descuentoAbajo: 5, descuentoArriba: 5,
      })
    }
    return dv
  }

  function updDV(data: Partial<DespieceVR>) {
    const d = ensureDV()
    updateDespieceVR(d.id, data)
  }

  return (
    <div className="space-y-4">
      <FormHeader
        name={vr.descripcion} pred={vr.predeterminado}
        onName={v => onUpdate({ descripcion: v })}
        onPred={v => onUpdate({ predeterminado: v })}
        onDelete={onDelete}
      />

      <FieldGroup title="Perfil de contorno">
        <div className="flex gap-2">
          <select value={dv?.perfilDeContorno ?? ''} onChange={e => updDV({ perfilDeContorno: e.target.value })}
            className="flex-1 text-xs bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 rounded px-2 py-1">
            {perfiles.map(p => <option key={p.nroPerfil} value={p.nroPerfil}>{p.nroPerfil} - {p.descri}</option>)}
          </select>
          <select value={dv?.angulo ?? '45'} onChange={e => updDV({ angulo: e.target.value })}
            className="w-16 text-xs bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 rounded px-2 py-1">
            {ANGULOS.map(a => <option key={a} value={a}>{a || '—'}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <FormulaInput label="Cant. horiz." value={dv?.formulaCantidadContornoAncho ?? ''} onChange={v => updDV({ formulaCantidadContornoAncho: v })} description="ej: hojas*2" />
          <FormulaInput label="Cant. vert."  value={dv?.formulaCantidadContornoAlto ?? ''}  onChange={v => updDV({ formulaCantidadContornoAlto: v })}  description="ej: hojas*2" />
          <FormulaInput label="Largo horiz." value={dv?.formulaContornoAncho ?? ''}        onChange={v => updDV({ formulaContornoAncho: v })}        description="ej: ancho - 20" />
          <FormulaInput label="Largo vert."  value={dv?.formulaContornoAlto ?? ''}         onChange={v => updDV({ formulaContornoAlto: v })}         description="ej: alto - 20" />
        </div>
      </FieldGroup>

      <FieldGroup title="Perfil de cruce (cruceta)">
        <div className="flex gap-2">
          <select value={dv?.perfilDeCruce ?? ''} onChange={e => updDV({ perfilDeCruce: e.target.value })}
            className="flex-1 text-xs bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 rounded px-2 py-1">
            {perfiles.map(p => <option key={p.nroPerfil} value={p.nroPerfil}>{p.nroPerfil} - {p.descri}</option>)}
          </select>
          <select value={dv?.anguloCruce ?? '45'} onChange={e => updDV({ anguloCruce: e.target.value })}
            className="w-16 text-xs bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 rounded px-2 py-1">
            {ANGULOS.map(a => <option key={a} value={a}>{a || '—'}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <FormulaInput label="Largo horiz." value={dv?.formulaCruceAncho ?? ''} onChange={v => updDV({ formulaCruceAncho: v })} description="ej: ancho - 20" />
          <FormulaInput label="Largo vert."  value={dv?.formulaCruceAlto ?? ''}  onChange={v => updDV({ formulaCruceAlto: v })}  description="ej: alto - 20" />
          <Input label="Desc. de vidrio" type="number" value={String(dv?.descuentoDeVidrio ?? 0)} onValueChange={v => updDV({ descuentoDeVidrio: parseFloat(v) || 0 })} size="sm" endContent={<span className="text-[10px] text-steel-400">mm</span>} classNames={IW} />
          <Input label="Desc. de sí mismo" type="number" value={String(dv?.descuentoDeSi ?? 0)} onValueChange={v => updDV({ descuentoDeSi: parseFloat(v) || 0 })} size="sm" endContent={<span className="text-[10px] text-steel-400">mm</span>} classNames={IW} />
        </div>
      </FieldGroup>

      <FieldGroup title="Interiores del vidrio repartido">
        <div className="grid grid-cols-2 gap-3">
          <FormulaInput label="Cantidad" value={dv?.formulaCantidadInteriores ?? ''} onChange={v => updDV({ formulaCantidadInteriores: v })} description="ej: (crucesH+1)*(crucesV+1)" />
          <div />
          <FormulaInput label="Ancho" value={dv?.formulaAnchoInterior ?? ''} onChange={v => updDV({ formulaAnchoInterior: v })} description="ej: (ancho-10)/(crucesV+1)" />
          <FormulaInput label="Alto"  value={dv?.formulaAltoInterior ?? ''}  onChange={v => updDV({ formulaAltoInterior: v })}  description="ej: (alto-10)/(crucesH+1)" />
        </div>
      </FieldGroup>

      <FieldGroup title="Descuentos en los bordes (mm)">
        <div className="grid grid-cols-4 gap-2">
          {([
            ['Izquierda', 'descuentoIzquierda'],
            ['Derecha',   'descuentoDerecha'],
            ['Arriba',    'descuentoArriba'],
            ['Abajo',     'descuentoAbajo'],
          ] as [string, keyof DespieceVR][]).map(([label, field]) => (
            <Input key={field} label={label} type="number"
              value={String(dv?.[field] ?? 0)}
              onValueChange={v => updDV({ [field]: parseFloat(v) || 0 } as Partial<DespieceVR>)}
              size="sm" endContent={<span className="text-[10px] text-steel-400">mm</span>}
              classNames={IW} />
          ))}
        </div>
      </FieldGroup>
    </div>
  )
}

// ── Shared mini-components ────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-steel-500 uppercase tracking-wide">
      {children}
    </p>
  )
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold text-steel-400 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  )
}

function FormHeader({ name, pred, onName, onPred, onDelete }: {
  name: string; pred: boolean
  onName: (v: string) => void
  onPred: (v: boolean) => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-steel-100 dark:border-steel-800">
      <Input value={name} onValueChange={onName} size="sm" aria-label="Descripción"
        classNames={{ inputWrapper: 'bg-transparent border-0 shadow-none h-7 min-h-unit-7 px-0' }}
        className="flex-1" />
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[10px] text-steel-400">Pred.</span>
        <Switch isSelected={pred} onValueChange={onPred} size="sm" aria-label="Predeterminado" />
      </div>
      <Button isIconOnly size="sm" variant="light" color="danger" onPress={onDelete} className="h-7 w-7 min-w-7">
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

function TabBadge({ label, count }: { label: string; count: number }) {
  return (
    <span className="flex items-center gap-1">
      {label}
      {count > 0 && (
        <Chip size="sm" variant="flat" className="h-4 min-w-unit-4 text-[10px]">{count}</Chip>
      )}
    </span>
  )
}
