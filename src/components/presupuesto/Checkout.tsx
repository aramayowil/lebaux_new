import useAberturasStore from "@/stores/useAberturasStore";
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
  Chip,
} from "@heroui/react";
import { useState, useEffect, useMemo } from "react";
import { HiReceiptTax, HiOutlineCalculator } from "react-icons/hi";
import GeneratorPdf from "@/components/ui/modals/GeneratorPdf";
import useAberturasCompuestasStore from "@/stores/useAberturasCompustasStore";
import { HiArrowRightOnRectangle, HiPencilSquare } from "react-icons/hi2";
import { useConfigObraStore } from "@/stores/useConfigObraStore";
import { usePresupuestosDB } from "@/hooks/usePresupuestosDB";

const formatCurrency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
});

export default function CardResumen() {
  const IVA_PERCENT = 0.105;

  // STORES
  const aberturasStore = useAberturasStore((state) => state.aberturas);
  const aberturaCompuestaStore = useAberturasCompuestasStore(
    (state) => state.aberturasComps,
  );
  const { esEdicion, idObraActual } = useConfigObraStore();
  const { presupuestos } = usePresupuestosDB(); // Obtenemos la lista cargada del hook

  // ESTADOS LOCALES
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isCheckedDescuento, setIsCheckedDescuento] = useState(false);
  const [inputDescuento, setInputDescuento] = useState(0.1);
  const [isCheckedACuenta, setIsCheckedACuenta] = useState(false);
  const [inputACuenta, setInputACuenta] = useState(0);
  const [isCheckedIva, setIsCheckedIva] = useState(false);

  // LÓGICA DE HIDRATACIÓN PARA EDICIÓN
  useEffect(() => {
    if (esEdicion && idObraActual && presupuestos.length > 0) {
      // Buscamos la obra en la lista que ya cargó el hook usePresupuestosDB
      const obraAEditar = presupuestos.find((p) => p.id === idObraActual);

      if (obraAEditar) {
        // 1. Restaurar Descuento
        if (obraAEditar.detalleCompra.descuento > 0) {
          setIsCheckedDescuento(true);
          // Calculamos el porcentaje original (regla de 3 simple)
          const porcentajeOriginal =
            obraAEditar.detalleCompra.descuento /
            obraAEditar.detalleCompra.total;
          setInputDescuento(porcentajeOriginal);
        }

        // 2. Restaurar Saldo / A Cuenta
        if (obraAEditar.detalleCompra.saldoPendiente > 0) {
          setIsCheckedACuenta(true);
          setInputACuenta(obraAEditar.detalleCompra.saldoPendiente);
        }

        // 3. Restaurar IVA
        if (obraAEditar.detalleCompra.iva > 0) {
          setIsCheckedIva(true);
        }
      }
    }
  }, [esEdicion, idObraActual, presupuestos]);

  const handleOpenModal = () => setIsOpenModal(!isOpenModal);

  // CÁLCULOS (Memorizados para rendimiento)
  const totalCompra = useMemo(() => {
    const simples = aberturasStore.reduce((acc, a) => acc + a.precioFinal, 0);
    const compuestas = aberturaCompuestaStore.reduce(
      (acc, a) =>
        acc +
        (a.precio_compuesta + a.precioColocacion_compuesta) *
          a.cantidad_compuesta,
      0,
    );
    return simples + compuestas;
  }, [aberturasStore, aberturaCompuestaStore]);

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
      className="w-full border-1 border-zinc-400/50 bg-zinc-950/50 backdrop-blur-md shadow-none"
      radius="lg"
    >
      <CardHeader className="flex justify-between items-center px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <HiOutlineCalculator className="text-warning" size={18} />
          <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500">
            Resumen de venta
          </h4>
        </div>

        {esEdicion && (
          <Chip
            startContent={<HiPencilSquare size={14} />}
            variant="flat"
            color="warning"
            size="sm"
            className="border border-warning/20 font-bold"
          >
            EDITANDO {idObraActual}
          </Chip>
        )}
      </CardHeader>

      <CardBody className="px-6 pb-6 pt-2">
        <div className="flex flex-col gap-4">
          {/* Importe Final */}
          <div className="py-3 px-5 bg-zinc-900/30 border border-zinc-800/40 rounded-2xl transition-all">
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">
              Importe Total Final
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tighter text-white ">
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
              classNames={{ label: "text-xs font-bold text-zinc-400" }}
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
                onValueChange={(v) =>
                  setInputDescuento(Number.isNaN(v) ? 0 : v)
                }
                formatOptions={{ style: "percent" }}
                variant="flat"
                classNames={{ inputWrapper: "bg-zinc-900/50 border-zinc-800" }}
              />
            )}
          </div>

          <Accordion
            className="px-0"
            itemClasses={{
              title:
                "text-[11px] uppercase tracking-widest font-black text-zinc-500",
              trigger: "py-2 px-0 hover:bg-transparent",
              content: "pb-4",
            }}
          >
            <AccordionItem
              key="1"
              aria-label="Cargos adicionales"
              title="Impuestos y Saldo"
              startContent={<HiReceiptTax className="text-zinc-600" />}
            >
              <div className="flex flex-col gap-3 pt-2">
                <div className="p-3 bg-zinc-900/20 rounded-xl border border-zinc-800/30">
                  <Switch
                    isSelected={isCheckedACuenta}
                    onValueChange={setIsCheckedACuenta}
                    color="warning"
                    size="sm"
                    className="mb-2"
                    classNames={{
                      label: "text-[11px] font-bold text-zinc-400",
                    }}
                  >
                    Saldo Pendiente / A Cuenta
                  </Switch>
                  {isCheckedACuenta && (
                    <NumberInput
                      size="sm"
                      value={inputACuenta}
                      onValueChange={(v) =>
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
                  classNames={{ label: "text-[11px] font-bold text-zinc-400" }}
                >
                  Incluir IVA ({IVA_PERCENT * 100}%)
                </Switch>
              </div>
            </AccordionItem>
          </Accordion>

          <Divider className="bg-zinc-800/50" />

          {/* Desglose */}
          <div className="space-y-2 px-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 font-bold uppercase tracking-wider">
                Subtotal Bruto
              </span>
              <span className="text-zinc-100 font-bold text-sm">
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
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span className="font-bold uppercase tracking-wider">
                  Impuesto IVA
                </span>
                <span className="font-black">
                  {formatCurrency.format(calcularIva())}
                </span>
              </div>
            )}
          </div>

          <Button
            variant="bordered"
            size="lg"
            endContent={
              <HiArrowRightOnRectangle
                size={18}
                className="text-warning group-hover:translate-x-1 transition-transform"
              />
            }
            className="mt-4 h-16 w-full bg-zinc-900/40 border-1 border-zinc-700/50 hover:border-warning/60 text-zinc-200 font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl group relative overflow-hidden transition-all"
            onPress={handleOpenModal}
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-warning/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10">
              {esEdicion ? "Actualizar Cotización" : "Finalizar Cotización"}
            </span>
          </Button>

          {isOpenModal && (
            <GeneratorPdf
              isOpen={isOpenModal}
              onOpenChange={handleOpenModal}
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

// import useAberturasStore from '@/stores/useAberturasStore'
// import {
//   Card as CardHeroUI,
//   CardHeader,
//   CardBody,
//   Divider,
//   Switch,
//   NumberInput,
//   Button,
//   Accordion,
//   AccordionItem,
// } from '@heroui/react'
// import { useState } from 'react'
// import { HiReceiptTax, HiOutlineCalculator } from 'react-icons/hi'
// import GeneratorPdf from '@/components/ui/modals/GeneratorPdf'
// import useAberturasCompuestasStore from '@/stores/useAberturasCompustasStore'
// import { HiArrowRightOnRectangle } from 'react-icons/hi2'

// const formatCurrency = new Intl.NumberFormat('es-AR', {
//   style: 'currency',
//   currency: 'ARS',
//   minimumFractionDigits: 0,
// })

// export default function Card() {
//   const IVA = 0.105
//   const aberturasStore = useAberturasStore((state) => state.aberturas)
//   const aberturaCompuestaStore = useAberturasCompuestasStore(
//     (state) => state.aberturasComps,
//   )

//   const [isOpenModal, setIsOpenModal] = useState(false)
//   const [IsCheckedDescuento, setIsCheckedDescuento] = useState(false)
//   const [inputDescuento, setInputDescuento] = useState(0.1)
//   const [IsCheckedACuenta, setIsCheckedACuenta] = useState(false)
//   const [inputACuenta, setInputACuenta] = useState(0)
//   const [isCheckedIva, setIsCheckedIva] = useState(false)

//   const handleOpenModal = () => setIsOpenModal(!isOpenModal)

//   const totalCompra =
//     aberturasStore.reduce((acc, a) => acc + a.precioFinal, 0) +
//     aberturaCompuestaStore.reduce(
//       (acc, a) =>
//         acc +
//         (a.precio_compuesta + a.precioColocacion_compuesta) *
//           a.cantidad_compuesta,
//       0,
//     )

//   const calcularDescuento = () =>
//     IsCheckedDescuento ? totalCompra * inputDescuento : 0
//   const calcularIva = () =>
//     isCheckedIva ? (totalCompra - calcularDescuento()) * IVA : 0
//   const calcularImporteTotal = () =>
//     totalCompra -
//     calcularDescuento() +
//     (IsCheckedACuenta ? inputACuenta : 0) +
//     calcularIva()

//   return (
//     <CardHeroUI
//       className='w-full border-1 border-zinc-400/50 bg-zinc-950/50 backdrop-blur-md shadow-none'
//       radius='lg'
//     >
//       <CardHeader className='flex flex-col items-start px-4 pt-4 pb-2 gap-1'>
//         <div className='flex items-center gap-2'>
//           <HiOutlineCalculator className='text-warning' size={18} />
//           <h4 className='text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500'>
//             Resumen de venta
//           </h4>
//         </div>
//       </CardHeader>

//       <CardBody className='px-6 pb-6 pt-2'>
//         <div className='flex flex-col gap-4'>
//           {/* Sección Total Principal */}
//           <div className='py-3 px-5 bg-zinc-900/30 border border-zinc-800/40 rounded-2xl'>
//             <p className='text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1'>
//               Importe Total Final
//             </p>
//             <div className='flex items-baseline gap-1'>
//               <span className='text-3xl font-black tracking-tighter text-white '>
//                 {formatCurrency.format(calcularImporteTotal())}
//               </span>
//             </div>
//           </div>

//           {/* Controles de Ajuste */}
//           <div className='space-y-1'>
//             <Switch
//               isSelected={IsCheckedDescuento}
//               onValueChange={setIsCheckedDescuento}
//               color='warning'
//               size='sm'
//               classNames={{
//                 label: 'text-xs font-bold text-zinc-400',
//               }}
//             >
//               Aplicar Descuento
//             </Switch>

//             {IsCheckedDescuento && (
//               <NumberInput
//                 isWheelDisabled
//                 className='mt-2'
//                 size='sm'
//                 minValue={0}
//                 value={inputDescuento}
//                 onValueChange={(v) =>
//                   setInputDescuento(Number.isNaN(v) ? 0 : v)
//                 }
//                 formatOptions={{ style: 'percent' }}
//                 variant='flat'
//                 classNames={{ inputWrapper: 'bg-zinc-900/50 border-zinc-800' }}
//               />
//             )}
//           </div>

//           <Accordion
//             className='px-0'
//             itemClasses={{
//               title:
//                 'text-[11px] uppercase tracking-widest font-black text-zinc-500',
//               trigger: 'py-2 px-0 hover:bg-transparent',
//               content: 'pb-4',
//             }}
//           >
//             <AccordionItem
//               key='1'
//               aria-label='Cargos adicionales'
//               title='Ajustes de Impuestos y Saldo'
//               startContent={<HiReceiptTax className='text-zinc-600' />}
//             >
//               <div className='flex flex-col gap-3 pt-2'>
//                 <div className='p-3 bg-zinc-900/20 rounded-xl border border-zinc-800/30'>
//                   <Switch
//                     isSelected={IsCheckedACuenta}
//                     onValueChange={setIsCheckedACuenta}
//                     color='warning'
//                     size='sm'
//                     className='mb-2'
//                     classNames={{
//                       label: 'text-[11px] font-bold text-zinc-400',
//                     }}
//                   >
//                     Saldo Pendiente
//                   </Switch>
//                   {IsCheckedACuenta && (
//                     <NumberInput
//                       size='sm'
//                       value={inputACuenta}
//                       onValueChange={(v) =>
//                         setInputACuenta(Number.isNaN(v) ? 0 : v)
//                       }
//                       formatOptions={{ style: 'currency', currency: 'ARS' }}
//                       variant='bordered'
//                     />
//                   )}
//                 </div>

//                 <Switch
//                   isSelected={isCheckedIva}
//                   onValueChange={setIsCheckedIva}
//                   color='warning'
//                   size='sm'
//                   classNames={{ label: 'text-[11px] font-bold text-zinc-400' }}
//                 >
//                   Incluir IVA ({IVA * 100}%)
//                 </Switch>
//               </div>
//             </AccordionItem>
//           </Accordion>

//           <Divider className='bg-zinc-800/50' />

//           {/* Desglose de Precios */}
//           <div className='space-y-2 px-1'>
//             <div className='flex justify-between text-xs'>
//               <span className='text-zinc-400 font-bold uppercase tracking-wider'>
//                 Subtotal Bruto
//               </span>
//               <span className='text-zinc-100 font-bold text-sm'>
//                 {formatCurrency.format(totalCompra)}
//               </span>
//             </div>
//             {IsCheckedDescuento && (
//               <div className='flex justify-between text-xs text-warning'>
//                 <span className='font-bold uppercase tracking-wider'>
//                   Descuento aplic.
//                 </span>
//                 <span className='font-bold text-sm'>
//                   - {formatCurrency.format(calcularDescuento())}
//                 </span>
//               </div>
//             )}
//             {isCheckedIva && (
//               <div className='flex justify-between text-[11px] text-zinc-400'>
//                 <span className='font-bold uppercase tracking-wider'>
//                   Impuesto IVA
//                 </span>
//                 <span className='font-black'>
//                   {formatCurrency.format(calcularIva())}
//                 </span>
//               </div>
//             )}
//           </div>

//           <Button
//             variant='bordered'
//             size='lg'
//             endContent={
//               <HiArrowRightOnRectangle
//                 size={18}
//                 className='text-warning group-hover:translate-x-1 transition-transform duration-300'
//               />
//             }
//             className='mt-4 h-16 w-full  bg-zinc-900/40 border-1 border-zinc-700/50 hover:border-warning/60  text-zinc-200font-sans font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.2)]active:scale-[0.97] transition-all duration-500 group relative overflow-hidden'
//             onPress={handleOpenModal}
//           >
//             {/* Efecto de brillo sutil de fondo al pasar el mouse */}
//             <div className='absolute inset-0 bg-linear-to-r from-transparent via-warning/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000' />

//             <span className='relative z-10'>Finalizar Cotización</span>
//           </Button>

//           {isOpenModal && (
//             <GeneratorPdf
//               isOpen={isOpenModal}
//               onOpenChange={handleOpenModal}
//               compra={{
//                 total: totalCompra,
//                 descuento: calcularDescuento(),
//                 iva: calcularIva(),
//                 saldoPendiente: IsCheckedACuenta ? inputACuenta : 0,
//                 importeFinal: calcularImporteTotal(),
//               }}
//             />
//           )}
//         </div>
//       </CardBody>
//     </CardHeroUI>
//   )
// }
