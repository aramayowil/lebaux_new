import { ObraDetalle } from "@/types";
import { Group, Line, Rect } from "react-konva";

// 🌟 Extendemos la interfaz localmente para este componente gráfico
interface ObraDetalleCanvas extends ObraDetalle {
  pos_h?: number[];
  pos_v?: number[];
}

interface RenderCrucesProps {
  width: number;
  height: number;
  config: ObraDetalleCanvas;
  espesoPerfilCruce: number;
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
  const tipoDeCruce = config.tipo_cruce ?? 0;
  if (tipoDeCruce === 0) return null;

  let posV: number[] = [];
  let posH: number[] = [];

  if (tipoDeCruce === 1) {
    const cantV =
      Number(config?.cant_centrados_vertical ?? (config as any)?.cruces_v) || 0;
    const cantH =
      Number(config?.cant_centrados_horizontal ?? (config as any)?.cruces_h) ||
      0;

    posV = Array.from({ length: cantV }).map(
      (_, i) => (width / (cantV + 1)) * (i + 1),
    );
    posH = Array.from({ length: cantH }).map(
      (_, i) => (height / (cantH + 1)) * (i + 1),
    );
  } else {
    posV = Array.isArray(config.pos_v) ? config.pos_v : [];
    posH = (Array.isArray(config.pos_h) ? config.pos_h : []).map(
      (p) => height - p,
    );
  }

  const sortedH = [...posH].sort((a, b) => a - b);
  const tramosH = [0, ...sortedH, height];

  return (
    <Group>
      {/* 1. RENDERIZADO HORIZONTAL */}
      {posH.map((hY, i) => (
        <Group key={`h-pasante-${i}`}>
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
          <Rect
            x={0}
            y={hY - espesoPerfilCruce / 2}
            width={width}
            height={espesoPerfilCruce}
            fill={colors.colorDeAluminio}
            stroke={colors.contorno}
            strokeWidth={1}
          />
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

      {/* 2. RENDERIZADO VERTICAL */}
      {posV.map((vX, vIdx) => (
        <Group key={`v-columna-${vIdx}`}>
          {tramosH.map((_, tIdx) => {
            if (tIdx === tramosH.length - 1) return null;

            const startY = tramosH[tIdx];
            const endY = tramosH[tIdx + 1];

            const yActual = startY === 0 ? 0 : startY + espesoPerfilCruce / 2;
            const yFinal =
              endY === height ? height : endY - espesoPerfilCruce / 2;
            const hActual = yFinal - yActual;

            if (hActual <= 0) return null;

            return (
              <Group key={`v-seg-${vIdx}-${tIdx}`}>
                <Line
                  points={[
                    vX - espesoPerfilCruce / 2,
                    yActual,
                    vX - espesoPerfilCruce / 2 - contravidrioThick,
                    yActual + contravidrioThick,
                    vX - espesoPerfilCruce / 2 - contravidrioThick,
                    yFinal - contravidrioThick,
                    vX - espesoPerfilCruce / 2,
                    yFinal,
                  ]}
                  closed={true}
                  fill={colors.colorDeAluminio}
                  stroke={colors.contorno}
                  strokeWidth={1}
                />
                <Rect
                  x={vX - espesoPerfilCruce / 2}
                  y={yActual}
                  width={espesoPerfilCruce}
                  height={hActual}
                  fill={colors.colorDeAluminio}
                  stroke={colors.contorno}
                  strokeWidth={0.5}
                />
                <Line
                  points={[
                    vX + espesoPerfilCruce / 2,
                    yActual,
                    vX + espesoPerfilCruce / 2 + contravidrioThick,
                    yActual + contravidrioThick,
                    vX + espesoPerfilCruce / 2 + contravidrioThick,
                    yFinal - contravidrioThick,
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
