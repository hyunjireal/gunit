import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { PageHeader } from '../../components/PageHeader'
import iconArrowLeft from '../../asset/icons/arrow_l.svg'
import './Auth.css'

type AuthShellProps = {
  children: ReactNode
  onBack: () => void
  showTopbar?: boolean
  scrollLock?: boolean
}

export function AuthShell({ children, onBack, showTopbar = true, scrollLock = false }: AuthShellProps) {
  useEffect(() => {
    document.body.classList.add('auth_body')

    return () => {
      document.body.classList.remove('auth_body')
    }
  }, [])

  return (
    <main className="mobile_frame auth_screen">
      <div className={`auth_screen__inner${scrollLock ? ' auth_screen__inner--lock' : ''}`}>
        <div className="auth_screen__status" aria-hidden="true" />

        {showTopbar ? (
          <PageHeader
            className="auth_screen__topbar"
            backIcon={iconArrowLeft}
            backButtonClassName="auth_screen__back"
            onBack={onBack}
            variant="dark"
          />
        ) : null}

        {children}
      </div>
    </main>
  )
}
