import { useEffect, useState } from 'react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import arrowLeftIcon from '../../asset/icons/arrow_l.svg'
import buddyCalendarIcon from '../../asset/icons/buddy_cal.png'
import buddyCheckIcon from '../../asset/icons/buddy_check.svg'
import buddyShieldIcon from '../../asset/icons/buddy_shield.svg'
import buddySmileIcon from '../../asset/icons/buddy_smile.svg'
import buddyHeroDark from '../../asset/images/buddy_bg_d.png'
import buddyHeroLight from '../../asset/images/buddy_bg_l.png'
import buddyLoadingFigmaBg from '../../asset/images/buddy_loading_figma_bg.png'
import buddyProfileOne from '../../asset/images/buddy_profile_img01.png'
import buddyProfileTwo from '../../asset/images/buddy_profile_img02.png'
import buddyProfileThree from '../../asset/images/buddy_profile_img03.png'
import buddyProfileFour from '../../asset/images/buddy_profile_img04.png'
import buddyProfileFive from '../../asset/images/buddy_profile_img05.png'
import { PageHeader } from '../../components/PageHeader'
import { useThemeMode } from '../../hooks/useThemeMode'
import { getMyMatches, type MyMatchItem } from '../my/myMatchData'
import {
  buddyButtonHover,
  buddyButtonTap,
  buddyCardVariants,
  buddyChipVariants,
  buddyInViewViewport,
  buddySectionVariants,
  buddyStaggerContainerVariants,
  buddySurfaceVariants,
} from './buddyFindMotion'
import './BuddyFind.css'

type ScheduleItem = {
  id: string
  matchId: string
  date: string
  place: string
  memberCount: string
  summaryLabel?: string
  to: string
}

type FilterOption = {
  id: string
  label: string
}

type BuddyRecommendation = {
  id: string
  name: string
  region: string
  experience: string
  manner: string
  rating: string
  image: string
}

type BuddyReview = {
  id: string
  author: string
  tag: string
  body: string
  date: string
}

const MOCK_SCHEDULES: ScheduleItem[] = [] /*
  {
    id: 1,
    date: '5/23 (토) 13:00',
    place: '서울 CQB 아레나',
    memberCount: '8 / 12명',
    summaryLabel: '5/23 (토) 13:30 서울 CQB 아레나',
  },
  {
    id: 2,
    date: '5/24 (일) 15:00',
    place: '인천 필드 전장',
    memberCount: '5 / 10명',
  },
  {
    id: 3,
    date: '5/26 (화) 18:30',
    place: '송파 택티컬존',
    memberCount: '10 / 14명',
  },
  {
    id: 4,
    date: '5/27 (수) 14:00',
    place: '수원 밀심 필드',
    memberCount: '4 / 8명',
  },
]

*/

const HELP_OPTIONS: FilterOption[] = [
  { id: 'equipment', label: '장비' },
  { id: 'rules', label: '룰·안전' },
  { id: 'adaptation', label: '적응 도움' },
  { id: 'position', label: '포지션 추천' },
  { id: 'teamplay', label: '팀플레이' },
  { id: 'solo', label: '개인전' },
]

const EXP_OPTIONS: FilterOption[] = [
  { id: 'first', label: '처음 참여' },
  { id: 'one-two', label: '1~2회 참여' },
  { id: 'three-plus', label: '3회 이상' },
]

const BUDDY_RECOMMENDATIONS: BuddyRecommendation[] = [
  {
    id: 'buddy-buddy',
    name: '버디버디',
    region: '경기도',
    experience: '안내 9회',
    manner: '우수',
    rating: '4.8',
    image: buddyProfileOne,
  },
  {
    id: 'tacti-bear',
    name: '택티곰',
    region: '서울',
    experience: '안내 2회',
    manner: '우수',
    rating: '4.9',
    image: buddyProfileTwo,
  },
  {
    id: 'lime-shot',
    name: '라임샷',
    region: '경기도',
    experience: '안내 9회',
    manner: '우수',
    rating: '4.7',
    image: buddyProfileThree,
  },
  {
    id: 'magnum',
    name: '매그넘',
    region: '경기도',
    experience: '안내 6회',
    manner: '우수',
    rating: '4.2',
    image: buddyProfileFour,
  },
  {
    id: 'kill-shopping',
    name: '킬샷핑',
    region: '경기도',
    experience: '안내 7회',
    manner: '우수',
    rating: '4.0',
    image: buddyProfileFive,
  },
]

