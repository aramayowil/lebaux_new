import { Group, Rect } from "react-konva";
import type { ObraDetalle, Perfil, Vidrio } from "@/types";
import { RenderCelda } from "./RenderCelda";
import { JSX } from "react";

type Color = {
  aluminio: string;
  catalogVidrios: Vidrio[];
  contorno: string;
  lineasCotas: string;
  perfiles: Perfil[];
};

interface RenderCrucesCentradosProps {
  interiorW: number;
  interiorH: number;
  sizePerfilCruce: number;
  scale: number;
  colors: Color;
  detalles: ObraDetalle;
}

export const RenderCrucesCentrados = ({
  interiorW,
  interiorH,
  sizePerfilCruce,
  scale,
  colors,
  detalles,
}: RenderCrucesCentradosProps) => {
  const cantH = Number(detalles.cant_centrados_horizontal ?? 0);
  const cantV = Number(detalles.cant_centrados_vertical ?? 0);

  if (cantH === 0 && cantV === 0) return null;

  const filasH = cantH + 1;
  const columnasV = cantV + 1;

  // Cálculos de dimensiones de celdas libres de carpintería
  const altoCadaPanel = (interiorH - cantH * sizePerfilCruce) / filasH;
  const anchoCadaPanel = (interiorW - cantV * sizePerfilCruce) / columnasV;

  const elementos: JSX.Element[] = [];
  let currentY = 0;

  for (let r = 0; r < filasH; r++) {
    let currentX = 0;
    const filaId = r + 1;

    for (let c = 0; c < columnasV; c++) {
      // Inyectamos la celda modularizada delegando la lógica interna
      elementos.push(
        <Group key={`panel-matriz-${r}-${c}`} x={currentX} y={currentY}>
          <RenderCelda
            filaId={filaId}
            ancho={anchoCadaPanel}
            alto={altoCadaPanel}
            scale={scale}
            colors={colors}
            detalles={detalles}
          />
        </Group>,
      );

      currentX += anchoCadaPanel;

      // Travesaño Vertical Acoplado (Cortado de Taller)
      if (c < cantV) {
        elementos.push(
          <Rect
            key={`perfil-v-falso-${r}-${c}`}
            x={currentX}
            y={currentY}
            width={sizePerfilCruce}
            height={altoCadaPanel}
            fill={colors.aluminio}
            stroke={colors.contorno}
            strokeWidth={1}
          />,
        );
        currentX += sizePerfilCruce;
      }
    }

    currentY += altoCadaPanel;

    // Travesaño Horizontal Completo (Entero de Punta a Punta)
    if (r < cantH) {
      elementos.push(
        <Rect
          key={`perfil-h-entero-${r}`}
          x={0}
          y={currentY}
          width={interiorW}
          height={sizePerfilCruce}
          fill={colors.aluminio}
          stroke={colors.contorno}
          strokeWidth={1}
        />,
      );
      currentY += sizePerfilCruce;
    }
  }

  return <Group>{elementos}</Group>;
};

export default RenderCrucesCentrados;
