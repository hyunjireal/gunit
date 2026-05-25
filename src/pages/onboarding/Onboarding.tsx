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
import {
  OnboardingSlideFrame,
  type OnboardingSlideFrameData,
} from '../../components/OnboardingSlideFrame'
import './Onboarding.css'

const CREATED_MATCHES_KEY = 'airsoft:created-matches'
const CREATED_MATCH_FOCUS_DATE_KEY = 'airsoft:created-match-focus-date'
const ONBOARDING_THEME_COLOR = '#1a1a1a'
const SIGNUP_COMPLETED_KEY = 'airsoft:signup-completed'
const SIGNUP_MODE_KEY = 'airsoft:signup-mode'

const onboardingSlides: OnboardingSlideFrameData[] = [
  {
    id: 'start',
    imageSrc: onboarding01Image,
    imageClassName: 'onboarding_rebuilt__image--first',
    overlayImageSrc: onboarding01_01Image,
    copy: [
      { text: '장비부터 규칙까지 막막하다면' },
      {
        segments: [
          { text: 'AI 가이드', accent: true, strong: true },
          { text: '가 쉽게 알려드려요' },
        ],
      },
    ],
  },
  {
    id: 'guide',
    imageSrc: onboarding02Image,
    imageClassName: 'onboarding_rebuilt__image--second',
    overlayImageSrc: onboarding02_01Image,
    overlayImageClassName: 'onboarding_rebuilt__image--guide-overlay',
    copy: [
      { text: '실전에 나가기 전 필요한 정보만' },
      {
        segments: [
          { text: '가이드와 퀴즈', accent: true, strong: true },
          { text: '로 준비해요' },
        ],
      },
    ],
  },
  {
    id: 'community',
    imageSrc: onboarding03Image,
    imageClassName: 'onboarding_rebuilt__image--third',
    overlayImageSrc: onboarding03_01Image,
    overlayImageClassName: 'onboarding_rebuilt__image--community-overlay',
    copy: [
      { text: '함께할 사람이 필요하다면' },
      {
        segments: [
          { text: '버디와 팀을 연결', accent: true, strong: true },
          { text: '해드려요' },
        ],
      },
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

          <OnboardingSlideFrame
            activeIndex={activeIndex}
            direction={slideDirection}
            logoSrc={logoIcon}
            slide={activeSlide}
            slides={orderedOnboardingSlides}
          />
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
