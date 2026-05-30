import { useState, useRef } from "react";
import {
  Card,
  CardBody,
  Button,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
} from "@heroui/react";
import {
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  Columns,
  ArrowRight,
  Database,
  FileSpreadsheet,
  Zap,
  Plus,
  Link2,
  Info,
  XCircle,
  ArrowRightLeft,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  usePerfiles,
  useBulkUpsertPerfiles,
  useResolveImportDependencies,
} from "@/hooks/catalogo/usePerfiles";
import { procesarYCompararDatos, PreviewRow } from "@/utils/importUtils";

// ─── Tipos locales ───────────────────────────────────────────────
type ConflictDecision = "NEW" | string; // "NEW" = crear nuevo, string numérica = ID existente

interface ResolvedMappings {
  lineas: Record<string, ConflictDecision>;
  monedas: Record<string, ConflictDecision>;
}

// ─── Subcomponente: Tarjeta de conflicto individual ─────────────
function ConflictCard({
  tipo,
  sugerencia,
  valor,
  opciones,
  catalogoCompleto,
  onChange,
}: {
  tipo: "linea" | "moneda";
  sugerencia: ConflictDecision;
  valor: string;
  opciones: any[];
  catalogoCompleto: any[];
  onChange: (val: string) => void;
}) {
  const decidioCrear = sugerencia === "NEW";
  const decidioVincular = sugerencia && sugerencia !== "NEW";

  const labelField = tipo === "linea" ? "linea" : "descripcion";
  const entidad = tipo === "linea" ? "línea" : "moneda";

  // IDs ya presentes en sugerencias — para no repetirlos en el catálogo completo
  const opcionesIds = new Set(opciones.map((op: any) => String(op.id)));
  // Catálogo completo sin los que ya aparecen como sugerencias
  const restoDelCatalogo = catalogoCompleto.filter(
    (item: any) => !opcionesIds.has(String(item.id)),
  );

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 ${
        decidioCrear
          ? "border-emerald-400/60 bg-emerald-500/5 dark:bg-emerald-500/5"
          : decidioVincular
            ? "border-blue-400/60 bg-blue-500/5 dark:bg-blue-500/5"
            : "border-amber-400/60 bg-amber-500/5 dark:bg-amber-500/5"
      }`}
    >
      {/* Header de la tarjeta */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {tipo === "linea" ? "LÍNEA" : "MONEDA"} NO RECONOCIDA
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="font-mono font-bold text-base text-red-500 dark:text-red-400">
              "{valor}"
            </code>
          </div>
        </div>

        {/* Indicador del estado de la decisión */}
        {decidioCrear && (
          <Chip
            size="sm"
            color="success"
            variant="flat"
            startContent={<Plus className="w-3 h-3" />}
            className="text-[10px] font-bold"
          >
            Se creará nuevo registro
          </Chip>
        )}
        {decidioVincular && (
          <Chip
            size="sm"
            color="primary"
            variant="flat"
            startContent={<Link2 className="w-3 h-3" />}
            className="text-[10px] font-bold"
          >
            Vinculado a existente
          </Chip>
        )}
      </div>

      {/* Selector de acción */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1">
          <Select
            aria-label={`Resolver ${entidad} ${valor}`}
            label={`Vincular con ${entidad} de la base de datos:`}
            size="sm"
            variant="bordered"
            selectedKeys={sugerencia ? [sugerencia] : []}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onChange(e.target.value)
            }
            classNames={{
              trigger: `border-zinc-300 dark:border-zinc-700 ${
                decidioCrear
                  ? "data-[focus=true]:border-emerald-500"
                  : decidioVincular
                    ? "data-[focus=true]:border-blue-500"
                    : "data-[focus=true]:border-amber-500"
              }`,
            }}
          >
            {/* Opción: Crear nuevo */}
            <SelectItem
              key="NEW"
              textValue={`✨ Crear nueva ${entidad}: "${valor}"`}
              className="text-emerald-600 font-bold dark:text-emerald-400"
            >
              <div className="flex items-center gap-2 py-0.5">
                <Plus className="w-4 h-4 shrink-0" />
                <span>
                  Crear nueva {entidad}:{" "}
                  <span className="font-mono">"{valor}"</span>
                </span>
              </div>
            </SelectItem>

            {/* Sugerencias inteligentes con score */}
            {opciones.map((op: any) => (
              <SelectItem key={String(op.id)} textValue={op[labelField]}>
                <div className="flex items-center justify-between gap-2 py-0.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-medium">{op[labelField]}</span>
                  </div>
                  <Chip
                    size="sm"
                    color={op.score > 0.75 ? "warning" : "default"}
                    variant="flat"
                    className="text-[9px] font-bold shrink-0"
                  >
                    {Math.round(op.score * 100)}% similar
                  </Chip>
                </div>
              </SelectItem>
            ))}

            {/* Resto del catálogo (sin duplicar los que ya están arriba) */}
            {restoDelCatalogo.map((item: any) => (
              <SelectItem key={String(item.id)} textValue={item[labelField]}>
                <div className="flex items-center gap-2 py-0.5 text-zinc-500">
                  <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
                  <span>{item[labelField]}</span>
                </div>
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Aviso informativo según decisión */}
      {decidioCrear && (
        <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0" />
          Se insertará como nuevo registro en el catálogo maestro de{" "}
          {tipo === "linea" ? "líneas" : "monedas"} al confirmar.
        </p>
      )}
      {decidioVincular && (
        <p className="mt-2 text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Los perfiles con "{valor}" usarán el registro existente seleccionado.
        </p>
      )}
      {!sugerencia && (
        <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Pendiente de decisión — elegí una opción para poder continuar.
        </p>
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────
export default function ImportarPage() {
  const [catalogo, setCatalogo] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawCsvRows, setRawCsvRows] = useState<any[]>([]);

  // Wizard: 1 = Cargar, 2 = Mapear, 2.5 = Resolver conflictos (inline), 3 = Diff
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showConflictPanel, setShowConflictPanel] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    nro_perfil: "",
    linea: "",
    moneda: "",
    descri: "",
    peso_metro: "",
    precio_kg: "",
    long_tira: "",
    cubre: "",
    minimo_reutilizable: "",
  });

  const [conflictData, setConflictData] = useState<any | null>(null);
  const [resolvedMappings, setResolvedMappings] = useState<ResolvedMappings>({
    lineas: {},
    monedas: {},
  });
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: dbPerfiles = [] } = usePerfiles();
  const { mutateAsync: resolveDependencies, isPending: isResolving } =
    useResolveImportDependencies();
  const { mutateAsync: bulkUpsert, isPending: isSavingFinal } =
    useBulkUpsertPerfiles();

  const [isProcessingInner, setIsProcessingInner] = useState(false);
  const loadingGlobal = isResolving || isProcessingInner;

  // ── Campos por catálogo ───────────────────────────────────────
  // Cada catálogo define sus propios campos requeridos y opcionales.
  // Extender acá cuando se sumen nuevos catálogos (accesorios, vidrios, etc.)
  const camposPorCatalogo: Record<
    string,
    { key: string; label: string; required: boolean }[]
  > = {
    perfiles: [
      { key: "nro_perfil", label: "Número de Perfil", required: true },
      { key: "linea", label: "Nombre de la Línea", required: true },
      { key: "moneda", label: "Moneda (ej: USD, ARS)", required: true },
      { key: "descri", label: "Descripción", required: true },
      { key: "peso_metro", label: "Peso por Metro", required: true },
      { key: "precio_kg", label: "Precio por KG", required: true },
      { key: "long_tira", label: "Longitud de Tira", required: false },
      {
        key: "minimo_reutilizable",
        label: "Minimo reutilizable",
        required: false,
      },
      { key: "cubre", label: "Cubre", required: false },
    ],
    accesorios: [
      { key: "codigo", label: "Código", required: true },
      { key: "descri", label: "Descripción", required: true },
      { key: "moneda", label: "Moneda", required: true },
      { key: "precio_unit", label: "Precio Unitario", required: true },
    ],
    vidrios: [
      { key: "codigo", label: "Código", required: true },
      { key: "descri", label: "Descripción", required: true },
      { key: "moneda", label: "Moneda", required: true },
      { key: "precio_m2", label: "Precio por m²", required: true },
      { key: "espesor", label: "Espesor (mm)", required: false },
    ],
    tratamientos: [
      { key: "codigo", label: "Código", required: true },
      { key: "descri", label: "Descripción", required: true },
      { key: "moneda", label: "Moneda", required: true },
      { key: "precio_kg", label: "Precio por KG", required: true },
      { key: "color", label: "Color / Acabado", required: false },
    ],
  };

  const camposRequeridos = catalogo ? (camposPorCatalogo[catalogo] ?? []) : [];

  // ── Conflictos sin resolver ──────────────────────────────────
  const conflictosSinResolver = conflictData
    ? [
        ...conflictData.sugerenciasLineas.filter(
          (s: any) => !resolvedMappings.lineas[s.valorOriginal],
        ),
        ...conflictData.sugerenciasMonedas.filter(
          (s: any) => !resolvedMappings.monedas[s.valorOriginal],
        ),
      ]
    : [];
  const todosResueltos =
    conflictData !== null && conflictosSinResolver.length === 0;

  // ── Handlers de archivo ──────────────────────────────────────
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      validarYProcesarArchivo(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) validarYProcesarArchivo(e.target.files[0]);
  };

  const validarYProcesarArchivo = (archivo: File) => {
    const extension = archivo.name.split(".").pop()?.toLowerCase();
    if (extension === "csv" || extension === "xlsx" || extension === "xls") {
      setErrorMsg("");
      setStatus("idle");
      setConflictData(null);
      setShowConflictPanel(false);
      procesarArchivoInicial(archivo, extension);
    } else {
      alert("Por favor, seleccioná un archivo válido (.csv, .xlsx, .xls)");
    }
  };

  const procesarArchivoInicial = (archivo: File, extension: string) => {
    setFile(archivo);

    if (extension === "xlsx" || extension === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
            defval: "",
          });
          const cleanRows = jsonData.filter((row) =>
            Object.values(row).some((v) => String(v).trim() !== ""),
          );
          if (cleanRows.length > 0) {
            const headers = Object.keys(cleanRows[0]);
            setCsvHeaders(headers);
            setRawCsvRows(cleanRows);
            autoMapearColumnas(headers);
          } else {
            throw new Error("El archivo está vacío o no tiene filas válidas.");
          }
        } catch {
          setErrorMsg("No se pudo leer el archivo Excel.");
          setStatus("error");
        }
      };
      reader.readAsBinaryString(archivo);
    } else if (extension === "csv") {
      Papa.parse(archivo, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.meta.fields) {
            const cleanRows = results.data.filter((row: any) =>
              Object.values(row).some(
                (v) => v !== null && String(v).trim() !== "",
              ),
            );
            setCsvHeaders(results.meta.fields);
            setRawCsvRows(cleanRows);
            autoMapearColumnas(results.meta.fields);
          }
        },
        error: () => {
          setErrorMsg("Error al parsear el CSV.");
          setStatus("error");
        },
      });
    }
  };

  const autoMapearColumnas = (headers: string[]) => {
    const autoMap: Record<string, string> = {};
    headers.forEach((h) => {
      const c = h.toLowerCase().trim();
      if (["nro_perfil", "codigo", "nro", "nº perfil"].includes(c))
        autoMap["nro_perfil"] = h;
      if (["linea", "id_linea"].includes(c)) autoMap["linea"] = h;
      if (["moneda", "tipo_moneda"].includes(c)) autoMap["moneda"] = h;
      if (
        ["descri", "descripcion", "detalle", "descripción del perfil"].includes(
          c,
        )
      )
        autoMap["descri"] = h;
      if (["peso_metro", "peso", "peso (kg/m)"].includes(c))
        autoMap["peso_metro"] = h;
      if (["precio_kg", "precio", "precio / kg"].includes(c))
        autoMap["precio_kg"] = h;
      if (["long_tira", "longitud tira"].includes(c)) autoMap["long_tira"] = h;
      if (c === "cubre") autoMap["cubre"] = h;
    });
    setColumnMapping((prev) => ({ ...prev, ...autoMap }));
  };

  // ── Procesamiento y comparación ──────────────────────────────
  const procesarMapeoYComparar = async () => {
    try {
      setStatus("idle");
      setErrorMsg("");
      setConflictData(null);
      setShowConflictPanel(false);

      const lineasEnArchivo = rawCsvRows
        .map((r) => String(r[columnMapping["linea"]] || "").trim())
        .filter((v) => v && v !== "undefined" && v !== "null");

      const monedasEnArchivo = rawCsvRows
        .map((r) => String(r[columnMapping["moneda"]] || "").trim())
        .filter((v) => v && v !== "undefined" && v !== "null");

      const res = await resolveDependencies({
        lineasNames: lineasEnArchivo,
        monedasNames: monedasEnArchivo,
      });

      if (res.hasConflicts) {
        setConflictData(res);
        setShowConflictPanel(true);

        // Pre-seleccionar la mejor sugerencia disponible (score > 0.4)
        // Si hay alta confianza (>75%) se marca automáticamente; si no, se pre-carga
        // la mejor opción pero el usuario la verá destacada para confirmar o cambiar
        const initLineas: Record<string, string> = {};
        res.sugerenciasLineas.forEach((s: any) => {
          if (s.opciones.length > 0) {
            initLineas[s.valorOriginal] = String(s.opciones[0].id);
          }
          // Sin ninguna sugerencia: dejamos vacío (el usuario debe elegir crear o buscar manualmente)
        });

        const initMonedas: Record<string, string> = {};
        res.sugerenciasMonedas.forEach((s: any) => {
          if (s.opciones.length > 0) {
            initMonedas[s.valorOriginal] = String(s.opciones[0].id);
          }
        });

        setResolvedMappings({ lineas: initLineas, monedas: initMonedas });
        setStatus("error");
        setErrorMsg(
          `Se encontraron ${res.sugerenciasLineas.length + res.sugerenciasMonedas.length} término(s) desconocido(s). Resolvelos antes de continuar.`,
        );
        return;
      }

      avanzarAlDiff(res.lineaMap, res.monedaMap);
    } catch {
      setErrorMsg("Error al verificar dependencias en la base de datos.");
      setStatus("error");
    }
  };

  const avanzarAlDiff = (
    finalLineaMap: Record<string, number>,
    finalMonedaMap: Record<string, number>,
  ) => {
    const diff = procesarYCompararDatos(
      rawCsvRows,
      columnMapping,
      dbPerfiles,
      finalLineaMap,
      finalMonedaMap,
    );
    setPreviewData(diff);
    setStep(3);
    setStatus("idle");
    setErrorMsg("");
    setConflictData(null);
    setShowConflictPanel(false);
  };

  const aplicarResolucionDeConflictos = async () => {
    if (!conflictData) return;
    try {
      setIsProcessingInner(true);

      const lineasEnArchivo = rawCsvRows
        .map((r) => String(r[columnMapping["linea"]] || ""))
        .filter(Boolean);
      const monedasEnArchivo = rawCsvRows
        .map((r) => String(r[columnMapping["moneda"]] || ""))
        .filter(Boolean);

      const lineasACrear = Object.entries(resolvedMappings.lineas)
        .filter(([, id]) => id === "NEW")
        .map(([v]) => v);

      const monedasACrear = Object.entries(resolvedMappings.monedas)
        .filter(([, id]) => id === "NEW")
        .map(([v]) => v);

      const res = await resolveDependencies({
        lineasNames: lineasEnArchivo,
        monedasNames: monedasEnArchivo,
        crearNuevos: { lineas: lineasACrear, monedas: monedasACrear },
      });

      const finalLineaMap = { ...res.lineaMap };
      Object.entries(resolvedMappings.lineas).forEach(([val, idStr]) => {
        if (idStr !== "NEW") {
          finalLineaMap[val.toLowerCase().trim()] = Number(idStr);
        }
      });

      const finalMonedaMap = { ...res.monedaMap };
      Object.entries(resolvedMappings.monedas).forEach(([val, idStr]) => {
        if (idStr !== "NEW") {
          finalMonedaMap[val.toLowerCase().trim()] = Number(idStr);
        }
      });

      avanzarAlDiff(finalLineaMap, finalMonedaMap);
    } catch {
      setErrorMsg("Error al procesar y registrar los nuevos catálogos.");
      setStatus("error");
    } finally {
      setIsProcessingInner(false);
    }
  };

  const ejecutarImportacionFinal = async () => {
    try {
      setStatus("idle");
      const payloads = previewData.map((row) => {
        const { rawLinea, rawMoneda, ...clean } = row.newData as any;
        return clean;
      });
      await bulkUpsert(payloads);
      setStatus("success");
      setTimeout(() => resetImportador(), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al inyectar el lote.");
      setStatus("error");
    }
  };

  const resetImportador = () => {
    setFile(null);
    setRawCsvRows([]);
    setCsvHeaders([]);
    setPreviewData([]);
    setConflictData(null);
    setShowConflictPanel(false);
    setStep(1);
    setStatus("idle");
    setErrorMsg("");
    setResolvedMappings({ lineas: {}, monedas: {} });
  };

  // ── Contadores de conflictos ──────────────────────────────────
  const totalConflictos = conflictData
    ? conflictData.sugerenciasLineas.length +
      conflictData.sugerenciasMonedas.length
    : 0;
  const conflictosResueltos = conflictData
    ? Object.keys(resolvedMappings.lineas).length +
      Object.keys(resolvedMappings.monedas).length
    : 0;

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="w-full mx-auto space-y-5 pb-16 px-4 md:px-0 animate-in fade-in duration-300">
      {/* ── HEADER ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight">
            Importación Masiva
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 font-medium leading-relaxed">
            Actualizá listas de precios y catálogos de materiales mediante
            archivos CSV o planillas Excel.
          </p>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          STEP 1: DROPZONE
      ══════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
          <CardBody className="p-6 space-y-6">
            {/* Paso 1: Selector de catálogo */}
            <div className="space-y-2">
              <label className="font-bold text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                1. Seleccionar Catálogo de Destino
              </label>
              <Select
                aria-label="Catalogo"
                placeholder="¿Qué datos vas a importar?"
                variant="bordered"
                selectedKeys={catalogo ? [catalogo] : []}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setCatalogo(e.target.value);
                  // Resetear archivo y mapeo si cambia el catálogo
                  setFile(null);
                  setCsvHeaders([]);
                  setRawCsvRows([]);
                  setColumnMapping({
                    nro_perfil: "",
                    linea: "",
                    moneda: "",
                    descri: "",
                    peso_metro: "",
                    precio_kg: "",
                    long_tira: "",
                    cubre: "",
                    codigo: "",
                    precio_unit: "",
                    precio_m2: "",
                    espesor: "",
                    color: "",
                  });
                }}
                classNames={{
                  trigger:
                    "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-xl shadow-none h-11",
                  value: "text-sm font-medium text-zinc-800 dark:text-zinc-200",
                }}
              >
                <SelectItem key="perfiles" textValue="Catálogo de Perfiles">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Catálogo de Perfiles (Aluminio)
                  </span>
                </SelectItem>
                <SelectItem key="accesorios" textValue="Catálogo de Accesorios">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Catálogo de Accesorios
                  </span>
                </SelectItem>
                <SelectItem key="vidrios" textValue="Vidrios e Interiores">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Vidrios e Interiores
                  </span>
                </SelectItem>
                <SelectItem
                  key="tratamientos"
                  textValue="Tratamientos y Pinturas"
                >
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Tratamientos y Pinturas
                  </span>
                </SelectItem>
              </Select>
            </div>

            {/* Paso 2: Dropzone — deshabilitado si no hay catálogo seleccionado */}
            <div className="space-y-2">
              <label className="font-bold text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                2. Cargar Archivo de Datos
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
                className="hidden"
                disabled={!catalogo}
              />
              <div
                onDragEnter={catalogo ? handleDrag : undefined}
                onDragOver={catalogo ? handleDrag : undefined}
                onDragLeave={catalogo ? handleDrag : undefined}
                onDrop={catalogo ? handleDrop : undefined}
                onClick={() => catalogo && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all ${
                  !catalogo
                    ? "border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/30 dark:bg-zinc-950/5 cursor-not-allowed opacity-50"
                    : dragActive
                      ? "border-amber-500 bg-amber-500/5 cursor-pointer"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/10 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer"
                }`}
              >
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <UploadCloud
                    className={`w-6 h-6 ${catalogo ? "text-amber-500" : "text-zinc-300"}`}
                  />
                </div>
                <div className="text-center space-y-1">
                  {!catalogo ? (
                    <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">
                      Primero seleccioná un catálogo de destino
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Arrastrá tu archivo acá o{" "}
                      <span className="text-amber-500 underline">
                        buscá en tu equipo
                      </span>
                    </p>
                  )}
                  <p className="text-xs font-medium text-zinc-400">
                    Soporta formatos estructurados .CSV, .XLSX o .XLS
                  </p>
                </div>
              </div>
            </div>

            {/* Vista previa del archivo seleccionado */}
            {file && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-amber-500 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200 truncate max-w-md">
                      {file.name}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400">
                      {(file.size / 1024).toFixed(1)} KB · {rawCsvRows.length}{" "}
                      filas detectadas
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="light"
                  className="text-zinc-400 hover:text-zinc-600 font-bold text-xs"
                  onPress={() => {
                    setFile(null);
                    setCsvHeaders([]);
                    setRawCsvRows([]);
                  }}
                >
                  Quitar
                </Button>
              </div>
            )}

            {/* Botón principal — avanza al paso 2 */}
            <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
              <Button
                onPress={() => setStep(2)}
                isDisabled={!catalogo || !file || rawCsvRows.length === 0}
                className={`font-bold px-8 rounded-xl text-sm shadow-none h-11 transition-all ${
                  !catalogo || !file || rawCsvRows.length === 0
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
              >
                Siguiente
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════
          STEP 2: MAPEO DE COLUMNAS + PANEL DE CONFLICTOS
      ══════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
          <CardBody className="p-6 space-y-6">
            {/* Cabecera sección */}
            <div className="flex items-center justify-between border-b pb-3 border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Columns className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                  Asociar columnas del archivo
                </h3>
              </div>
              {file && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <FileSpreadsheet className="w-4 h-4 text-zinc-300" />
                  {file.name}
                  <Chip size="sm" variant="flat" className="text-[10px]">
                    {rawCsvRows.length} filas
                  </Chip>
                </div>
              )}
            </div>

            {/* Grid de mapeo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {camposRequeridos.map((campo) => {
                const isMapped = !!columnMapping[campo.key];
                return (
                  <div
                    key={campo.key}
                    className={`p-3 rounded-xl border transition-all ${
                      isMapped
                        ? "bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200/60 dark:border-zinc-800/60"
                        : campo.required
                          ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/80 dark:border-amber-800/40"
                          : "bg-zinc-50/50 dark:bg-zinc-950/10 border-zinc-200/40 dark:border-zinc-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                        {campo.label}
                      </span>
                      {campo.required ? (
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                          Requerido
                        </span>
                      ) : (
                        <span className="text-[9px] text-zinc-300 uppercase tracking-wider">
                          Opcional
                        </span>
                      )}
                    </div>
                    <Select
                      aria-label={campo.label}
                      placeholder="Elegir columna..."
                      size="sm"
                      variant="bordered"
                      selectedKeys={
                        columnMapping[campo.key]
                          ? [columnMapping[campo.key]]
                          : []
                      }
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setColumnMapping((prev) => ({
                          ...prev,
                          [campo.key]: e.target.value,
                        }))
                      }
                    >
                      {csvHeaders.map((header) => (
                        <SelectItem key={header} textValue={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                );
              })}
            </div>

            {/* ── PANEL DE CONFLICTOS (aparece tras el análisis) ── */}
            {conflictData && showConflictPanel && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                {/* Banner de advertencia con resumen */}
                <div className="rounded-2xl border border-amber-400/60 bg-amber-500/8 dark:bg-amber-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">
                        Se encontraron términos desconocidos en tu archivo
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
                        Los siguientes valores no coinciden con ningún registro
                        en la base de datos. Podés vincularlos a uno existente o
                        crear un nuevo registro:
                      </p>

                      {/* Progreso de resolución */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Chip
                          size="sm"
                          color={todosResueltos ? "success" : "warning"}
                          variant="flat"
                          className="text-[10px] font-bold"
                        >
                          {conflictosResueltos}/{totalConflictos} resueltos
                        </Chip>
                        {conflictData.sugerenciasLineas.length > 0 && (
                          <Chip
                            size="sm"
                            variant="flat"
                            className="text-[10px]"
                          >
                            {conflictData.sugerenciasLineas.length} línea(s)
                          </Chip>
                        )}
                        {conflictData.sugerenciasMonedas.length > 0 && (
                          <Chip
                            size="sm"
                            variant="flat"
                            className="text-[10px]"
                          >
                            {conflictData.sugerenciasMonedas.length} moneda(s)
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tarjetas de conflicto — LÍNEAS */}
                {conflictData.sugerenciasLineas.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                      Líneas sin coincidencia
                    </h5>
                    {conflictData.sugerenciasLineas.map(
                      (s: any, idx: number) => (
                        <ConflictCard
                          key={idx}
                          tipo="linea"
                          valor={s.valorOriginal}
                          sugerencia={
                            resolvedMappings.lineas[s.valorOriginal] || ""
                          }
                          opciones={s.opciones}
                          catalogoCompleto={conflictData.dbLineas}
                          onChange={(val) =>
                            setResolvedMappings((prev) => ({
                              ...prev,
                              lineas: {
                                ...prev.lineas,
                                [s.valorOriginal]: val,
                              },
                            }))
                          }
                        />
                      ),
                    )}
                  </div>
                )}

                {/* Tarjetas de conflicto — MONEDAS */}
                {conflictData.sugerenciasMonedas.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                      Monedas sin coincidencia
                    </h5>
                    {conflictData.sugerenciasMonedas.map(
                      (s: any, idx: number) => (
                        <ConflictCard
                          key={idx}
                          tipo="moneda"
                          valor={s.valorOriginal}
                          sugerencia={
                            resolvedMappings.monedas[s.valorOriginal] || ""
                          }
                          opciones={s.opciones}
                          catalogoCompleto={conflictData.dbMonedas}
                          onChange={(val) =>
                            setResolvedMappings((prev) => ({
                              ...prev,
                              monedas: {
                                ...prev.monedas,
                                [s.valorOriginal]: val,
                              },
                            }))
                          }
                        />
                      ),
                    )}
                  </div>
                )}

                {/* Botón de confirmar resolución */}
                <div className="flex justify-end pt-1">
                  <Tooltip
                    content={
                      !todosResueltos
                        ? `Faltan resolver ${conflictosSinResolver.length} conflicto(s)`
                        : "Todo resuelto — listo para continuar"
                    }
                  >
                    <Button
                      color={todosResueltos ? "success" : "warning"}
                      size="sm"
                      className="font-bold text-xs px-5"
                      onPress={aplicarResolucionDeConflictos}
                      isLoading={loadingGlobal}
                      isDisabled={!todosResueltos || loadingGlobal}
                      startContent={
                        !loadingGlobal &&
                        (todosResueltos ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        ))
                      }
                    >
                      {todosResueltos
                        ? "Confirmar y continuar al análisis"
                        : `Resolver ${conflictosSinResolver.length} pendiente(s) primero`}
                    </Button>
                  </Tooltip>
                </div>
              </div>
            )}

            {/* Banner de error genérico */}
            {status === "error" && !conflictData && (
              <div className="p-4 rounded-xl bg-red-500/8 border border-red-400/40 flex items-start gap-3 text-red-600 dark:text-red-400">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold uppercase tracking-wide">Error</p>
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">
                    {errorMsg}
                  </p>
                </div>
              </div>
            )}

            {/* Footer de acciones */}
            <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                size="sm"
                variant="flat"
                onPress={() => {
                  setStep(1);
                  setConflictData(null);
                  setShowConflictPanel(false);
                  setStatus("idle");
                }}
                isDisabled={loadingGlobal}
                startContent={<ArrowRight className="w-3.5 h-3.5 rotate-180" />}
              >
                Atrás
              </Button>

              {/* Solo mostrar el botón de analizar si no hay conflictos activos */}
              {!conflictData && (
                <Button
                  color="warning"
                  className="font-bold text-xs px-6 text-zinc-900"
                  onPress={procesarMapeoYComparar}
                  isLoading={loadingGlobal}
                  isDisabled={
                    camposRequeridos
                      .filter((c) => c.required)
                      .some((c) => !columnMapping[c.key]) || loadingGlobal
                  }
                  startContent={!loadingGlobal && <Zap className="w-4 h-4" />}
                >
                  Analizar e identificar cambios
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════
          STEP 3: DIFF / VISTA PREVIA
      ══════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Resumen en tarjetas */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-emerald-500/8 border border-emerald-400/40 shadow-none">
              <CardBody className="p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">
                  A Agregar
                </span>
                <p className="text-3xl font-black text-emerald-600 mt-1">
                  {previewData.filter((r) => r.action === "create").length}
                </p>
                <span className="text-[10px] text-emerald-500/70">
                  nuevos registros
                </span>
              </CardBody>
            </Card>
            <Card className="bg-amber-500/8 border border-amber-400/40 shadow-none">
              <CardBody className="p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block">
                  A Modificar
                </span>
                <p className="text-3xl font-black text-amber-600 mt-1">
                  {previewData.filter((r) => r.action === "update").length}
                </p>
                <span className="text-[10px] text-amber-500/70">
                  sobrescrituras
                </span>
              </CardBody>
            </Card>
            <Card className="bg-blue-500/8 border border-blue-400/40 shadow-none">
              <CardBody className="p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">
                  Total
                </span>
                <p className="text-3xl font-black text-blue-600 mt-1">
                  {previewData.length}
                </p>
                <span className="text-[10px] text-blue-500/70">
                  en el archivo
                </span>
              </CardBody>
            </Card>
          </div>

          {/* Tabla diff */}
          <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
            <CardBody className="p-0">
              <Table
                aria-label="Vista previa de cambios"
                shadow="none"
                removeWrapper
                classNames={{
                  th: "bg-zinc-50 dark:bg-zinc-950/40 text-[10px] uppercase tracking-widest font-bold text-zinc-400",
                }}
              >
                <TableHeader>
                  <TableColumn>Nro Perfil</TableColumn>
                  <TableColumn>Estado</TableColumn>
                  <TableColumn>Línea / Moneda</TableColumn>
                  <TableColumn>Cambios detectados</TableColumn>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 20).map((row, i) => (
                    <TableRow
                      key={i}
                      className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                    >
                      <TableCell className="font-bold font-mono text-zinc-700 dark:text-zinc-200 text-sm">
                        {row.nro_perfil}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={
                            row.action === "create" ? "success" : "warning"
                          }
                          variant="flat"
                          className="font-bold text-[10px]"
                        >
                          {row.action === "create" ? "ALTA" : "EDICIÓN"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="block font-semibold text-xs text-zinc-600 dark:text-zinc-400">
                          {row.newData.rawLinea}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {row.newData.rawMoneda}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          {row.cambios.map((c, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1"
                            >
                              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 inline-block shrink-0" />
                              {c}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {previewData.length > 20 && (
                <div className="p-3 text-center text-[11px] text-zinc-400 font-medium border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20">
                  Vista previa: primeras 20 de {previewData.length} filas
                </div>
              )}
            </CardBody>
          </Card>

          {/* Banner de éxito */}
          {status === "success" && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 flex items-start gap-3 text-emerald-600 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <p className="font-bold uppercase tracking-wide">
                  Importación completada
                </p>
                <p className="text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">
                  Los perfiles fueron consolidados e inyectados correctamente en
                  la base de datos.
                </p>
              </div>
            </div>
          )}

          {/* Banner de error */}
          {status === "error" && (
            <div className="p-4 rounded-2xl bg-red-500/8 border border-red-400/40 flex items-start gap-3 text-red-600 dark:text-red-400 animate-in fade-in">
              <XCircle className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <p className="font-bold uppercase tracking-wide">
                  Error en la importación
                </p>
                <p className="text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">
                  {errorMsg}
                </p>
              </div>
            </div>
          )}

          {/* Acciones finales */}
          <div className="flex justify-between items-center">
            <Button
              size="md"
              variant="flat"
              onPress={() => setStep(2)}
              isDisabled={isSavingFinal}
              startContent={<ArrowRight className="w-3.5 h-3.5 rotate-180" />}
            >
              Atrás
            </Button>
            <div className="flex gap-2">
              <Button
                size="md"
                color="danger"
                variant="light"
                onPress={resetImportador}
                isDisabled={isSavingFinal}
                startContent={<XCircle className="w-4 h-4" />}
              >
                Cancelar
              </Button>
              <Button
                color="success"
                className="text-white font-bold px-6 text-xs"
                onPress={ejecutarImportacionFinal}
                isLoading={isSavingFinal}
                startContent={
                  !isSavingFinal && <Database className="w-4 h-4" />
                }
              >
                Confirmar e importar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
