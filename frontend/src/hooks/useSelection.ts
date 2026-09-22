import { useEffect, useState, type RefObject } from 'react'

type SelectionDetails = {
  text: string
  rect: DOMRect
}

export function useSelection(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const [selection, setSelection] = useState<SelectionDetails | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    function handleSelectionChange() {
      const container = containerRef.current
      const browserSelection = window.getSelection()
      if (!container || !browserSelection || browserSelection.rangeCount === 0) {
        setSelection(null)
        return
      }

      const range = browserSelection.getRangeAt(0)
      const selectedText = browserSelection.toString().trim()
      const selectionInsideContainer = container.contains(range.commonAncestorContainer)
      if (!selectedText || !selectionInsideContainer) {
        setSelection(null)
        return
      }

      setSelection({ text: selectedText, rect: range.getBoundingClientRect() })
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [containerRef, enabled])

  function clearSelection() {
    setSelection(null)
    window.getSelection()?.removeAllRanges()
  }

  return { selection, clearSelection }
}
