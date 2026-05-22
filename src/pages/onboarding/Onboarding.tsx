import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoIcon from '../../asset/icons/logo.svg'
import onboardingButtonColor from '../../asset/icons/OnboardingButton_color.svg'
import onboardingButtonNoColor from '../../asset/icons/OnboardingButton_nocolor.svg'
import onboarding01Image from '../../asset/images/onboarding01.png'
import onboarding01_01Image from '../../asset/images/onboarding01_01.png'
import onboarding02Image from '../../asset/images/onboarding02.png'
import onboarding02_01Image from '../../asset/images/onboarding02_01.png'
import onboarding03Image from '../../asset/images/onboarding03.png'
import onboarding03_01Image from '../../asset/images/onboarding03_01.png'
import onboarding01Video from '../../asset/video/onboarding01.mp4'
import './Onboarding.css'

const CREATED_MATCHES_KEY = 'airsoft:created-matches'
const CREATED_MATCH_FOCUS_DATE_KEY = 'airsoft:created-match-focus-date'
const ONBOARDING_THEME_COLOR = '#1a1a1a'
const SIGNUP_COMPLETED_KEY = 'airsoft:signup-completed'
const SIGNUP_MODE_KEY = 'airsoft:signup-mode'

type OnboardingSlide = {
  id: string
  imageSrc: string
  imageClassName?: string
  overlayImageSrc?: string
  overlayImageClassName?: string
  copy: Array<{
    text?: string
    accent?: boolean
    strong?: boolean
    segments?: Array<{
      text: string
      accent?: boolean
      strong?: boolean
    }>
  }>
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 'start',
    imageSrc: onboarding01Image,
    imageClassName: 'onboarding_rebuilt__image--first',
    overlayImageSrc: onboarding01_01Image,
    copy: [
      { text: '에어소프트건' },
      { text: '시작하고 싶었지만', accent: true, strong: true },
      { text: '막막하셨죠?' },
    ],
  },
  {
    id: 'guide',
    imageSrc: onboarding02Image,
    imageClassName: 'onboarding_rebuilt__image--second',
    overlayImageSrc: onboarding02_01Image,
    overlayImageClassName: 'onboarding_rebuilt__image--guide-overlay',
    copy: [
      { text: '그래서 건잇이 준비했어요' },
      { text: '당신의 첫 걸음을 함께할 가이드', accent: true, strong: true },
    ],
  },
  {
    id: 'community',
    imageSrc: onboarding03Image,
    imageClassName: 'onboarding_rebuilt__image--third',
    overlayImageSrc: onboarding03_01Image,
    overlayImageClassName: 'onboarding_rebuilt__image--community-overlay',
    copy: [
      { text: '나만의 플레이를' },
      { text: '친구들과 함께 이어가요', accent: true, strong: true },
    ],
  },
]

const orderedOnboardingSlides = [onboardingSlides[0], onboardingSlides[2], onboardingSlides[1]]

function hasCompletedSignup() {
  return (
    localStorage.getItem(SIGNUP_COMPLETED_KEY) === 'true' ||
    localStorage.getItem('isLoggedIn') === 'true'
  )
}

function restoreSignupHomeProfile() {
  const signupMode = localStorage.getItem(SIGNUP_MODE_KEY)
  const isVeteran =
    signupMode === 'veteran' ||
    localStorage.getItem('level') === '숙련자' ||
    localStorage.getItem('skillAlias') === '베테랑'

  localStorage.setItem('level', isVeteran ? '숙련자' : '입문자')
  localStorage.setItem('skillAlias', isVeteran ? '베테랑' : '뉴비')
  localStorage.setItem('homePreset', isVeteran ? '전술 지도, 경기 매칭 위주' : 'AI 질문 가이드, 기초 퀴즈 위주')
  localStorage.setItem('homeProfileBadge', isVeteran ? 'badge03' : 'symbol_beginner')
  localStorage.setItem('homeProfileTitle', isVeteran ? '베테랑 숙련자' : '안전제일 뉴비')
}

const MVP_VOTE_STORAGE_KEYS = [
  'votedMvpId',
  'votedMvpMatchId',
  'votedMvpMatchIds',
  'votedMvpTeamId',
  'votedMvpTeamIds',
]

type OnboardingButtonProps = {
  label: string
  variant?: 'color' | 'nocolor'
  onClick: () => void
}

function OnboardingButton({ label, variant = 'color', onClick }: OnboardingButtonProps) {
  return (
    <button
      className={`onboarding_rebuilt__button onboarding_rebuilt__button--${variant}`}
      type="button"
      onClick={onClick}
      aria-label={label}
    >
      <img
        className="onboarding_rebuilt__button_asset"
        src={variant === 'color' ? onboardingButtonColor : onboardingButtonNoColor}
        alt=""
        aria-hidden="true"
      />
      <span className="onboarding_rebuilt__button_label">{label}</span>
    </button>
  )
}

