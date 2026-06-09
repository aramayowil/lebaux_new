import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Checkbox,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Chip,
} from "@heroui/react";

// --- Interfaces para Tipado ---
interface Corte {
  nro: string;
  cant: number;
  largo: number;
  desc: string;
  pesoLinea: number;
  precioLinea: number;
}

interface ResultadosCotizacion {
  costoAlu: number;
  costoVidrio: number;
  costoMateriales: number;
  precioVenta: number;
  pesoNeto: number;
  pesoFacturado: number;
  m2Vidrio: number;
  cortes: Corte[];
  costoPlusManoObra: number;
  metrosCorteTotales: number;
  cantidadCortesTotales: number;
}

// Base de datos con los pesos exactos provistos
const DB_PERFILES: Record<string, { peso: number; desc: string }> = {
  "6200": { peso: 1.266, desc: "Umbral y dintel marco" },
  "6201": { peso: 0.664, desc: "Jambas marco" },
  "6203": { peso: 0.651, desc: "Parante lateral hoja VS" },
  "6204": { peso: 0.721, desc: "Zócalo y cabezal de hoja VS" },
  "6205": { peso: 0.41, desc: "Premarco" },
  "6206": { peso: 0.181, desc: "Tapa premarco" },
  "6207": { peso: 0.613, desc: "Parante central hoja VS" },
  "6208": { peso: 0.813, desc: "Parante central c/tirador VS" },
  "6209": { peso: 1.266, desc: "Zócalo alto hoja VS" },
  "6239": { peso: 0.585, desc: "Travesaño de hoja" },
};

