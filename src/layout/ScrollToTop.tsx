import { useEffect } from 'react'
import { useLenis } from 'lenis/react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname, search } = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true })
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [lenis, pathname, search])

  return null
}
