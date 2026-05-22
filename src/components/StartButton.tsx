import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import './ActionButton.css'

type StartButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children?: ReactNode
}

const startButtonStyle: CSSProperties = {
  WebkitTextFillColor: 'var(--color-black)',
}

export function StartButton({
  children = '시작하기',
  className,
  style,
  type = 'button',
  ...props
}: StartButtonProps) {
  return (
    <button
      {...props}
      className={['app_action_button', 'app_action_button--accent', className].filter(Boolean).join(' ')}
      type={type}
      style={{ ...startButtonStyle, ...style }}
    >
      {children}
    </button>
  )
}
