import { Switch, Input, Chip, Button } from "@heroui/react";
import { Palette, Layers, Grid2X2, LayoutGrid, Plus } from "lucide-react";
import { useTratamientos } from "@/hooks/catalogo/useTratamientos";
import { useVidrios } from "@/hooks/catalogo/useVidrios";
import { usePerfiles } from "@/hooks/catalogo/usePerfiles";
import { useInterioresByHoja } from "@/hooks/productos/useInteriores";
import { useContravidriosByInterior } from "@/hooks/productos/useContravidrios";
import { useContravidriosExtByInterior } from "@/hooks/productos/useContravidriosExt";
import { useVidrioRepartidosByInterior } from "@/hooks/productos/useVidRepartidos";
import { useTiposInteriores } from "@/hooks/catalogo/useTiposInteriores";
import type { ObraDetalle } from "@/types";
import { useTipologiaLogic, FILA_FIELDS } from "./logic/useTipologiaLogic";
import SectionHeader from "./ui/SectionHeader";
import RowSelect from "./ui/RowSelect";
import CruceModeSelector from "./ui/CruceModeSelector";
import CentradosCounter from "./ui/CentradosCounter";
import InteriorFilaEditor from "./sections/InteriorFilaEditor";
import TipologiaConfigPanelSkeleton from "./skeletons/TipologiaConfigPanelSkeleton";

interface Props {
  detalle: ObraDetalle | undefined;
  upsertDetalle: (fields: Partial<ObraDetalle>) => void;
}

