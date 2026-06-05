import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import {
  ArrowLeft,
  Loader2,
  FileText,
  CheckCircle,
  Package,
} from "lucide-react";
import { useObra } from "@/hooks/obra/useObras";
import { useTipologiasByObra } from "@/hooks/obra/useObrasTipologias";
import Checkout from "@/components/presupuesto/Checkout";

export default function PresupuestoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idObra = Number(id);

  // ── HOOKS OBRAS Y TIPOLOGIAS ──
  const {
    data: obra,
    isLoading: isLoadingObra,
    isError: isErrorObra,
  } = useObra(idObra);

  const {
    data: tipologias = [],
    isLoading: isLoadingTipologias,
    isError: isErrorTipologias,
  } = useTipologiasByObra(idObra);

  const globalLoading = isLoadingObra || isLoadingTipologias;
  const globalError = isErrorObra || isErrorTipologias;

  if (globalLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-3 bg-white dark:bg-steel-950">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-sm text-steel-500 font-medium">
          Cargando presupuesto...
        </p>
      </div>
    );
  }

  if (globalError || !obra) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-4 bg-white dark:bg-steel-950">
        <p className="text-sm font-semibold text-red-500">
          No se pudo cargar la información del presupuesto
        </p>
        <Button variant="flat" size="sm" onPress={() => navigate("/obras")}>
          ← Volver a Obras
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] -m-6 fade-in bg-slate-50 dark:bg-steel-950">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-steel-200 dark:border-steel-800 bg-white dark:bg-steel-900 shrink-0 shadow-sm z-10">
        <Button
          variant="light"
          isIconOnly
          size="sm"
          onPress={() => navigate(`/obras/${idObra}`)}
          className="text-steel-400 hover:text-steel-600 dark:text-steel-500 dark:hover:text-steel-300"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </Button>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#db924b]/10 rounded-md">
              <FileText className="w-4 h-4 text-[#db924b]" />
            </div>
            <h2 className="font-semibold text-steel-900 dark:text-steel-100 text-md">
              Presupuesto: {obra.apellido}, {obra.nombre}
            </h2>
          </div>
        </div>
      </div>

      {/* ── Body Principal ── */}
      <div className="flex flex-1 min-h-0 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-6">
          {/* Columna Izquierda: Detalle de Tipologías */}
          <div className="flex-1 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-steel-800 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-steel-400" />
              Detalle de Tipologías
              <span className="bg-steel-200 dark:bg-zinc-800 text-xs px-2 py-0.5 rounded-full text-steel-600 dark:text-zinc-300 ml-2">
                {tipologias.length}
              </span>
            </h3>

            {tipologias.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-steel-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center">
                <p className="text-steel-500 font-medium mb-2">
                  No hay tipologías en esta obra.
                </p>
                <p className="text-sm text-steel-400 mb-4">
                  Agrega tipologías desde el editor para armar el presupuesto.
                </p>
                <Button
                  color="primary"
                  onPress={() => navigate(`/obras/${idObra}`)}
                >
                  Ir al Editor
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {tipologias.map((tipologia) => (
                  <div
                    key={tipologia.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-900 border border-steel-200 dark:border-zinc-800 rounded-xl shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 bg-steel-50 dark:bg-zinc-800 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-steel-900 dark:text-white text-sm">
                          {tipologia.descripcion}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs font-mono text-steel-500 bg-steel-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                            {tipologia.ancho} × {tipologia.alto} mm
                          </span>
                          <span className="text-xs text-steel-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-medium">
                            Cantidad: {tipologia.cantidad}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {/* Cálculo Mock del Precio Unitario y Subtotal */}
                      {(() => {
                        const areaM2 =
                          ((tipologia.ancho ?? 0) / 1000) *
                          ((tipologia.alto ?? 0) / 1000);
                        const unitario = areaM2 * 100000;
                        const subtotal = unitario * (tipologia.cantidad ?? 0);

                        return (
                          <>
                            <p className="text-[10px] text-steel-400 font-medium mb-0.5">
                              Subtotal
                            </p>
                            <p className="font-bold text-steel-900 dark:text-white">
                              ${" "}
                              {subtotal.toLocaleString("es-AR", {
                                maximumFractionDigits: 0,
                              })}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha: Checkout (Resumen) */}
          {tipologias.length > 0 && (
            <aside className="w-full lg:w-96 shrink-0">
              <div className="sticky top-4">
                <Checkout obra={obra} tipologias={tipologias} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
