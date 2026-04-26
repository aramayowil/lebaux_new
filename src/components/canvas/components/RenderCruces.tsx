import { TipologiaConfig } from "@/store/obrasStore";
import { Group, Line, Rect } from "react-konva";

interface RenderCrucesProps {
  width: number;
  height: number;
  config: TipologiaConfig;
  espesoPerfilCruce: number; // Ahora este es el ancho total
  contravidrioThick: number;
  colors: {
    colorDeAluminio: string;
    vidrio: string;
    contorno: string;
    lineasCotas: string;
  };
}

const RenderCruces = ({
  width,
  height,
  config,
  espesoPerfilCruce,
  contravidrioThick,
  colors,
}: RenderCrucesProps) => {
  const tipoDeCruce = config.tipoCruce;
  if (tipoDeCruce === 0) return null;

  // 1. OBTENCIÓN DE POSICIONES
  let posV: number[] = [];
  let posH: number[] = [];

  if (tipoDeCruce === 1) {
    const cantV = Number(config?.crucesV) || 0;
    const cantH = Number(config?.crucesH) || 0;
    posV = Array.from({ length: cantV }).map(
      (_, i) => (width / (cantV + 1)) * (i + 1),
    );
    posH = Array.from({ length: cantH }).map(
      (_, i) => (height / (cantH + 1)) * (i + 1),
    );
  } else {
    posV = Array.isArray(config.posV) ? config.posV : [];
    posH = (Array.isArray(config.posH) ? config.posH : []).map(
      (p) => height - p,
    );
  }

  const sortedH = [...posH].sort((a, b) => a - b);
  const tramosH = [0, ...sortedH, height];

  return (
    <Group>
      {/* 1. RENDERIZADO HORIZONTAL (PASANTE/CONTINUO) */}
      {posH.map((hY, i) => (
        <Group key={`h-pasante-${i}`}>
          {/* Bisel Superior Pasante */}
          <Line
            points={[
              0,
              hY - espesoPerfilCruce / 2,
              contravidrioThick,
              hY - espesoPerfilCruce / 2 - contravidrioThick,
              width - contravidrioThick,
              hY - espesoPerfilCruce / 2 - contravidrioThick,
              width,
              hY - espesoPerfilCruce / 2,
            ]}
            closed={true}
            fill={colors.colorDeAluminio}
            stroke={colors.contorno}
            strokeWidth={1}
          />

          {/* Cuerpo Central Horizontal */}
          <Rect
            x={0}
            y={hY - espesoPerfilCruce / 2}
            width={width}
            height={espesoPerfilCruce}
            fill={colors.colorDeAluminio}
            stroke={colors.contorno}
            strokeWidth={1}
          />

          {/* Bisel Inferior Pasante */}
          <Line
            points={[
              0,
              hY + espesoPerfilCruce / 2,
              contravidrioThick,
              hY + espesoPerfilCruce / 2 + contravidrioThick,
              width - contravidrioThick,
              hY + espesoPerfilCruce / 2 + contravidrioThick,
              width,
              hY + espesoPerfilCruce / 2,
            ]}
            closed={true}
            fill={colors.colorDeAluminio}
            stroke={colors.contorno}
            strokeWidth={1}
          />
        </Group>
      ))}

      {/* 2. RENDERIZADO VERTICAL (SEGMENTADO) */}
      {posV.map((vX, vIdx) => (
        <Group key={`v-columna-${vIdx}`}>
          {tramosH.map((_, tIdx) => {
            if (tIdx === tramosH.length - 1) return null;

            const startY = tramosH[tIdx];
            const endY = tramosH[tIdx + 1];

            // Determinamos el inicio y fin real para que corte en el perfil horizontal
            const yActual = startY === 0 ? 0 : startY + espesoPerfilCruce / 2;
            const yFinal =
              endY === height ? height : endY - espesoPerfilCruce / 2;
            const hActual = yFinal - yActual;

            if (hActual <= 0) return null;

            return (
              <Group key={`v-seg-${vIdx}-${tIdx}`}>
                {/* Bisel Izquierdo Segmentado */}
                <Line
                  points={[
                    vX - espesoPerfilCruce / 2,
                    yActual,
                    vX - espesoPerfilCruce / 2 - contravidrioThick,
                    yActual +
                      (startY === 0 ? contravidrioThick : contravidrioThick),
                    vX - espesoPerfilCruce / 2 - contravidrioThick,
                    yFinal -
                      (endY === height ? contravidrioThick : contravidrioThick),
                    vX - espesoPerfilCruce / 2,
                    yFinal,
                  ]}
                  closed={true}
                  fill={colors.colorDeAluminio}
                  stroke={colors.contorno}
                  strokeWidth={1}
                />

                {/* Rectángulo Central Vertical */}
                <Rect
                  x={vX - espesoPerfilCruce / 2}
                  y={yActual}
                  width={espesoPerfilCruce}
                  height={hActual}
                  fill={colors.colorDeAluminio}
                  stroke={colors.contorno}
                  strokeWidth={0.5}
                />

                {/* Bisel Derecho Segmentado */}
                <Line
                  points={[
                    vX + espesoPerfilCruce / 2,
                    yActual,
                    vX + espesoPerfilCruce / 2 + contravidrioThick,
                    yActual +
                      (startY === 0 ? contravidrioThick : contravidrioThick),
                    vX + espesoPerfilCruce / 2 + contravidrioThick,
                    yFinal -
                      (endY === height ? contravidrioThick : contravidrioThick),
                    vX + espesoPerfilCruce / 2,
                    yFinal,
                  ]}
                  closed={true}
                  fill={colors.colorDeAluminio}
                  stroke={colors.contorno}
                  strokeWidth={1}
                />
              </Group>
            );
          })}
        </Group>
      ))}
    </Group>
  );
};

export default RenderCruces;
