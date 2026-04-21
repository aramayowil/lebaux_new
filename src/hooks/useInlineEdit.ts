import { useState, useCallback, useRef } from 'react'

export interface CellId {
  rowKey: string | number
  field: string
}

export function useInlineEdit<T extends Record<string, unknown>>() {
  const [editing, setEditing] = useState<CellId | null>(null)
  const [draft, setDraft] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = useCallback((rowKey: string | number, field: string, currentValue: T[keyof T]) => {
    setEditing({ rowKey, field })
    setDraft(String(currentValue ?? ''))
    // focus after render
    setTimeout(() => inputRef.current?.select(), 30)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditing(null)
    setDraft('')
  }, [])

  const isEditing = useCallback((rowKey: string | number, field: string) =>
    editing?.rowKey === rowKey && editing?.field === field,
  [editing])

  return { editing, draft, setDraft, startEdit, cancelEdit, isEditing, inputRef }
}
