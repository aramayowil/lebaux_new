import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { ObraTipologia, ObraDespiece, ObraDetalle } from "@/types";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Spinner,
} from "@heroui/react";
import { Calculator, AlertTriangle, Save, CheckCircle2 } from "lucide-react";
import DespieceView from "./DespieceView";
import type { ResultadoDespiece } from "@/lib/motorDespiece";
import {
  useSaveObraDespiece,
  useObraDespieceByTipologia,
} from "@/hooks/obra/useObraDespiece";
import { useTipologiasByObra } from "@/hooks/obra/useObrasTipologias";

// 🌟 Extendemos ObraDetalle localmente sólo por si el motor o las vistas
// necesitan leer arrays numéricos mapeados en tiempo de ejecución.
interface ObraDetalleCanvas extends ObraDetalle {
  pos_h?: number[];
  pos_v?: number[];
}

interface DespieceModalProps {
  idTipologia: number;
  isOpen: boolean;
  onClose: () => void;
}

const DespieceModal = ({
  idTipologia,
  isOpen,
  onClose,
}: DespieceModalProps) => {
  // 1. OBTENCIÓN AUTÓNOMA DEL ID DE LA OBRA
  const { idObra: idObraParam, id: idParam } = useParams<any>();
  const idObra = Number(idObraParam || idParam) || 0;

  // Seguridad: evitamos peticiones basura al backend si los IDs no están listos
  const queryHabilitada = isOpen && idObra > 0 && idTipologia > 0;

  // 2. CONSUMO DE DATOS BASADO ÚNICAMENTE EN OBRA_DETALLE
  const { data: tipologias = [], isLoading: isLoadingTip } =
    useTipologiasByObra(idObra, {
      enabled: queryHabilitada,
    });

  // Encontrás la tipología (que actúa como el contenedor de detalles)
  const tipSel = useMemo(() => {
    return tipologias.find((t: ObraTipologia) => t.id === idTipologia);
  }, [tipologias, idTipologia]);

  // Buscamos si hay un registro de detalles de obra directo
  const detalles: ObraDetalleCanvas | undefined = tipSel as any;

  const {
    mutateAsync: saveDespiece,
    isPending: isSaving,
    isSuccess: isSaved,
  } = useSaveObraDespiece();

  // Despiece guardado en DB (ítems manuales y optimizaciones previas)
  const { data: despieceGuardado = [] } = useObraDespieceByTipologia(
    idObra,
    idTipologia,
    { enabled: queryHabilitada },
  );

  // 3. EJECUCIÓN DEL MOTOR DE DESPIECE (Síncrono usando ObraDetalle)
  const { despieceResult, despieceError } = useMemo(() => {
    if (!detalles || !isOpen)
      return { despieceResult: null, despieceError: null };

    try {
      // 🌟 Aquí conectás directamente tu función del motor de despiece técnico.
      // Como ya no usás Configs, el motor recibe 'detalles' que es tipo ObraDetalle.
      // const res = tuMotorDeCortes(detalles);
      // return { despieceResult: res, despieceError: null };

      return { despieceResult: null, despieceError: null }; // Placeholder hasta linkear función
    } catch (err: any) {
      return {
        despieceResult: null,
        despieceError: err?.message || "Error en el motor",
      };
    }
  }, [detalles, isOpen]);

  /**
   * Guardado automático en la BD al abrir con un cálculo exitoso
   */
  useEffect(() => {
    if (!isOpen || !despieceResult || !detalles || despieceError) return;

    const items = buildDespieceItems(despieceResult, idObra, idTipologia);
    saveDespiece({ idObra, idTipologia, items });
  }, [isOpen, despieceResult, idObra, idTipologia, despieceError, detalles]);

  const isLoadingGlobal = isLoadingTip;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      size="full"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950",
        header: "border-b border-zinc-100 dark:border-zinc-800",
        closeButton:
          "hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors",
      }}
    >
      <ModalContent>
        <>
          <ModalHeader className="flex items-center gap-3 py-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Calculator className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-small font-bold text-foreground leading-tight">
                Despiece Técnico (Taller)
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                {detalles?.descri_item_manual || "Cargando tipología..."}
              </span>
            </div>

            <div className="ml-auto">
              {isSaving && (
                <Chip
                  size="sm"
                  variant="flat"
                  className="bg-amber-500/10 text-amber-600 text-[10px] font-bold"
                >
                  Guardando en base de datos...
                </Chip>
              )}
              {isSaved && !isSaving && (
                <Chip
                  size="sm"
                  variant="flat"
                  startContent={<CheckCircle2 className="w-3 h-3" />}
                  className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold"
                >
                  Sincronizado con DB
                </Chip>
              )}
            </div>
          </ModalHeader>

          <ModalBody className="py-6">
            {isLoadingGlobal ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Spinner size="lg" color="warning" />
                <p className="text-xs text-zinc-400 font-medium">
                  Procesando matriz de perfiles...
                </p>
              </div>
            ) : (
              <>
                {despieceError && (
                  <div className="flex items-center gap-3 text-danger bg-danger-50 dark:bg-danger-900/10 rounded-xl p-4 mb-4 border border-danger/20">
                    <AlertTriangle size={18} />
                    <p className="text-sm font-medium">
                      Error: {despieceError}
                    </p>
                  </div>
                )}

                {despieceResult ? (
                  <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-2">
                    <DespieceView resultado={despieceResult} />
                  </div>
                ) : (
                  <div className="text-center py-12 flex flex-col items-center justify-center text-zinc-400">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                      <Calculator className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-sm font-medium text-foreground/50">
                      No hay datos calculados
                    </p>
                    <p className="text-[11px] mt-1">
                      Verificá las medidas en el editor de tipologías.
                    </p>
                  </div>
                )}

                {/* Bloque de ítems manuales */}
                {despieceGuardado.some((d) => d.manual) && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      Adicionales agregados a mano
                    </p>
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                      {despieceGuardado
                        .filter((d) => d.manual && !d.anulado)
                        .map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center gap-3 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 bg-white dark:bg-zinc-900"
                          >
                            <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                              {d.tipo_elemento}
                            </span>
                            <span className="text-xs text-zinc-700 dark:text-zinc-300 flex-1 truncate">
                              {d.elemento}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500 font-bold">
                              ×{d.cantidad}
                            </span>
                            {d.ancho && d.ancho !== "0" && (
                              <span className="text-[10px] font-mono text-emerald-600 font-bold">
                                {d.ancho}mm
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter className="border-t border-zinc-100 dark:border-zinc-800">
            <Button
              variant="light"
              onPress={onClose}
              className="text-zinc-500 hover:text-foreground font-medium"
            >
              Cerrar Plano
            </Button>
            <Button
              className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-md"
              startContent={<Save className="w-4 h-4" />}
              isLoading={isSaving}
              isDisabled={isLoadingGlobal || !despieceResult}
              onPress={() => {
                if (despieceResult) {
                  const items = buildDespieceItems(
                    despieceResult,
                    idObra,
                    idTipologia,
                  );
                  saveDespiece({ idObra, idTipologia, items });
                }
              }}
            >
              Forzar Guardado
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};

export default DespieceModal;

// ── Helper de mapeo directo a la estructura de la DB ──
function buildDespieceItems(
  resultado: ResultadoDespiece,
  idObra: number,
  idTipologia: number,
): Omit<ObraDespiece, "id">[] {
  const items: Omit<ObraDespiece, "id">[] = [];

  // Perfiles (PF)
  for (const corte of resultado.cortes ?? []) {
    items.push({
      id_obra: idObra,
      id_tipologia: idTipologia,
      id_producto_en_tipo: 0,
      id_producto: 0,
      tipo_elemento: "PF",
      elemento: corte.nro_perfil,
      cantidad: String(corte.cantidad),
      ancho: String(corte.medida_mm),
      alto: "0",
      color: 0,
      ubicacion: corte.nivel ?? "",
      corte: corte.angulo ?? "",
      manual: false,
      error: false,
      anulado: false,
      agregado_tipo: false,
    });
  }

  // Accesorios (AC)
  for (const acc of resultado.accesorios ?? []) {
    items.push({
      id_obra: idObra,
      id_tipologia: idTipologia,
      id_producto_en_tipo: 0,
      id_producto: 0,
      tipo_elemento: "AC",
      elemento: String(acc.cod_parte),
      cantidad: String(acc.cantidad),
      ancho: "0",
      alto: "0",
      color: 0,
      ubicacion: acc.descripcion ?? "",
      corte: "",
      manual: false,
      error: false,
      anulado: false,
      agregado_tipo: false,
    });
  }

  // Interiores: Vidrios (VD) / Tableros-Laminados (TL)
  for (const int of resultado.interiores ?? []) {
    items.push({
      id_obra: idObra,
      id_tipologia: idTipologia,
      id_producto_en_tipo: 0,
      id_producto: 0,
      tipo_elemento: int.tipo === "Vidrio" ? "VD" : "TL",
      elemento: int.tipo,
      cantidad: String(int.cantidad),
      ancho: String(int.ancho),
      alto: String(int.alto),
      color: 0,
      ubicacion: int.modulo ?? "",
      corte: "",
      manual: false,
      error: false,
      anulado: false,
      agregado_tipo: false,
    });
  }

  return items;
}
