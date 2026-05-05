import { Input, Button } from "@heroui/react";
import { Search, Plus } from "lucide-react";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  onNew: () => void;
  newLabel?: string;
  placeholder?: string;
  extra?: React.ReactNode;
}

export default function CatalogToolbar({
  search,
  onSearch,
  onNew,
  newLabel = "Nuevo",
  placeholder = "Buscar...",
  extra,
}: Props) {
  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <Input
        placeholder={placeholder}
        value={search}
        onValueChange={onSearch}
        startContent={<Search className="w-4 h-4 text-steel-400 shrink-0" />}
        size="sm"
        className="max-w-xs"
        classNames={{
          inputWrapper:
            "bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 shadow-none hover:border-steel-400 transition-colors",
        }}
        isClearable
        onClear={() => onSearch("")}
      />
      {extra}
      <div className="flex-1" />
      <Button
        size="sm"
        color="primary"
        startContent={<Plus className="w-3.5 h-3.5" />}
        onPress={onNew}
      >
        {newLabel}
      </Button>
    </div>
  );
}