const CalculadoraPage: React.FC = () => {
  const [conTravesano, setConTravesano] = useState(false);
  const [dimensiones, setDimensiones] = useState({ ancho: 1200, alto: 2000 });
  const [factorGanancia, setFactorGanancia] = useState(2.16);
  const [porcentajeMOTravesano, setPorcentajeMOTravesano] = useState(135);
  const [precios, setPrecios] = useState({
    aluminioKg: 9075,
    vidrioM2: 8200,
    accesoriosBase: 22550,
  });
  const [editadoManualmente, setEditadoManualmente] = useState(false);

  useEffect(() => {
    if (!editadoManualmente) {
      const { ancho: A, alto: H } = dimensiones;
      let sugerido = 22550;
      if (A >= 1800 || H >= 2000) sugerido = 29050;
      else if (A === 1500 && H === 1500) sugerido = 25650;
      setPrecios((prev) => ({ ...prev, accesoriosBase: sugerido }));
    }
  }, [dimensiones, editadoManualmente]);

  // --- Lógica de Cálculo Unificada ---
  const resultados = useMemo((): ResultadosCotizacion => {
    const { ancho: A, alto: H } = dimensiones;

    // Estructura de cortes crudos base
    const cortesBase = [
      { nro: "6201", cant: 2, largo: H, desc: "Jambas marco" },
      { nro: "6200", cant: 2, largo: A - 42, desc: "Umbral y dintel marco" },
      { nro: "6203", cant: 2, largo: H - 79, desc: "Parante lateral de hoja" },
      {
        nro: "6204",
        cant: 4,
        largo: A / 2 - 24,
        desc: "Zócalo y cabezal de hoja",
      },
      { nro: "6207", cant: 2, largo: H - 79, desc: "Parante central" },
    ];

    if (conTravesano) {
      const largoT = A / 2 - 74;
      cortesBase.push({
        nro: "6239",
        cant: 2,
        largo: largoT,
        desc: "Travesaño de hoja",
      });
    }

    let totalMileniosCorte = 0;
    let cantidadCortesTotales = 0;
    let pesoNeto = 0;

    // Mapeamos los cortes para calcular métricas individuales por línea (incluyendo desperdicio de barra comercial 1.0065 y factor de ganancia)
    const listaCortes: Corte[] = cortesBase.map((c) => {
      totalMileniosCorte += c.cant * c.largo;
      cantidadCortesTotales += c.cant;

      const pesoLineaNeto = c.cant * (c.largo / 1000) * DB_PERFILES[c.nro].peso; // peso base sin desperdicio para la fila
      const pesoLineaFacturado =
        c.cant * (c.largo / 1000) * DB_PERFILES[c.nro].peso * 1.0065;
      pesoNeto += pesoLineaNeto;

      // El precio de costo de la línea de aluminio afectada por el factor de ganancia para dar precio de venta
      const precioLineaVenta =
        pesoLineaFacturado * precios.aluminioKg * factorGanancia;

      return {
        ...c,
        pesoLinea: pesoLineaFacturado,
        precioLinea: precioLineaVenta,
      };
    });

    // Cálculos globales
    const metrosCorteTotales = totalMileniosCorte / 1000;
    const pesoFacturado = pesoNeto * 1.0065;
    const costoAlu = pesoFacturado * precios.aluminioKg;

    // Lógica para el plus de mano de obra del travesaño si está activo
    let montoExtraTravesano = 0;
    if (conTravesano) {
      const corteT = listaCortes.find((c) => c.nro === "6239");
      if (corteT) {
        // Descontamos el precio del aluminio base del travesaño ya que se sumó en listaCortes, y aplicamos el porcentaje de mano de obra configurado
        const pesoT =
          2 * ((A / 2 - 74) / 1000) * DB_PERFILES["6239"].peso * 1.0065;
        montoExtraTravesano =
          pesoT * precios.aluminioKg * (porcentajeMOTravesano / 100);
      }
    }

    // Descuentos de Vidrio
    const cantPaños = conTravesano ? 4 : 2;
    const anchoVidrio = A / 2 - 71;
    const altoVidrio = conTravesano ? (H - 166 - 40) / 2 : H - 166;

    const m2Vidrio = ((anchoVidrio * altoVidrio) / 1000000) * cantPaños;
    const costoVidrio = m2Vidrio * precios.vidrioM2 * 1.03;

    const costoMateriales =
      costoAlu + costoVidrio + precios.accesoriosBase + montoExtraTravesano;
    const precioVenta = costoMateriales * factorGanancia;

    return {
      costoAlu,
      costoVidrio,
      costoMateriales,
      precioVenta,
      pesoNeto,
      pesoFacturado,
      m2Vidrio,
      cortes: listaCortes,
      costoPlusManoObra: montoExtraTravesano * factorGanancia,
      metrosCorteTotales,
      cantidadCortesTotales,
    };
  }, [
    dimensiones,
    conTravesano,
    precios,
    factorGanancia,
    porcentajeMOTravesano,
  ]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b-2 border-divider pb-6">
        <div>
          <h1 className="text-3xl font-bold text-default-900">
            Módena Business
          </h1>
          <p className="text-default-400">
            Sistema de Cotización v3.7 — Detalle de Costos
          </p>
        </div>
        <Chip
          variant="shadow"
          color="primary"
          size="lg"
          className="px-4 font-bold"
        >
          Línea Corrediza VS
        </Chip>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar - Controles */}
        <aside className="lg:col-span-4 space-y-6">
          <Card shadow="sm">
            <CardHeader className="flex gap-3">
              <div className="flex flex-col text-left">
                <p className="text-md font-bold">📐 Medidas y Estructura</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <Input
                type="number"
                label="Ancho Vano"
                labelPlacement="outside"
                endContent="mm"
                value={dimensiones.ancho.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDimensiones({ ...dimensiones, ancho: +e.target.value })
                }
              />
              <Input
                type="number"
                label="Alto Vano"
                labelPlacement="outside"
                endContent="mm"
                value={dimensiones.alto.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDimensiones({ ...dimensiones, alto: +e.target.value })
                }
              />
              <div className="pt-2">
                <Checkbox
                  isSelected={conTravesano}
                  onValueChange={setConTravesano}
                >
                  Incluir Travesaño (6239)
                </Checkbox>
              </div>
              {conTravesano && (
                <Input
                  type="number"
                  label="M.O. Adicional"
                  labelPlacement="outside"
                  endContent="%"
                  value={porcentajeMOTravesano.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPorcentajeMOTravesano(+e.target.value)
                  }
                />
              )}
              <Input
                type="number"
                label="Ganancia (Factor)"
                labelPlacement="outside"
                step="0.01"
                value={factorGanancia.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFactorGanancia(+e.target.value)
                }
              />
            </CardBody>
          </Card>

          <Card shadow="sm" className="bg-warning-50/20 border-warning-100">
            <CardHeader className="flex justify-between">
              <p className="text-md font-bold text-warning-700">💵 Insumos</p>
              {editadoManualmente && (
                <Button
                  size="sm"
                  variant="light"
                  color="warning"
                  onPress={() => setEditadoManualmente(false)}
                >
                  🔄 Auto
                </Button>
              )}
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                type="number"
                label="Aluminio $/Kg"
                size="sm"
                value={precios.aluminioKg.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPrecios({ ...precios, aluminioKg: +e.target.value })
                }
              />
              <Input
                type="number"
                label="Vidrio $/m²"
                size="sm"
                value={precios.vidrioM2.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPrecios({ ...precios, vidrioM2: +e.target.value })
                }
              />
              <Input
                type="number"
                label="Accesorios $"
                size="sm"
                color={editadoManualmente ? "warning" : "default"}
                value={precios.accesoriosBase.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEditadoManualmente(true);
                  setPrecios({
                    ...precios,
                    accesoriosBase: +e.target.value,
                  });
                }}
                description={
                  editadoManualmente
                    ? "Valor manual"
                    : "Calculado automáticamente"
                }
              />
            </CardBody>
          </Card>
        </aside>

        {/* Main Content - Resultados */}
        <main className="lg:col-span-8 space-y-6">
          <Card
            className="bg-primary text-primary-foreground p-4 md:p-8"
            shadow="lg"
          >
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest opacity-80">
                Precio de venta sugerido
              </p>
              <h2 className="text-6xl md:text-7xl font-bold">
                $
                {resultados.precioVenta.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </h2>
              <div className="flex justify-around pt-6 border-t border-primary-foreground/20 mt-6">
                <div>
                  <p className="text-xs opacity-70">Costo Materiales</p>
                  <p className="text-xl font-semibold">
                    $
                    {resultados.costoMateriales.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Utilidad Bruta</p>
                  <p className="text-xl font-semibold text-success-300">
                    $
                    {(
                      resultados.precioVenta - resultados.costoMateriales
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tarjetas Informativas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card shadow="sm">
              <CardBody className="text-center justify-center p-3">
                <p className="text-xs text-default-500 uppercase font-semibold">
                  Peso Aluminio
                </p>
                <p className="text-lg font-bold text-default-800">
                  {resultados.pesoFacturado.toFixed(2)} kg
                </p>
                <p className="text-[10px] text-default-400">Inc. Desperdicio</p>
              </CardBody>
            </Card>
            <Card shadow="sm">
              <CardBody className="text-center justify-center p-3">
                <p className="text-xs text-default-500 uppercase font-semibold">
                  Metros de Corte
                </p>
                <p className="text-lg font-bold text-primary font-mono">
                  {resultados.metrosCorteTotales.toFixed(2)} m
                </p>
                <p className="text-[10px] text-default-400">
                  {resultados.cantidadCortesTotales} cortes
                </p>
              </CardBody>
            </Card>
            <Card shadow="sm">
              <CardBody className="text-center justify-center p-3">
                <p className="text-xs text-default-500 uppercase font-semibold">
                  Superficie Vidrio
                </p>
                <p className="text-lg font-bold text-default-800">
                  {resultados.m2Vidrio.toFixed(2)} m²
                </p>
                <p className="text-[10px] text-default-400">
                  {conTravesano ? "4 paños" : "2 paños"}
                </p>
              </CardBody>
            </Card>
            <Card shadow="sm">
              <CardBody className="text-center justify-center p-3">
                <p className="text-xs text-default-500 uppercase font-semibold">
                  Plus M.O. Trav.
                </p>
                <p className="text-lg font-bold text-default-800">
                  $
                  {resultados.costoPlusManoObra.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-[10px] text-default-400">
                  Mano de Obra extra
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Tabla de Cortes con Peso y Precio Incorporado */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">📋 Hoja de Corte Técnica</h3>
              <Chip size="sm" variant="flat" color="primary">
                Modena VS
              </Chip>
            </div>
            <Table aria-label="Tabla de cortes detallada" shadow="sm">
              <TableHeader>
                <TableColumn>PERFIL</TableColumn>
                <TableColumn>DESCRIPCIÓN</TableColumn>
                <TableColumn align="center">CANT</TableColumn>
                <TableColumn align="center">MEDIDA (MM)</TableColumn>
                <TableColumn align="right">PESO (KG)</TableColumn>
                <TableColumn align="right">PRECIO VENTA</TableColumn>
              </TableHeader>
              <TableBody>
                {resultados.cortes.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-bold">{c.nro}</TableCell>
                    <TableCell className="text-xs text-default-600">
                      {c.desc}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {c.cant}
                    </TableCell>
                    <TableCell className="text-center">
                      <Chip
                        radius="sm"
                        color="success"
                        variant="flat"
                        className="font-mono font-bold"
                      >
                        {c.largo.toFixed(0)}
                      </Chip>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {c.pesoLinea.toFixed(2)} kg
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm text-default-800">
                      $
                      {c.precioLinea.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CalculadoraPage;
