import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { ElementType, ReactNode } from 'react'
import arrowLeftIcon from '../asset/icons/arrow_l.svg'
import darkModeIcon from '../asset/icons/dark.svg'
import lightModeIcon from '../asset/icons/light.svg'
import userAvatar from '../asset/images/main_user01.png'
import './PageHeader.css'

type PageHeaderVariant = 'default' | 'dark' | 'overlay' | 'transparent'
type PageHeaderLayout = 'custom' | 'standard' | 'section'
type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'airsoft-theme'
const PROFILE_IMAGE_KEY = 'airsoft:home-profile-image'

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark'
}

type PageHeaderProps = {
  title?: ReactNode
  subtitle?: ReactNode
  onBack?: () => void
  backIcon?: string
  backContent?: ReactNode
  backLabel?: string
  backButtonClassName?: string
  backIconClassName?: string
  className?: string
  groupClassName?: string
  titleClassName?: string
  subtitleClassName?: string
  rightSlot?: ReactNode
  rightLeadSlot?: ReactNode
  rightTrailSlot?: ReactNode
  leftSlot?: ReactNode
  children?: ReactNode
  titleAs?: ElementType
  variant?: PageHeaderVariant
  layout?: PageHeaderLayout
  hideLeft?: boolean
  hideRight?: boolean
  hideProfile?: boolean
}

export function PageHeader({
  title,
  subtitle,
  onBack,
  backIcon = arrowLeftIcon,
  backContent,
  backLabel = '뒤로가기',
  backButtonClassName,
  backIconClassName,
  className,
  groupClassName,
  titleClassName,
  subtitleClassName,
  rightSlot,
  rightLeadSlot,
  rightTrailSlot,
  leftSlot,
  children,
  titleAs: TitleTag = 'h1',
  variant = 'default',
  layout = 'custom',
  hideLeft = false,
  hideRight = false,
  hideProfile = false,
}: PageHeaderProps) {
  const location = useLocation()
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme)
  const [profileImage, setProfileImage] = useState<string>(() => localStorage.getItem(PROFILE_IMAGE_KEY) || userAvatar)
  const hasTitleContent = !hideLeft && Boolean(leftSlot || onBack || title)
  const currentPath = `${location.pathname}${location.search}${location.hash}`
  const profileLinkState = location.pathname.startsWith('/my') ? undefined : { from: currentPath }

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    localStorage.setItem(THEME_STORAGE_KEY, themeMode)
  }, [themeMode])

  useEffect(() => {
    const syncStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        setThemeMode(event.newValue === 'light' ? 'light' : 'dark')
      } else if (event.key === PROFILE_IMAGE_KEY) {
        setProfileImage(event.newValue || userAvatar)
      }
    }

    const syncProfileOnFocus = () => {
      setProfileImage(localStorage.getItem(PROFILE_IMAGE_KEY) || userAvatar)
    }

    window.addEventListener('storage', syncStorage)
    window.addEventListener('focus', syncProfileOnFocus)

    return () => {
      window.removeEventListener('storage', syncStorage)
      window.removeEventListener('focus', syncProfileOnFocus)
    }
  }, [])

  const toggleThemeMode = () => {
    setThemeMode((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const titleContent = (
    <>
      {leftSlot}
      {onBack ? (
        <button
          className={['page_header__back', backButtonClassName].filter(Boolean).join(' ')}
          type="button"
          aria-label={backLabel}
          onClick={onBack}
        >
          {backContent ?? (
            <img
              className={['page_header__back_icon', backIconClassName].filter(Boolean).join(' ')}
              src={backIcon}
              alt=""
              aria-hidden="true"
            />
          )}
        </button>
      ) : null}
      {title ? <TitleTag className={['page_header__title', titleClassName].filter(Boolean).join(' ')}>{title}</TitleTag> : null}
    </>
  )

  return (
    <header
      className={[
        'page_header',
        `page_header--${variant}`,
        `page_header--${layout}`,
        hideLeft ? 'page_header--hide-left' : '',
        hideProfile ? 'page_header--hide-profile' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="page_header__tit">
        {hasTitleContent ? (
          <div className={['page_header__left', 'page_header__main', groupClassName].filter(Boolean).join(' ')}>
            {titleContent}
          </div>
        ) : null}
        {rightSlot ? (
          <div className="page_header__right">
            {rightSlot}
          </div>
        ) : !hideRight ? (
          <div className="page_header__right" aria-label="테마와 프로필 바로가기">
            {rightLeadSlot}
            <button
              className="page_header__circle_button"
              type="button"
              aria-label={`${themeMode === 'dark' ? '라이트' : '다크'} 모드로 전환`}
              aria-pressed={themeMode === 'dark'}
              onClick={toggleThemeMode}
            >
              <img
                key={themeMode}
                className="page_header__theme_icon"
                src={themeMode === 'dark' ? darkModeIcon : lightModeIcon}
                alt=""
                aria-hidden="true"
              />
            </button>
            {rightTrailSlot}
            <Link className="page_header__circle_button page_header__profile_link" to="/my" state={profileLinkState} aria-label="마이페이지로 이동">
              <img className="page_header__profile_image" src={profileImage} alt="" aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>
      {subtitle ? (
        <p className={['page_header__subtitle', subtitleClassName].filter(Boolean).join(' ')}>
          {subtitle}
        </p>
      ) : null}
      {children}
    </header>
  )
}
