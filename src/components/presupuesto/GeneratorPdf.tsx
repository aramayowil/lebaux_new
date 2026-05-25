import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  addToast,
} from "@heroui/react";
import { useState, useEffect } from "react";

import PDF from "@/components/presupuesto/PdfLayout";
import { pdf } from "@react-pdf/renderer";

// INTERFACES
import { Obra, ObraTipologia } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  CloudDownload,
  FileText,
  MessageSquareText,
  UserRound,
} from "lucide-react";

import { useObrasStore } from "@/store/obrasStore";
import { useProductos } from "@/hooks/productos/useProducto";
import { useTipos } from "@/hooks/obra/useTipos";
import { useHojas } from "@/hooks/productos/useHojas";
import TipologiaCanvas from "@/components/canvas/TipologiaCanvas";

function obtenerFechaHoy() {
  return new Date().toLocaleDateString("es-AR");
}

type GeneratorPdfProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  obra: Obra;
  tipologias: ObraTipologia[];
  compra: {
    total: number;
    descuento: number;
    iva: number;
    saldoPendiente: number;
    importeFinal: number;
  };
};

function GeneratorPdf({
  isOpen,
  onOpenChange,
  obra,
  tipologias,
  compra,
}: GeneratorPdfProps) {
  const navigate = useNavigate();

  const [nameCliente, setNameCliente] = useState(
    obra.nombre + " " + obra.apellido,
  );
  const [observaciones, setObservaciones] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- HOOKS PARA RENDERIZAR LOS CANVAS OCULTOS ---
  const { getConfig } = useObrasStore();
  const { data: productos } = useProductos();
  const { data: tipos } = useTipos();
  const { data: hojas } = useHojas();

  const [canvasImages, setCanvasImages] = useState<Record<number, string>>({});

  useEffect(() => {
    if (isOpen && obra) {
      setNameCliente(`${obra.nombre} ${obra.apellido}`.trim());
      // Reiniciamos las imágenes cuando se abre el modal para forzar nueva captura si cambió algo
      setCanvasImages({});
    }
  }, [isOpen, obra]);

  const handleFinalizar = () => {
    // Si necesitas hacer alguna limpieza al terminar
    navigate(`/obras/${obra.id}`);
  };

  const generarPDF = async (): Promise<void> => {
    if (!nameCliente.trim()) {
      addToast({
        title: "Faltan datos",
        description: "Por favor, ingrese el nombre del cliente.",
        color: "danger",
      });
      return;
    }

    if (Object.keys(canvasImages).length !== tipologias.length && tipologias.length > 0) {
      addToast({
        title: "Generando esquemas",
        description: "Aguarde un instante mientras se renderizan los dibujos.",
        color: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      const idFinal = `PRE-${obra.id}-${Date.now().toString().slice(-4)}`;

      // 5. GENERAR EL DOCUMENTO PDF
      const blob = await pdf(
        <PDF
          idPresupuesto={idFinal}
          obra={obra}
          tipologias={tipologias}
          detalleCompra={compra}
          nameCliente={nameCliente.trim()}
          observaciones={observaciones}
          images={canvasImages}
        />,
      ).toBlob();

      // 6. DESCARGA
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `${idFinal}-${nameCliente.replace(/\s+/g, "_").toUpperCase()}-${obtenerFechaHoy().replace(/\//g, "-")}.pdf`;
      enlace.click();

      addToast({
        title: "¡Éxito!",
        description: `Presupuesto ${idFinal} generado correctamente.`,
        color: "success",
      });

      setTimeout(() => {
        URL.revokeObjectURL(url);
        setIsLoading(false);
        onOpenChange(false);
      }, 500);

      handleFinalizar();
    } catch (error) {
      console.error("Error al generar PDF:", error);
      addToast({
        title: "Error de exportación",
        description: "No se pudo procesar el presupuesto.",
        color: "danger",
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px", opacity: 0, pointerEvents: "none" }}>
        {isOpen && tipologias.map((tipologia) => {
          const configSel = getConfig(tipologia.id);
          const nHojas = configSel?.id_hoja && hojas
              ? (hojas.find((h) => h.id === configSel.id_hoja)?.cantidad ?? 1)
              : 1;

          const formaTipo = productos && configSel
              ? productos.find((p) => p.id === configSel.id_producto)?.id_tipo
              : null;
          
          const tipoDeProducto = tipos && formaTipo
              ? tipos.find((t) => t.id === formaTipo)?.forma_tipo
              : undefined;

          // Si no hay config válido (ej: no se seleccionó producto), evitamos fallos
          if (!configSel || !tipoDeProducto) return null;

          return (
            <TipologiaCanvas
              key={tipologia.id}
              tipologia={tipologia}
              config={configSel}
              tipoDeProducto={tipoDeProducto}
              hojas={nHojas}
              width={400}
              height={400}
              onReady={(base64) => {
                setCanvasImages((prev) => ({ ...prev, [tipologia.id]: base64 }));
              }}
            />
          );
        })}
      </div>

      <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
      classNames={{
        base: "bg-white dark:bg-zinc-950 border border-steel-200 dark:border-white/10 shadow-2xl rounded-[2rem]",
        closeButton:
          "hover:bg-steel-100 dark:hover:bg-white/5 transition-colors",
      }}
    >
      <ModalContent>
        {(onClose: (isOpen: boolean) => void) => (
          <>
            <ModalBody className="pt-10 pb-4 px-8">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <FileText className="text-amber-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-steel-900 dark:text-white uppercase tracking-tight">
                      Confirmar Cotización
                    </h3>
                    <p className="text-xs text-steel-500 dark:text-zinc-500 font-medium">
                      Obra de {obra.nombre} {obra.apellido}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <Input
                    label="NOMBRE DEL CLIENTE"
                    placeholder="Ej: Juan Pérez"
                    labelPlacement="outside"
                    variant="bordered"
                    isRequired
                    value={nameCliente}
                    onValueChange={setNameCliente}
                    startContent={
                      <UserRound
                        className="text-steel-400 dark:text-zinc-500"
                        size={18}
                      />
                    }
                    classNames={{
                      label:
                        "text-[10px] font-black tracking-[0.2em] text-steel-500 dark:text-zinc-500 ml-1",
                      inputWrapper:
                        "border-steel-200 dark:border-white/10 hover:border-[#db924b]/50 focus-within:!border-[#db924b] h-14 bg-steel-50 dark:bg-white/5 transition-all rounded-xl",
                      input:
                        "text-steel-900 dark:text-zinc-100 text-sm font-semibold",
                    }}
                  />

                  <Textarea
                    label="NOTAS ADICIONALES"
                    placeholder="Detalles de obra, entrega o colores..."
                    labelPlacement="outside"
                    variant="bordered"
                    minRows={3}
                    value={observaciones}
                    onValueChange={setObservaciones}
                    startContent={
                      <MessageSquareText
                        className="text-steel-400 dark:text-zinc-500 mt-1"
                        size={18}
                      />
                    }
                    classNames={{
                      label:
                        "text-[10px] font-black tracking-[0.2em] text-steel-500 dark:text-zinc-500 ml-1",
                      inputWrapper:
                        "border-steel-200 dark:border-white/10 hover:border-[#db924b]/50 focus-within:!border-[#db924b] bg-steel-50 dark:bg-white/5 transition-all rounded-xl",
                      input: "text-steel-900 dark:text-zinc-100 text-sm",
                    }}
                  />
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="px-8 pb-8 pt-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  variant="flat"
                  onPress={onClose}
                  className="flex-1 font-bold text-steel-600 dark:text-zinc-400 hover:text-steel-900 dark:hover:text-white transition-colors bg-steel-100 dark:bg-white/5 rounded-xl"
                >
                  VOLVER
                </Button>
                <Button
                  color="warning"
                  isLoading={isLoading}
                  onPress={generarPDF}
                  className="flex-2 bg-[#db924b] text-white font-black uppercase tracking-wider rounded-xl shadow-[0_8px_20px_rgba(219,146,75,0.3)]"
                  startContent={!isLoading && <CloudDownload size={20} />}
                >
                  {isLoading ? "PROCESANDO..." : "FINALIZAR Y DESCARGAR"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
    </>
  );
}

export default GeneratorPdf;
