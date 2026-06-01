import { ObraTipologia } from "@/types";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Calculator, AlertTriangle } from "lucide-react";
import DespieceView from "./DespieceView";
import { ResultadoDespiece } from "@/lib/motorDespiece";

interface DespieceModalProps {
  isOpen: boolean;

  onOpenChange: () => void;
  tipSel: ObraTipologia;
  despieceError: string | null;
  despieceResult: ResultadoDespiece | null;
}

const DespieceModal = ({
  isOpen,
  onOpenChange,
  tipSel,
  despieceError,
  despieceResult,
}: DespieceModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="full"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950",
        header: "border-b border-zinc-100 dark:border-zinc-800",
        closeButton: "hover:bg-lebaux-surface-hover transition-colors",
      }}
    >
      <ModalContent>
        <>
          <ModalHeader className="flex items-center gap-3 py-2">
            <div className="p-2 bg-lebaux-amber/10 rounded-lg">
              <Calculator className="w-5 h-5 text-lebaux-amber" />
            </div>
            <div className="flex flex-col">
              <span className="text-small font-bold text-foreground leading-tight">
                Despiece Técnico
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                {tipSel?.descripcion || "Sin descripción"}
              </span>
            </div>
          </ModalHeader>

          <ModalBody className="py-6">
            {/* Alerta de Error */}
            {despieceError && (
              <div className="flex items-center gap-3 text-danger bg-danger-50 dark:bg-danger-900/10 rounded-xl p-4 mb-4 border border-danger/20">
                <AlertTriangle size={18} />
                <p className="text-sm font-medium">Error: {despieceError}</p>
              </div>
            )}

            {/* Contenido principal */}
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
                  No hay datos para calcular
                </p>
                <p className="text-[11px] mt-1">
                  Configura las medidas en el canvas primero
                </p>
              </div>
            )}
          </ModalBody>

          <ModalFooter className="border-t border-zinc-100 dark:border-zinc-800">
            <Button
              variant="light"
              onPress={onOpenChange}
              className="text-zinc-500 hover:text-foreground font-medium"
            >
              Cerrar
            </Button>
            <Button
              className="bg-lebaux-amber hover:bg-lebaux-amber-hover text-zinc-900 font-bold shadow-lg shadow-lebaux-amber/20"
              onPress={onOpenChange}
            >
              Exportar PDF
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};

export default DespieceModal;
