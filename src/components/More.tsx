import type { CSSProperties, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import arrowR from '../asset/icons/arrow_r.svg'

type MoreProps = {
  ariaLabel?: string
  children?: ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  state?: LinkProps['state']
  style?: CSSProperties
  to?: string
  type?: 'button' | 'reset' | 'submit'
}

const moreStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 5,
  width: 'fit-content',
  border: 0,
  padding: 0,
  background: 'transparent',
  color: '#98999A',
  textDecoration: 'none',
  fontFamily: 'Pretendard Variable, Pretendard, system-ui, sans-serif',
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 'normal',
  letterSpacing: 0,
}

const arrowStyle: CSSProperties = {
  width: 12,
  height: 12,
  flexShrink: 0,
}

function More({
  ariaLabel,
  children = '\uB354\uBCF4\uAE30',
  className,
  disabled,
  onClick,
  state,
  style,
  to,
  type,
}: MoreProps) {
  const mergedStyle = { ...moreStyle, ...style }
  const content = (
    <>
      <span>{children}</span>
      <img aria-hidden="true" alt="" className="arrow_r" src={arrowR} style={arrowStyle} />
    </>
  )

  if (to) {
    return (
      <Link aria-label={ariaLabel} className={className} state={state} style={mergedStyle} to={to}>
        {content}
      </Link>
    )
  }

  if (type || onClick || disabled) {
    return (
      <button
        aria-label={ariaLabel}
        className={className}
        disabled={disabled}
        style={mergedStyle}
        type={type ?? 'button'}
        onClick={onClick}
      >
        {content}
      </button>
    )
  }

  return (
    <span className={className} style={mergedStyle}>
      {content}
    </span>
  )
}

export default More
