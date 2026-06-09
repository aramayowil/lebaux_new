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
type ConflictDecision = "NEW" | string;

interface ResolvedMappings {
  lineas: Record<string, ConflictDecision>;
  monedas: Record<string, ConflictDecision>;
}

// ─── Subcomponente: Tarjeta de conflicto de dependencias ─────────
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

  const opcionesIds = new Set(opciones.map((op: any) => String(op.id)));
  const restoDelCatalogo = catalogoCompleto.filter(
    (item: any) => !opcionesIds.has(String(item.id)),
  );

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${
        decidioCrear
          ? "border-emerald-400/60 bg-emerald-500/5"
          : decidioVincular
            ? "border-blue-400/60 bg-blue-500/5"
            : "border-amber-400/60 bg-amber-500/5"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            {tipo === "linea" ? "LÍNEA" : "MONEDA"} NO RECONOCIDA
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="font-mono font-bold text-sm text-red-500 dark:text-red-400">
              "{valor}"
            </code>
          </div>
        </div>

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
              label:
                "font-bold text-[10px] text-zinc-500 uppercase tracking-wider mb-1",
              trigger: `border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-none transition-colors ${
                decidioCrear
                  ? "data-[focus=true]:border-emerald-500"
                  : decidioVincular
                    ? "data-[focus=true]:border-blue-500"
                    : "data-[focus=true]:border-lebaux-amber"
              }`,
            }}
          >
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