export default function TipologiaConfigPanel({
  detalle,
  upsertDetalle,
}: Props) {
  const { state, actions } = useTipologiaLogic(detalle, upsertDetalle);

  const { data: tratamientos = [], isLoading: loadingTratamientos } =
    useTratamientos();
  const { data: vidrios = [], isLoading: loadingVidrios } = useVidrios();
  const { data: perfiles = [], isLoading: loadingPerfiles } = usePerfiles();
  const { data: tiposInterior = [] } = useTiposInteriores();

  const idHoja = detalle?.hoja;
  const idInterior = detalle?.interior;

  const { data: interiores = [] } = useInterioresByHoja(idHoja ?? undefined);
  const { data: contravidrios = [] } = useContravidriosByInterior(
    idInterior ?? undefined,
  );
  const { data: contravidriosExt = [] } = useContravidriosExtByInterior(
    idInterior ?? undefined,
  );
  const { data: vidriosRepartidos = [] } = useVidrioRepartidosByInterior(
    idInterior ?? undefined,
  );

  const vidrosCrudos = vidrios.filter((v) => {
    const t = tiposInterior.find((x) => x.id === v.tipo_rev);
    return !t || t.descripcion?.toLowerCase().includes("vidrio");
  });

  const tSel = tratamientos.find((t) => t.id === detalle?.color);
  const acabadoBadge = tSel?.descripcion ?? undefined;

  let cruceBadge = "Sin cruces";
  if (state.tipoCruce === 1)
    cruceBadge = `Centrados (${(detalle?.cant_centrados_horizontal ?? 0) + 1} f. de vidrio)`;
  if (state.tipoCruce === 2)
    cruceBadge = `Variables (${state.posH.length + 1} f. de vidrio)`;

  if (!detalle || loadingTratamientos || loadingVidrios || loadingPerfiles) {
    return <TipologiaConfigPanelSkeleton />;
  }

  const ancho = detalle.ancho ?? 0;
  const alto = detalle.alto ?? 0;

  console.log("detalles", detalle);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950 border-zinc-200/80 select-none">
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-500">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Componentes
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium font-mono">
              {ancho} × {alto} mm
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {/* ACABADO */}
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-700/40 overflow-hidden">
          <SectionHeader
            icon={Palette}
            label="Acabado y Terminación"
            isOpen={state.openSections.acabado}
            isComplete={!!detalle.color}
            badge={acabadoBadge}
            onClick={() => actions.toggleSection("acabado")}
          />
          {state.openSections.acabado && (
            <div className="px-3 pb-3 pt-2 space-y-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
              <RowSelect
                label="Tratamiento / Color"
                items={tratamientos}
                selectedKey={detalle.color}
                onKeyChange={(k) => actions.upd({ color: k })}
                placeholder="Seleccione un acabado..."
              />
            </div>
          )}
        </div>

        {/* ESTRUCTURA */}
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-700/40 overflow-hidden">
          <SectionHeader
            icon={Layers}
            label="Especificaciones Estructura"
            isOpen={state.openSections.estructura}
            isComplete={!!detalle.interior}
            onClick={() => actions.toggleSection("estructura")}
          />
          {state.openSections.estructura && (
            <div className="px-3 pb-3 pt-2 space-y-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
              <RowSelect
                label="Componente Interior / Acoplado"
                items={interiores}
                selectedKey={detalle.interior}
                onKeyChange={(k) =>
                  actions.upd({
                    interior: k,
                    contravidrios: null,
                    contravidrios_ext: null,
                  })
                }
                placeholder="Seleccione interior..."
              />

              {idInterior && (
                <>
                  {contravidrios.length > 0 && (
                    <RowSelect
                      label="Contravidrio Interior"
                      items={contravidrios}
                      selectedKey={detalle.contravidrios}
                      onKeyChange={(k) => actions.upd({ contravidrios: k })}
                      placeholder="Automático..."
                    />
                  )}
                  {contravidriosExt.length > 0 && (
                    <RowSelect
                      label="Contravidrio Exterior"
                      items={contravidriosExt}
                      selectedKey={detalle.contravidrios_ext}
                      onKeyChange={(k) => actions.upd({ contravidrios_ext: k })}
                      placeholder="Automático..."
                    />
                  )}
                </>
              )}

              <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800/60 space-y-2">
                {state.tipoCruce === 0 && (
                  <InteriorFilaEditor
                    label="Material de relleno"
                    modoRelleno={state.modoRelleno}
                    onModoChange={actions.cambiarModo}
                    interiorKey="interior_1"
                    dvh1Key="dvh_1_1"
                    dvh2Key="dvh_1_2"
                    camaraKey="camara_1"
                    revestKey="revest_1"
                    direccKey="direcc_1"
                    vrKey="vr_1"
                    horKey="hor_vr_1"
                    verKey="ver_vr_1"
                    activoVrKey="activo_vr_1"
                    detalle={detalle}
                    vidrios={vidrosCrudos}
                    perfiles={perfiles}
                    vidriosRepartidos={vidriosRepartidos}
                    upd={actions.upd}
                    onToggleVR={(activo) =>
                      actions.toggleVidrioRepartido(0, activo)
                    }
                  />
                )}

                {state.tipoCruce > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                        Material de relleno
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400">
                          {state.mismoRellenoPanel
                            ? "Igual para todas"
                            : "Por fila"}
                        </span>
                        <Switch
                          size="sm"
                          isSelected={state.mismoRellenoPanel}
                          onValueChange={actions.handleToggleRellenoPorPanel}
                          classNames={{
                            wrapper:
                              "bg-zinc-200 dark:bg-zinc-700 group-data-[selected=true]:bg-amber-500",
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                      <LayoutGrid className="w-3 h-3 text-zinc-400" />
                      <span>
                        {state.panosCount} Fila
                        {state.panosCount !== 1 ? "s" : " "}
                        {state.tipoCruce === 1
                          ? ` · ${(detalle.cant_centrados_vertical ?? 0) + 1} Módulos por fila`
                          : ` · ${state.posV.length + 1} Módulos por fila`}
                      </span>
                    </div>

                    {state.mismoRellenoPanel ? (
                      <InteriorFilaEditor
                        label="Todas las filas (Fila 1)"
                        modoRelleno={state.modoRelleno}
                        onModoChange={actions.cambiarModo}
                        interiorKey="interior_1"
                        dvh1Key="dvh_1_1"
                        dvh2Key="dvh_1_2"
                        camaraKey="camara_1"
                        revestKey="revest_1"
                        direccKey="direcc_1"
                        vrKey="vr_1"
                        horKey="hor_vr_1"
                        verKey="ver_vr_1"
                        activoVrKey="activo_vr_1"
                        detalle={detalle}
                        vidrios={vidrosCrudos}
                        perfiles={perfiles}
                        vidriosRepartidos={vidriosRepartidos}
                        upd={actions.upd}
                        onToggleVR={(activo) =>
                          actions.toggleVidrioRepartido(0, activo)
                        }
                      />
                    ) : (
                      <div className="space-y-2">
                        {Array.from({ length: state.panosCount }, (_, idx) => {
                          const f = FILA_FIELDS[idx];
                          return (
                            <InteriorFilaEditor
                              key={idx}
                              label={`Fila ${idx + 1}`}
                              modoRelleno={
                                state.modoRellenoByFila[idx] ?? "simple"
                              }
                              onModoChange={(modo) =>
                                actions.cambiarModoFila(idx, modo)
                              }
                              interiorKey={f.interior}
                              dvh1Key={f.dvh1}
                              dvh2Key={f.dvh2}
                              camaraKey={f.camara}
                              revestKey={f.revest}
                              direccKey={f.direcc}
                              vrKey={f.vr}
                              horKey={f.hor}
                              verKey={f.ver}
                              activoVrKey={f.activoVr}
                              detalle={detalle}
                              vidrios={vidrosCrudos}
                              perfiles={perfiles}
                              vidriosRepartidos={vidriosRepartidos}
                              upd={actions.upd}
                              onToggleVR={(activo) =>
                                actions.toggleVidrioRepartido(idx, activo)
                              }
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CRUCES */}
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-700/40 overflow-hidden">
          <SectionHeader
            icon={Grid2X2}
            label="Cruces y Divisiones"
            isOpen={state.openSections.cruces}
            isComplete={state.tipoCruce > 0}
            badge={cruceBadge}
            onClick={() => actions.toggleSection("cruces")}
          />
          {state.openSections.cruces && (
            <div className="px-3 pb-3 pt-2 space-y-3 border-t border-zinc-100 dark:border-zinc-800/60">
              <CruceModeSelector
                value={state.tipoCruce}
                onChange={actions.handleCruceMode}
              />

              {state.tipoCruce === 1 && (
                <div className="space-y-2 pt-1">
                  <CentradosCounter
                    label="Horizontales (Divisores)"
                    value={detalle.cant_centrados_horizontal ?? 0}
                    max={3}
                    onChange={(v) =>
                      actions.upd({ cant_centrados_horizontal: v })
                    }
                  />
                  <CentradosCounter
                    label="Verticales (Parantes)"
                    value={detalle.cant_centrados_vertical ?? 0}
                    max={5}
                    onChange={(v) =>
                      actions.upd({ cant_centrados_vertical: v })
                    }
                  />
                </div>
              )}

              {state.tipoCruce === 2 && (
                <div className="space-y-3 pt-1 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Divisiones Horizontales (Máx. 3)
                    </label>
                    <div className="flex gap-1.5">
                      <Input
                        size="sm"
                        type="number"
                        placeholder={`Ej: ${Math.round(alto / 2)} mm`}
                        value={state.inputH}
                        onValueChange={actions.setInputH}
                        className="flex-1"
                        classNames={{ input: "text-xs font-mono" }}
                      />
                      <Button
                        size="sm"
                        isIconOnly
                        color="warning"
                        variant="flat"
                        isDisabled={state.posH.length >= 3}
                        onPress={() => {
                          const num = parseInt(state.inputH);
                          actions.addCruceH(isNaN(num) ? undefined : num);
                          actions.setInputH("");
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {state.posH.length === 0 ? (
                        <span className="text-[10px] text-zinc-400 italic">
                          Ningún corte horizontal.
                        </span>
                      ) : (
                        state.posH.map((pos, idx) => (
                          <Chip
                            key={idx}
                            size="sm"
                            variant="flat"
                            color="warning"
                            className="font-mono text-[10px]"
                            onClose={() =>
                              actions.savePosH(
                                state.posH.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            H: {pos}mm
                          </Chip>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Divisiones Verticales (Máx. 5)
                    </label>
                    <div className="flex gap-1.5">
                      <Input
                        size="sm"
                        type="number"
                        placeholder={`Ej: ${Math.round(ancho / 2)} mm`}
                        value={state.inputV}
                        onValueChange={actions.setInputV}
                        className="flex-1"
                        classNames={{ input: "text-xs font-mono" }}
                      />
                      <Button
                        size="sm"
                        isIconOnly
                        color="warning"
                        variant="flat"
                        isDisabled={state.posV.length >= 5}
                        onPress={() => {
                          const num = parseInt(state.inputV);
                          actions.addCruceV(isNaN(num) ? undefined : num);
                          actions.setInputV("");
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {state.posV.length === 0 ? (
                        <span className="text-[10px] text-zinc-400 italic">
                          Ningún corte vertical.
                        </span>
                      ) : (
                        state.posV.map((pos, idx) => (
                          <Chip
                            key={idx}
                            size="sm"
                            variant="flat"
                            color="warning"
                            className="font-mono text-[10px]"
                            onClose={() =>
                              actions.savePosV(
                                state.posV.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            V: {pos}mm
                          </Chip>
                        ))
                      )}
                    </div>
                  </div>

                  {(state.posH.length > 0 || state.posV.length > 0) && (
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 rounded-lg px-2 py-1.5 border border-zinc-100 dark:border-zinc-800/40">
                      <LayoutGrid className="w-3 h-3 text-amber-500" />
                      <span className="font-mono">
                        Configuración estructural: {state.posH.length + 1} filas
                        de corte.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {state.tipoCruce === 0 && (
                <p className="text-[10px] text-zinc-400 italic text-center py-1">
                  Un solo paño entero sin divisiones transversales
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
