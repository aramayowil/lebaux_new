import { useState } from 'react'
import { Input, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import { HelpCircle } from 'lucide-react'
import clsx from 'clsx'

const VARIABLES = [
  { token: 'ancho',   desc: 'Ancho de apertura en mm' },
  { token: 'alto',    desc: 'Alto de apertura en mm' },
  { token: 'hojas',   desc: 'Cantidad de hojas' },
  { token: 'crucesH', desc: 'Cantidad de cruces horizontales' },
  { token: 'crucesV', desc: 'Cantidad de cruces verticales' },
  { token: 'Entero()', desc: 'Parte entera (floor)' },
]

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  size?: 'sm' | 'md'
  className?: string
  description?: string
}

export default function FormulaInput({ label, value, onChange, size = 'sm', className, description }: Props) {
  const [focused, setFocused] = useState(false)

  return (
    <div className={clsx('relative', className)}>
      <Input
        label={label}
        value={value}
        onValueChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        size={size}
        description={description}
        classNames={{
          input: 'font-mono text-xs',
          inputWrapper: 'bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700',
        }}
        endContent={
          <Popover placement="top">
            <PopoverTrigger>
              <button type="button" className="flex-shrink-0 text-steel-300 hover:text-steel-500 transition-colors">
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-64">
              <div className="p-3">
                <p className="text-xs font-semibold text-steel-600 dark:text-steel-300 mb-2">Variables disponibles</p>
                <div className="space-y-1.5">
                  {VARIABLES.map(v => (
                    <div key={v.token} className="flex items-start gap-2">
                      <code
                        className="text-[10px] font-mono bg-steel-100 dark:bg-steel-800 text-steel-700 dark:text-steel-300 px-1.5 py-0.5 rounded cursor-pointer hover:bg-amber-100 flex-shrink-0"
                        onClick={() => onChange(value + v.token)}
                      >
                        {v.token}
                      </code>
                      <span className="text-[10px] text-steel-400 leading-tight pt-0.5">{v.desc}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-steel-400 mt-2 border-t border-steel-100 dark:border-steel-800 pt-2">
                  Operadores: <code className="font-mono">+ - * / ( )</code>
                </p>
              </div>
            </PopoverContent>
          </Popover>
        }
      />
    </div>
  )
}
