import type { CSSProperties } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import './EventBanner.css'

type EventBannerProps = {
  to: LinkProps['to']
  state?: LinkProps['state']
  backgroundImage: string
  label: string
  title: string
  accent: string
  suffix?: string
  page: number
  total: number
  className?: string
}

export function EventBanner({
  to,
  state,
  backgroundImage,
  label,
  title,
  accent,
  suffix = '',
  page,
  total,
  className = '',
}: EventBannerProps) {
  const bannerStyle = {
    '--event-banner-bg': `url(${backgroundImage})`,
  } as CSSProperties

  return (
    <Link
      className={['event_banner', className].filter(Boolean).join(' ')}
      to={to}
      state={state}
      style={bannerStyle}
    >
      <span className="event_banner_overlay" aria-hidden="true" />
      <span className="event_banner_text">
        <span className="event_banner_label">{label}</span>
        <span className="event_banner_title">
          {title}
          <br />
          <span className="event_banner_title_accent">{accent}</span>
          {suffix}
        </span>
      </span>
      <span className="event_banner_page">
        {page}&nbsp;&nbsp;/&nbsp;&nbsp;{total}
      </span>
    </Link>
  )
}
