export interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
}

export const ContextMenu = ({ x, y, onClose, onAction }: ContextMenuProps) => {
  return (
    <>
      {/* Overlay transparente para cerrar el menú al hacer clic fuera */}
      <div
        className="fixed inset-0 z-999"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      <div
        style={{ top: y, left: x }}
        className="fixed z-1000 w-64 bg-white dark:bg-zinc-950 shadow-2xl rounded-xl border border-zinc-200 dark:border-zinc-800 py-1.5 text-sm animate-in fade-in zoom-in duration-100"
      >
        <div className="px-4 py-2 text-zinc-400 dark:text-zinc-500 font-bold text-[10px] uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-900 mb-1">
          Insertar Producto
        </div>

        {/* Item con Submenú */}
        <div className="relative group">
          <button className="w-full text-left px-4 py-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-[#db924b]/10 hover:text-[#db924b] dark:hover:bg-[#db924b]/20 flex justify-between items-center transition-colors font-medium">
            <span>Insertar Componentes</span>
            <span className="text-[10px] opacity-50">❯</span>
          </button>

          {/* Submenú adaptado */}
          <div className="hidden group-hover:block absolute left-[98%] top-0 ml-px w-48 bg-white dark:bg-zinc-950 shadow-2xl rounded-xl border border-zinc-200 dark:border-zinc-800 py-1.5 text-zinc-700 dark:text-zinc-300 animate-in slide-in-from-left-1 duration-150">
            {["Marco", "Hoja", "Travesaño", "Parante"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  onAction(item);
                  onClose();
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-[#db924b] transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            onAction("perfil");
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-[#db924b]/10 hover:text-[#db924b] dark:hover:bg-[#db924b]/20 transition-colors font-medium"
        >
          Insertar Perfil
        </button>

        <div className="my-1 border-t border-zinc-100 dark:border-zinc-900" />

        <button
          onClick={onClose}
          className="w-full text-left px-4 py-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </>
  );
};