export function Onboarding() {
  const navigate = useNavigate()
  const [hasStarted, setHasStarted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState<'next' | 'previous'>('next')
  const activeSlide = orderedOnboardingSlides[activeIndex]
  const isLastSlide = activeIndex === orderedOnboardingSlides.length - 1

  useEffect(() => {
    localStorage.removeItem(CREATED_MATCHES_KEY)
    localStorage.removeItem(CREATED_MATCH_FOCUS_DATE_KEY)
    MVP_VOTE_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  }, [])

  useEffect(() => {
    const themeColorMetas = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    )
    const previousThemeColors = themeColorMetas.map((meta) => meta.content)
    const previousBodyBackground = document.body.style.background

    themeColorMetas.forEach((meta) => {
      meta.content = ONBOARDING_THEME_COLOR
    })
    document.body.style.background = ONBOARDING_THEME_COLOR

    return () => {
      themeColorMetas.forEach((meta, index) => {
        meta.content = previousThemeColors[index]
      })
      document.body.style.background = previousBodyBackground
    }
  }, [])

  const goNext = () => {
    setSlideDirection('next')
    setActiveIndex((index) => Math.min(index + 1, orderedOnboardingSlides.length - 1))
  }

  const goPrevious = () => {
    setSlideDirection('previous')
    setActiveIndex((index) => Math.max(index - 1, 0))
  }

  const goBack = () => {
    if (activeIndex === 0) {
      setHasStarted(false)
      return
    }

    goPrevious()
  }

  const goHomeWithSignupProfile = () => {
    if (hasCompletedSignup()) {
      restoreSignupHomeProfile()
    }

    navigate('/home')
  }

  const handleStart = () => {
    if (hasCompletedSignup()) {
      goHomeWithSignupProfile()
      return
    }

    setHasStarted(true)
  }

  return (
    <main className="mobile_frame onboarding_flow">
      {hasStarted ? (
        <section
          className="onboarding_rebuilt"
          aria-labelledby={`onboarding-title-${activeSlide.id}`}
        >
          <button
            className="onboarding_intro__skip onboarding_rebuilt__skip"
            type="button"
            onClick={() => navigate('/login')}
          >
            Skip
          </button>

          <div className="onboarding_rebuilt__content">
            <div className="onboarding_rebuilt__top">
              <div className="onboarding_rebuilt__dots" aria-label="온보딩 페이지">
                {orderedOnboardingSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    className={`onboarding_rebuilt__dot${activeIndex === index ? ' is-active' : ''}`}
                    type="button"
                    aria-label={`${index + 1}번째 온보딩 보기`}
                    aria-current={activeIndex === index ? 'true' : undefined}
                    tabIndex={-1}
                  />
                ))}
              </div>
              <img className="onboarding_rebuilt__logo" src={logoIcon} alt="GUNIT" />
              <div
                className={[
                  'onboarding_rebuilt__visual',
                  `onboarding_rebuilt__visual--${activeSlide.id}`,
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              >
                <div
                  className="onboarding_rebuilt__orbit onboarding_rebuilt__orbit--back"
                  aria-hidden="true"
                >
                  <svg
                    className="onboarding_rebuilt__orbit_line"
                    viewBox="0 0 320 240"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="onboarding_rebuilt__orbit_track"
                      d="M 34 120 C 35 99 51 81 77 70 C 86 66 96 64 108 66"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="8 12"
                    />
                    <path
                      className="onboarding_rebuilt__orbit_glow onboarding_rebuilt__orbit_glow--back-left"
                      d="M 34 120 C 35 99 51 81 77 70 C 86 66 96 64 108 66"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      pathLength="100"
                    />
                    <path
                      className="onboarding_rebuilt__orbit_track"
                      d="M 191 60 C 249 65 286 91 286 120"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="8 12"
                    />
                  </svg>
                </div>
                <div
                  className="onboarding_rebuilt__orbit onboarding_rebuilt__orbit--white"
                  aria-hidden="true"
                >
                  <svg
                    className="onboarding_rebuilt__orbit_line"
                    viewBox="0 0 320 240"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="onboarding_rebuilt__orbit_track"
                      d="M 34 120 C 35 99 51 81 77 70 C 86 66 96 64 108 66"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="8 12"
                    />
                    <path
                      className="onboarding_rebuilt__orbit_glow onboarding_rebuilt__orbit_glow--white"
                      d="M 34 120 C 35 99 51 81 77 70 C 86 66 96 64 108 66"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      pathLength="100"
                    />
                    <path
                      className="onboarding_rebuilt__orbit_track"
                      d="M 191 60 C 249 65 286 91 286 120"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="8 12"
                    />
                    <path
                      className="onboarding_rebuilt__orbit_track"
                      d="M 286 120 C 286 156 229 184 160 184 C 91 184 34 156 34 120"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="8 12"
                    />
                    <path
                      className="onboarding_rebuilt__orbit_glow onboarding_rebuilt__orbit_glow--white-long"
                      d="M 286 120 C 286 156 229 184 160 184 C 91 184 34 156 34 120"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      pathLength="100"
                    />
                  </svg>
                </div>
                <div className="onboarding_rebuilt__orbit_dots" aria-hidden="true">
                  <span className="onboarding_rebuilt__orbit_star" />
                  <span className="onboarding_rebuilt__orbit_dot onboarding_rebuilt__orbit_dot--one" />
                  <span className="onboarding_rebuilt__orbit_dot onboarding_rebuilt__orbit_dot--two" />
                  <span className="onboarding_rebuilt__orbit_dot onboarding_rebuilt__orbit_dot--three" />
                  <span className="onboarding_rebuilt__orbit_dot onboarding_rebuilt__orbit_dot--four" />
                  <span className="onboarding_rebuilt__orbit_dot onboarding_rebuilt__orbit_dot--five" />
                </div>
                <div
                  key={`media-${activeSlide.id}`}
                  className={[
                    'onboarding_rebuilt__slide_media',
                    `onboarding_rebuilt__slide_media--${activeSlide.id}`,
                    `is-slide-${slideDirection}`,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <img
                    className={[
                      'onboarding_rebuilt__image',
                      `onboarding_rebuilt__image--${activeSlide.id}-base`,
                      activeSlide.imageClassName,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    src={activeSlide.imageSrc}
                    alt=""
                  />
                  {activeSlide.overlayImageSrc && (
                    <img
                      className={[
                        'onboarding_rebuilt__image',
                        'onboarding_rebuilt__image--overlay',
                        `onboarding_rebuilt__image--${activeSlide.id}-overlay`,
                        activeSlide.overlayImageClassName,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      src={activeSlide.overlayImageSrc}
                      alt=""
                    />
                  )}
                </div>
                <div
                  className="onboarding_rebuilt__orbit onboarding_rebuilt__orbit--front"
                  aria-hidden="true"
                >
                  <svg
                    className="onboarding_rebuilt__orbit_line"
                    viewBox="0 0 320 240"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="onboarding_rebuilt__orbit_track"
                      d="M 286 120 C 286 156 229 184 160 184 C 91 184 34 156 34 120"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="8 12"
                    />
                    <path
                      className="onboarding_rebuilt__orbit_glow"
                      d="M 286 120 C 286 156 229 184 160 184 C 91 184 34 156 34 120"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      pathLength="100"
                    />
                  </svg>
                </div>
              </div>
              <h1
                key={`copy-${activeSlide.id}`}
                className={[
                  'onboarding_rebuilt__copy',
                  `is-slide-${slideDirection}`,
                ]
                  .filter(Boolean)
                  .join(' ')}
                id={`onboarding-title-${activeSlide.id}`}
              >
                {activeSlide.id === 'community' ? (
                  <span className="onboarding_rebuilt__copy_line">
                    <span className="onboarding_rebuilt__copy_segment">안전하고 친절한<br></br> </span>
                    <span className="onboarding_rebuilt__copy_segment is-accent is-strong">
                      커뮤니티와 연결
                    </span>
                    <span className="onboarding_rebuilt__copy_segment">해드려요</span>
                  </span>
                ) : activeSlide.id === 'guide' ? (
                  <>
                    <span className="onboarding_rebuilt__copy_line">실제 경험 기반 정보로</span>
                    <span className="onboarding_rebuilt__copy_line">
                      <span className="onboarding_rebuilt__copy_segment is-accent is-strong">
                        정확하게 안내
                      </span>
                      <span className="onboarding_rebuilt__copy_segment">해요</span>
                    </span>
                  </>
                ) : (
                  activeSlide.copy.map((line) => (
                    <span
                      key={line.text}
                      className={[
                        'onboarding_rebuilt__copy_line',
                        line.accent ? 'is-accent' : '',
                        line.strong ? 'is-strong' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {line.text}
                    </span>
                  ))
                )}
              </h1>
            </div>

          </div>

          <div className="onboarding_rebuilt__actions has-auth">
            {isLastSlide ? (
              <OnboardingButton label="다음" onClick={() => navigate('/login')} />
            ) : (
              <>
                <OnboardingButton label="다음" onClick={goNext} />
                <OnboardingButton label="이전" variant="nocolor" onClick={goBack} />
              </>
            )}
          </div>
        </section>
      ) : (
        <section className="onboarding_intro" aria-labelledby="onboarding-intro-title">
          <video
            className="onboarding_intro__video"
            src={onboarding01Video}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="onboarding_intro__shade" aria-hidden="true" />

          <div className="onboarding_intro__content">
            <div className="onboarding_intro__hero">
              <img className="onboarding_intro__logo" src={logoIcon} alt="GUNIT" />

              <h1 id="onboarding-intro-title" className="onboarding_intro__title">
                <span className="onboarding_intro__title_line onboarding_intro__title_line--accent">
                  에어소프트건
                </span>
                <span className="onboarding_intro__title_line">시작하고 싶었지만</span>
                <span className="onboarding_intro__title_line">막막하셨죠?</span>
              </h1>

              <p className="onboarding_intro__description">
                정보는 흩어져 있고
                <br />
                커뮤니티는 어렵게 느껴졌을 거예요
              </p>
            </div>
          </div>

          <div className="onboarding_rebuilt__actions onboarding_rebuilt__actions--intro">
            <OnboardingButton label="시작하기" onClick={handleStart} />
          </div>
        </section>
      )}
    </main>
  )
}
