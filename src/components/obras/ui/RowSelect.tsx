import { SelectItem } from "@heroui/react";
import { Select } from "@heroui/react";

const SEL = {
  trigger:
    "h-8 min-h-8 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-700/60 rounded-lg text-xs",
  value: "text-xs text-zinc-700 dark:text-zinc-300 font-medium",
};

export default function RowSelect({
  label,
  items,
  selectedKey,
  onKeyChange,
  placeholder,
  useCode,
}: {
  label: string;
  items: any[];
  selectedKey: number | undefined | null;
  onKeyChange: (key: number | null) => void;
  placeholder?: string;
  useCode?: boolean;
}) {
  const hasValue = selectedKey !== null && selectedKey !== undefined;
  const existsInCatalog =
    hasValue && items.some((item) => item.id === selectedKey);

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
        {label}
      </label>
      <Select
        size="sm"
        aria-label={label}
        placeholder={placeholder}
        classNames={SEL}
        selectedKeys={
          existsInCatalog ? new Set([String(selectedKey)]) : new Set()
        }
        onSelectionChange={(keys: React.Key[]) => {
          const key = Array.from(keys)[0];
          onKeyChange(key ? Number(key) : null);
        }}
      >
        {items.map((item) => {
          const text = useCode
            ? item.codigo
            : item.descri || item.descripcion || `ID: ${item.id}`;
          return (
            <SelectItem key={String(item.id)} textValue={text || ""}>
              <span className="text-xs font-medium font-mono">{text}</span>
            </SelectItem>
          );
        })}
      </Select>
    </div>
  );
}