const BUDDY_DETAIL_REVIEWS: BuddyReview[] = [
  {
    id: 'review-01',
    author: '화가난빵아리',
    tag: 'CQB',
    body: '입문자인데 끝까지 잘 알려줬어요.\n덕분에 정말 재미있게 플레이했습니다!',
    date: '2026.05.11',
  },
  {
    id: 'review-02',
    author: '착한사람',
    tag: '팀플레이',
    body: '팀 분위기를 잘 이끌어줘서 편하게\n집중할 수 있었어요. 최고!',
    date: '2026.05.09',
  },
  {
    id: 'review-03',
    author: '에어소프트초보',
    tag: '필드적응',
    body: '처음 가는 필드였는데 지형이랑 전략까지\n세심하게 케어해줘서 든든했어요.',
    date: '2026.05.08',
  },
]

const BUDDY_DETAIL_TAGS = ['공격형', '팀플레이', 'CQB 전문', '입문자 친화', '커뮤니케이션 우수', '전략적 플레이']

function createScheduleItem(match: MyMatchItem): ScheduleItem {
  const scheduleLabel = match.detail.split(' I ')[0] || match.time

  return {
    id: match.id,
    matchId: match.matchId,
    date: scheduleLabel,
    place: match.fieldName || match.title,
    memberCount: `${match.currentParticipants} / ${match.maxParticipants}명`,
    summaryLabel: `${scheduleLabel} ${match.fieldName || match.title}`,
    to: match.to,
  }
}

function getUpcomingBuddySchedules() {
  const schedules = getMyMatches()
    .filter((match) => match.status !== 'past')
    .map(createScheduleItem)

  return schedules.length > 0 ? schedules : MOCK_SCHEDULES
}

