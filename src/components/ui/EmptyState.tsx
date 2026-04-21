import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description?: string
}

export default function EmptyState({ icon: Icon, title, description }: Props) {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-3 text-steel-400 dark:text-steel-600">
      <Icon className="w-10 h-10 opacity-40" strokeWidth={1.2} />
      <div className="text-center">
        <p className="font-medium text-steel-500 dark:text-steel-400">{title}</p>
        {description && <p className="text-xs mt-0.5 text-steel-400">{description}</p>}
      </div>
    </div>
  )
}
