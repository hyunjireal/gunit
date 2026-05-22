import onboardingLogo from '../../asset/images/onboarding_logo.png'
import onboarding01Video from '../../asset/video/onboarding01.mp4'
import { StartButton } from '../../components/StartButton'

type IntroScreenProps = {
  onStart: () => void
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <section className="onboarding_intro" aria-labelledby="onboarding-title">
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
          <img className="onboarding_intro__logo" src={onboardingLogo} alt="" aria-hidden="true" />

          <h1 id="onboarding-title" className="onboarding_intro__title">
            <span className="onboarding_intro__title_line onboarding_intro__title_line--accent">
              에어소프트 건,
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

        <div className="onboarding_intro__button_wrap">
          <StartButton aria-label="시작하기" onClick={onStart} />
        </div>
      </div>
    </section>
  )
}
