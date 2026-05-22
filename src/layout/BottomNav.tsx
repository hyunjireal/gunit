import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import headerComIcon from '../asset/icons/header_com.svg'
import headerHomeIcon from '../asset/icons/header_home.svg'
import headerMatchIcon from '../asset/icons/header_match.svg'
import headerMediaIcon from '../asset/icons/header_media.svg'
import guyFaceArcSmileIcon from '../asset/icons/guy-face-arc-smile.svg'
import guyFaceSmileIcon from '../asset/icons/guy-face-caret-circle-caret.svg'
import guyFaceHeartSmileIcon from '../asset/icons/guy-face-heart-smile.svg'
import guyFaceTalkIcon from '../asset/icons/guy-face-owo.svg'
import guyFaceThinkIcon from '../asset/icons/guy-face-plus-underscore-plus.svg'
import gaiImage from '../asset/images/loading_char.png'

const items = [
  { to: '/home', label: '홈', icon: headerHomeIcon },
  { to: '/match', label: '매치', icon: headerMatchIcon },
  { to: '/media', label: '미디어', icon: headerMediaIcon },
  { to: '/community', label: '커뮤니티', icon: headerComIcon },
]

const gaiFaces = [
  guyFaceTalkIcon,
  guyFaceThinkIcon,
  guyFaceSmileIcon,
  guyFaceArcSmileIcon,
  guyFaceHeartSmileIcon,
]

export function BottomNav() {
  const location = useLocation()
  const [gaiFaceIndex, setGaiFaceIndex] = useState(0)
  const pathname = location.pathname
  const returnTo = `${location.pathname}${location.search}`
  const shouldActivateMatchTab =
    pathname === '/my/schedule' ||
    pathname === '/tournament' ||
    pathname === '/tournament/mvp-vote' ||
    pathname === '/tournament/mvp-complete'
  const activeIndex = Math.max(
    items.findIndex((item) => {
      if (shouldActivateMatchTab && item.to === '/match') {
        return true
      }

      return pathname === item.to || pathname.startsWith(`${item.to}/`)
    }),
    0,
  )

  useEffect(() => {
    const faceTimer = window.setInterval(() => {
      setGaiFaceIndex((current) => (current + 1) % gaiFaces.length)
    }, 2800)

    return () => {
      window.clearInterval(faceTimer)
    }
  }, [])

  return (
    <header className="app_header">
      <nav className="app_header_left" aria-label="주요 내비게이션">
        {items.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={`app_header_menu${activeIndex === index ? ' is-active' : ''}`}
          >
            <span className="app_header_hover_circle" aria-hidden="true" />
            <span className="app_header_label_stack">
              <span className="app_header_label_content">
                <img className="app_header_menu_icon" src={item.icon} alt="" aria-hidden="true" />
                <span className="app_header_label">{item.label}</span>
              </span>
              <span className="app_header_label_hover" aria-hidden="true">
                <img className="app_header_menu_icon" src={item.icon} alt="" aria-hidden="true" />
                <span>{item.label}</span>
              </span>
            </span>
          </NavLink>
        ))}
      </nav>

      <nav className="app_header_right" aria-label="AI 챗봇">
        <NavLink to="/chat" state={{ returnTo }} className="app_header_ai" aria-label="AI 챗봇">
          <img className="app_header_gai" src={gaiImage} alt="" aria-hidden="true" />
          <img
            className="app_header_gai_expression"
            key={gaiFaces[gaiFaceIndex]}
            src={gaiFaces[gaiFaceIndex]}
            alt=""
            aria-hidden="true"
          />
        </NavLink>
      </nav>
    </header>
  )
}
