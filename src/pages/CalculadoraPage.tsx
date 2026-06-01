import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Checkbox,
  Button,
  ButtonGroup,
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
}

interface ResultadosCotizacion {
  costoAlu: number;
  costoVidrio: number;
  costoMateriales: number;
  precioVenta: number;
  pesoFacturado: number;
  m2Vidrio: number;
  cortes: Corte[];
  costoPlusManoObra: number;
}

const DB_PERFILES: Record<string, { peso: number; desc: string }> = {
  "6204": { peso: 0.721, desc: "Zócalo y cabezal hoja VS" },
  "6249": { peso: 0.689, desc: "Zócalo y cabezal hoja DVH" },
  "6239": { peso: 0.585, desc: "Travesaño de hoja" },
  "7713": { peso: 1.31, desc: "Umbral y dintel marco" },
  "7714": { peso: 0.724, desc: "Jamba de marco" },
  "7715": { peso: 0.678, desc: "Parante lateral hoja VS" },
  "7716": { peso: 0.71, desc: "Parante central hoja VS" },
  "7723": { peso: 0.643, desc: "Parante lateral hoja DVH" },
  "7724": { peso: 0.675, desc: "Parante central hoja DVH" },
};

const CalculadoraPage: React.FC = () => {
  const [esDVH, setEsDVH] = useState(false);
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

  // --- Lógica de Cálculo Unificada con Fórmulas de Taller ---
  const resultados = useMemo((): ResultadosCotizacion => {
    const { ancho: A, alto: H } = dimensiones;
    const pHojaLat = esDVH ? "7723" : "7715";
    const pHojaCent = esDVH ? "7724" : "7716";
    const pZocalo = esDVH ? "6249" : "6204";

    // Se aplica el descuento de A/2 - 24 para Zócalo/Cabezal
    const listaCortes: Corte[] = [
      { nro: "7714", cant: 2, largo: H, desc: "Jambas marco" },
      { nro: "7713", cant: 2, largo: A - 42, desc: "Umbral/Dintel" },
      { nro: pHojaLat, cant: 2, largo: H - 79, desc: "P. Lateral" },
      { nro: pHojaCent, cant: 2, largo: H - 79, desc: "P. Central" },
      { nro: pZocalo, cant: 4, largo: A / 2 - 24, desc: "Zócalo/Cabezal" },
    ];

    let montoExtraTravesano = 0;
    if (conTravesano) {
      const largoT = A / 2 - 74;
      const pesoT = 2 * (largoT / 1000) * DB_PERFILES["6239"].peso * 1.0065;
      montoExtraTravesano =
        pesoT * precios.aluminioKg * (porcentajeMOTravesano / 100);
      listaCortes.push({
        nro: "6239",
        cant: 2,
        largo: largoT,
        desc: "Travesaño de hoja",
      });
    }

    const pesoNeto = listaCortes.reduce(
      (acc, c) => acc + c.cant * (c.largo / 1000) * DB_PERFILES[c.nro].peso,
      0,
    );
    const pesoFacturado = pesoNeto * 1.0065;
    const costoAlu = pesoFacturado * precios.aluminioKg;

    // Cantidad de paños totales de vidrio
    const cantPaños = conTravesano ? 4 : 2;

    // Descuentos de Vidrio basados en tus especificaciones de armado
    const anchoVidrio = A / 2 - 71;
    const altoVidrio = conTravesano ? (H - 166 - 40) / 2 : H - 166;

    // Cálculo final de superficie (mm a m²)
    const m2Vidrio = ((anchoVidrio * altoVidrio) / 1000000) * cantPaños;
    const costoVidrio = m2Vidrio * precios.vidrioM2 * 1.03; // Incluye 3% de desperdicio operativo

    const costoMateriales =
      costoAlu + costoVidrio + precios.accesoriosBase + montoExtraTravesano;
    const precioVenta = costoMateriales * factorGanancia;

    return {
      costoAlu,
      costoVidrio,
      costoMateriales,
      precioVenta,
      pesoFacturado,
      m2Vidrio,
      cortes: listaCortes,
      costoPlusManoObra: montoExtraTravesano * factorGanancia,
    };
  }, [
    dimensiones,
    esDVH,
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
          <p className="text-default-400">Sistema de Cotización v3.5</p>
        </div>
        <ButtonGroup variant="flat" color="primary">
          <Button
            onPress={() => setEsDVH(false)}
            variant={!esDVH ? "solid" : "flat"}
          >
            Vidrio Simple
          </Button>
          <Button
            onPress={() => setEsDVH(true)}
            variant={esDVH ? "solid" : "flat"}
          >
            DVH
          </Button>
        </ButtonGroup>
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
                  setPrecios({ ...precios, accesoriosBase: +e.target.value });
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card shadow="sm">
              <CardBody className="text-center">
                <p className="text-xs text-default-500 uppercase">
                  Peso Aluminio
                </p>
                <p className="text-lg font-bold">
                  {resultados.pesoFacturado.toFixed(2)} kg
                </p>
              </CardBody>
            </Card>
            <Card shadow="sm">
              <CardBody className="text-center">
                <p className="text-xs text-default-500 uppercase">
                  Superficie Vidrio
                </p>
                <p className="text-lg font-bold">
                  {resultados.m2Vidrio.toFixed(2)} m²
                </p>
              </CardBody>
            </Card>
            <Card shadow="sm">
              <CardBody className="text-center">
                <p className="text-xs text-default-500 uppercase">
                  Plus M.O. Travesaño
                </p>
                <p className="text-lg font-bold">
                  $
                  {resultados.costoPlusManoObra.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">📋 Hoja de Corte Técnica</h3>
              <Chip size="sm" variant="flat" color="primary">
                Modena
              </Chip>
            </div>
            <Table aria-label="Tabla de cortes" shadow="sm">
              <TableHeader>
                <TableColumn>PERFIL</TableColumn>
                <TableColumn>DESCRIPCIÓN</TableColumn>
                <TableColumn align="center">CANT</TableColumn>
                <TableColumn align="center">MEDIDA (MM)</TableColumn>
              </TableHeader>
              <TableBody>
                {resultados.cortes.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-bold">{c.nro}</TableCell>
                    <TableCell>{c.desc}</TableCell>
                    <TableCell className="text-center">{c.cant}</TableCell>
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
