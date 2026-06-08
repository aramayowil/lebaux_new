import { Group, Rect, Arrow } from "react-konva";
import type { ObraTipologia, ObraDetalle, Vidrio } from "@/types";
import { RenderFoco } from "../components/FocoRender";
import RenderCruces from "../components/RenderCruces";
import { RenderContravidrio } from "../components/RenderProfundidad";

interface LayoutProps {
  drawW: number;
  drawH: number;
  scale: number;
  tipologia: ObraTipologia;
  config: ObraDetalle;
  hojas: number;
  isFocused: boolean;
  focusedHoja: number;
  colors: {
    colorDeAluminio: string;
    catalogoVidrio: Vidrio[];
    contorno: string;
    lineasCotas: string;
  };
  onContextMenu?: (e: any, index: number) => void;
  posH?: number[];
  posV?: number[];
  espesoPerfil?: number;
}

export const CorredizaLayout = ({
  drawW,
  drawH,
  scale,
  config,
  hojas,
  isFocused,
  focusedHoja,
  colors,
  onContextMenu,
}: LayoutProps) => {
  const { colorDeAluminio, contorno, lineasCotas, catalogoVidrio } = colors;

  // --- CONFIGURACIÓN DE PERFILES TÉCNICOS ESCALADOS (Líneas Módena / A30) ---
  const jambaMarco = 30 * scale; // Ancho de la jamba lateral del marco
  const umbralYdintelMarco = 45 * scale; // Altura del dintel superior e inferior
  const paranteHoja = 52 * scale; // Ancho del parante lateral de hoja (gancho/cruce)
  const zocaloYcabezalHoja = 50 * scale; // Altura de cabezal superior y zócalo inferior
  const perfilDeCruce = 55 * scale; // Espesor de travesaños de cruce divisor
  const contravidrioThick = 15 * scale; // Espesor visual del contravidrio interno

  // Hueco interior neto libre que deja el marco perimetral
  const marcoHojaW = drawW - jambaMarco * 2;
  const marcoHojaH = drawH - umbralYdintelMarco * 2;

  // Cierres laterales (Picaportes / Tiradores embutidos de taller)
  const cierreLateralW = 12 * scale;
  const cierreLateralH = 75 * scale;
  const colorCierreLateral = "#374151"; // Gris oscuro texturado para herrajes

  // 🌟 Fallback anti-explosiones: Si no viene cantidad de hojas de la DB, asumimos 2 paños
  const cantidadHojasEfectiva = hojas && hojas > 0 ? hojas : 2;

  // ── 🌟 RESOLUTOR DINÁMICO DE COLOR DE VIDRIO POR HOJA INDEXADA ──
  const rgbNumToHex = (n: number): string => {
    const r = n & 0xff;
    const g = (n >> 8) & 0xff;
    const b = (n >> 16) & 0xff;
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const obtenerColorVidrio = (index: number): string => {
    // Mapeo estricto de columnas físicas indexadas de tu DB para paños dinámicos
    const columnasRelleno: Record<number, string | null | undefined> = {
      0: config.interior_1,
      1: config.interior_2,
      2: config.interior_3,
      3: config.interior_4,
    };

    // Estrategia de cascada: Relleno indexado -> Relleno general unificado -> Fallback oscuro de seguridad
    const idVidrioDb = columnasRelleno[index] ?? config.interior;

    if (!idVidrioDb) return "#1b1a1aff"; // Color por defecto si el paño está vacío en Supabase

    const vidrioEncontrado = catalogVidrios.find(
      (v) => String(v.id) === String(idVidrioDb),
    );

    if (vidrioEncontrado && typeof vidrioEncontrado.color === "number") {
      return rgbNumToHex(vidrioEncontrado.color);
    }

    return "#1b1a1aff";
  };

  const RenderMarcoPrincipal = () => (
    <Group>
      {/* Jamba Izquierda */}
      <Rect
        width={jambaMarco}
        height={drawH}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Jamba Derecha */}
      <Rect
        x={drawW - jambaMarco}
        width={jambaMarco}
        height={drawH}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Dintel Superior */}
      <Rect
        x={jambaMarco}
        y={0}
        width={marcoHojaW}
        height={umbralYdintelMarco}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
      {/* Umbral Inferior */}
      <Rect
        x={jambaMarco}
        y={drawH - umbralYdintelMarco}
        width={marcoHojaW}
        height={umbralYdintelMarco}
        fill={colorDeAluminio}
        stroke={contorno}
        strokeWidth={1}
      />
    </Group>
  );

  const RenderHojaIndividual = ({
    id,
    xPos,
    hojaW,
    hojaH,
    direction,
  }: {
    id: number;
    xPos: number;
    hojaW: number;
    hojaH: number;
    direction: "left" | "right" | "center";
  }) => {
    // 🌟 Resolvemos el color específico e independiente de este paño antes de pintar
    const colorVidrioEspecifico = obtenerColorVidrio(id);

    return (
      <Group x={xPos}>
        {/* Perfil Cabezal Superior */}
        <Rect
          x={paranteHoja}
          width={hojaW - paranteHoja * 2}
          height={zocaloYcabezalHoja}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        {/* Perfil Parante Izquierdo */}
        <Rect
          width={paranteHoja}
          height={hojaH}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        {/* Perfil Parante Derecho */}
        <Rect
          x={hojaW - paranteHoja}
          width={paranteHoja}
          height={hojaH}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />
        {/* Perfil Zócalo Inferior */}
        <Rect
          x={paranteHoja}
          y={hojaH - zocaloYcabezalHoja}
          width={hojaW - paranteHoja * 2}
          height={zocaloYcabezalHoja}
          fill={colorDeAluminio}
          stroke={contorno}
          strokeWidth={1}
        />

        {/* Vidrio, Contravidrios y Cruces Interiores de la Estructura */}
        <Group x={paranteHoja} y={zocaloYcabezalHoja}>
          {RenderInteriorHoja(
            hojaW - paranteHoja * 2,
            hojaH - zocaloYcabezalHoja * 2,
            id,
            direction,
            colorVidrioEspecifico,
          )}
        </Group>

        {/* Herrajes / Cierres Centrales Embutidos según sentido de apertura */}
        {direction === "left" && (
          <Rect
            x={paranteHoja - cierreLateralW - 4 * scale}
            y={hojaH / 2 - cierreLateralH / 2}
            width={cierreLateralW}
            height={cierreLateralH}
            fill={colorCierreLateral}
            rx={2 * scale}
          />
        )}
        {direction === "right" && (
          <Rect
            x={hojaW - paranteHoja + 4 * scale}
            y={hojaH / 2 - cierreLateralH / 2}
            width={cierreLateralW}
            height={cierreLateralH}
            fill={colorCierreLateral}
            rx={2 * scale}
          />
        )}
      </Group>
    );
  };

  const RenderInteriorHoja = (
    interiorW: number,
    interiorH: number,
    index: number,
    direction: "left" | "right" | "center",
    colorVidrio: string,
  ) => {
    const estaEnFoco = isFocused && focusedHoja === index;
    const centerY = interiorH / 2;
    const xStart = interiorW * 0.25;
    const xEnd = interiorW * 0.75;

    return (
      <Group onContextMenu={(e) => onContextMenu?.(e, index)}>
        {/* 🌟 Rectángulo base pintado con el color único resuelto para este paño */}
        <Rect
          width={interiorW}
          height={interiorH}
          fill={colorVidrio}
          stroke={contorno}
          strokeWidth={1}
        />

        {estaEnFoco && <RenderFoco width={interiorW} height={interiorH} />}

        {/* <RenderContravidrio
          hojaW={interiorW}
          hojaH={interiorH}
          contravidrioThick={contravidrioThick}
          colors={colors}
        /> */}

        {/* <RenderCruces
          width={interiorW}
          height={interiorH}
          config={config}
          espesoPerfilCruce={perfilDeCruce}
          contravidrioThick={contravidrioThick}
          colors={colors}
        /> */}

        {/* Flecha indicadora de corrimiento técnico */}
        {direction !== "center" && (
          <Arrow
            points={
              direction === "right"
                ? [xEnd, centerY, xStart, centerY]
                : [xStart, centerY, xEnd, centerY]
            }
            fill={lineasCotas}
            stroke={lineasCotas}
            strokeWidth={1.2}
            pointerLength={6 * scale < 6 ? 6 : 6 * scale}
            pointerWidth={5 * scale < 5 ? 5 : 5 * scale}
            opacity={0.5}
          />
        )}
      </Group>
    );
  };

  // ── 🛠️ MATRICERÍA Y FÓRMULAS DE SOLAPE REAL DE TALLER DE ALUMINIO ──
  const calcularHojasYRenderizar = () => {
    const h = cantidadHojasEfectiva;

    if (h === 2) {
      // Fórmula de taller de 2 hojas: (Ancho Neto + 1 Cruce de Parante) / 2
      const hojaW = (marcoHojaW + paranteHoja) / 2;
      return (
        <>
          <RenderHojaIndividual
            id={0}
            xPos={0}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="left"
          />
          <RenderHojaIndividual
            id={1}
            xPos={marcoHojaW - hojaW}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="right"
          />
        </>
      );
    }

    if (h === 3) {
      // Fórmula de taller de 3 hojas (Triple guía o cruces sucesivos): (Ancho Neto + 2 Cruces) / 3
      const hojaW = (marcoHojaW + paranteHoja * 2) / 3;
      return (
        <>
          <RenderHojaIndividual
            id={0}
            xPos={0}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="left"
          />
          <RenderHojaIndividual
            id={1}
            xPos={hojaW - paranteHoja}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="center"
          />
          <RenderHojaIndividual
            id={2}
            xPos={marcoHojaW - hojaW}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="right"
          />
        </>
      );
    }

    if (h === 4) {
      // Fórmula de taller de 4 hojas (Cierre central): Dos sistemas independientes acoplados en el medio.
      const mitadW = marcoHojaW / 2;
      const hojaW = (mitadW + paranteHoja) / 2;
      return (
        <>
          {/* Par Izquierdo */}
          <RenderHojaIndividual
            id={0}
            xPos={0}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="left"
          />
          <RenderHojaIndividual
            id={1}
            xPos={mitadW - hojaW + paranteHoja / 2}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="right"
          />
          {/* Par Derecho */}
          <RenderHojaIndividual
            id={2}
            xPos={mitadW - paranteHoja / 2}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="left"
          />
          <RenderHojaIndividual
            id={3}
            xPos={marcoHojaW - hojaW}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="right"
          />
        </>
      );
    }

    if (h === 6) {
      // Fórmula de taller de 6 hojas (Encuentro central triple guía):
      const mitadW = marcoHojaW / 2;
      const hojaW = (mitadW + paranteHoja * 2) / 3;
      return (
        <>
          {/* Bloque Corredizo Izquierdo */}
          <RenderHojaIndividual
            id={0}
            xPos={0}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="left"
          />
          <RenderHojaIndividual
            id={1}
            xPos={hojaW - paranteHoja}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="center"
          />
          <RenderHojaIndividual
            id={2}
            xPos={mitadW - hojaW + paranteHoja / 2}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="right"
          />
          {/* Bloque Corredizo Derecho */}
          <RenderHojaIndividual
            id={3}
            xPos={mitadW - paranteHoja / 2}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="left"
          />
          <RenderHojaIndividual
            id={4}
            xPos={mitadW + hojaW - paranteHoja * 1.5}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="center"
          />
          <RenderHojaIndividual
            id={5}
            xPos={marcoHojaW - hojaW}
            hojaW={hojaW}
            hojaH={marcoHojaH}
            direction="right"
          />
        </>
      );
    }

    return null;
  };

  return (
    <Group>
      <RenderMarcoPrincipal />
      <Group x={jambaMarco} y={umbralYdintelMarco}>
        {calcularHojasYRenderizar()}
      </Group>
    </Group>
  );
};

export default CorredizaLayout;
