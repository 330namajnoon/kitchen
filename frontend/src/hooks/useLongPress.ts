import { useRef } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'

const DEFAULT_DELAY_MS = 500
const DEFAULT_MOVE_THRESHOLD_PX = 10

type UseLongPressOptions = {
  delay?: number
  moveThreshold?: number
}

/**
 * Detecta "pulsar y mantener" sobre elementos de una lista para entrar en modo selección.
 * Si el puntero se mueve más de `moveThreshold` antes de que se cumpla `delay` (p. ej. al hacer
 * scroll), se cancela y no se dispara `onLongPress`, para no seleccionar nada por accidente.
 */
export const useLongPress = <T>(onLongPress: (item: T) => void, options: UseLongPressOptions = {}) => {
  const { delay = DEFAULT_DELAY_MS, moveThreshold = DEFAULT_MOVE_THRESHOLD_PX } = options

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const startPosition = useRef<{ x: number; y: number } | null>(null)
  const triggered = useRef(false)

  const cancel = () => {
    clearTimeout(timer.current)
    startPosition.current = null
  }

  const start = (item: T) => (event: ReactPointerEvent) => {
    triggered.current = false
    startPosition.current = { x: event.clientX, y: event.clientY }
    timer.current = setTimeout(() => {
      triggered.current = true
      startPosition.current = null
      onLongPress(item)
    }, delay)
  }

  const handleMove = (event: ReactPointerEvent) => {
    if (!startPosition.current) return

    const dx = event.clientX - startPosition.current.x
    const dy = event.clientY - startPosition.current.y
    if (Math.hypot(dx, dy) > moveThreshold) {
      cancel()
    }
  }

  const wasTriggered = () => {
    if (!triggered.current) return false
    triggered.current = false
    return true
  }

  const getHandlers = (item: T) => ({
    onPointerDown: start(item),
    onPointerMove: handleMove,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: (event: ReactMouseEvent<HTMLElement>) => event.preventDefault(),
  })

  return { getHandlers, wasTriggered }
}
