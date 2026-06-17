import { Group, Rect } from "react-konva";
import type { ObraDetalle, Perfil, Vidrio } from "@/types";
import { RenderCelda } from "./RenderCelda";
import { JSX } from "react";

type ColorPalette = {
  aluminio: string;
  catalogVidrios: Vidrio[];
  contorno: string;
  lineasCotas: string;
  perfiles: Perfil[];
};

interface RenderCrucesVariablesProps {
  windowW: number; // Ancho total exterior nominal de la abertura (drawW)
  windowH: number; // Alto total exterior nominal de la abertura (drawH)
  interiorHojaW: number; // Ancho neto del vano/hoja donde se dibuja físicamente
  interiorHojaH: number; // Alto neto del vano/hoja donde se dibuja físicamente
  sizePerfilCruce: number; // Grosor del perfil travesaño intermedio escalado
  scale: number; // Escala de conversión gráfica
  colors: ColorPalette; // Estructura unificada de colores
  detalles: ObraDetalle; // Record completo de la base de datos
}

export const RenderCrucesVariables = ({
  windowW,
  windowH,
  interiorHojaW,
  interiorHojaH,
  sizePerfilCruce,
  scale,
  colors,
  detalles,
}: RenderCrucesVariablesProps) => {
  const { aluminio, contorno } = colors;

  const offsetMarcoX = (windowW - interiorHojaW) / 2;
  const offsetMarcoY = (windowH - interiorHojaH) / 2;

  // 1. FILTRADO Y TRADUCCIÓN HORIZONTAL (Cota Y medida en mm desde el piso de la abertura hacia arriba)
  const crucesHorizontalesDb = [
    detalles.horizontal_1,
    detalles.horizontal_2,
    detalles.horizontal_3,
  ].filter((x): x is number => typeof x === "number" && x > 0);

  // Ordenados visualmente de Arriba hacia Abajo (Eje Y de Konva se invierte)
  const posH = crucesHorizontalesDb
    .map((mm) => windowH - mm * scale - offsetMarcoY)
    .sort((a, b) => a - b);

  // 2. FILTRADO Y TRADUCCIÓN VERTICAL (Cota X medida en mm desde el lateral izquierdo de la abertura)
  const crucesVerticalesDb = [
    detalles.vertical_1,
    detalles.vertical_2,
    detalles.vertical_3,
    detalles.vertical_4,
    detalles.vertical_5,
  ].filter((x): x is number => typeof x === "number" && x > 0);

  // Ordenados visualmente de Izquierda a Derecha (Eje X de Konva)
  const posV = crucesVerticalesDb
    .map((mm) => mm * scale - offsetMarcoX)
    .sort((a, b) => a - b);

  // Si no hay ningún cruce variable cargado en la base de datos, no dibuja nada
  if (posH.length === 0 && posV.length === 0) {
    return (
      <RenderCelda
        filaId={1}
        ancho={interiorHojaW}
        alto={interiorHojaH}
        scale={scale}
        colors={colors}
        detalles={detalles}
      />
    );
  }

  // 3. GENERACIÓN DE LÍMITES PARA LA CUADRÍCULA DE CELDAS
  const tramosY = [0, ...posH, interiorHojaH];
  const tramosX = [0, ...posV, interiorHojaW];

  const celdasRenderizadas: JSX.Element[] = [];

  // ─── MATRIZ DINÁMICA DE CELDAS (Asignadas por Fila) ───
  for (let r = 0; r < tramosY.length - 1; r++) {
    const startY = tramosY[r];
    const endY = tramosY[r + 1];

    // 🚀 CLAVE: El ID del material se define estrictamente por el piso/fila actual (1, 2, 3, 4)
    const filaId = r + 1;

    // Restamos el grosor de los perfiles horizontales al vidrio para que encaje perfecto
    const yActual = startY === 0 ? 0 : startY + sizePerfilCruce / 2;
    const yFinal =
      endY === interiorHojaH ? interiorHojaH : endY - sizePerfilCruce / 2;
    const altoPanel = yFinal - yActual;

    for (let c = 0; c < tramosX.length - 1; c++) {
      const startX = tramosX[c];
      const endX = tramosX[c + 1];

      // Restamos el grosor de los perfiles verticales al vidrio
      const xActual = startX === 0 ? 0 : startX + sizePerfilCruce / 2;
      const xFinal =
        endX === interiorHojaW ? interiorHojaW : endX - sizePerfilCruce / 2;
      const anchoPanel = xFinal - xActual;

      // Generamos el cristal con el ID de su fila correspondiente
      if (altoPanel > 0 && anchoPanel > 0) {
        celdasRenderizadas.push(
          <Group key={`celda-var-${r}-${c}`} x={xActual} y={yActual}>
            <RenderCelda
              filaId={filaId} // Todos los paños de la fila 'r' leen 'interior_r', 'dvh_r_1', 'revest_r', etc.
              ancho={anchoPanel}
              alto={altoPanel}
              scale={scale}
              colors={colors}
              detalles={detalles}
            />
          </Group>,
        );
      }
    }
  }

  return (
    <Group>
      {/* 1. Renderizamos todos los vidrios y revestimientos de forma individual */}
      {celdasRenderizadas}

      {/* 2. Superponemos el Aluminio: TRAVESAÑOS HORIZONTALES PASANTES */}
      {posH.map((hY, idx) => {
        // Validación de seguridad constructiva perimetral
        if (
          hY - sizePerfilCruce / 2 < 0 ||
          hY + sizePerfilCruce / 2 > interiorHojaH
        ) {
          return null;
        }

        return (
          <Rect
            key={`var-h-perfil-${idx}`}
            x={0}
            y={hY - sizePerfilCruce / 2}
            width={interiorHojaW}
            height={sizePerfilCruce}
            fill={aluminio}
            stroke={contorno}
            strokeWidth={1}
          />
        );
      })}

      {/* 3. Superponemos el Aluminio: PARANTES VERTICALES INTERRUMPIDOS */}
      {posV.map((vX, vIdx) => {
        // Validación de seguridad constructiva perimetral
        if (
          vX - sizePerfilCruce / 2 < 0 ||
          vX + sizePerfilCruce / 2 > interiorHojaW
        ) {
          return null;
        }

        return (
          <Group key={`var-v-columna-${vIdx}`}>
            {tramosY.map((_, tIdx) => {
              if (tIdx === tramosY.length - 1) return null;

              const startY = tramosY[tIdx];
              const endY = tramosY[tIdx + 1];

              // Descontamos las mitades de los perfiles horizontales pasantes para un acople perfecto
              const yActual = startY === 0 ? 0 : startY + sizePerfilCruce / 2;
              const yFinal =
                endY === interiorHojaH
                  ? interiorHojaH
                  : endY - sizePerfilCruce / 2;
              const hActual = yFinal - yActual;

              if (hActual <= 0) return null;

              return (
                <Rect
                  key={`var-v-segmento-${vIdx}-${tIdx}`}
                  x={vX - sizePerfilCruce / 2}
                  y={yActual}
                  width={sizePerfilCruce}
                  height={hActual}
                  fill={aluminio}
                  stroke={contorno}
                  strokeWidth={0.5} // Simula la costura técnica del ensamble en taller
                />
              );
            })}
          </Group>
        );
      })}
    </Group>
  );
};
