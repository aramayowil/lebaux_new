import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  onAccept: (data: { medida: number; cantidad: number }) => void;
}

export default function TravesanoModal({
  isOpen,
  onOpenChange,
  onAccept,
}: Props) {
  const [medida, setMedida] = useState(1000);
  const [cantidad, setCantidad] = useState(1);

  const handleAccept = (onClose: () => void) => {
    onAccept({ medida, cantidad });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xs">
      <ModalContent>
        {(onClose: any) => (
          <>
            <ModalHeader className="font-display">
              Insertar Travesaño
            </ModalHeader>
            <ModalBody className="gap-4">
              <Input
                label="Medida (mm)"
                type="number"
                value={String(medida)}
                onValueChange={(v: string) => setMedida(Number(v) || 0)}
                size="sm"
                autoFocus
              />
              <Input
                label="Cantidad"
                type="number"
                value={String(cantidad)}
                onValueChange={(v: string) => setCantidad(Number(v) || 1)}
                size="sm"
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} size="sm">
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={() => handleAccept(onClose)}
                size="sm"
              >
                Aceptar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
