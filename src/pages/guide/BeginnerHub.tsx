import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import arrowDownIcon from '../../asset/icons/arrow_down.svg'
import arrowRightIcon from '../../asset/icons/arrow_r.svg'
import bookIcon from '../../asset/icons/com_book.svg'
import safetyBadgeIcon from '../../asset/icons/com_safety.svg'
import guideHandImage from '../../asset/images/guide_hand.png'
import guideRuleImage from '../../asset/images/guide_rule.png'
import guideSafeImage from '../../asset/images/guide_safe.png'
import { beginnerGuideSections } from '../../data/beginnerGuideSections'
import './Guide.css'

const guideTips = [
  {
    id: 'safety',
    title: '안전이 최우선',
    description: ['보안경 착용은', '선택이 아닌 필수!'],
    image: guideSafeImage,
  },
  {
    id: 'rules',
    title: '규칙을 기억해요',
    description: ['규칙을 지키는 사람이', '멋진 플레이어입니다'],
    image: guideRuleImage,
  },
  {
    id: 'respect',
    title: '서로 존중해요',
    description: ['배려와 존중이', '게임을 더 즐겁게!'],
    image: guideHandImage,
  },
] as const

type BeginnerGuideLocationState = {
  returnTo?: string
  fromChatReturn?: boolean
}

function getSafeGuideReturnPath(path?: string) {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/chat') || path.startsWith('/guide')) {
    return '/community'
  }

  return path
}

export function BeginnerHub() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as BeginnerGuideLocationState | null
  const returnTo = getSafeGuideReturnPath(locationState?.returnTo)
  const [openSectionId, setOpenSectionId] = useState<string | null>(null)

  const goBack = () => {
    navigate(returnTo, { replace: Boolean(locationState?.fromChatReturn) })
  }

  const toggleSection = (sectionId: string) => {
    setOpenSectionId((currentId) => (currentId === sectionId ? null : sectionId))
  }

  return (
    <div className="beginner_guide_page">
      <PageHeader
        title="초보자 가이드"
        onBack={goBack}
      />

      <div className="beginner_guide_content">
      <section className="beginner_guide_tips" aria-labelledby="beginner-guide-tips-title">
        <div className="beginner_guide_tips_label" id="beginner-guide-tips-title">
          <img src={safetyBadgeIcon} alt="" aria-hidden="true" />
          <span>초보자 팁</span>
        </div>

        <div className="beginner_guide_tips_grid">
          {guideTips.map((tip) => (
            <article className="beginner_guide_tip_card" key={tip.id}>
              <img className="beginner_guide_tip_image" src={tip.image} alt="" aria-hidden="true" />
              <strong>{tip.title}</strong>
              <p>
                {tip.description.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="beginner_guide_section_list" aria-label="초보자 가이드 목록">
        {beginnerGuideSections.map((section) => {
          const isOpen = openSectionId === section.id
          const contentId = `beginner-guide-panel-${section.id}`

          return (
            <article className={`beginner_guide_section_card${isOpen ? ' is_open' : ''}`} key={section.id}>
              <button
                className="beginner_guide_section_button"
                type="button"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => toggleSection(section.id)}
              >
                <div className="beginner_guide_section_heading">
                  <span className="beginner_guide_section_number">{section.number}</span>
                  <span className="beginner_guide_section_title">{section.title}</span>
                </div>
                <img
                  className="beginner_guide_section_chevron"
                  src={arrowDownIcon}
                  alt=""
                  aria-hidden="true"
                />
              </button>

              <div
                className={`beginner_guide_section_panel_wrap${isOpen ? ' is_open' : ''}`}
                id={contentId}
                aria-hidden={!isOpen}
              >
                <div className="beginner_guide_section_panel">
                  <p className="beginner_guide_section_summary">{section.summary}</p>
                  <ul className="beginner_guide_section_points">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <Link
        className="beginner_guide_help_card"
        to="/chat"
        state={{
          returnTo: '/guide',
          returnState: {
            returnTo,
            fromChatReturn: true,
          },
        }}
      >
        <div className="beginner_guide_help_card_left">
          <img className="beginner_guide_help_icon" src={bookIcon} alt="" aria-hidden="true" />
          <div className="beginner_guide_help_copy">
            <strong>더 도움이 필요하신가요?</strong>
            <p>
              <span>궁금한 내용은</span>
              <span>AI 챗봇 가이에게 물어보세요.</span>
            </p>
          </div>
        </div>
        <img className="beginner_guide_help_arrow" src={arrowRightIcon} alt="" aria-hidden="true" />
      </Link>
      </div>
    </div>
  )
}
