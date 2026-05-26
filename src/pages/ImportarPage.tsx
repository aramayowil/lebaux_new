import { useState, useRef } from "react";
import {
  Card,
  CardBody,
  Button,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export default function ImportarPage() {
  const [catalogo, setCatalogo] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Opciones del selector alineadas con tus pestañas de catálogo
  const opcionesCatalogo = [
    { key: "perfiles", label: "Catálogo de Perfiles" },
    { key: "accesorios", label: "Catálogo de Accesorios" },
    { key: "vidrios", label: "Vidrios e Interiores" },
    { key: "tratamientos", label: "Tratamientos y Pinturas" },
  ];

  // Manejadores del Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validarYAsignarArchivo(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validarYAsignarArchivo(e.target.files[0]);
    }
  };

  const validarYAsignarArchivo = (archivo: File) => {
    // Validar que sea extensión CSV o Excel
    const extension = archivo.name.split(".").pop()?.toLowerCase();
    if (extension === "csv" || extension === "xlsx" || extension === "xls") {
      setFile(archivo);
      setStatus("idle");
    } else {
      alert("Por favor, selecciona un archivo válido (.csv, .xlsx)");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImportar = async () => {
    if (!catalogo || !file) return;

    setIsUploading(true);
    setStatus("idle");

    try {
      // Aquí irá tu lógica de backend/mutación con React Query o Axios
      // const formData = new FormData();
      // formData.append("file", file);
      // formData.append("type", catalogo);
      // await mutateAsync(formData);

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulando subida
      setStatus("success");
      setFile(null);
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 px-4 md:px-0 animate-in fade-in duration-400">
      {/* ── Header Profesional ────────────────────────────────────────────── */}
      {/* ── Header Profesional SIN GRADIENTE ────────────────────────────────────────────── */}
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

      {/* ── Layout Asimétrico 2:1 ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Columna Izquierda (Ancha): Selectores y Zona de Carga */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
            <CardBody className="p-6 space-y-6">
              {/* Paso 1: Selección de destino */}
              <div className="space-y-2">
                <label className="font-bold text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  1. Seleccionar Catálogo de Destino
                </label>
                <Select
                  aria-label="Catálogo destino"
                  placeholder="¿Qué datos vas a importar?"
                  variant="bordered"
                  selectedKeys={catalogo ? [catalogo] : []}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setCatalogo(e.target.value)
                  }
                  classNames={{
                    trigger:
                      "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-xl shadow-none h-11",
                    value:
                      "text-sm font-medium text-zinc-800 dark:text-zinc-200",
                  }}
                >
                  {opcionesCatalogo.map((opc) => (
                    <SelectItem key={opc.key} textValue={opc.label}>
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {opc.label}
                      </span>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Paso 2: Zona de Arrastre o Drag & Drop */}
              <div className="space-y-2">
                <label className="font-bold text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  2. Cargar Archivo de Datos
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv, .xlsx, .xls"
                  className="hidden"
                />

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    dragActive
                      ? "border-amber-500 bg-amber-500/5"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/10 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-400 dark:text-zinc-500">
                    <UploadCloud className="w-6 h-6 text-amber-500" />
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Arrastrá tu archivo acá o{" "}
                      <span className="text-amber-500 underline">
                        buscá en tu equipo
                      </span>
                    </p>
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
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="light"
                    className="text-zinc-400 hover:text-zinc-600 font-bold text-xs"
                    onPress={() => setFile(null)}
                  >
                    Quitar
                  </Button>
                </div>
              )}

              {/* Estados de Feedback Operativo */}
              {status === "success" && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-wide">
                      Importación Exitosa
                    </p>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Los datos han sido procesados y guardados correctamente en
                      la base maestros.
                    </p>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 flex items-start gap-3 text-danger-600 dark:text-danger-400">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-wide">
                      Error de Procesamiento
                    </p>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Las columnas del archivo no coinciden con la estructura
                      requerida del catálogo.
                    </p>
                  </div>
                </div>
              )}

              {/* Botón de Acción Principal */}
              <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                <Button
                  onPress={handleImportar}
                  isDisabled={!catalogo || !file || isUploading}
                  className={`font-bold px-8 rounded-xl text-xs transition-all shadow-none h-11 ${
                    !catalogo || !file
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      : "bg-amber-500 hover:bg-amber-600 text-white"
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <Spinner color="current" size="sm" />
                      <span>Procesando filas...</span>
                    </div>
                  ) : (
                    "Procesar e Importar"
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Columna Derecha (Estrecha): Instrucciones Técnicas */}
        <div className="space-y-6">
          <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
            <CardBody className="p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Requisitos del Archivo
                </h3>
              </div>

              <div className="space-y-4 text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <p>
                  Para asegurar que el motor de cómputos procese los materiales
                  sin inconsistencias, verifique las siguientes reglas:
                </p>

                <ul className="space-y-3 list-disc pl-4 text-zinc-500 dark:text-zinc-400">
                  <li>
                    <strong className="text-zinc-700 dark:text-zinc-300">
                      Cabeceras exactas:
                    </strong>{" "}
                    La primera fila debe contener los nombres técnicos de los
                    campos (ej:{" "}
                    <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
                      codigo
                    </code>
                    ,{" "}
                    <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
                      peso_metro
                    </code>
                    ).
                  </li>
                  <li>
                    <strong className="text-zinc-700 dark:text-zinc-300">
                      Formatos numéricos:
                    </strong>{" "}
                    Use puntos o comas estandarizados según la región para los
                    coeficientes y valores de moneda.
                  </li>
                  <li>
                    <strong className="text-zinc-700 dark:text-zinc-300">
                      Códigos únicos:
                    </strong>{" "}
                    Si un código ya existe en el catálogo seleccionado, el
                    sistema sobrescribirá sus valores con los del archivo.
                  </li>
                </ul>

                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="flat"
                    className="w-full font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 rounded-xl text-[11px]"
                  >
                    Descargar Plantilla Base (.CSV)
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
