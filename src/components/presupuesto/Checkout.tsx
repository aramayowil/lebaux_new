import {
  Card as CardHeroUI,
  CardHeader,
  CardBody,
  Divider,
  Switch,
  NumberInput,
  Button,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import { useState, useMemo } from "react";
import GeneratorPdf from "@/components/presupuesto/GeneratorPdf";
import { Obra, ObraTipologia } from "@/types";
import { Calculator, LogIn, Receipt } from "lucide-react";

const formatCurrency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
});

interface CheckoutProps {
  obra: Obra;
  tipologias: ObraTipologia[];
}

export default function Checkout({ obra, tipologias }: CheckoutProps) {
  const IVA_PERCENT = 0.105;

  // ESTADOS LOCALES
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isCheckedDescuento, setIsCheckedDescuento] = useState(false);
  const [inputDescuento, setInputDescuento] = useState(0.1);
  const [isCheckedACuenta, setIsCheckedACuenta] = useState(false);
  const [inputACuenta, setInputACuenta] = useState(0);
  const [isCheckedIva, setIsCheckedIva] = useState(false);

  const handleOpenModal = () => setIsOpenModal(!isOpenModal);

  // CÁLCULOS (Memorizados para rendimiento)
  const totalCompra = useMemo(() => {
    // Aquí implementamos un cálculo dummy/provisional
    // ya que ObraTipologia no tiene precio actualmente almacenado.
    // Esto asume un costo base por área o un valor provisorio.
    return tipologias.reduce((acc, t) => {
      // Mock precio: $100,000 por metro cuadrado
      const areaM2 = ((t.ancho ?? 0) / 1000) * ((t.alto ?? 0) / 1000);
      const precioUnitario = areaM2 * 100000;
      return acc + precioUnitario * (t.cantidad ?? 0);
    }, 0);
  }, [tipologias]);

  const calcularDescuento = () =>
    isCheckedDescuento ? totalCompra * inputDescuento : 0;

  const calcularIva = () =>
    isCheckedIva ? (totalCompra - calcularDescuento()) * IVA_PERCENT : 0;

  const calcularImporteTotal = () =>
    totalCompra -
    calcularDescuento() +
    (isCheckedACuenta ? inputACuenta : 0) +
    calcularIva();

  return (
    <CardHeroUI
      className="w-full border-1 border-steel-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950/50 shadow-sm"
      radius="lg"
    >
      <CardHeader className="flex justify-between items-center px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Calculator className="text-[#db924b]" size={18} />
          <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-steel-500">
            Resumen de venta
          </h4>
        </div>
      </CardHeader>

      <CardBody className="px-6 pb-6 pt-2">
        <div className="flex flex-col gap-4">
          {/* Importe Final */}
          <div className="py-3 px-5 bg-steel-50 dark:bg-zinc-900/30 border border-steel-100 dark:border-zinc-800/40 rounded-2xl transition-all">
            <p className="text-[10px] uppercase tracking-widest font-bold text-steel-500 mb-1">
              Importe Total Final
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tighter text-steel-900 dark:text-white ">
                {formatCurrency.format(calcularImporteTotal())}
              </span>
            </div>
          </div>

          {/* Switch Descuento */}
          <div className="space-y-1">
            <Switch
              isSelected={isCheckedDescuento}
              onValueChange={setIsCheckedDescuento}
              color="warning"
              size="sm"
              classNames={{
                label: "text-xs font-bold text-steel-600 dark:text-zinc-400",
              }}
            >
              Aplicar Descuento
            </Switch>

            {isCheckedDescuento && (
              <NumberInput
                isWheelDisabled
                className="mt-2"
                size="sm"
                minValue={0}
                maxValue={1}
                step={0.05}
                value={inputDescuento}
                onValueChange={(v: number) =>
                  setInputDescuento(Number.isNaN(v) ? 0 : v)
                }
                formatOptions={{ style: "percent" }}
                variant="flat"
                classNames={{
                  inputWrapper:
                    "dark:bg-zinc-900/50 dark:border-zinc-800 bg-steel-100",
                }}
              />
            )}
          </div>

          <Accordion
            className="px-0"
            itemClasses={{
              title:
                "text-[11px] uppercase tracking-widest font-black text-steel-500",
              trigger: "py-2 px-0 hover:bg-transparent",
              content: "pb-4",
            }}
          >
            <AccordionItem
              key="1"
              aria-label="Cargos adicionales"
              title="Impuestos y Saldo"
              startContent={
                <Receipt className="text-steel-600 dark:text-zinc-600" />
              }
            >
              <div className="flex flex-col gap-3 pt-2">
                <div className="p-3 bg-steel-50 dark:bg-zinc-900/20 rounded-xl border border-steel-100 dark:border-zinc-800/30">
                  <Switch
                    isSelected={isCheckedACuenta}
                    onValueChange={setIsCheckedACuenta}
                    color="warning"
                    size="sm"
                    className="mb-2"
                    classNames={{
                      label:
                        "text-[11px] font-bold text-steel-600 dark:text-zinc-400",
                    }}
                  >
                    Saldo Pendiente / A Cuenta
                  </Switch>
                  {isCheckedACuenta && (
                    <NumberInput
                      size="sm"
                      value={inputACuenta}
                      onValueChange={(v: number) =>
                        setInputACuenta(Number.isNaN(v) ? 0 : v)
                      }
                      formatOptions={{ style: "currency", currency: "ARS" }}
                      variant="bordered"
                    />
                  )}
                </div>

                <Switch
                  isSelected={isCheckedIva}
                  onValueChange={setIsCheckedIva}
                  color="warning"
                  size="sm"
                  classNames={{
                    label:
                      "text-[11px] font-bold text-steel-600 dark:text-zinc-400",
                  }}
                >
                  Incluir IVA ({IVA_PERCENT * 100}%)
                </Switch>
              </div>
            </AccordionItem>
          </Accordion>

          <Divider className="bg-steel-200 dark:bg-zinc-800/50" />

          {/* Desglose */}
          <div className="space-y-2 px-1">
            <div className="flex justify-between text-xs">
              <span className="text-steel-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Subtotal Bruto
              </span>
              <span className="text-steel-800 dark:text-zinc-100 font-bold text-sm">
                {formatCurrency.format(totalCompra)}
              </span>
            </div>
            {isCheckedDescuento && (
              <div className="flex justify-between text-xs text-warning">
                <span className="font-bold uppercase tracking-wider">
                  Descuento aplic.
                </span>
                <span className="font-bold text-sm">
                  - {formatCurrency.format(calcularDescuento())}
                </span>
              </div>
            )}
            {isCheckedIva && (
              <div className="flex justify-between text-[11px] text-steel-500 dark:text-zinc-400">
                <span className="font-bold uppercase tracking-wider">
                  Impuesto IVA
                </span>
                <span className="font-black text-steel-800 dark:text-zinc-200">
                  {formatCurrency.format(calcularIva())}
                </span>
              </div>
            )}
          </div>

          <Button
            variant="bordered"
            size="lg"
            endContent={
              <LogIn
                size={18}
                className="text-[#db924b] group-hover:translate-x-1 transition-transform"
              />
            }
            className="mt-4 h-16 w-full bg-steel-50 dark:bg-zinc-900/40 border-1 border-steel-200 dark:border-zinc-700/50 hover:border-[#db924b]/60 text-steel-800 dark:text-zinc-200 font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl group relative overflow-hidden transition-all shadow-sm"
            onPress={handleOpenModal}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#db924b]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10">Finalizar Cotización</span>
          </Button>

          {isOpenModal && (
            <GeneratorPdf
              isOpen={isOpenModal}
              onOpenChange={handleOpenModal}
              obra={obra}
              tipologias={tipologias}
              compra={{
                total: totalCompra,
                descuento: calcularDescuento(),
                iva: calcularIva(),
                saldoPendiente: isCheckedACuenta ? inputACuenta : 0,
                importeFinal: calcularImporteTotal(),
              }}
            />
          )}
        </div>
      </CardBody>
    </CardHeroUI>
  );
}
