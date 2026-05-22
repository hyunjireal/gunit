import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import onboarding01Image from '../../asset/images/onboarding01.png'
import onboarding02Image from '../../asset/images/onboarding02.png'
import onboarding03Image from '../../asset/images/onboarding03.png'
import onboardingLogo from '../../asset/images/onboarding_logo.png'
import { LoginButton } from '../../components/LoginButton'
import { SignupButton } from '../../components/SignupButton'

type InfoSlide = {
  id: string
  titleLines: string[]
  descriptionLines: string[]
  imageSrc: string
  imageWidth: number
  imageHeight: number
}

export const onboardingInfoSlides: InfoSlide[] = [
  {
    id: 'ai-guide',
    titleLines: ['장비가 없어도', '어떻게 시작할지 몰라도'],
    descriptionLines: ['장비부터 규칙, 참여 방법까지', 'AI 챗봇 GAI에게 물어보세요'],
    imageSrc: onboarding01Image,
    imageWidth: 203,
    imageHeight: 161,
  },
  {
    id: 'buddy-guide',
    titleLines: ['혼자가 아닌', '숙련된 버디와 함께'],
    descriptionLines: ['버디와 함께', '차근차근 시작해보세요'],
    imageSrc: onboarding02Image,
    imageWidth: 184,
    imageHeight: 161,
  },
  {
    id: 'creator-guide',
    titleLines: ['나만의 크리에이터를', '응원해보세요'],
    descriptionLines: ['영상 · 경기 · 커뮤니티 활동까지', '팬들과 함께 즐길 수 있어요'],
    imageSrc: onboarding03Image,
    imageWidth: 234,
    imageHeight: 161,
  },
]

type InfoScreenProps = {
  activeIndex: number
  onSelectSlide: (index: number) => void
  onLogin: () => void
  onSignup: () => void
  onPanelClick: (event: ReactMouseEvent<HTMLElement>) => void
  dragOffset: number
  isDragging: boolean
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void
}

export function InfoScreen({
  activeIndex,
  onSelectSlide,
  onLogin,
  onSignup,
  onPanelClick,
  dragOffset,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: InfoScreenProps) {
  const trackStyle = {
    transform: `translate3d(calc(${-activeIndex * 100}% + ${dragOffset}px), 0, 0)`,
    transition: isDragging ? 'none' : 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
  }

  return (
    <section className="onboarding_panel" aria-label="온보딩 안내" onClick={onPanelClick}>
      <div
        className="onboarding_panel__viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div className="onboarding_panel__track" style={trackStyle}>
          {onboardingInfoSlides.map((slide, index) => (
            <article
              key={slide.id}
              className="onboarding_panel__slide"
              aria-hidden={activeIndex !== index}
            >
              <div className="onboarding_panel__hero">
                <img className="onboarding_panel__logo" src={onboardingLogo} alt="" aria-hidden="true" />

                <div
                  className="onboarding_panel__illustration"
                  style={{ '--slide-illustration-width': `${slide.imageWidth}px` } as CSSProperties}
                >
                  <img src={slide.imageSrc} alt="" aria-hidden="true" />
                </div>
              </div>

              <div className="onboarding_panel__body">
                <div className="onboarding_panel__indicator" aria-label="온보딩 안내 페이지">
                  {onboardingInfoSlides.map((item, indicatorIndex) => (
                    <button
                      key={item.id}
                      className={`onboarding_panel__indicator_button${activeIndex === indicatorIndex ? ' is-active' : ''}`}
                      type="button"
                      aria-label={`${indicatorIndex + 1}번 안내 보기`}
                      aria-current={activeIndex === indicatorIndex ? 'true' : undefined}
                      onClick={() => onSelectSlide(indicatorIndex)}
                    >
                      <span className="onboarding_panel__indicator_dot" />
                    </button>
                  ))}
                </div>

                <div className="onboarding_panel__copy">
                  <h2 id={`onboarding-info-title-${slide.id}`} className="onboarding_panel__title">
                    {slide.titleLines.map((line) => (
                      <span key={line} className="onboarding_panel__title_line">
                        {line}
                      </span>
                    ))}
                  </h2>

                  <p className="onboarding_panel__description">
                    {slide.descriptionLines.map((line) => (
                      <span key={line} className="onboarding_panel__description_line">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="onboarding_panel__actions">
        <LoginButton aria-label="로그인" onClick={onLogin} />
        <SignupButton aria-label="회원가입" onClick={onSignup} />
      </div>
    </section>
  )
}
