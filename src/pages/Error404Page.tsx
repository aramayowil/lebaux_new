import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none antialiased">
      {/* Iluminación ambiental de fondo para dar profundidad */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.02] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-zinc-800/[0.02] blur-[100px] rounded-full pointer-events-none" />

      <div className="text-center space-y-8 relative z-10 max-w-md">
        {/* Icono Principal Estilizado */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 shadow-inner">
          <Compass className="w-10 h-10 text-amber-500 stroke-[1.5] animate-[spin_4s_linear_infinite]" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>

        {/* Textos de Error */}
        <div className="space-y-3">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-500 tracking-tighter font-mono">
            404
          </h1>
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">
            Página no encontrada
          </h2>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
            La ruta a la que intentás acceder no existe o fue movida
            temporalmente dentro del panel.
          </p>
        </div>

        {/* Separador Estético Mínimo */}
        <div className="w-16 h-[2px] bg-zinc-800 mx-auto rounded-full" />

        {/* Acciones de Navegación */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="bordered"
            size="lg"
            startContent={<ArrowLeft className="w-4 h-4" />}
            onPress={() => navigate(-1)}
            className="w-full sm:w-auto h-12 text-xs font-bold uppercase tracking-wider text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/30 rounded-xl transition-all"
          >
            Volver Atrás
          </Button>

          <Button
            size="lg"
            startContent={<Home className="w-4 h-4" />}
            onPress={() => navigate("/inicio")}
            className="w-full sm:w-auto h-12 text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-black rounded-xl shadow-md shadow-amber-950/10 active:scale-[0.98] transition-all"
          >
            Ir al Inicio
          </Button>
        </div>
      </div>

      {/* Footer Técnico Discreto */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-zinc-600 tracking-widest uppercase">
        Lebaux Sistema v2.0
      </div>
    </div>
  );
}
