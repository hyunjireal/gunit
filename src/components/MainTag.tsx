import type { CSSProperties, ReactNode } from 'react'

type MainTagProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

const mainTagStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'fit-content',
  height: 'fit-content',
  padding: '5px 10px',
  gap: 10,
  boxSizing: 'border-box',
  borderRadius: '999px'
}

function MainTag({ children, className, style }: MainTagProps) {
  return (
    <span className={className} style={{ ...mainTagStyle, ...style }}>
      {children}
    </span>
  )
}

export default MainTag
