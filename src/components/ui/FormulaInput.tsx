import { useState } from "react";
import { Input, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { HelpCircle } from "lucide-react";
import clsx from "clsx";

const VARIABLES = [
  { token: "ancho", desc: "Ancho de apertura en mm" },
  { token: "alto", desc: "Alto de apertura en mm" },
  { token: "hojas", desc: "Cantidad de hojas" },
  { token: "crucesH", desc: "Cantidad de cruces horizontales" },
  { token: "crucesV", desc: "Cantidad de cruces verticales" },
  { token: "Entero()", desc: "Parte entera (floor)" },
];

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  size?: "sm" | "md";
  className?: {
    inputWrapper?: string;
    input?: string;
    label?: string;
    description?: string;
    endContent?: string;
  };
  description?: string;
}

export default function FormulaInput({
  label,
  value,
  onChange,
  size = "sm",
  className,
  description,
}: Props) {
  const [focused, setFocused] = useState(false); // <--- Ahora lo usaremos

  return (
    <div className={clsx("relative", className)}>
      <Input
        label={label}
        value={value}
        onValueChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        size={size}
        description={description}
        variant="bordered"
        classNames={{
          input: "font-mono text-xs",
          label: "text-zinc-500 dark:text-zinc-400 font-medium",
          inputWrapper: clsx(
            "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
            "hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm",

            focused
              ? "!border-amber-500/60 shadow-[0_0_0_1px_rgba(219,146,75,0.2)]"
              : "",
          ),
        }}
        endContent={
          <Popover placement="top" showArrow offset={10}>
            <PopoverTrigger>
              <button
                type="button"
                className={clsx(
                  "shrink-0 transition-colors p-1",
                  focused ? "text-[#db924b]" : "text-zinc-400",
                )}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-64 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <div className="p-3">
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
                  Variables disponibles
                </p>
                <div className="space-y-2">
                  {VARIABLES.map((v) => (
                    <div key={v.token} className="flex items-start gap-2 group">
                      <code
                        className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 rounded cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-[#db924b] transition-all shrink-0 border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
                        onClick={() => onChange(value + v.token)}
                      >
                        {v.token}
                      </code>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight pt-0.5 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                        {v.desc}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[9px] text-zinc-400 flex gap-1.5 items-center">
                    <span>Operadores:</span>
                    <code className="font-mono text-zinc-600 dark:text-zinc-300">
                      + - * / ( )
                    </code>
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        }
      />
    </div>
  );
}
