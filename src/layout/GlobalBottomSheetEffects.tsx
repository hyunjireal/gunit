import { useEffect, useRef } from 'react'

const BOTTOM_SHEET_SELECTOR = [
  '[class*="_sheet_layer"]',
  '.auth_region_sheet',
  '.mts_sheet',
].join(',')

type ScrollLockSnapshot = {
  scrollY: number
  bodyOverflow: string
  bodyPosition: string
  bodyTop: string
  bodyLeft: string
  bodyRight: string
  bodyWidth: string
  htmlOverflow: string
}

function hasVisibleBottomSheet() {
  const sheets = Array.from(document.querySelectorAll<HTMLElement>(BOTTOM_SHEET_SELECTOR))

  return sheets.some((sheet) => {
    if (!sheet.isConnected) return false

    const style = window.getComputedStyle(sheet)
    if (style.display === 'none' || style.visibility === 'hidden') return false

    const rect = sheet.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  })
}

export function GlobalBottomSheetEffects() {
  const scrollLockRef = useRef<ScrollLockSnapshot | null>(null)

  useEffect(() => {
    const lockScroll = () => {
      if (scrollLockRef.current) return

      const bodyStyle = document.body.style
      const htmlStyle = document.documentElement.style
      const scrollY = window.scrollY

      scrollLockRef.current = {
        scrollY,
        bodyOverflow: bodyStyle.overflow,
        bodyPosition: bodyStyle.position,
        bodyTop: bodyStyle.top,
        bodyLeft: bodyStyle.left,
        bodyRight: bodyStyle.right,
        bodyWidth: bodyStyle.width,
        htmlOverflow: htmlStyle.overflow,
      }

      document.documentElement.classList.add('app_bottom_sheet_locked')
      document.body.classList.add('app_bottom_sheet_locked')
      htmlStyle.overflow = 'hidden'
      bodyStyle.position = 'fixed'
      bodyStyle.top = `-${scrollY}px`
      bodyStyle.left = '0'
      bodyStyle.right = '0'
      bodyStyle.width = '100%'
      bodyStyle.overflow = 'hidden'
    }

    const unlockScroll = () => {
      const snapshot = scrollLockRef.current
      if (!snapshot) return

      const bodyStyle = document.body.style
      const htmlStyle = document.documentElement.style

      htmlStyle.overflow = snapshot.htmlOverflow
      bodyStyle.overflow = snapshot.bodyOverflow
      bodyStyle.position = snapshot.bodyPosition
      bodyStyle.top = snapshot.bodyTop
      bodyStyle.left = snapshot.bodyLeft
      bodyStyle.right = snapshot.bodyRight
      bodyStyle.width = snapshot.bodyWidth
      document.documentElement.classList.remove('app_bottom_sheet_locked')
      document.body.classList.remove('app_bottom_sheet_locked')
      window.scrollTo({ top: snapshot.scrollY, left: 0, behavior: 'auto' })
      scrollLockRef.current = null
    }

    const syncBottomSheetEffects = () => {
      if (hasVisibleBottomSheet()) {
        lockScroll()
      } else {
        unlockScroll()
      }
    }

    const observer = new MutationObserver(syncBottomSheetEffects)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'aria-hidden'],
    })

    syncBottomSheetEffects()

    return () => {
      observer.disconnect()
      unlockScroll()
    }
  }, [])

  return null
}
