import './OnboardingSlideFrame.css'

export type OnboardingCopySegment = {
  text: string
  accent?: boolean
  strong?: boolean
}

export type OnboardingCopyLine = {
  text?: string
  accent?: boolean
  strong?: boolean
  segments?: OnboardingCopySegment[]
}

export type OnboardingSlideFrameData = {
  id: string
  imageSrc: string
  imageClassName?: string
  overlayImageSrc?: string
  overlayImageClassName?: string
  copy: OnboardingCopyLine[]
}

type OnboardingSlideFrameProps = {
  activeIndex: number
  direction: 'next' | 'previous'
  logoSrc: string
  slide: OnboardingSlideFrameData
  slides: OnboardingSlideFrameData[]
}

function renderTextWithBreaks(text: string) {
  return text.split('\n').map((part, index, parts) => (
    <span key={`${part}-${index}`}>
      {part}
      {index < parts.length - 1 ? <br /> : null}
    </span>
  ))
}

function OnboardingCopy({ copy }: { copy: OnboardingCopyLine[] }) {
  return (
    <>
      {copy.map((line, lineIndex) => (
        <span
          key={`${line.text ?? 'segments'}-${lineIndex}`}
          className={[
            'onboarding_rebuilt__copy_line',
            line.accent ? 'is-accent' : '',
            line.strong ? 'is-strong' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {line.segments
            ? line.segments.map((segment, segmentIndex) => (
                <span
                  key={`${segment.text}-${segmentIndex}`}
                  className={[
                    'onboarding_rebuilt__copy_segment',
                    segment.accent ? 'is-accent' : '',
                    segment.strong ? 'is-strong' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {renderTextWithBreaks(segment.text)}
                </span>
              ))
            : renderTextWithBreaks(line.text ?? '')}
        </span>
      ))}
    </>
  )
}

export function OnboardingSlideFrame({
  activeIndex,
  direction,
  logoSrc,
  slide,
  slides,
}: OnboardingSlideFrameProps) {
  return (
    <div className="onboarding_rebuilt__content">
      <div className="onboarding_rebuilt__top">
        <div className="onboarding_rebuilt__dots" aria-label="온보딩 페이지">
          {slides.map((item, index) => (
            <button
              key={item.id}
              className={`onboarding_rebuilt__dot${activeIndex === index ? ' is-active' : ''}`}
              type="button"
              aria-label={`${index + 1}번째 온보딩 보기`}
              aria-current={activeIndex === index ? 'true' : undefined}
              tabIndex={-1}
            />
          ))}
        </div>
        <img className="onboarding_rebuilt__logo" src={logoSrc} alt="GUNIT" />
        <div
          className={['onboarding_rebuilt__visual', `onboarding_rebuilt__visual--${slide.id}`]
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
            key={`media-${slide.id}`}
            className={[
              'onboarding_rebuilt__slide_media',
              `onboarding_rebuilt__slide_media--${slide.id}`,
              `is-slide-${direction}`,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <img
              className={[
                'onboarding_rebuilt__image',
                `onboarding_rebuilt__image--${slide.id}-base`,
                slide.imageClassName,
              ]
                .filter(Boolean)
                .join(' ')}
              src={slide.imageSrc}
              alt=""
            />
            {slide.overlayImageSrc ? (
              <img
                className={[
                  'onboarding_rebuilt__image',
                  'onboarding_rebuilt__image--overlay',
                  `onboarding_rebuilt__image--${slide.id}-overlay`,
                  slide.overlayImageClassName,
                ]
                  .filter(Boolean)
                  .join(' ')}
                src={slide.overlayImageSrc}
                alt=""
              />
            ) : null}
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
          key={`copy-${slide.id}`}
          className={['onboarding_rebuilt__copy', `is-slide-${direction}`]
            .filter(Boolean)
            .join(' ')}
          id={`onboarding-title-${slide.id}`}
        >
          <OnboardingCopy copy={slide.copy} />
        </h1>
      </div>
    </div>
  )
}
