import { Group, Rect, Arrow } from "react-konva";
import type { ObraTipologia, ObraDetalle, Vidrio, Perfil } from "@/types";
import { RenderCelda } from "../components/RenderCelda";
import { RenderCrucesCentrados } from "../components/RenderCrucesCentrados";
import { RenderCrucesVariables } from "../components/RenderCrucesVariables";

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
    perfiles: Perfil[];
  };
}

export const CorredizaLayout = ({
  drawW,
  drawH,
  scale,
  detalles,
  cantHojas,
  colors,
}: LayoutProps) => {
  const { aluminio, contorno, lineasCotas } = colors;

  // --- CONFIGURACIÓN DE PERFILES TÉCNICOS ESCALADOS (Líneas Módena / A30) ---
  const jambaMarco = (36 - 6) * scale;
  const umbralYdintelMarco = 49.1 * scale;
  const paranteHoja = 53.5 * scale;
  const zocaloYcabezalHoja = 52.4 * scale;
  const perfilDeCruce = 55 * scale;

  // El espacio interno libre que deja el marco perimetral exterior
  const marcoHojaW = drawW - jambaMarco * 2;
  const marcoHojaH = drawH - umbralYdintelMarco * 2;

  // Accesorios / Cierres laterales
  const cierreLateralW = 20 * scale;
  const cierreLateralH = 80 * scale;
  const colorCierreLateral = "#595959";

  const cantHojasEfectiva = cantHojas && cantHojas > 0 ? cantHojas : 2;

  // --- RENDER DEL MARCO PRINCIPAL EXTERIOR ---
  const RenderMarcoPrincipal = () => (
    <Group>
      {/* Jamba izquierda */}
      <Rect
        width={jambaMarco}
        height={drawH}
        fill={aluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Jamba Derecha */}
      <Rect
        x={drawW - jambaMarco}
        width={jambaMarco}
        height={drawH}
        fill={aluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Dintel (Superior) */}
      <Rect
        x={jambaMarco}
        y={0}
        width={marcoHojaW}
        height={umbralYdintelMarco}
        fill={aluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Umbral (Inferior) */}
      <Rect
        x={jambaMarco}
        y={drawH - umbralYdintelMarco}
        width={marcoHojaW}
        height={umbralYdintelMarco}
        fill={aluminio}
        stroke={contorno}
        strokeWidth={1}
      />
    </Group>
  );

  // --- ORQUESTADOR MODULAR DEL CONTENIDO INTERNO DE LA HOJA ---
  const renderContenidoInternoHoja = (
    xPos: number,
    interiorW: number,
    interiorH: number,
  ) => {
    const cantH = Number(detalles.cant_centrados_horizontal ?? 0);
    const cantV = Number(detalles.cant_centrados_vertical ?? 0);
    const tipoCruce = Number(detalles.tipo_cruce ?? 0);

    // CASO 1: Cruces Centrados
    if (tipoCruce === 1 && (cantH > 0 || cantV > 0)) {
      return (
        <RenderCrucesCentrados
          interiorW={interiorW}
          interiorH={interiorH}
          sizePerfilCruce={perfilDeCruce}
          scale={scale}
          colors={colors}
          detalles={detalles}
        />
      );
    }

    // Comprobamos si existen cruces variables cargados en la base de datos
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

    // CASO 2: Cruces Variables (Calculados según cota real en milímetros)
    if (tipoCruce === 2 && tieneCrucesVariables) {
      const inicioXVidrioGlobal = jambaMarco + xPos + paranteHoja;

      // Forzamos una ventana ficticia ideal para que la matriz del cruce variable encaje al milímetro
      const windowWFicticia = interiorW + inicioXVidrioGlobal * 2;

      return (
        <RenderCrucesVariables
          windowW={windowWFicticia}
          windowH={drawH}
          interiorHojaW={interiorW}
          interiorHojaH={interiorH}
          sizePerfilCruce={perfilDeCruce}
          scale={scale}
          colors={colors}
          detalles={detalles}
        />
      );
    }

    // CASO POR DEFECTO: Sin cruces (Renderiza cristal entero mapeando su respectivo panelId)
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

  // --- RENDER DE CADA HOJA INDIVIDUAL ---
  const RenderHojaIndividual = ({
    index,
    hojaW,
    hojaH,
    direction,
  }: {
    index: number;
    hojaW: number;
    hojaH: number;
    direction: "left" | "right" | "center";
  }) => {
    // Posición X calculada según tu matricería de solapes de taller
    const xPos = index * (hojaW - paranteHoja);

    const interiorVidrioW = hojaW - paranteHoja * 2;
    const interiorVidrioH = hojaH - zocaloYcabezalHoja * 2;

    const centerY = interiorVidrioH / 2;

    const xStart = interiorVidrioW * 0.3;
    const xEnd = interiorVidrioW * 0.7;

    return (
      <Group x={xPos}>
        {/* CABEZAL DE HOJA (Superior) */}
        <Rect
          x={paranteHoja}
          width={interiorVidrioW}
          height={zocaloYcabezalHoja}
          fill={aluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        {/* PARANTE LATERAL IZQUIERDO */}
        <Rect
          width={paranteHoja}
          height={hojaH}
          fill={aluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        {/* PARANTE LATERAL DERECHO */}
        <Rect
          x={hojaW - paranteHoja}
          width={paranteHoja}
          height={hojaH}
          fill={aluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        {/* ZÓCALO DE HOJA (Inferior) */}
        <Rect
          x={paranteHoja}
          y={hojaH - zocaloYcabezalHoja}
          width={interiorVidrioW}
          height={zocaloYcabezalHoja}
          fill={aluminio}
          stroke={contorno}
          strokeWidth={1}
        />

        {/* ÁREA INTERNA COMPARTIDA Y DE INTERACCIÓN */}
        <Group x={paranteHoja} y={zocaloYcabezalHoja}>
          {renderContenidoInternoHoja(xPos, interiorVidrioW, interiorVidrioH)}

          {/* FLECHAS TÉCNICAS DE APERTURA CORREDIZA */}
          <Arrow
            points={
              direction === "right"
                ? [xEnd, centerY, xStart, centerY]
                : [xStart, centerY, xEnd, centerY]
            }
            pointerAtBeginning={direction === "center"}
            fill={lineasCotas}
            stroke={lineasCotas}
            strokeWidth={1.5}
            pointerLength={8}
            pointerWidth={6}
            opacity={0.6}
          />
        </Group>

        {/* CIERRES LATERALES / PICAPORTES SEGÚN ORIENTACIÓN */}
        {direction === "left" && (
          <Rect
            x={paranteHoja - cierreLateralW}
            y={hojaH / 2 - cierreLateralH / 2}
            width={cierreLateralW}
            height={cierreLateralH}
            fill={colorCierreLateral}
            stroke={colorCierreLateral}
            strokeWidth={1}
          />
        )}
        {direction === "right" && (
          <Rect
            x={hojaW - paranteHoja}
            y={hojaH / 2 - cierreLateralH / 2}
            width={cierreLateralW}
            height={cierreLateralH}
            fill={colorCierreLateral}
            stroke={colorCierreLateral}
            strokeWidth={1}
          />
        )}
      </Group>
    );
  };

  // --- MATRICERÍA INDUSTRIAL PARA CONTROL DE HOJAS MULTIPLES ---
  const renderPorCasos = (hojas: number, width: number, height: number) => {
    const hojaW = (width + (hojas - 1) * paranteHoja) / hojas;
    const hojaWpara4 = width / 2;
    const widthHoja4 = (hojaWpara4 + paranteHoja) / 2;

    const hojasWpara3 = width / 2;
    const widthHoja3 = (hojasWpara3 + 2 * paranteHoja) / 3;

    switch (hojas) {
      case 2:
        return (
          <>
            <RenderHojaIndividual
              key={0}
              index={0}
              hojaW={hojaW}
              hojaH={height}
              direction="left"
            />
            <RenderHojaIndividual
              key={1}
              index={1}
              hojaW={hojaW}
              hojaH={height}
              direction="right"
            />
          </>
        );
      case 3:
        return (
          <>
            <RenderHojaIndividual
              key={0}
              index={0}
              hojaW={hojaW}
              hojaH={height}
              direction="left"
            />
            <RenderHojaIndividual
              key={1}
              index={1}
              hojaW={hojaW}
              hojaH={height}
              direction="center"
            />
            <RenderHojaIndividual
              key={2}
              index={2}
              hojaW={hojaW}
              hojaH={height}
              direction="right"
            />
          </>
        );
      case 4:
        return (
          <>
            <Group>
              <RenderHojaIndividual
                key={0}
                index={0}
                hojaW={widthHoja4}
                hojaH={height}
                direction="left"
              />
              <RenderHojaIndividual
                key={1}
                index={1}
                hojaW={widthHoja4}
                hojaH={height}
                direction="right"
              />
            </Group>
            <Group x={width / 2}>
              <RenderHojaIndividual
                key={2}
                index={0}
                hojaW={widthHoja4}
                hojaH={height}
                direction="left"
              />
              <RenderHojaIndividual
                key={3}
                index={1}
                hojaW={widthHoja4}
                hojaH={height}
                direction="right"
              />
            </Group>
          </>
        );
      case 6:
        return (
          <>
            <Group>
              <RenderHojaIndividual
                key={0}
                index={0}
                hojaW={widthHoja3}
                hojaH={height}
                direction="left"
              />
              <RenderHojaIndividual
                key={1}
                index={1}
                hojaW={widthHoja3}
                hojaH={height}
                direction="center"
              />
              <RenderHojaIndividual
                key={2}
                index={2}
                hojaW={widthHoja3}
                hojaH={height}
                direction="right"
              />
            </Group>
            <Group x={width / 2}>
              <RenderHojaIndividual
                key={3}
                index={0}
                hojaW={widthHoja3}
                hojaH={height}
                direction="left"
              />
              <RenderHojaIndividual
                key={4}
                index={1}
                hojaW={widthHoja3}
                hojaH={height}
                direction="center"
              />
              <RenderHojaIndividual
                key={5}
                index={2}
                hojaW={widthHoja3}
                hojaH={height}
                direction="right"
              />
            </Group>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Group>
      <RenderMarcoPrincipal />
      <Group x={jambaMarco} y={umbralYdintelMarco}>
        {renderPorCasos(cantHojasEfectiva, marcoHojaW, marcoHojaH)}
      </Group>
    </Group>
  );
};

export default CorredizaLayout;
