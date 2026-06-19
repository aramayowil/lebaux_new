import { useMemo } from "react";
import { useParams } from "react-router-dom";
import type { ObraDespiece } from "@/types";
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
import { useDespiece } from "@/hooks/useDespiece";
import {
  useSaveObraDespiece,
  useObraDespieceByTipologia,
} from "@/hooks/obra/useObraDespiece";
import { useTipologiasByObra } from "@/hooks/obra/useObrasTipologias";
import { useObraDetallesByTipologia } from "@/hooks/obra/useObraDetalles";

interface DespieceModalProps {
  idTipologia: number;
  isOpen: boolean;
  moColocacion?: number;
  onClose: () => void;
}

const DespieceModal = ({
  idTipologia,
  isOpen,
  onClose,
}: DespieceModalProps) => {
  const { id: idObraParam } = useParams<any>();
  const idObra = Number(idObraParam);

  // Queries de sincronización con la DB
  const { data: tipologias = [] } = useTipologiasByObra(idObra);
  const { mutateAsync: saveDespiece, isPending: isSaving } =
    useSaveObraDespiece();
  const { data: despieceExistente, isLoading: isLoadingExistente } =
    useObraDespieceByTipologia(idObra, idTipologia);
  const { data: obraDetalles = [], isLoading: isLoadingDetalles } =
    useObraDetallesByTipologia(idTipologia);

  // Encontrar la tipología y su detalle correspondiente
  const tipologia = useMemo(() => {
    return tipologias.find((t) => t.id === idTipologia) ?? null;
  }, [tipologias, idTipologia]);

  const detalle = useMemo(() => {
    return obraDetalles[0] ?? null;
  }, [obraDetalles]);

  // ─── EJECUCIÓN DEL MOTOR LOCAL INTEGRADO ───────────────────────────────────
  const { resultado, error, isLoading, configurado } = useDespiece(
    tipologia,
    detalle,
  );

  const totalCortes = resultado?.cortes?.length ?? 0;
  const totalInteriores = resultado?.interiores?.length ?? 0;
  const hasItemsCalculados = totalCortes > 0 || totalInteriores > 0;

  // ─── ACCIÓN DE PERSISTENCIA EN LA DB (BULK SAVE) ───────────────────────────
  const handleSaveToDB = async () => {
    if (!resultado || !tipologia) return;

    try {
      const items: Omit<ObraDespiece, "id">[] = [];
      const idDetalle = detalle?.id ?? 0;
      const colorTratamiento = detalle?.color ?? null;

      // 1. Mapear Perfiles de Aluminio (PF)
      for (const corte of resultado.cortes ?? []) {
        items.push({
          id_obra: idObra,
          id_tipologia: idTipologia,
          id_producto_en_tipo: idDetalle,
          id_producto: detalle?.id_producto ?? null,
          tipo_elemento: "PF" as any, // Perfil
          elemento: corte.descripcion_perfil,
          cantidad: String(corte.cantidad),
          ancho: String(corte.medida_mm),
          alto: "0",
          color: colorTratamiento,
          ubicacion: corte.nivel ?? "Estructura",
          corte: corte.angulo ?? "90°/90°",
          manual: false,
          error: false,
          anulado: false,
          agregado_tipo: false,
        });
      }

      // 2. Mapear Interiores (Vidrios VD, Revestimientos TL)
      for (const int of resultado.interiores ?? []) {
        const esVidrio = int.tipo === "Vidrio";
        items.push({
          id_obra: idObra,
          id_tipologia: idTipologia,
          id_producto_en_tipo: idDetalle,
          id_producto: detalle?.id_producto ?? null,
          tipo_elemento: esVidrio ? ("VD" as any) : ("TL" as any), // VD = Vidrio, TL = Tablero/Lama
          elemento: esVidrio
            ? `Vidrio ${int.modulo ?? ""}`
            : `Lama Revestimiento ${int.modulo ?? ""}`,
          cantidad: String(int.cantidad),
          ancho: String(int.ancho),
          alto: String(int.alto),
          color: esVidrio ? null : colorTratamiento,
          ubicacion: int.modulo ?? "Interior",
          corte: "90°/90°",
          manual: false,
          error: false,
          anulado: false,
          agregado_tipo: false,
        });
      }

      // Despacha el lote estructurado completo hacia Postgres (Supabase)
      await saveDespiece({
        idObra: idObra,
        idTipologia: idTipologia,
        items: items as ObraDespiece[],
      });

      onClose();
    } catch (err) {
      console.error(
        "Error intentando consolidar el despiece en base de datos:",
        err,
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  Motor de Despiece Avanzado
                </h2>
                <p className="text-xs text-zinc-500 font-normal">
                  {tipologia?.descripcion} — {tipologia?.ancho}x
                  {tipologia?.alto} mm
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {despieceExistente && despieceExistente.length > 0 ? (
                <Chip
                  color="success"
                  variant="flat"
                  startContent={<CheckCircle2 className="w-3 h-3" />}
                  size="sm"
                >
                  Sincronizado en DB ({despieceExistente.length} ítems)
                </Chip>
              ) : (
                <Chip
                  color="warning"
                  variant="flat"
                  startContent={<AlertTriangle className="w-3 h-3" />}
                  size="sm"
                >
                  Solo Local (Sin Guardar)
                </Chip>
              )}
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="py-4 bg-zinc-50/50 dark:bg-zinc-900/20">
          {isLoading || isLoadingExistente || isLoadingDetalles ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3">
              <Spinner
                color="amber"
                label="Corriendo matrices de corte..."
                size="lg"
              />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex gap-3 border border-red-200 dark:border-red-900/30">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">
                  Error de Procesamiento de Fórmulas
                </h4>
                <p className="text-xs font-mono mt-1">{error}</p>
              </div>
            </div>
          ) : !configurado || !resultado ? (
            <div className="h-80 flex flex-col items-center justify-center text-center p-6">
              <AlertTriangle className="w-12 h-12 text-zinc-400 mb-3 stroke-[1.5]" />
              <h3 className="font-bold text-zinc-700 dark:text-zinc-300">
                Abertura Incompleta
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                Asegúrate de haber seleccionado una Línea, un Perfil de Marco y
                una Hoja en el panel de configuración antes de procesar el
                despiece.
              </p>
            </div>
          ) : (
            <DespieceView resultado={resultado} />
          )}
        </ModalBody>

        <ModalFooter className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-xl"
          >
            Cerrar Vista
          </Button>
          <Button
            size="sm"
            className="rounded-xl font-medium text-white shadow-md bg-amber-400/20 shadow-amber-500/10"
            onClick={handleSaveToDB}
            isLoading={isSaving}
            disabled={!hasItemsCalculados}
          >
            <Save className="w-4 h-4 mr-1.5" />
            Guardar Despiece en DB
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DespieceModal;
