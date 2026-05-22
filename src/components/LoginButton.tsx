import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './ActionButton.css'

type LoginButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children?: ReactNode
  variant?: 'light' | 'accent' | 'apply'
}

export function LoginButton({
  children = '로그인',
  className,
  style,
  type = 'button',
  variant = 'light',
  ...props
}: LoginButtonProps) {
  return (
    <button
      {...props}
      className={['app_action_button', `app_action_button--${variant}`, className].filter(Boolean).join(' ')}
      type={type}
      style={style}
    >
      <span className="app_action_button__label">{children}</span>
    </button>
  )
}