export function BuddyFind() {
  const navigate = useNavigate()
  const themeMode = useThemeMode()
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => getUpcomingBuddySchedules())
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(() => schedules[0]?.id ?? null)
  const [selectedHelpIds, setSelectedHelpIds] = useState<string[]>(['equipment', 'rules'])
  const [selectedExpId, setSelectedExpId] = useState<string>('first')

  const selectedSchedule =
    schedules.find((schedule) => schedule.id === selectedScheduleId) ?? null
  const selectedHelpOptions = HELP_OPTIONS.filter((option) => selectedHelpIds.includes(option.id))
  const selectedExpOption = EXP_OPTIONS.find((option) => option.id === selectedExpId) ?? null
  const isReadyToStart =
    selectedSchedule !== null && selectedHelpOptions.length > 0 && selectedExpOption !== null

  useEffect(() => {
    const refreshSchedules = () => {
      const nextSchedules = getUpcomingBuddySchedules()

      setSchedules(nextSchedules)
      setSelectedScheduleId((currentId) => {
        if (currentId && nextSchedules.some((schedule) => schedule.id === currentId)) {
          return currentId
        }

        return nextSchedules[0]?.id ?? null
      })
    }

    refreshSchedules()
    window.addEventListener('focus', refreshSchedules)
    window.addEventListener('storage', refreshSchedules)
    window.addEventListener('pageshow', refreshSchedules)

    return () => {
      window.removeEventListener('focus', refreshSchedules)
      window.removeEventListener('storage', refreshSchedules)
      window.removeEventListener('pageshow', refreshSchedules)
    }
  }, [])

  const toggleHelpOption = (targetId: string) => {
    setSelectedHelpIds((currentIds) =>
      currentIds.includes(targetId)
        ? currentIds.filter((id) => id !== targetId)
        : [...currentIds, targetId],
    )
  }

  return (
    <LazyMotion features={domAnimation}>
      <article className="buddy_find_page">
        <PageHeader
          variant={themeMode === 'dark' ? 'dark' : 'default'}
          className="buddy_find_header"
          onBack={() => navigate('/home')}
          backLabel="뒤로 가기"
          title="버디 찾기"
        />

        <section className="buddy_find_hero" aria-label="버디 매칭 소개">
          <img
            className="buddy_find_hero__art"
            src={themeMode === 'dark' ? buddyHeroDark : buddyHeroLight}
            alt=""
            aria-hidden="true"
          />
          <div className="buddy_find_hero__info">
            <p className="buddy_find_hero__title">
              같은 게임 참가자와
              <br />
              버디 매칭을 시작해보세요
            </p>
          </div>
        </section>

        <m.section
          className="buddy_find_section"
          aria-labelledby="buddy_find_step_01"
          initial="hidden"
          whileInView="visible"
          viewport={buddyInViewViewport}
          variants={buddySectionVariants}
        >
          <div className="buddy_find_section__header">
            <span className="buddy_find_section__badge" aria-hidden="true">
              1
            </span>
            <h2 className="buddy_find_section__title" id="buddy_find_step_01">
              다가오는 매치 선택
            </h2>
          </div>
          <p className="buddy_find_section__desc">
            일정 예약 시 <span>버디 필요를 체크</span>하면 함께할 버디를 연결해드려요
          </p>

          <m.div
            className="buddy_find_schedule_list"
            aria-label="다가오는 매치 목록"
            variants={buddyStaggerContainerVariants}
          >
            {schedules.map((schedule) => {
              const isSelected = schedule.id === selectedScheduleId

              return (
                <m.article
                  key={schedule.id}
                  className={[
                    'buddy_find_schedule_card',
                    'buddy_find_motion_surface',
                    isSelected ? 'buddy_find_schedule_card--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  variants={buddyCardVariants}
                >
                  <div className="buddy_find_schedule_card__content">
                    <div className="buddy_find_schedule_card__icon_wrap" aria-hidden="true">
                      <img src={buddyCalendarIcon} alt="" />
                    </div>
                    <div className="buddy_find_schedule_card__text">
                      <p className="buddy_find_schedule_card__date">{schedule.date}</p>
                      <p className="buddy_find_schedule_card__place">{schedule.place}</p>
                      <p className="buddy_find_schedule_card__count">{schedule.memberCount}</p>
                    </div>
                  </div>
                  <div className="buddy_find_schedule_card__divider" role="separator" />
                  <m.button
                    className="buddy_find_schedule_card__action buddy_find_motion_button"
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedScheduleId(schedule.id)}
                    whileHover={buddyButtonHover}
                    whileTap={buddyButtonTap}
                  >
                    일정 선택
                  </m.button>
                </m.article>
              )
            })}
          </m.div>
        </m.section>

        <m.div
          className="buddy_find_more"
          initial="hidden"
          whileInView="visible"
          viewport={buddyInViewViewport}
          variants={buddySurfaceVariants}
        >
          <m.button
            className="buddy_find_more__button buddy_find_motion_button"
            type="button"
            onClick={() => navigate('/match', { state: { scrollTo: 'schedule', returnTo: '/buddy' } })}
            whileHover={buddyButtonHover}
            whileTap={buddyButtonTap}
          >
            <div className="buddy_find_more__left">
              <span className="buddy_find_more__icon_wrap" aria-hidden="true">
                <img src={buddyCalendarIcon} alt="" />
              </span>
              <span className="buddy_find_more__label">다른 날짜의 게임 찾기</span>
            </div>
            <img
              className="buddy_find_more__arrow"
              src={arrowLeftIcon}
              alt=""
              aria-hidden="true"
            />
          </m.button>
        </m.div>

        <m.section
          className="buddy_find_section buddy_find_section--filters"
          aria-labelledby="buddy_find_step_02"
          initial="hidden"
          whileInView="visible"
          viewport={buddyInViewViewport}
          variants={buddySectionVariants}
        >
          <div className="buddy_find_section__header">
            <span className="buddy_find_section__badge" aria-hidden="true">
              2
            </span>
            <h2 className="buddy_find_section__title" id="buddy_find_step_02">
              버디 매칭 설정
            </h2>
          </div>
          <p className="buddy_find_section__desc buddy_find_section__desc--stacked">
            도움이 필요한 항목과 경험 수준을 선택하면
            <br />
            더 잘 맞는 버디를 추천해드려요
          </p>

          <m.div
            className="buddy_find_filter_card buddy_find_motion_surface"
            variants={buddySurfaceVariants}
          >
            <div className="buddy_find_filter_group">
              <h3 className="buddy_find_filter_title">
                도움이 필요한 부분 <span>(복수 선택)</span>
              </h3>
              <div className="buddy_find_filter_grid">
                {HELP_OPTIONS.map((option) => (
                  <m.button
                    key={option.id}
                    type="button"
                    className={[
                      'buddy_find_filter_button',
                      'buddy_find_motion_button',
                      selectedHelpIds.includes(option.id) ? 'buddy_find_filter_button--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={selectedHelpIds.includes(option.id)}
                    onClick={() => toggleHelpOption(option.id)}
                    whileHover={buddyButtonHover}
                    whileTap={buddyButtonTap}
                  >
                    {option.label}
                  </m.button>
                ))}
              </div>
            </div>
          </m.div>

          <m.div
            className="buddy_find_filter_card buddy_find_motion_surface"
            variants={buddySurfaceVariants}
          >
            <div className="buddy_find_filter_group">
              <h3 className="buddy_find_filter_title">플레이 경험 수준</h3>
              <div className="buddy_find_filter_grid">
                {EXP_OPTIONS.map((option) => (
                  <m.button
                    key={option.id}
                    type="button"
                    className={[
                      'buddy_find_filter_button',
                      'buddy_find_motion_button',
                      selectedExpId === option.id ? 'buddy_find_filter_button--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={selectedExpId === option.id}
                    onClick={() => setSelectedExpId(option.id)}
                    whileHover={buddyButtonHover}
                    whileTap={buddyButtonTap}
                  >
                    {option.label}
                  </m.button>
                ))}
              </div>
            </div>
          </m.div>
        </m.section>

        <m.section
          className="buddy_find_section buddy_find_section--summary"
          aria-labelledby="buddy_find_step_03"
          initial="hidden"
          whileInView="visible"
          viewport={buddyInViewViewport}
          variants={buddySectionVariants}
        >
          <div className="buddy_find_section__header">
            <span className="buddy_find_section__badge" aria-hidden="true">
              3
            </span>
            <h2 className="buddy_find_section__title" id="buddy_find_step_03">
              선택 요약
            </h2>
          </div>

          <m.div
            className="buddy_find_summary_card buddy_find_motion_surface"
            variants={buddySurfaceVariants}
          >
            {selectedSchedule ? (
              <m.button
                className="buddy_find_summary_chip buddy_find_summary_chip--schedule buddy_find_motion_button"
                type="button"
                onClick={() => setSelectedScheduleId(null)}
                variants={buddyChipVariants}
                whileHover={buddyButtonHover}
                whileTap={buddyButtonTap}
              >
                <span className="buddy_find_summary_chip__left">
                  <img src={buddyCalendarIcon} alt="" aria-hidden="true" />
                  <span>
                    {selectedSchedule.summaryLabel ??
                      `${selectedSchedule.date} ${selectedSchedule.place}`}
                  </span>
                </span>
                <span className="buddy_find_summary_chip__close" aria-hidden="true">
                  ×
                </span>
              </m.button>
            ) : null}

            <m.div className="buddy_find_summary_row" variants={buddyStaggerContainerVariants}>
              {selectedHelpOptions.map((option) => (
                <m.button
                  key={option.id}
                  className="buddy_find_summary_chip buddy_find_motion_button"
                  type="button"
                  onClick={() =>
                    setSelectedHelpIds((currentIds) =>
                      currentIds.filter((id) => id !== option.id),
                    )
                  }
                  whileHover={buddyButtonHover}
                  whileTap={buddyButtonTap}
                >
                  <span>{option.label}</span>
                  <span className="buddy_find_summary_chip__close" aria-hidden="true">
                    ×
                  </span>
                </m.button>
              ))}

              {selectedExpOption ? (
                <m.button
                  key={selectedExpOption.id}
                  className="buddy_find_summary_chip buddy_find_motion_button"
                  type="button"
                  onClick={() => setSelectedExpId('')}
                  whileHover={buddyButtonHover}
                  whileTap={buddyButtonTap}
                >
                  <span>{selectedExpOption.label}</span>
                  <span className="buddy_find_summary_chip__close" aria-hidden="true">
                    ×
                  </span>
                </m.button>
              ) : null}
            </m.div>
          </m.div>
        </m.section>

        <m.div
          className="buddy_find_footer"
          initial="hidden"
          whileInView="visible"
          viewport={buddyInViewViewport}
          variants={buddySurfaceVariants}
        >
          <m.button
            className="buddy_find_start_button buddy_find_motion_button"
            type="button"
            disabled={!isReadyToStart}
            onClick={() => navigate('/buddy/loading')}
            whileHover={isReadyToStart ? buddyButtonHover : undefined}
            whileTap={isReadyToStart ? buddyButtonTap : undefined}
          >
            버디 추천 시작
          </m.button>
        </m.div>
      </article>
    </LazyMotion>
  )
}

export function BuddyLoading() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/buddy/recommend')
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [navigate])

  return (
    <article
      className="buddy_loading_page"
      aria-live="polite"
      aria-busy="true"
    >
      {/* 왼쪽 상단: 방패 + 체크 아이콘 */}
      <span className="buddy_loading_deco_icon deco_shield" aria-hidden="true">
        <img className="buddy_loading_deco_image buddy_loading_deco_image--shield" src={buddyShieldIcon} alt="" />
      </span>

      {/* 상단 중앙: 원형 체크 아이콘 */}
      <span className="buddy_loading_deco_icon deco_check" aria-hidden="true">
        <img className="buddy_loading_deco_image buddy_loading_deco_image--check" src={buddyCheckIcon} alt="" />
      </span>

      {/* 오른쪽 상단: 스마일 아이콘 */}
      <span className="buddy_loading_deco_icon deco_smile" aria-hidden="true">
        <img className="buddy_loading_deco_image" src={buddySmileIcon} alt="" />
      </span>

      {/* 파티클 */}
      <span className="buddy_loading_particle lp1" aria-hidden="true">✦</span>
      <span className="buddy_loading_particle lp2" aria-hidden="true">+</span>
      <span className="buddy_loading_particle lp3" aria-hidden="true">•</span>
      <span className="buddy_loading_particle lp4" aria-hidden="true">✦</span>
      <span className="buddy_loading_particle lp5" aria-hidden="true">+</span>
      <span className="buddy_loading_particle lp6" aria-hidden="true">•</span>
      <span className="buddy_loading_particle lp7" aria-hidden="true">✦</span>
      <span className="buddy_loading_particle lp8" aria-hidden="true">•</span>

      <section className="buddy_loading_text">
        <h1>
          버디 찾는 중
          <span className="buddy_loading_dots" aria-hidden="true">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </h1>
        <p>
          당신에게 맞는 버디를 찾고있어요
          <br />
          잠시만 기다려주세요
        </p>
      </section>

      <div className="buddy_loading_visual_frame" aria-hidden="true">
        <img className="buddy_loading_visual" src={buddyLoadingFigmaBg} alt="" />
      </div>

      <div className="buddy_loading_progress" aria-hidden="true">
        <div className="buddy_loading_progress__bar" />
      </div>
    </article>
  )
}

export function BuddyRecommend() {
  const navigate = useNavigate()
  const themeMode = useThemeMode()
  const isLightMode = themeMode === 'light'

  return (
    <LazyMotion features={domAnimation}>
      <article className={`buddy_recommend_page${isLightMode ? ' buddy_recommend_page--light' : ''}`}>
      <PageHeader
        variant={isLightMode ? 'default' : 'dark'}
        className="buddy_recommend_header"
        onBack={() => navigate('/buddy')}
        backLabel="버디 찾기로 돌아가기"
        title="추천 버디"
      />

      <section className="buddy_recommend_intro">
        <p>가장 적합한 순서대로 안내해 드릴게요</p>
      </section>

      <section className="buddy_recommend_list_section" aria-label="추천 버디 목록">
        <m.div
          className="buddy_recommend_list"
          initial="hidden"
          animate="visible"
          variants={buddyStaggerContainerVariants}
        >
          {BUDDY_RECOMMENDATIONS.map((buddy) => (
            <m.button
              className="buddy_recommend_card"
              type="button"
              key={buddy.id}
              onClick={() => navigate(`/buddy/recommend/${buddy.id}`)}
              variants={buddyCardVariants}
              whileTap={buddyButtonTap}
            >
              <span className="buddy_recommend_card__main">
                <img className="buddy_recommend_card__avatar" src={buddy.image} alt="" />
                <span className="buddy_recommend_card__info">
                  <strong className="buddy_recommend_card__name">{buddy.name}</strong>
                  <span className="buddy_recommend_card__meta">
                    <span>
                      <b>지역</b>
                      <span>{buddy.region}</span>
                    </span>
                    <span>
                      <b>경험</b>
                      <span>{buddy.experience}</span>
                    </span>
                    <span>
                      <b>매너</b>
                      <span>{buddy.manner}</span>
                    </span>
                  </span>
                  <span className="buddy_recommend_card__rating">
                    <span aria-hidden="true">★</span>
                    {buddy.rating}
                  </span>
                </span>
              </span>
              <span className="buddy_recommend_card__arrow" aria-hidden="true" />
            </m.button>
          ))}
        </m.div>
      </section>
      </article>
    </LazyMotion>
  )
}

type RequestModalStep = 'form' | 'success'

function BuddyRequestModal({
  buddy,
  onClose,
}: {
  buddy: BuddyRecommendation
  onClose: () => void
}) {
  const navigate = useNavigate()
  const [step, setStep] = useState<RequestModalStep>('form')
  const [message, setMessage] = useState('')
  const MAX_LENGTH = 80

  const handleSubmit = () => {
    setStep('success')
  }

  const handleConfirm = () => {
    onClose()
    navigate('/home')
  }

  return (
    <div className="buddy_request_overlay" onClick={step === 'form' ? onClose : undefined}>
      <div className="buddy_request_sheet" onClick={(e) => e.stopPropagation()}>
        <div className="buddy_request_handle" aria-hidden="true" />

        {step === 'form' ? (
          <div className="buddy_request_form">
            <h2 className="buddy_request_title">
              버디에게
              <br />
              <em>플레이 요청</em> 보내기
            </h2>
            <p className="buddy_request_desc">
              함께 플레이하고 싶은 이유나
              <br />
              간단한 인사를 남겨보세요
            </p>
            <div className="buddy_request_textarea_wrap">
              <textarea
                className="buddy_request_textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
                placeholder="안녕하세요! 이번 주말 CQB&#10;함께 플레이해보고 싶어요 🙌"
                rows={4}
              />
              <span className="buddy_request_counter">
                {message.length}/{MAX_LENGTH}
              </span>
            </div>
            <p className="buddy_request_info">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="7" stroke="#adadad" strokeWidth="1.5" />
                <rect x="7.25" y="7" width="1.5" height="5" rx="0.75" fill="#adadad" />
                <rect x="7.25" y="4.5" width="1.5" height="1.5" rx="0.75" fill="#adadad" />
              </svg>
              상대방이 수락하면 채팅이 열려요
            </p>
            <div className="buddy_request_actions">
              <button className="buddy_request_btn buddy_request_btn--cancel" type="button" onClick={onClose}>
                취소
              </button>
              <button className="buddy_request_btn buddy_request_btn--submit" type="button" onClick={handleSubmit}>
                버디 요청하기
              </button>
            </div>
          </div>
        ) : (
          <div className="buddy_request_success">
            <div className="buddy_request_radar" aria-hidden="true">
              <span className="buddy_request_radar__ring buddy_request_radar__ring--1" />
              <span className="buddy_request_radar__ring buddy_request_radar__ring--2" />
              <span className="buddy_request_radar__ring buddy_request_radar__ring--3" />
              <span className="buddy_request_radar__dot" />
              <svg className="buddy_request_radar__check" width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#e2fd34" strokeWidth="3" />
                <path d="M20 32L28 40L44 24" stroke="#e2fd34" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="buddy_request_success__title">
              버디 요청을
              <br />
              <em>보냈어요!</em>
            </h2>
            <p className="buddy_request_success__desc">
              {buddy.name}님이 요청을 확인하고 있어요
              <br />
              수락 시 채팅이 자동으로 열립니다
            </p>
            <button className="buddy_request_btn buddy_request_btn--confirm" type="button" onClick={handleConfirm}>
              확인
            </button>
            <button className="buddy_request_btn--home" type="button" hidden aria-hidden="true" tabIndex={-1} onClick={handleConfirm}>
              홈으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function BuddyDetail() {
  const navigate = useNavigate()
  const { buddyId } = useParams()
  const themeMode = useThemeMode()
  const isLightMode = themeMode === 'light'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const buddy =
    BUDDY_RECOMMENDATIONS.find((recommendation) => recommendation.id === buddyId) ??
    BUDDY_RECOMMENDATIONS[0]

  return (
    <LazyMotion features={domAnimation}>
      <article className={`buddy_detail_page${isLightMode ? ' buddy_detail_page--light' : ''}`}>
      <PageHeader
        variant={isLightMode ? 'default' : 'dark'}
        className="buddy_detail_header"
        onBack={() => navigate('/buddy/recommend')}
        backLabel="추천 버디로 돌아가기"
        title="버디 상세"
      />

      <m.main
        className="buddy_detail_content"
        initial="hidden"
        animate="visible"
        variants={buddyStaggerContainerVariants}
      >
        <m.section
          className="buddy_detail_profile"
          aria-label={`${buddy.name} 프로필`}
          variants={buddyCardVariants}
        >
          <div className="buddy_detail_avatar_wrap">
            <img className="buddy_detail_avatar" src={buddy.image} alt="" />
          </div>

          <div className="buddy_detail_identity">
            <h1>{buddy.name}</h1>
            <p className="buddy_detail_rating">
              <span aria-hidden="true">★</span>
              {buddy.rating}
            </p>
          </div>
        </m.section>

        <m.section
          className="buddy_detail_styles"
          aria-labelledby="buddy_detail_styles_title"
          variants={buddySurfaceVariants}
        >
          <h2 id="buddy_detail_styles_title">버디의 플레이 스타일</h2>
          <m.div className="buddy_detail_tag_list" variants={buddyStaggerContainerVariants}>
            {BUDDY_DETAIL_TAGS.map((tag) => (
              <m.span key={tag} variants={buddyChipVariants}>{tag}</m.span>
            ))}
          </m.div>
        </m.section>

        <m.section className="buddy_detail_quote" variants={buddySurfaceVariants}>
          <span aria-hidden="true">“</span>
          <p>
            저와 함께 다니면
            <br />
            모든 분들이 행복하고 즐거워합니다.
          </p>
          <span aria-hidden="true">”</span>
        </m.section>

        <m.section className="buddy_detail_stats" aria-label="버디 활동 정보" variants={buddySurfaceVariants}>
          <div>
            <p>안내 완료</p>
            <strong>9회</strong>
          </div>
          <div>
            <p>선호 플레이</p>
            <strong>CQB</strong>
          </div>
          <div>
            <p>매너도</p>
            <strong>우수</strong>
          </div>
          <div>
            <p>응답 속도</p>
            <strong>빠름</strong>
          </div>
        </m.section>

        <m.section
          className="buddy_detail_reviews"
          aria-labelledby="buddy_detail_reviews_title"
          variants={buddySurfaceVariants}
        >
          <div className="buddy_detail_section_header">
            <h2 id="buddy_detail_reviews_title">최근 플레이 후기</h2>
          </div>
          <m.div className="buddy_detail_review_list" variants={buddyStaggerContainerVariants}>
            {BUDDY_DETAIL_REVIEWS.map((review) => (
              <m.article className="buddy_detail_review_card" key={review.id} variants={buddyCardVariants}>
                <div className="buddy_detail_review_top">
                  <div className="buddy_detail_reviewer">
                    <span aria-hidden="true" />
                    <strong>{review.author}</strong>
                  </div>
                  <span className="buddy_detail_review_stars" aria-label="별점 5점">
                    ★★★★★
                  </span>
                </div>
                <span className="buddy_detail_review_tag">{review.tag}</span>
                <p>
                  {review.body.split('\n').map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
                <time>{review.date}</time>
              </m.article>
            ))}
          </m.div>
        </m.section>

        <m.button
          className="buddy_detail_request"
          type="button"
          onClick={() => setIsModalOpen(true)}
          variants={buddyCardVariants}
          whileHover={buddyButtonHover}
          whileTap={buddyButtonTap}
        >
          버디 요청하기
        </m.button>
      </m.main>

      {isModalOpen && (
        <BuddyRequestModal buddy={buddy} onClose={() => setIsModalOpen(false)} />
      )}
      </article>
    </LazyMotion>
  )
}
