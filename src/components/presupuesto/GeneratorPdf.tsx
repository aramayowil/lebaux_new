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
import {
  HiOutlineDocumentText,
  HiOutlineUser,
  HiOutlineCloudArrowDown,
  HiOutlineChatBubbleBottomCenterText,
} from "react-icons/hi2";
import PDF from "@/components/PdfLayout";
import { pdf } from "@react-pdf/renderer";

// STORES Y HOOKS
import useAberturasStore from "@/stores/useAberturasStore";
import useAberturasCompuestasStore from "@/stores/useAberturasCompustasStore";
import { usePresupuestosDB } from "@/hooks/usePresupuestosDB";
// Supongamos que tienes un store para la configuración de la obra actual
import { useConfigObraStore } from "@/stores/useConfigObraStore";

// INTERFACES
import IPresupuesto from "@/interfaces/IPresupuesto";
import { useNavigate } from "react-router-dom";
import useBorradorObraStore from "@/stores/useBorradorObraStore";

function obtenerFechaHoy() {
  return new Date().toLocaleDateString("es-AR");
}

type GeneratorPdfProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  compra: {
    total: number;
    descuento: number;
    iva: number;
    saldoPendiente: number;
    importeFinal: number;
  };
};

function GeneratorPdf({ isOpen, onOpenChange, compra }: GeneratorPdfProps) {
  const navigate = useNavigate();

  // EXTRAEMOS DATOS DE LA OBRA ACTUAL (Si es que venimos de "Editar")
  const { idObraActual, clienteActual, esEdicion, observacionesActuales } =
    useConfigObraStore();

  const [nameCliente, setNameCliente] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 1. Extraemos funciones del hook (Asegúrate de tener actualizarPresupuesto en tu hook)
  const { guardarPresupuesto, actualizarPresupuesto, createId } =
    usePresupuestosDB();

  const aberturasStore = useAberturasStore((state) => state.aberturas);
  const aberturasCompuestasStore = useAberturasCompuestasStore(
    (state) => state.aberturasComps,
  );

  // Sincronizar los campos si es una edición
  useEffect(() => {
    if (isOpen && esEdicion) {
      setNameCliente(clienteActual || "");
      setObservaciones(observacionesActuales || "");
    }
  }, [isOpen, esEdicion, clienteActual, observacionesActuales]);

  const handleFinalizar = () => {
    localStorage.clear();
    localStorage.setItem("heroui-theme", "dark");
    navigate("/", { replace: true });
    window.location.reload();
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

    setIsLoading(true);
    try {
      // 2. DETERMINAR EL ID (Usar el existente o crear uno nuevo)
      let idFinal = idObraActual;
      if (!esEdicion || !idFinal) {
        idFinal = await createId();
      }

      // 3. PREPARAR EL OBJETO
      const presupuestoData: IPresupuesto = {
        id: idFinal,
        cliente: nameCliente.trim(),
        fecha: obtenerFechaHoy(),
        items: [...aberturasStore, ...aberturasCompuestasStore],
        detalleCompra: {
          total: compra.total,
          descuento: compra.descuento || 0,
          saldoPendiente: compra.saldoPendiente || 0,
          iva: compra.iva,
          importeFinal: compra.importeFinal,
        },
        observaciones: observaciones || "",
        estado: "pendiente",
      };

      // 4. GUARDAR O ACTUALIZAR SEGÚN EL MODO
      if (esEdicion) {
        await actualizarPresupuesto(idFinal, presupuestoData);
      } else {
        await guardarPresupuesto(presupuestoData);
      }

      // 5. GENERAR EL DOCUMENTO PDF
      const blob = await pdf(
        <PDF
          idPresupuesto={idFinal}
          aberturas={aberturasStore}
          aberturasCompuestas={aberturasCompuestasStore}
          detalleCompra={compra}
          nameCliente={nameCliente.trim()}
          observaciones={observaciones}
        />,
      ).toBlob();

      // 6. DESCARGA
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `${idFinal}-${nameCliente.replace(/\s+/g, "_").toUpperCase()}-${obtenerFechaHoy()}.pdf`;
      enlace.click();

      // 7. FINALIZACIÓN
      useBorradorObraStore.getState().setAberturas([]);
      useBorradorObraStore.getState().setAberturasComps([]);
      addToast({
        title: esEdicion ? "Actualización exitosa" : "¡Éxito!",
        description: `Presupuesto ${idFinal} ${esEdicion ? "actualizado" : "guardado"}.`,
        color: "success",
      });

      setTimeout(() => {
        URL.revokeObjectURL(url);
        setIsLoading(false);
        onOpenChange(false);
      }, 500);

      handleFinalizar();
    } catch (error) {
      console.error("Error:", error);
      addToast({
        title: "Error de exportación",
        description: "No se pudo procesar el presupuesto.",
        color: "danger",
      });
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
      classNames={{
        base: "bg-zinc-950 border border-white/10 shadow-2xl rounded-[2rem]",
        closeButton: "hover:bg-white/5 transition-colors",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="pt-10 pb-4 px-8">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <HiOutlineDocumentText
                      className="text-amber-500"
                      size={24}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                      {esEdicion
                        ? "Actualizar Cotización"
                        : "Confirmar Cotización"}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      {esEdicion
                        ? `Modificando presupuesto: ${idObraActual}`
                        : "Se asignará un número correlativo automáticamente."}
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
                      <HiOutlineUser className="text-zinc-500" size={18} />
                    }
                    classNames={{
                      label:
                        "text-[10px] font-black tracking-[0.2em] text-zinc-500 ml-1",
                      inputWrapper:
                        "border-white/10 hover:border-amber-500/50 focus-within:!border-amber-500 h-14 bg-white/5 transition-all rounded-xl",
                      input: "text-zinc-100 text-sm font-semibold",
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
                      <HiOutlineChatBubbleBottomCenterText
                        className="text-zinc-500 mt-1"
                        size={18}
                      />
                    }
                    classNames={{
                      label:
                        "text-[10px] font-black tracking-[0.2em] text-zinc-500 ml-1",
                      inputWrapper:
                        "border-white/10 hover:border-amber-500/50 focus-within:!border-amber-500 bg-white/5 transition-all rounded-xl",
                      input: "text-zinc-100 text-sm",
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
                  className="flex-1 font-bold text-zinc-400 hover:text-white transition-colors bg-white/5 rounded-xl"
                >
                  VOLVER
                </Button>
                <Button
                  color="warning"
                  isLoading={isLoading}
                  onPress={generarPDF}
                  className="flex-2 bg-amber-500 text-black font-black uppercase tracking-wider rounded-xl shadow-[0_8px_20px_rgba(245,158,11,0.2)]"
                  startContent={
                    !isLoading && <HiOutlineCloudArrowDown size={20} />
                  }
                >
                  {isLoading
                    ? "PROCESANDO..."
                    : esEdicion
                      ? "ACTUALIZAR Y DESCARGAR"
                      : "FINALIZAR Y DESCARGAR"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default GeneratorPdf;
