import type { CSSProperties, ReactNode } from 'react'

type CategoryTagProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

const categoryTagStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'fit-content',
  height: 'fit-content',
  padding: '4px 8px',
  gap: 4,
  boxSizing: 'border-box',
  borderRadius: '999px',
  border: '1px solid rgba(97, 122, 177, 0.40)',
  background: '#E9EEF8',
  color: '#617AB1',
  textAlign: 'center',
  fontFamily: 'Pretendard Variable, Pretendard, system-ui, sans-serif',
  fontSize: 12,
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '130%',
  letterSpacing: '-0.24px',
  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',
  flexShrink: 0,
  minWidth: 'max-content',
  maxWidth: 'none',
}

function CategoryTag({ children, className, style }: CategoryTagProps) {
  return (
    <span className={className} style={{ ...categoryTagStyle, ...style }}>
      {children}
    </span>
  )
}

export default CategoryTag
