import { Group, Rect, Line } from "react-konva";
import type { ObraDetalle, ObraTipologia, Vidrio } from "@/types";
import { RenderCelda } from "../components/RenderCelda";
import { RenderCrucesCentrados } from "../components/RenderCrucesCentrados";
import { RenderCrucesVariables } from "../components/RenderCrucesVariables";
import WarningAlertDesign from "../components/WarningAlertDesign";

interface LayoutProps {
  drawW: number;
  drawH: number;
  scale: number;
  tipologia: ObraTipologia;
  detalles: ObraDetalle;
  cantHojas: number;
  colors: {
    aluminio: string;
    catalogVidrios: Vidrio[];
    contorno: string;
    lineasCotas: string;
    revestimiento?: string;
  };
}

export const ProjectanteLayout = ({
  drawW,
  drawH,
  scale,
  detalles,
  colors,
}: LayoutProps) => {
  const { aluminio, contorno, lineasCotas } = colors;

  // --- CONFIGURACIÓN DE PERFILES TÉCNICOS ESCALADOS ---
  const perfilDeMarco = (45 / 2) * scale;
  const hojaW = drawW - perfilDeMarco * 2;
  const hojaH = drawH - perfilDeMarco * 2;
  const perfilDeHoja = 35 * scale;
  const perfilCruce = 57.8 * scale;

  // ACCESORIOS (Botón Tirante)
  const botonTiranteW = 80 * scale;
  const botonTiranteH = 10 * scale;
  const colorManija = "#595959";

  const tieneTratamiento =
    detalles.color != null || (detalles as any).tratamiento != null;

  const RenderMarco = () => (
    <Group>
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

  const renderContenidoInternoHoja = (interiorW: number, interiorH: number) => {
    const cantH = Number(detalles.cant_centrados_horizontal ?? 0);
    const cantV = Number(detalles.cant_centrados_vertical ?? 0);
    const tipoCruce = Number(detalles.tipo_cruce ?? 0);

    if (tipoCruce === 1 && (cantH > 0 || cantV > 0)) {
      return (
        <RenderCrucesCentrados
          interiorW={interiorW}
          interiorH={interiorH}
          sizePerfilCruce={perfilCruce}
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
      const inicioXVidrioGlobal = perfilDeMarco + perfilDeHoja;
      const windowWFicticia = interiorW + inicioXVidrioGlobal * 2;
      return (
        <RenderCrucesVariables
          windowW={windowWFicticia}
          windowH={drawH}
          interiorHojaW={interiorW}
          interiorHojaH={interiorH}
          sizePerfilCruce={perfilCruce}
          scale={scale}
          colors={colors}
          detalles={detalles}
        />
      );
    }

    return (
      <RenderCelda
        filaId={1}
        ancho={interiorW}
        alto={interiorH}
        scale={scale}
        colors={colors}
        detalles={detalles}
      />
    );
  };

  return (
    <Group>
      <RenderMarco />
      <Group x={perfilDeMarco} y={perfilDeMarco}>
        {/* Perfiles de Hoja */}
        <Rect
          width={hojaW}
          height={hojaH}
          fill={aluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        <Group x={perfilDeHoja} y={perfilDeHoja}>
          {renderContenidoInternoHoja(
            hojaW - perfilDeHoja * 2,
            hojaH - perfilDeHoja * 2,
          )}
        </Group>

        {/* Líneas de apertura */}
        <Line
          points={[perfilDeHoja, perfilDeHoja, hojaW / 2, hojaH - perfilDeHoja]}
          stroke={lineasCotas}
          dash={[6, 6]}
          strokeWidth={0.6}
        />
        <Line
          points={[
            hojaW - perfilDeHoja,
            perfilDeHoja,
            hojaW / 2,
            hojaH - perfilDeHoja,
          ]}
          stroke={lineasCotas}
          dash={[6, 6]}
          strokeWidth={0.6}
        />

        {/* Botón tirante */}
        <Rect
          x={hojaW / 2 - botonTiranteW / 2}
          y={hojaH - perfilDeHoja - botonTiranteH}
          width={botonTiranteW}
          height={botonTiranteH}
          fill={colorManija}
        />
      </Group>

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

export default ProjectanteLayout;
