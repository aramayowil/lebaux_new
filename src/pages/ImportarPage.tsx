import { useState, useRef, useCallback } from 'react'
import { Button, Switch, Progress, Chip } from '@heroui/react'
import { Upload, FileJson, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react'
import { useCatalogosStore } from '@/store/catalogosStore'
import type { Perfil, Accesorio } from '@/types'
import clsx from 'clsx'

// ─── Tipos del archivo JSON de importación ────────────────────────────────────

interface ImportPerfil {
  nroPerfil: string
  descri:    string
  pesoMetro: number
  longTira:  number
  precioKg?: number
  moneda?:   number
  cubre?:    number
  idLinea?:  number
}

interface ImportAccesorio {
  codParte: string
  descri:   string
  precio?:  number
  unidad?:  0 | 1
  moneda?:  number
}

interface ImportJSON {
  version?: string
  source?:  string
  exportedAt?: string
  perfiles:    ImportPerfil[]
  accesorios:  ImportAccesorio[]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountCard({ label, total, nuevo, existing }: {
  label: string; total: number; nuevo: number; existing: number
}) {
  return (
    <div className="card-surface p-4 flex flex-col gap-2">
      <p className="text-sm font-semibold text-steel-700 dark:text-steel-200">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{total.toLocaleString('es-AR')}</p>
      <div className="flex gap-2 flex-wrap">
        <Chip size="sm" color="success" variant="flat">{nuevo} nuevos</Chip>
        {existing > 0 && <Chip size="sm" color="warning" variant="flat">{existing} existentes</Chip>}
      </div>
    </div>
  )
}

function OptionRow({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-steel-100 dark:border-steel-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-steel-700 dark:text-steel-200">{label}</p>
        {description && <p className="text-xs text-steel-500 mt-0.5">{description}</p>}
      </div>
      <Switch isSelected={checked} onValueChange={onChange} size="sm" />
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Phase = 'upload' | 'preview' | 'importing' | 'done'

export default function ImportarPage() {
  const { perfiles, accesorios, setPerfil, setAccesorio } = useCatalogosStore()

  const [phase, setPhase]       = useState<Phase>('upload')
  const [dragging, setDragging] = useState(false)
  const [data, setData]         = useState<ImportJSON | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Options
  const [importPerfiles,   setImportPerfiles]   = useState(true)
  const [importAccesorios, setImportAccesorios] = useState(true)
  const [skipExisting,     setSkipExisting]     = useState(true)

  // Progress
  const [progress, setProgress]             = useState(0)
  const [totalItems, setTotalItems]         = useState(0)
  const [resultPerfiles, setResultPerfiles] = useState({ nuevos: 0, saltados: 0 })
  const [resultAccesorios, setResultAccesorios] = useState({ nuevos: 0, saltados: 0 })

  // ── Derived counts ──────────────────────────────────────────────────────────

  const existingPerfilIds   = new Set(perfiles.map(p => p.nroPerfil))
  const existingAccesorioIds = new Set(accesorios.map(a => a.codParte))

  const previewPerfiles = data ? {
    total:    data.perfiles.length,
    nuevo:    data.perfiles.filter(p => !existingPerfilIds.has(p.nroPerfil)).length,
    existing: data.perfiles.filter(p =>  existingPerfilIds.has(p.nroPerfil)).length,
  } : null

  const previewAccesorios = data ? {
    total:    data.accesorios.length,
    nuevo:    data.accesorios.filter(a => !existingAccesorioIds.has(a.codParte)).length,
    existing: data.accesorios.filter(a =>  existingAccesorioIds.has(a.codParte)).length,
  } : null

  // ── File handling ────────────────────────────────────────────────────────────

  function parseFile(file: File) {
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as ImportJSON
        if (!parsed.perfiles && !parsed.accesorios) {
          throw new Error('El archivo no tiene el formato esperado (faltan perfiles/accesorios)')
        }
        setData({
          ...parsed,
          perfiles:   parsed.perfiles   ?? [],
          accesorios: parsed.accesorios ?? [],
        })
        setPhase('preview')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al parsear el archivo JSON')
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  // ── Import ───────────────────────────────────────────────────────────────────

  async function runImport() {
    if (!data) return
    setPhase('importing')
    setProgress(0)

    const pfsToImport = importPerfiles
      ? (skipExisting
          ? data.perfiles.filter(p => !existingPerfilIds.has(p.nroPerfil))
          : data.perfiles)
      : []

    const accsToImport = importAccesorios
      ? (skipExisting
          ? data.accesorios.filter(a => !existingAccesorioIds.has(a.codParte))
          : data.accesorios)
      : []

    const saltadosPf  = importPerfiles   ? data.perfiles.length   - pfsToImport.length  : 0
    const saltadosAcc = importAccesorios ? data.accesorios.length - accsToImport.length : 0

    const total = pfsToImport.length + accsToImport.length
    setTotalItems(total)

    let done = 0
    const BATCH = 50

    // Batch perfiles
    for (let i = 0; i < pfsToImport.length; i += BATCH) {
      const batch = pfsToImport.slice(i, i + BATCH)
      for (const p of batch) {
        const perfil: Perfil = {
          nroPerfil: p.nroPerfil,
          descri:    p.descri || '(sin descripción)',
          pesoMetro: p.pesoMetro,
          longTira:  p.longTira || 6000,
          precioKg:  p.precioKg ?? 0,
          moneda:    p.moneda   ?? 1,
          cubre:     p.cubre    ?? 0,
          idLinea:   p.idLinea  ?? 0,
        }
        setPerfil(perfil)
        done++
      }
      setProgress(Math.round((done / total) * 100))
      // yield to UI
      await new Promise(r => setTimeout(r, 0))
    }

    // Batch accesorios
    for (let i = 0; i < accsToImport.length; i += BATCH) {
      const batch = accsToImport.slice(i, i + BATCH)
      for (const a of batch) {
        const acc: Accesorio = {
          codParte: a.codParte,
          descri:   a.descri || '(sin descripción)',
          precio:   a.precio  ?? 0,
          unidad:   (a.unidad ?? 0) as 0 | 1,
          moneda:   a.moneda  ?? 1,
        }
        setAccesorio(acc)
        done++
      }
      setProgress(Math.round((done / total) * 100))
      await new Promise(r => setTimeout(r, 0))
    }

    setResultPerfiles({   nuevos: pfsToImport.length,  saltados: saltadosPf })
    setResultAccesorios({ nuevos: accsToImport.length, saltados: saltadosAcc })
    setProgress(100)
    setPhase('done')
  }

  function reset() {
    setPhase('upload')
    setData(null)
    setError(null)
    setProgress(0)
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Upload phase ── */}
      {phase === 'upload' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-steel-800 dark:text-steel-100 mb-1">
              Importar catálogo desde archivo
            </h2>
            <p className="text-sm text-steel-500">
              Cargá el archivo <code className="text-xs bg-steel-100 dark:bg-steel-800 px-1 py-0.5 rounded">open2d2_import.json</code> generado
              por el extractor de base de datos Access.
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileRef.current?.click()}
            className={clsx(
              'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors',
              dragging
                ? 'border-steel-400 bg-steel-50 dark:bg-steel-800/50'
                : 'border-steel-200 dark:border-steel-700 hover:border-steel-400 hover:bg-steel-50 dark:hover:bg-steel-800/30'
            )}
          >
            <FileJson className="w-12 h-12 text-steel-300 dark:text-steel-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-steel-600 dark:text-steel-300">
              Arrastrá el archivo aquí o hacé clic para seleccionar
            </p>
            <p className="text-xs text-steel-400 mt-1">Sólo archivos .json</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />

          {error && (
            <div className="flex items-start gap-2 text-danger-600 bg-danger-50 dark:bg-danger-900/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Info box */}
          <div className="card-surface p-4 space-y-2">
            <p className="text-xs font-semibold text-steel-500 uppercase tracking-wide">¿Cómo obtengo el archivo?</p>
            <p className="text-sm text-steel-600 dark:text-steel-300">
              El archivo <code className="text-xs bg-steel-100 dark:bg-steel-800 px-1 py-0.5 rounded">open2d2_import.json</code> se genera
              con el extractor de bases de datos Access que parsea el archivo <code className="text-xs bg-steel-100 dark:bg-steel-800 px-1 py-0.5 rounded">Open2D2.accdr</code> o <code className="text-xs bg-steel-100 dark:bg-steel-800 px-1 py-0.5 rounded">Opendata.accdb</code>.
            </p>
            <p className="text-sm text-steel-500">
              Los precios quedarán en $0 y deberán actualizarse desde el módulo <strong>Catálogos</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── Preview phase ── */}
      {phase === 'preview' && data && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success-500" />
            <div>
              <p className="font-semibold text-steel-800 dark:text-steel-100">Archivo cargado correctamente</p>
              {data.source && <p className="text-xs text-steel-500">Origen: {data.source}</p>}
              {data.exportedAt && <p className="text-xs text-steel-500">Exportado: {data.exportedAt}</p>}
            </div>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-2 gap-3">
            {previewPerfiles && (
              <CountCard
                label="Perfiles"
                total={previewPerfiles.total}
                nuevo={previewPerfiles.nuevo}
                existing={previewPerfiles.existing}
              />
            )}
            {previewAccesorios && (
              <CountCard
                label="Accesorios"
                total={previewAccesorios.total}
                nuevo={previewAccesorios.nuevo}
                existing={previewAccesorios.existing}
              />
            )}
          </div>

          {/* Options */}
          <div className="card-surface p-4">
            <p className="text-xs font-semibold text-steel-500 uppercase tracking-wide mb-1">Opciones de importación</p>
            <OptionRow
              label="Importar perfiles"
              description={`${data.perfiles.length} perfiles en el archivo`}
              checked={importPerfiles}
              onChange={setImportPerfiles}
            />
            <OptionRow
              label="Importar accesorios"
              description={`${data.accesorios.length} accesorios en el archivo`}
              checked={importAccesorios}
              onChange={setImportAccesorios}
            />
            <OptionRow
              label="Omitir existentes"
              description="No sobreescribir registros que ya existen en el catálogo (recomendado)"
              checked={skipExisting}
              onChange={setSkipExisting}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="flat" startContent={<RotateCcw className="w-3.5 h-3.5" />} onPress={reset} size="sm">
              Cambiar archivo
            </Button>
            <Button
              color="primary"
              startContent={<Upload className="w-3.5 h-3.5" />}
              onPress={runImport}
              isDisabled={!importPerfiles && !importAccesorios}
            >
              Importar
            </Button>
          </div>
        </div>
      )}

      {/* ── Importing phase ── */}
      {phase === 'importing' && (
        <div className="space-y-6 py-8">
          <div className="text-center space-y-2">
            <p className="font-semibold text-steel-700 dark:text-steel-200">Importando datos...</p>
            <p className="text-sm text-steel-500">
              {Math.round(progress * totalItems / 100)} de {totalItems} registros
            </p>
          </div>
          <Progress
            value={progress}
            color="primary"
            className="w-full"
            classNames={{ track: 'h-2' }}
          />
          <p className="text-center text-xs text-steel-400">{progress}%</p>
        </div>
      )}

      {/* ── Done phase ── */}
      {phase === 'done' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-success-500" />
            <p className="text-lg font-semibold text-steel-800 dark:text-steel-100">Importación completada</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card-surface p-4">
              <p className="text-sm font-semibold text-steel-600 dark:text-steel-300 mb-2">Perfiles</p>
              <p className="text-2xl font-bold text-success-600">{resultPerfiles.nuevos}</p>
              <p className="text-xs text-steel-500">registros agregados</p>
              {resultPerfiles.saltados > 0 && (
                <p className="text-xs text-warning-500 mt-1">{resultPerfiles.saltados} omitidos</p>
              )}
            </div>
            <div className="card-surface p-4">
              <p className="text-sm font-semibold text-steel-600 dark:text-steel-300 mb-2">Accesorios</p>
              <p className="text-2xl font-bold text-success-600">{resultAccesorios.nuevos}</p>
              <p className="text-xs text-steel-500">registros agregados</p>
              {resultAccesorios.saltados > 0 && (
                <p className="text-xs text-warning-500 mt-1">{resultAccesorios.saltados} omitidos</p>
              )}
            </div>
          </div>

          <div className="card-surface p-4 text-sm text-steel-600 dark:text-steel-300 space-y-1">
            <p>✓ Los datos ya están disponibles en <strong>Catálogos → Perfiles</strong> y <strong>Catálogos → Accesorios</strong>.</p>
            <p>⚠ Los precios quedaron en $0. Actualizalos desde el módulo Catálogos.</p>
          </div>

          <div className="flex justify-between">
            <Button variant="flat" startContent={<RotateCcw className="w-3.5 h-3.5" />} onPress={reset} size="sm">
              Nueva importación
            </Button>
            <Button as="a" href="/catalogos" color="primary" size="sm">
              Ir a Catálogos
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
