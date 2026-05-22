import { useCallback, useEffect, useRef, useState } from 'react'
import { ToastMessage, type ToastMessageState } from '../../components/ToastMessage'

const MATCH_REGISTRATION_TOAST_KEY = 'airsoft:match-registration-toast'
const MATCH_REGISTRATION_TOAST_AUTO_CLOSE_MS = 2600
const MATCH_REGISTRATION_TOAST_EXIT_MS = 240
const MATCH_REGISTRATION_TOAST_MESSAGE = '일정이 등록되었습니다.'

type MatchRegistrationToastProps = {
  open: boolean
  onClose: () => void
}

export function markMatchRegistrationToastPending() {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(MATCH_REGISTRATION_TOAST_KEY, 'true')
}

export function consumeMatchRegistrationToastPending() {
  if (typeof window === 'undefined') {
    return false
  }

  const shouldShowToast = localStorage.getItem(MATCH_REGISTRATION_TOAST_KEY) === 'true'
  if (!shouldShowToast) {
    return false
  }

  localStorage.removeItem(MATCH_REGISTRATION_TOAST_KEY)
  return true
}

export function MatchRegistrationToast({ open, onClose }: MatchRegistrationToastProps) {
  const [toast, setToast] = useState<ToastMessageState | null>(null)
  const autoCloseTimeoutRef = useRef<number | null>(null)
  const exitTimeoutRef = useRef<number | null>(null)

  const clearTimers = useCallback(() => {
    if (autoCloseTimeoutRef.current !== null) {
      window.clearTimeout(autoCloseTimeoutRef.current)
      autoCloseTimeoutRef.current = null
    }

    if (exitTimeoutRef.current !== null) {
      window.clearTimeout(exitTimeoutRef.current)
      exitTimeoutRef.current = null
    }
  }, [])

  const startClose = useCallback(() => {
    if (exitTimeoutRef.current !== null) {
      return
    }

    if (autoCloseTimeoutRef.current !== null) {
      window.clearTimeout(autoCloseTimeoutRef.current)
      autoCloseTimeoutRef.current = null
    }

    setToast((currentToast) =>
      currentToast ? { ...currentToast, phase: 'exit' } : currentToast,
    )
    exitTimeoutRef.current = window.setTimeout(() => {
      exitTimeoutRef.current = null
      onClose()
    }, MATCH_REGISTRATION_TOAST_EXIT_MS)
  }, [onClose])

  useEffect(() => {
    if (!open) {
      return
    }

    setToast({ message: MATCH_REGISTRATION_TOAST_MESSAGE, phase: 'enter' })

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        startClose()
      }
    }

    autoCloseTimeoutRef.current = window.setTimeout(() => {
      autoCloseTimeoutRef.current = null
      startClose()
    }, MATCH_REGISTRATION_TOAST_AUTO_CLOSE_MS)

    window.addEventListener('keydown', handleEscape)
    return () => {
      clearTimers()
      window.removeEventListener('keydown', handleEscape)
    }
  }, [clearTimers, open, startClose])

  if (!open) {
    return null
  }

  return <ToastMessage toast={toast} className="match_registration_toast_message" />
}
