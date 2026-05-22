import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import iconEyeOff from '../../asset/icons/login_eye_off.svg'
import { AuthShell } from './AuthShell'

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="auth_provider_icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.13 4.13 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.85.86-3.05.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.03l2.99-2.33Z"
        fill="#FBBC04"
      />
      <path
        d="M9 3.58c1.32 0 2.5.45 3.43 1.33l2.57-2.57C13.46.91 11.42 0 9 0A9 9 0 0 0 .96 4.97L3.95 7.3C4.66 5.16 6.65 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg aria-hidden="true" className="auth_provider_icon auth_provider_icon_apple" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.94 9.55c.02 2.26 1.98 3.02 2 3.03-.02.05-.31 1.07-1.02 2.12-.61.91-1.25 1.82-2.25 1.84-.98.02-1.29-.58-2.42-.58s-1.47.56-2.38.6c-.97.04-1.71-.97-2.33-1.88C3.28 12.86 2.3 9.5 3.6 7.23c.64-1.13 1.78-1.85 3.02-1.87.94-.02 1.83.63 2.42.63.58 0 1.67-.78 2.81-.67.48.02 1.82.19 2.68 1.44-.07.04-1.59.93-1.59 2.79Zm-1.9-5.44c.51-.62.85-1.49.75-2.35-.73.03-1.61.49-2.14 1.11-.47.54-.88 1.42-.77 2.26.81.06 1.64-.41 2.16-1.02Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(() => localStorage.getItem('savedEmail') ?? localStorage.getItem('email') ?? '')
  const [password, setPassword] = useState(() => localStorage.getItem('savedPassword') ?? '')
  const [rememberLogin, setRememberLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const emailError = submitted && email.trim() === '' ? '이메일을 입력하세요' : ''
  const passwordError = submitted && password.trim() === '' ? '비밀번호를 입력하세요' : ''
  const loginError =
    submitted && email.trim() !== '' && password.trim() !== ''
      ? '아이디 또는 비밀번호가 틀렸습니다'
      : ''

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/onboarding')
  }

  const login = () => {
    setSubmitted(true)
  }

  return (
    <AuthShell onBack={goBack} showTopbar={false}>
      <section className="auth_page_body auth_login_page">
        <div className="auth_page_header auth_page_header_left">
          <h1 className="auth_page_title">로그인</h1>
          <p className="auth_page_description">이메일과 비밀번호를 입력하세요</p>
        </div>

        <div className="auth_form_block auth_form_block_login">
          <label className="auth_field">
            <span className="auth_field__label">이메일</span>
            <input
              className="auth_input"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={emailError || loginError ? 'true' : undefined}
              aria-describedby={emailError ? 'login-email-error' : loginError ? 'login-submit-error' : undefined}
            />
            {emailError ? (
              <span id="login-email-error" className="auth_field_error">
                {emailError}
              </span>
            ) : null}
          </label>

          <label className="auth_field">
            <span className="auth_field__label">비밀번호</span>
            <span className="auth_input_wrap">
              <input
                className="auth_input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={passwordError || loginError ? 'true' : undefined}
                aria-describedby={passwordError ? 'login-password-error' : loginError ? 'login-submit-error' : undefined}
              />
              <button
                className="auth_input_icon_button"
                type="button"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                onClick={() => setShowPassword((current) => !current)}
              >
                <img src={iconEyeOff} alt="" aria-hidden="true" />
              </button>
            </span>
            {passwordError ? (
              <span id="login-password-error" className="auth_field_error">
                {passwordError}
              </span>
            ) : null}
          </label>

          {loginError ? (
            <p id="login-submit-error" className="auth_field_error auth_login_error">
              {loginError}
            </p>
          ) : null}

          <div className="auth_helper_row">
            <button
              className={`auth_checkbox_button ${rememberLogin ? 'is_checked' : ''}`}
              type="button"
              disabled
              onClick={() => setRememberLogin((current) => !current)}
            >
              <span className="auth_checkbox_button__box" aria-hidden="true" />
              <span>로그인 정보 저장</span>
            </button>

            <button className="auth_inline_action" type="button">
              비밀번호를 잊으셨나요?
            </button>
          </div>
        </div>

        <div className="auth_login_actions">
          <button className="auth_primary_button" type="button" onClick={login} disabled>
            로그인
          </button>
          <button className="auth_primary_button" type="button" onClick={() => navigate('/signup')}>
            회원가입
          </button>

          <div className="auth_bottom_links">
            <button className="auth_bottom_links__default auth_bottom_links__disabled" type="button" disabled>
              비회원으로 둘러보기
            </button>
          </div>
        </div>

        <div className="auth_provider_group">
          <div className="auth_divider" aria-hidden="true">
            <span />
            <strong>Or</strong>
            <span />
          </div>

          <button className="auth_provider_button" type="button">
            <GoogleIcon />
            <span>Google로 계속하기</span>
          </button>

          <button className="auth_provider_button" type="button">
            <AppleIcon />
            <span>Apple로 계속하기</span>
          </button>
        </div>
      </section>
    </AuthShell>
  )
}
