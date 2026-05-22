import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import './ActionButton.css'

type SignupButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children?: ReactNode
}

const signupButtonStyle: CSSProperties = {
  WebkitTextFillColor: 'var(--color-black)',
}

export function SignupButton({
  children = '회원가입',
  className,
  style,
  type = 'button',
  ...props
}: SignupButtonProps) {
  return (
    <button
      {...props}
      className={['app_action_button', 'app_action_button--accent', className].filter(Boolean).join(' ')}
      type={type}
      style={{ ...signupButtonStyle, ...style }}
    >
      {children}
    </button>
  )
}