// ─── Componente Principal ────────────────────────────────────────
export default function ImportarPage() {
  const [catalogo, setCatalogo] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawCsvRows, setRawCsvRows] = useState<any[]>([]);

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
        label: "Mínimo reutilizable",
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

        const initLineas: Record<string, string> = {};
        res.sugerenciasLineas.forEach((s: any) => {
          if (s.opciones.length > 0) {
            initLineas[s.valorOriginal] = String(s.opciones[0].id);
          }
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

  const totalConflictos = conflictData
    ? conflictData.sugerenciasLineas.length +
      conflictData.sugerenciasMonedas.length
    : 0;
  const conflictosResueltos = conflictData
    ? Object.keys(resolvedMappings.lineas).length +
      Object.keys(resolvedMappings.monedas).length
    : 0;

  return (
    <div className="flex flex-col h-full">
      {/* ── Header Unificado y Consistente (Sticky y Full-Bleed) ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-steel-900 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">
            Importación Masiva
          </h2>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1 font-medium">
            Actualizá listas de precios y catálogos de materiales mediante
            archivos CSV o planillas Excel.
          </p>
        </div>
      </header>

      {/* ── Área de Contenido Scrollable ── */}
      <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-5">
        <div className="max-w-5xl mx-auto space-y-4 pb-10 animate-in fade-in duration-300">
          {/* ══════════════════════════════════════════════════════════
              STEP 1: DROPZONE
          ══════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
              <CardBody className="p-6 space-y-6">
                {/* Paso 1: Selector de catálogo */}
                <div className="space-y-2">
                  <label className="font-bold text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                    1. Seleccionar Catálogo de Destino
                  </label>
                  <Select
                    aria-label="Catalogo"
                    placeholder="¿Qué datos vas a importar?"
                    variant="bordered"
                    selectedKeys={catalogo ? [catalogo] : []}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setCatalogo(e.target.value);
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
                        "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-none h-11 hover:border-lebaux-amber/60 focus-within:!border-lebaux-amber transition-colors",
                      value:
                        "text-sm font-medium text-zinc-800 dark:text-zinc-200",
                    }}
                  >
                    <SelectItem key="perfiles" textValue="Catálogo de Perfiles">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Catálogo de Perfiles (Aluminio)
                      </span>
                    </SelectItem>
                    <SelectItem
                      key="accesorios"
                      textValue="Catálogo de Accesorios"
                    >
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

                {/* Paso 2: Dropzone */}
                <div className="space-y-2">
                  <label className="font-bold text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
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
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all ${
                      !catalogo
                        ? "border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/30 dark:bg-zinc-950/5 cursor-not-allowed opacity-50"
                        : dragActive
                          ? "border-lebaux-amber bg-lebaux-amber/5 cursor-pointer"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/10 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer"
                    }`}
                  >
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <UploadCloud
                        className={`w-6 h-6 ${catalogo ? "text-lebaux-amber" : "text-zinc-300"}`}
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
                          <span className="text-lebaux-amber underline font-bold">
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

                {/* Vista previa de archivo */}
                {file && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-lebaux-amber/5 border border-lebaux-amber/20 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-5 h-5 text-lebaux-amber shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200 truncate max-w-md">
                          {file.name}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-400">
                          {(file.size / 1024).toFixed(1)} KB ·{" "}
                          {rawCsvRows.length} filas detectadas
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

                <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Button
                    onPress={() => setStep(2)}
                    isDisabled={!catalogo || !file || rawCsvRows.length === 0}
                    className={`font-bold px-8 rounded-xl text-xs shadow-none h-9 transition-all ${
                      !catalogo || !file || rawCsvRows.length === 0
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                        : "bg-lebaux-amber hover:bg-amber-500 text-white"
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
            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
              <CardBody className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b pb-3 border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Columns className="w-4 h-4 text-lebaux-amber" />
                    <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                      Asociar columnas del archivo
                    </h3>
                  </div>
                  {file && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                      <FileSpreadsheet className="w-4 h-4 text-zinc-300" />
                      {file.name}
                      <Chip
                        size="sm"
                        variant="flat"
                        className="text-[10px] font-bold"
                      >
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
                              ? "bg-amber-50/40 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40"
                              : "bg-zinc-50/50 dark:bg-zinc-950/10 border-zinc-200/40 dark:border-zinc-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                            {campo.label}
                          </span>
                          {campo.required ? (
                            <span className="text-[9px] font-bold text-lebaux-amber uppercase tracking-wider">
                              Requerido
                            </span>
                          ) : (
                            <span className="text-[9px] text-zinc-400 uppercase tracking-wider">
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
                          classNames={{
                            trigger:
                              "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-none hover:border-lebaux-amber/60 data-[focus=true]:border-lebaux-amber transition-colors",
                          }}
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

                {/* Panel de Conflictos Inline */}
                {conflictData && showConflictPanel && (
                  <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-500/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">
                            Se encontraron términos desconocidos en tu archivo
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                            Los siguientes valores no coinciden con ningún
                            registro activo. Vinculalos a uno existente o
                            indicalos como nuevos registros:
                          </p>

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
                                className="text-[10px] font-bold"
                              >
                                {conflictData.sugerenciasLineas.length} línea(s)
                              </Chip>
                            )}
                            {conflictData.sugerenciasMonedas.length > 0 && (
                              <Chip
                                size="sm"
                                variant="flat"
                                className="text-[10px] font-bold"
                              >
                                {conflictData.sugerenciasMonedas.length}{" "}
                                moneda(s)
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
                          className="font-bold text-xs px-5 rounded-xl shadow-none"
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

                {/* Banner de error */}
                {status === "error" && !conflictData && (
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-200 dark:border-red-800 flex items-start gap-3 text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold uppercase tracking-wide">
                        Error en procesamiento
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">
                        {errorMsg}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Button
                    size="sm"
                    variant="flat"
                    className="rounded-xl font-semibold text-xs"
                    onPress={() => {
                      setStep(1);
                      setConflictData(null);
                      setShowConflictPanel(false);
                      setStatus("idle");
                    }}
                    isDisabled={loadingGlobal}
                    startContent={
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    }
                  >
                    Atrás
                  </Button>

                  {!conflictData && (
                    <Button
                      onPress={procesarMapeoYComparar}
                      isLoading={loadingGlobal}
                      isDisabled={
                        camposRequeridos
                          .filter((c) => c.required)
                          .some((c) => !columnMapping[c.key]) || loadingGlobal
                      }
                      className="font-bold text-xs px-6 bg-lebaux-amber hover:bg-amber-500 text-white rounded-xl shadow-none h-9 transition-colors"
                      startContent={
                        !loadingGlobal && <Zap className="w-4 h-4" />
                      }
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
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Resumen Métricas */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-xl">
                  <CardBody className="p-4 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">
                      A Agregar
                    </span>
                    <p className="text-3xl font-black text-emerald-600 mt-0.5">
                      {previewData.filter((r) => r.action === "create").length}
                    </p>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      nuevos registros
                    </span>
                  </CardBody>
                </Card>
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-xl">
                  <CardBody className="p-4 text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider block">
                      A Modificar
                    </span>
                    <p className="text-3xl font-black text-amber-500 mt-0.5">
                      {previewData.filter((r) => r.action === "update").length}
                    </p>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      sobrescrituras
                    </span>
                  </CardBody>
                </Card>
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-xl">
                  <CardBody className="p-4 text-center">
                    <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider block">
                      Total
                    </span>
                    <p className="text-3xl font-black text-blue-500 mt-0.5">
                      {previewData.length}
                    </p>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      en el archivo
                    </span>
                  </CardBody>
                </Card>
              </div>

              {/* Tabla Identificación de Cambios */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-none">
                <Table
                  aria-label="Vista previa de cambios"
                  removeWrapper
                  classNames={{
                    th: "bg-zinc-50 dark:bg-zinc-950/60 text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 py-3 px-5",
                    td: "py-3 px-5 border-b border-zinc-100 dark:border-zinc-800/50",
                  }}
                >
                  <TableHeader>
                    <TableColumn>Nro Perfil</TableColumn>
                    <TableColumn className="w-32">Estado</TableColumn>
                    <TableColumn>Línea / Moneda</TableColumn>
                    <TableColumn>Cambios detectados</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {previewData.slice(0, 20).map((row, i) => (
                      <TableRow
                        key={i}
                        className="group hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors"
                      >
                        <TableCell className="font-bold font-mono text-zinc-800 dark:text-zinc-200 text-xs">
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
                          <span className="block font-bold text-xs uppercase tracking-tight text-zinc-700 dark:text-zinc-300">
                            {row.newData.rawLinea}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono font-medium">
                            {row.newData.rawMoneda}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            {row.cambios.map((c, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1"
                              >
                                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block shrink-0" />
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
                  <div className="p-3 text-center text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40">
                    Vista previa: primeras 20 de {previewData.length} filas
                  </div>
                )}
              </div>

              {/* Banner Éxito Final */}
              {status === "success" && (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-emerald-600 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold uppercase tracking-wide">
                      Importación completada con éxito
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                      Los perfiles fueron consolidados e inyectados
                      correctamente en el almacenamiento maestro.
                    </p>
                  </div>
                </div>
              )}

              {/* Banner Error Final */}
              {status === "error" && (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-200 dark:border-red-800 flex items-start gap-3 text-red-600 dark:text-red-400 animate-in fade-in">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold uppercase tracking-wide">
                      Error en la consolidación
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                      {errorMsg}
                    </p>
                  </div>
                </div>
              )}

              {/* Acciones de Flujo Final */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  size="sm"
                  variant="flat"
                  className="rounded-xl font-semibold text-xs"
                  onPress={() => setStep(2)}
                  isDisabled={isSavingFinal}
                  startContent={
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  }
                >
                  Atrás
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={resetImportador}
                    className="font-bold text-xs rounded-xl"
                    isDisabled={isSavingFinal}
                    startContent={<XCircle className="w-4 h-4" />}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onPress={ejecutarImportacionFinal}
                    isLoading={isSavingFinal}
                    className="font-bold text-xs px-6 bg-lebaux-amber hover:bg-amber-500 text-white rounded-xl shadow-none h-9 transition-colors"
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
      </div>
    </div>
  );
}
