import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import './PointHistory.css'

type PointHistoryEntry = {
  id: string
  title: string
  description: string
  points: number
}

type PointHistoryDay = {
  id: string
  monthLabel: string
  dayLabel: string
  entries: PointHistoryEntry[]
}

const currentBalance = 2450
const expiringPoints = 320

const pointHistoryDays: PointHistoryDay[] = [
  {
    id: '2026-05-13',
    monthLabel: '5월',
    dayLabel: '13일',
    entries: [
      { id: 'signup', title: '첫 가입 완료', description: '신규 가입 보상', points: 500 },
      { id: 'buddy-match', title: '버디 매칭 완료', description: '버디 시스템', points: 100 },
      { id: 'field-booking', title: '경기 예약 완료', description: '강남 CQB 필드', points: 200 },
    ],
  },
  {
    id: '2026-05-12',
    monthLabel: '5월',
    dayLabel: '12일',
    entries: [
      { id: 'play-check', title: '경기 참여 완료', description: '플레이 인증', points: 400 },
      { id: 'invite-friend', title: '친구 초대 완료', description: '추천 코드 사용', points: 3000 },
      { id: 'community-hot', title: '커뮤니티 인기글 선정', description: '좋아요 30개 달성', points: 150 },
    ],
  },
  {
    id: '2026-05-11',
    monthLabel: '5월',
    dayLabel: '11일',
    entries: [
      { id: 'quiz', title: '초보자 퀴즈 완료', description: '입문자 가이드 퀴즈', points: 100 },
      { id: 'review-upload', title: '장비 후기 작성', description: '장비 리뷰 업로드', points: 120 },
      { id: 'manner-review', title: '상대방 매너 후기 작성', description: '매너 평가 완료', points: 50 },
    ],
  },
  {
    id: '2026-05-10',
    monthLabel: '5월',
    dayLabel: '10일',
    entries: [
      { id: 'first-play', title: '버디와 첫 경기 완료', description: '첫 활동 보너스', points: 600 },
      { id: 'accepted-answer', title: '초보자 질문 답변 채택', description: '질문 해결 완료', points: 150 },
      { id: 'profile-complete', title: '프로필 100% 작성 완료', description: '프로필 설정 완료', points: 100 },
    ],
  },
  {
    id: '2026-05-09',
    monthLabel: '5월',
    dayLabel: '9일',
    entries: [
      { id: 'field-review', title: '필드 리뷰 작성', description: '플레이 후기 등록', points: 120 },
      { id: 'first-chatbot', title: 'AI 챗봇 첫 사용', description: '입문 장비 추천', points: 80 },
      { id: 'saved-field', title: '관심 필드 저장', description: '맞춤 추천 활성화', points: 50 },
    ],
  },
  {
    id: '2026-05-08',
    monthLabel: '5월',
    dayLabel: '8일',
    entries: [
      { id: 'play-check-again', title: '경기 참여 완료', description: '플레이 인증', points: 400 },
      { id: 'schedule-share', title: '경기 일정 공유', description: '친구 초대 공유', points: 100 },
      { id: 'community-hot-20', title: '커뮤니티 인기글 선정', description: '좋아요 20개 달성', points: 120 },
    ],
  },
]

const pointFormatter = new Intl.NumberFormat('ko-KR')
const totalEarned = pointHistoryDays
  .flatMap((day) => day.entries)
  .reduce((sum, entry) => sum + entry.points, 0)
const totalActivities = pointHistoryDays.flatMap((day) => day.entries).length

function formatPoints(points: number) {
  return `${pointFormatter.format(points)}P`
}

function PointHistoryBadge({ small = false }: { small?: boolean }) {
  return (
    <span aria-hidden="true" className={`point_history_badge_icon${small ? ' is_small' : ''}`}>
      P
    </span>
  )
}

function InfoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="point_history_info_icon"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 6.55V10.1" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <circle cx="8" cy="4.3" r="0.9" fill="currentColor" />
    </svg>
  )
}

function SummaryStat({
  children,
  label,
  value,
}: {
  children?: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="point_history_summary_stat">
      <div className="point_history_summary_stat_label_row">
        <p className="point_history_summary_stat_label">{label}</p>
        {children}
      </div>
      <p className="point_history_summary_stat_value">{value}</p>
    </div>
  )
}

function HistoryEntryRow({ entry }: { entry: PointHistoryEntry }) {
  return (
    <article className="point_history_entry_row">
      <div className="point_history_entry_main">
        <h3 className="point_history_entry_title">{entry.title}</h3>
        <p className="point_history_entry_description">{entry.description}</p>
      </div>
      <p className="point_history_entry_points">+{formatPoints(entry.points)}</p>
    </article>
  )
}

export function PointHistory() {
  const navigate = useNavigate()
  const [expiryInfoOpen, setExpiryInfoOpen] = useState(false)
  const expiryInfoRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!expiryInfoOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (expiryInfoRef.current && !expiryInfoRef.current.contains(event.target as Node)) {
        setExpiryInfoOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpiryInfoOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [expiryInfoOpen])

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/my/point-shop')
  }

  return (
    <div className="point_history_page">
      <div className="point_history_shell">
        <div className="point_history_content">
          <PageHeader
            className="point_history_header"
            groupClassName="point_history_header_left"
            backButtonClassName="point_history_back_button"
            backIconClassName="point_history_back_icon"
            backLabel="뒤로 가기"
            layout="section"
            title="포인트 적립내역"
            titleClassName="point_history_title"
            onBack={goBack}
          />

          <section className="point_history_hero" aria-label="포인트 요약">
            <div className="point_history_hero_copy">
              <p className="point_history_hero_label">내 포인트</p>
              <div className="point_history_hero_total">
                <PointHistoryBadge />
                <strong>{formatPoints(currentBalance)}</strong>
              </div>
              <p className="point_history_hero_description">
                활동으로 모은 포인트를 적립일 순서로 확인해보세요.
                <span className="point_history_hero_note">*최근 6일 활동 기준</span>
              </p>
            </div>

            <div className="point_history_hero_stats">
              <SummaryStat label="최근 적립" value={formatPoints(totalEarned)} />
              <SummaryStat label="소멸예정 포인트" value={formatPoints(expiringPoints)}>
                <div className="point_history_info_wrap" ref={expiryInfoRef}>
                  <button
                    className="point_history_info_button"
                    type="button"
                    aria-expanded={expiryInfoOpen}
                    aria-label="소멸예정 포인트 안내"
                    onClick={() => setExpiryInfoOpen((open) => !open)}
                  >
                    <InfoIcon />
                  </button>
                  {expiryInfoOpen ? <span className="point_history_info_popup">유효기간 1년</span> : null}
                </div>
              </SummaryStat>
            </div>
          </section>

          <section className="point_history_list_section">
            <div className="point_history_section_header">
              <h2 className="point_history_section_title">적립 내역</h2>
              <p className="point_history_section_caption">총 {totalActivities}건</p>
            </div>

            <div className="point_history_day_list">
              {pointHistoryDays.map((day) => (
                <section className="point_history_day_group" key={day.id}>
                  <div className="point_history_day_heading" aria-label={`${day.monthLabel} ${day.dayLabel}`}>
                    <span className="point_history_day_month">{day.monthLabel}</span>
                    <span className="point_history_day_date">{day.dayLabel}</span>
                  </div>

                  <div className="point_history_day_entries">
                    {day.entries.map((entry) => (
                      <HistoryEntryRow entry={entry} key={entry.id} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
