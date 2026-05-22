import { useEffect, useState } from 'react'
import arrowRIcon from '../../asset/icons/arrow_r.svg'
import guestImage from '../../asset/images/match_guest.png'
import guestJoinImage from '../../asset/images/match_guest03.png'
import guestWantedImage from '../../asset/images/match_guest02.png'
import soloImage from '../../asset/images/match_solo.png'
import teamImage from '../../asset/images/match_team.png'

type MatchKind = 'personal' | 'team' | 'guest'
type SheetStep = 'type' | 'guest'
type GuestFlow = 'wanted' | 'join'

type SheetOption = {
  value: MatchKind
  label: string
  description: string[]
  imageSrc: string
  hasNext: boolean
  guestFlow?: GuestFlow
}

const options: SheetOption[] = [
  {
    value: 'personal',
    label: '개인',
    description: ['혼자 참여하거나', '개인적으로 매치를 만들어보세요.'],
    imageSrc: soloImage,
    hasNext: false,
  },
  {
    value: 'team',
    label: '팀',
    description: ['팀 단위로 매치를 만들고', '상대를 모집해보세요.'],
    imageSrc: teamImage,
    hasNext: false,
  },
  {
    value: 'guest',
    label: '용병',
    description: ['용병을 구하거나', '용병으로 합류하는 일정입니다.'],
    imageSrc: guestImage,
    hasNext: true,
  },
]

const guestOptions: SheetOption[] = [
  {
    value: 'guest',
    label: '빈자리 있어요',
    description: ['함께할 용병을 구해요'],
    imageSrc: guestWantedImage,
    hasNext: true,
    guestFlow: 'wanted',
  },
  {
    value: 'guest',
    label: '제가 갈게요',
    description: ['팀에 비어있는 자리에 합류할게요'],
    imageSrc: guestJoinImage,
    hasNext: true,
    guestFlow: 'join',
  },
]

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (kind: MatchKind, guestFlow?: GuestFlow) => void
}

export function MatchTypeSheet({ open, onClose, onSelect }: Props) {
  const [step, setStep] = useState<SheetStep>('type')
  const [isAnimatingNext, setIsAnimatingNext] = useState(false)

  useEffect(() => {
    if (open) {
      setStep('type')
      setIsAnimatingNext(false)
    }
  }, [open])

  if (!open) return null

  const handleSelect = (option: SheetOption) => {
    if (!option.hasNext) {
      return
    }

    if (option.value === 'guest' && step === 'type') {
      setIsAnimatingNext(true)
      setStep('guest')
      return
    }

    onSelect(option.value, option.guestFlow)
  }

  const currentOptions = step === 'guest' ? guestOptions : options

  return (
    <>
      <div className="mts_backdrop" onClick={onClose} aria-hidden="true" />
      <div className="mts_sheet" role="dialog" aria-modal="true" aria-label="유형 선택">
        <div className="mts_step_view">
          <div
            className={`mts_step ${isAnimatingNext ? 'is_entering_next' : ''}`}
            key={step}
            onAnimationEnd={() => setIsAnimatingNext(false)}
          >
            <h2 className="mts_title">유형 선택</h2>
            <div className="mts_info" aria-label="매치 유형">
              {currentOptions.map((opt) => (
                <button
                  key={`${step}-${opt.label}`}
                  className={`mts_option ${!opt.hasNext ? 'is_unavailable' : ''}`}
                  type="button"
                  aria-disabled={!opt.hasNext}
                  onClick={() => handleSelect(opt)}
                >
                  <img className="mts_option_image" src={opt.imageSrc} alt="" aria-hidden="true" />
                  <div className="mts_option_text">
                    <strong className="mts_option_label body_sb_24">{opt.label}</strong>
                    <span className="mts_option_desc body_m_16">
                      {opt.description.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </span>
                  </div>
                  <img className="mts_option_arrow" src={arrowRIcon} alt="" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
