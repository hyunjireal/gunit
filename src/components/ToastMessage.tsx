import { useCallback, useEffect, useState } from 'react'
import './ToastMessage.css'

export type ToastMessagePhase = 'enter' | 'exit'

export type ToastMessageState = {
  message: string
  phase: ToastMessagePhase
}

type ToastMessageOptions = {
  hideDelayMs?: number
  exitDurationMs?: number
}

type ToastMessageProps = {
  toast: ToastMessageState | null
  className?: string
}

const DEFAULT_HIDE_DELAY_MS = 2000
const DEFAULT_EXIT_DURATION_MS = 220

export function useToastMessage(
  initialMessage?: string,
  {
    hideDelayMs = DEFAULT_HIDE_DELAY_MS,
    exitDurationMs = DEFAULT_EXIT_DURATION_MS,
  }: ToastMessageOptions = {},
) {
  const [toast, setToast] = useState<ToastMessageState | null>(() =>
    initialMessage ? { message: initialMessage, phase: 'enter' } : null,
  )

  useEffect(() => {
    if (!toast) return undefined

    if (toast.phase === 'exit') {
      const timerId = window.setTimeout(() => setToast(null), exitDurationMs)
      return () => window.clearTimeout(timerId)
    }

    const timerId = window.setTimeout(() => {
      setToast((currentToast) =>
        currentToast ? { ...currentToast, phase: 'exit' } : currentToast,
      )
    }, hideDelayMs)

    return () => window.clearTimeout(timerId)
  }, [exitDurationMs, hideDelayMs, toast])

  const showToast = useCallback((message: string) => {
    setToast({ message, phase: 'enter' })
  }, [])

  return { toast, showToast }
}

export function ToastMessage({ toast, className }: ToastMessageProps) {
  if (!toast) return null

  return (
    <div
      className={['toast_message', className, toast.phase === 'exit' ? 'is_exiting' : ''].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
    >
      {toast.message}
    </div>
  )
}
