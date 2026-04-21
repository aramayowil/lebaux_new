import { useRef, useEffect } from 'react'
import clsx from 'clsx'

interface Props {
  value: string | number
  isEditing: boolean
  draft: string
  onDraftChange: (v: string) => void
  onStartEdit: () => void
  onCommit: (value: string) => void
  onCancel: () => void
  type?: 'text' | 'number'
  align?: 'left' | 'right' | 'center'
  className?: string
  mono?: boolean
  placeholder?: string
}

export default function EditableCell({
  value,
  isEditing,
  draft,
  onDraftChange,
  onStartEdit,
  onCommit,
  onCancel,
  type = 'text',
  align = 'left',
  className,
  mono,
  placeholder,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.select()
    }
  }, [isEditing])

  const alignClass = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
  }[align]

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={e => onDraftChange(e.target.value)}
        onBlur={() => onCommit(draft)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault()
            onCommit(draft)
          }
          if (e.key === 'Escape') {
            onCancel()
          }
        }}
        className={clsx(
          'w-full px-1.5 py-0.5 rounded border border-steel-400 dark:border-steel-500',
          'bg-amber-50 dark:bg-steel-800 outline-none ring-1 ring-amber-400 dark:ring-amber-600',
          'text-sm text-steel-800 dark:text-steel-100',
          alignClass,
          mono && 'font-mono',
          className,
        )}
      />
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onStartEdit}
      onKeyDown={e => e.key === 'Enter' && onStartEdit()}
      title="Click para editar"
      className={clsx(
        'px-1.5 py-0.5 rounded cursor-pointer min-h-[24px]',
        'hover:bg-steel-100 dark:hover:bg-steel-700/60 transition-colors',
        'text-sm text-steel-800 dark:text-steel-100',
        alignClass,
        mono && 'font-mono',
        !value && 'text-steel-300 dark:text-steel-600',
        className,
      )}
    >
      {value !== '' && value !== undefined ? value : (placeholder ?? '—')}
    </div>
  )
}
