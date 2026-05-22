import type { CSSProperties, ReactNode } from 'react'

type KeywordTagProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

const keywordTagStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'fit-content',
  height: 'fit-content',
  padding: '4px 10px',
  boxSizing: 'border-box',
  borderRadius: '5px'
}

function KeywordTag({ children, className, style }: KeywordTagProps) {
  return (
    <span className={className} style={{ ...keywordTagStyle, ...style }}>
      {children}
    </span>
  )
}

export default KeywordTag
