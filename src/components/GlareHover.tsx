import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import './GlareHover.css'

type GlareHoverProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  width?: string
  height?: string
  background?: string
  borderRadius?: string
  borderColor?: string
  children?: ReactNode
  glareColor?: string
  glareOpacity?: number
  glareAngle?: number
  glareSize?: number
  transitionDuration?: number
  playOnce?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  autoPlayDelay?: number
  className?: string
  style?: CSSProperties
}

type GlareHoverVars = CSSProperties & {
  '--gh-width': string
  '--gh-height': string
  '--gh-bg': string
  '--gh-br': string
  '--gh-angle': string
  '--gh-duration': string
  '--gh-size': string
  '--gh-rgba': string
  '--gh-border': string
  '--gh-auto-interval': string
  '--gh-auto-delay': string
}

const toRgba = (glareColor: string, glareOpacity: number) => {
  const hex = glareColor.replace('#', '')

  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`
  }

  if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16)
    const g = parseInt(hex[1] + hex[1], 16)
    const b = parseInt(hex[2] + hex[2], 16)
    return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`
  }

  return glareColor
}

export default function GlareHover({
  width = '500px',
  height = '500px',
  background = '#000',
  borderRadius = '10px',
  borderColor = '#333',
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  autoPlay = false,
  autoPlayInterval = 7200,
  autoPlayDelay = 0,
  className = '',
  style = {},
  ...props
}: GlareHoverProps) {
  const vars: GlareHoverVars = {
    '--gh-width': width,
    '--gh-height': height,
    '--gh-bg': background,
    '--gh-br': borderRadius,
    '--gh-angle': `${glareAngle}deg`,
    '--gh-duration': `${transitionDuration}ms`,
    '--gh-size': `${glareSize}%`,
    '--gh-rgba': toRgba(glareColor, glareOpacity),
    '--gh-border': borderColor,
    '--gh-auto-interval': `${autoPlayInterval}ms`,
    '--gh-auto-delay': `${autoPlayDelay}ms`,
  }

  return (
    <div
      {...props}
      className={[
        'glare-hover',
        playOnce ? 'glare-hover--play-once' : '',
        autoPlay ? 'glare-hover--auto' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...vars, ...style }}
    >
      {children}
    </div>
  )
}
