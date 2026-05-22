import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'airsoft-theme'

function readThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const rootTheme = document.documentElement.dataset.theme
  if (rootTheme === 'dark' || rootTheme === 'light') {
    return rootTheme
  }

  return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark'
}

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(readThemeMode)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const syncThemeMode = () => {
      setThemeMode(readThemeMode())
    }

    const observer = new MutationObserver(syncThemeMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    window.addEventListener('storage', syncThemeMode)
    syncThemeMode()

    return () => {
      observer.disconnect()
      window.removeEventListener('storage', syncThemeMode)
    }
  }, [])

  return themeMode
}
