import { Group, Rect, Text } from "react-konva";
import type { ObraDetalle, Perfil, Vidrio } from "@/types";
import { RenderSubPanel } from "./RenderSubPanel";
import RenderRevestimiento from "./RenderRevestimiento";
import { RenderProfundidad } from "./RenderProfundidad";
import { intToHexBGR } from "@/utils/intToHexRGB";
import RenderVidrioRepartido from "./RenderVidrioRepartido";

interface RenderCeldaCrucesProps {
  filaId: number;
  ancho: number;
  alto: number;
  scale: number;
  colors: {
    aluminio: string;
    catalogVidrios: Vidrio[];
    contorno: string;
    perfiles: Perfil[];
  };
  detalles: ObraDetalle;
}

export const RenderCelda = ({
  filaId,
  ancho,
  alto,
  scale,
  colors,
  detalles,
}: RenderCeldaCrucesProps) => {
  // Mapeo dinámico de llaves según la fila (interior_1, dvh_1_1, etc.)
  const keyInterior = `interior_${filaId}` as keyof ObraDetalle;
  const keyDvh1 = `dvh_${filaId}_1` as keyof ObraDetalle;
  const keyDvh2 = `dvh_${filaId}_2` as keyof ObraDetalle;
  const keyCamara = `camara_${filaId}` as keyof ObraDetalle;
  const keyRevest = `revest_${filaId}` as keyof ObraDetalle;
  const keyDirecc = `direcc_${filaId}` as keyof ObraDetalle;

  const valorInterior = detalles[keyInterior] as string | null;
  const valorDvh1 = detalles[keyDvh1] as string | null;
  const valorDvh2 = detalles[keyDvh2] as string | null;
  const valorRevest = detalles[keyRevest] as string | null;
  const valorDirecc = detalles[keyDirecc] as string | null;

  const vrKey = `vr_${filaId}` as keyof ObraDetalle;
  const horVRKey = `hor_vr_${filaId}` as keyof ObraDetalle;
  const verVRKey = `ver_vr_${filaId}` as keyof ObraDetalle;
  const activoVRKey = `activo_vr_${filaId}` as keyof ObraDetalle;

  const valorVR = detalles[vrKey] as string | null;
  const horVR = Number(detalles[horVRKey] ?? 0);
  const verVR = Number(detalles[verVRKey] ?? 0);
  const activoVR = !!detalles[activoVRKey];

  // Márgenes estéticos para los textos descriptivos técnicos
  const offsetProfundidad = 4 * scale;
  const margenX = offsetProfundidad + 6;
  const margenY = offsetProfundidad + 4;
  const fontSizeText = Math.max(10, 3.5 * scale);

  // --- EVALUACIÓN DE MATERIALES ---

  // Opción A: Revestimiento de Aluminio
  if (valorRevest?.trim() && valorDirecc?.trim()) {
    return (
      <Group>
        <RenderRevestimiento
          width={ancho}
          height={alto}
          scale={scale}
          color={colors.aluminio}
          direccion={valorDirecc}
          contorno={colors.contorno}
        />
        <RenderProfundidad
          hojaW={ancho}
          hojaH={alto}
          scale={scale}
          colors={colors}
        />
        <Text
          text={valorRevest.toUpperCase()}
          x={margenX}
          y={margenY}
          fontSize={fontSizeText}
          fontFamily="Calibri, Arial"
          fontStyle="bold"
          fill="#2C3E50"
        />
      </Group>
    );
  }

  // Opción B: Doble Vidriado Hermético (DVH)
  if (
    valorDvh1?.trim() &&
    valorDvh2?.trim() &&
    Number(detalles[keyCamara] ?? 0) > 0
  ) {
    const esp1 = Number(
      colors.catalogVidrios.find((v) => v.id === Number(valorDvh1))?.espesor ??
        0,
    );
    const esp2 = Number(
      colors.catalogVidrios.find((v) => v.id === Number(valorDvh2))?.espesor ??
        0,
    );
    const id_camara = Number(detalles[keyCamara]);
    const camara_descripcion =
      colors.perfiles.find((p) => p.id === id_camara)?.descri || "";
    const camara = camara_descripcion.split(" ")[2].split("mm")[0];
    const colorVidrio =
      intToHexBGR(
        Number(
          colors.catalogVidrios.find((v) => v.id === Number(valorDvh1))?.color,
        ),
      ) || "transparent";

    return (
      <Group>
        <RenderSubPanel
          x={0}
          y={0}
          width={ancho}
          height={alto}
          colorFondo={colorVidrio}
          contorno={colors.contorno}
          colors={colors}
        />
        <RenderProfundidad
          hojaW={ancho}
          hojaH={alto}
          scale={scale}
          colors={colors}
        />
        <Text
          text={`DVH ${esp1}/${camara}/${esp2}`}
          x={margenX}
          y={margenY}
          fontSize={fontSizeText}
          fontFamily="Calibri, Arial"
          fontStyle="bold"
          fill="#2C3E50"
        />
      </Group>
    );
  }

  // Opción C: Vidrio Simple
  if (valorInterior?.trim()) {
    const datosVidrio = colors.catalogVidrios.find(
      (v) => v.id === Number(valorInterior),
    );
    const colorVidrio =
      intToHexBGR(Number(datosVidrio?.color)) || "transparent";

    return (
      <Group>
        <RenderSubPanel
          x={0}
          y={0}
          width={ancho}
          height={alto}
          colorFondo={colorVidrio}
          contorno={colors.contorno}
          colors={colors}
        />
        {/* 4. Vidrio repartido (VR) si está activo */}
        {activoVR && valorVR?.trim() && (horVR > 0 || verVR > 0) ? (
          <RenderVidrioRepartido
            ancho={ancho}
            alto={alto}
            scale={scale}
            colors={colors}
            horVR={horVR}
            verVR={verVR}
          />
        ) : (
          <RenderProfundidad
            hojaW={ancho}
            hojaH={alto}
            scale={scale}
            colors={colors}
          />
        )}

        {datosVidrio?.descri && (
          <Text
            text={datosVidrio.descri.toUpperCase()}
            x={margenX}
            y={margenY}
            fontSize={fontSizeText}
            fontFamily="Calibri, Arial"
            fontStyle="bold"
            fill="#2C3E50"
          />
        )}
      </Group>
    );
  }

  // Opción D: Celda vacía/fija sin material configurado
  return (
    <Rect
      x={0}
      y={0}
      width={ancho}
      height={alto}
      fill="transparent"
      stroke={colors.contorno}
      strokeWidth={0.5}
    />
  );
};
