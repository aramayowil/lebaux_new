import { Group, Line } from "react-konva";
import type { ObraDetalle, Perfil, Vidrio } from "@/types";
import { RenderCrucesCentrados } from "../components/RenderCrucesCentrados";
import WarningAlertDesign from "../components/WarningAlertDesign";
import { RenderCelda } from "../components/RenderCelda";
import { RenderCrucesVariables } from "../components/RenderCrucesVariables";

interface LayoutProps {
  drawW: number;
  drawH: number;
  scale: number;
  detalles: ObraDetalle;
  colors: {
    aluminio: string;
    catalogVidrios: Vidrio[];
    contorno: string;
    lineasCotas: string;
    perfiles: Perfil[];
  };
}

export const PañoFijoLayout = ({
  drawW,
  drawH,
  scale,
  detalles,
  colors,
}: LayoutProps) => {
  const { aluminio, contorno } = colors;

  // --- CONFIGURACIÓN DE PERFILES TÉCNICOS ESCALADOS ---
  const perfilDeMarco = 42.5 * scale; // Marco perimetral fijo
  const perfilDeCruce = 57.8 * scale; // Travesaño intermedio (Cruce Modena T)

  // Dimensiones libres del hueco interior neto que deja el marco
  const marcoInteriorW = drawW - perfilDeMarco * 2;
  const marcoInteriorH = drawH - perfilDeMarco * 2;

  // Comprobación flexible del campo de tratamiento según tu base de datos
  const tieneTratamiento =
    detalles.color != null || (detalles as any).tratamiento != null;

  const RenderMarco = () => (
    <Group>
      {/* DINTEL DE MARCO */}
      <Line
        points={[
          0,
          0,
          drawW,
          0,
          drawW - perfilDeMarco,
          perfilDeMarco,
          perfilDeMarco,
          perfilDeMarco,
        ]}
        closed
        fill={aluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* UMBRAL DE MARCO */}
      <Line
        points={[
          0,
          drawH,
          perfilDeMarco,
          drawH - perfilDeMarco,
          drawW - perfilDeMarco,
          drawH - perfilDeMarco,
          drawW,
          drawH,
        ]}
        closed
        fill={aluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* JAMBA IZQUIERDA DE MARCO */}
      <Line
        points={[
          0,
          0,
          perfilDeMarco,
          perfilDeMarco,
          perfilDeMarco,
          drawH - perfilDeMarco,
          0,
          drawH,
        ]}
        closed
        fill={aluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* JAMBA DERECHA DE MARCO */}
      <Line
        points={[
          drawW - perfilDeMarco,
          perfilDeMarco,
          drawW,
          0,
          drawW,
          drawH,
          drawW - perfilDeMarco,
          drawH - perfilDeMarco,
        ]}
        closed
        fill={aluminio}
        stroke={contorno}
        strokeWidth={1}
      />
    </Group>
  );

  const renderContenidoMarco = () => {
    const cantH = Number(detalles.cant_centrados_horizontal ?? 0);
    const cantV = Number(detalles.cant_centrados_vertical ?? 0);
    const tipoCruce = Number(detalles.tipo_cruce ?? 0);

    // Activamos el módulo si hay divisiones cuantitativas cargadas en la BD
    if (tipoCruce === 1 && (cantH > 0 || cantV > 0)) {
      return (
        <RenderCrucesCentrados
          interiorW={marcoInteriorW}
          interiorH={marcoInteriorH}
          sizePerfilCruce={perfilDeCruce}
          scale={scale}
          colors={colors}
          detalles={detalles}
        />
      );
    }

    const tieneCrucesVariables = [
      detalles.horizontal_1,
      detalles.horizontal_2,
      detalles.horizontal_3,
      detalles.vertical_1,
      detalles.vertical_2,
      detalles.vertical_3,
      detalles.vertical_4,
      detalles.vertical_5,
    ].some((v) => typeof v === "number" && v > 0);

    if (tipoCruce === 2 && tieneCrucesVariables) {
      return (
        <>
          <RenderCrucesVariables
            windowH={drawH}
            windowW={drawW}
            interiorHojaH={marcoInteriorH}
            interiorHojaW={marcoInteriorW}
            sizePerfilCruce={perfilDeCruce}
            scale={scale}
            colors={colors}
            detalles={detalles}
          />
        </>
      );
    }

    // Si no tiene cruces intermedios, renderiza el paño unificado normal
    return (
      <RenderCelda
        filaId={1}
        ancho={marcoInteriorW}
        alto={marcoInteriorH}
        scale={scale}
        colors={colors}
        detalles={detalles}
      />
    );
  };

  return (
    <Group>
      {/* 1. Estructura de aluminio de la abertura */}
      <RenderMarco />

      {/* 2. Vidrios o paneles internos divididos */}
      <Group x={perfilDeMarco} y={perfilDeMarco}>
        {renderContenidoMarco()}
      </Group>

      {/* 3. Capa superior de Advertencia si falta el tratamiento de color */}
      {!tieneTratamiento && (
        <WarningAlertDesign
          x={0}
          y={0}
          width={drawW}
          height={drawH}
          scale={scale}
        />
      )}
    </Group>
  );
};

export default PañoFijoLayout;
