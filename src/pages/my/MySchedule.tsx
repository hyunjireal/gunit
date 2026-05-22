import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageHeader } from '../../components/PageHeader'
import { ToastMessage, useToastMessage } from '../../components/ToastMessage'
import arrowRIcon from '../../asset/icons/arrow_r.svg'
import matchPencilIcon from '../../asset/icons/preset_pencil.svg'
import presetTrashIcon from '../../asset/icons/preset_trash.svg'
import { getMyMatches, type MyMatchStatus, type MyMatchType } from './myMatchData'
import './my.css'

type ScheduleStatus = Extract<MyMatchStatus, 'applied' | 'confirmed'>

type ScheduleTab = {
  label: string
  value: ScheduleStatus
}

type DeleteTarget = {
  matchId: string
  title: string
}

type MyScheduleLocationState = {
  toastMessage?: string
  from?: string
}

const CREATED_MATCHES_KEY = 'airsoft:created-matches'

const tabs: ScheduleTab[] = [
  { label: '신청 중', value: 'applied' },
  { label: '확정', value: 'confirmed' },
]

const myScheduleTypeColor: Record<MyMatchType, string> = {
  team: 'var(--color-navy)',
  personal: 'var(--color-teal)',
  mercenary: 'var(--color-khaki)',
}

function getMyScheduleTypeLabel(type: MyMatchType) {
  if (type === 'personal') return '개인'
  if (type === 'team') return '팀'
  return '용병'
}

function getSafeScheduleReturnPath(path?: string) {
  if (path === '/my' || path === '/match') {
    return path
  }

  return '/match'
}

export function MySchedule() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const locationState = location.state as MyScheduleLocationState | null
  const initialTab = searchParams.get('tab') === 'confirmed' ? 'confirmed' : 'applied'
  const [selectedTab, setSelectedTab] = useState<ScheduleStatus>(initialTab)
  const [scheduleRevision, setScheduleRevision] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const { toast } = useToastMessage(locationState?.toastMessage)
  const returnTo = getSafeScheduleReturnPath(locationState?.from)

  const schedules = useMemo(() => getMyMatches().filter((match) => match.status !== 'past'), [scheduleRevision])

  const filteredSchedules = useMemo(
    () => schedules.filter((schedule) => schedule.status === selectedTab),
    [schedules, selectedTab],
  )

  const goBack = () => {
    navigate(returnTo)
  }

  useEffect(() => {
    if (!locationState?.toastMessage) return

    navigate(location.pathname, {
      replace: true,
      state: locationState.from ? { from: locationState.from } : null,
    })
  }, [location.pathname, locationState?.from, locationState?.toastMessage, navigate])

  const requestDeleteMyMatch = (matchId: string, title: string) => {
    setDeleteTarget({ matchId, title })
  }

  const cancelDeleteMyMatch = () => {
    setDeleteTarget(null)
  }

  const deleteMyMatch = () => {
    if (!deleteTarget) return

    try {
      const savedMatches = JSON.parse(localStorage.getItem(CREATED_MATCHES_KEY) ?? '[]')
      const nextMatches = Array.isArray(savedMatches)
        ? savedMatches.filter((match) => !match || typeof match !== 'object' || match.id !== deleteTarget.matchId)
        : []

      localStorage.setItem(CREATED_MATCHES_KEY, JSON.stringify(nextMatches))
      setScheduleRevision((value) => value + 1)
    } catch {
      localStorage.setItem(CREATED_MATCHES_KEY, '[]')
      setScheduleRevision((value) => value + 1)
    }

    setDeleteTarget(null)
  }

  return (
    <div className="my_schedule_page">
      <ToastMessage toast={toast} className="my_schedule_toast_message" />
      <PageHeader
        className="my_schedule_top"
        groupClassName="my_schedule_tit"
        backButtonClassName="my_schedule_back"
        layout="standard"
        title="내 매치 현황"
        titleClassName="body_b_28"
        onBack={goBack}
      />

      <section className="my_schedule_tabs" aria-label="매치 현황 상태">
        {tabs.map((tab) => (
          <button
            className={`my_schedule_tab body_m_16 ${selectedTab === tab.value ? 'is_active' : ''}`}
            type="button"
            key={tab.value}
            onClick={() => {
              setSelectedTab(tab.value)
              setSearchParams({ tab: tab.value })
            }}
          >
            {tab.label}
          </button>
        ))}
      </section>

      <section className="my_schedule_list_section" aria-live="polite">
        <div
          className={`my_schedule_tab_panel my_schedule_tab_panel_${selectedTab}`}
          key={selectedTab}
        >
        {filteredSchedules.length > 0 ? (
          <div className="my_schedule_match_list">
            {filteredSchedules.map((match) => {
              if (match.isMine) {
                return (
                  <article className="my_schedule_match_item my_schedule_match_item_mine" key={match.id}>
                    <div className="my_schedule_match_item_main">
                      <span
                        className="my_schedule_match_type_tag"
                        style={{ backgroundColor: myScheduleTypeColor[match.type] }}
                      >
                        {getMyScheduleTypeLabel(match.type)}
                      </span>
                      <div className="my_schedule_badge_stack" aria-hidden="true">
                        <span className="my_schedule_mine_badge">내가 올린 일정</span>
                      </div>
                      <div className="my_schedule_match_bottom">
                      <div className="my_schedule_match_media">
                        <img className="my_schedule_match_thumb" src={match.imageSrc} alt="" aria-hidden="true" />
                        <div className="my_schedule_match_info">
                          <strong className="my_schedule_match_title">{match.title}</strong>
                          <div className="my_schedule_match_meta">
                            <p className="my_schedule_match_meta_row">
                              <span className="my_schedule_match_meta_label">시간</span>
                              <span className="my_schedule_match_meta_value">{match.time}</span>
                            </p>
                            <p className="my_schedule_match_meta_row">
                              <span className="my_schedule_match_meta_label">장소</span>
                              <span className="my_schedule_match_meta_value">
                                {match.region} · {match.fieldName}
                              </span>
                            </p>
                            <p className="my_schedule_match_meta_row">
                              <span className="my_schedule_match_meta_label">인원</span>
                              <span className="my_schedule_match_meta_value">
                                {match.currentParticipants} / {match.maxParticipants}명
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="my_schedule_match_mine_actions">
                        <button
                          className="my_schedule_match_mine_action"
                          type="button"
                          aria-label={`${match.title} 수정`}
                          onClick={() => navigate(`/match/edit/${match.matchId}`)}
                        >
                          <img src={matchPencilIcon} alt="" aria-hidden="true" />
                        </button>
                        <button
                          className="my_schedule_match_mine_action"
                          type="button"
                          aria-label={`${match.title} 삭제`}
                          onClick={() => requestDeleteMyMatch(match.matchId, match.title)}
                        >
                          <img src={presetTrashIcon} alt="" aria-hidden="true" />
                        </button>
                      </div>
                      </div>
                    </div>
                  </article>
                )
              }

              return (
                <Link
                  className="my_schedule_match_item"
                  to={`/match/detail/${match.matchId}`}
                  state={{ hideCancelApplication: selectedTab === 'confirmed', returnTo: '/my/schedule' }}
                  aria-label={`${match.title} 상세 보기`}
                  key={match.id}
                >
                  <div className="my_schedule_match_item_main">
                    <span
                      className="my_schedule_match_type_tag"
                      style={{ backgroundColor: myScheduleTypeColor[match.type] }}
                    >
                      {getMyScheduleTypeLabel(match.type)}
                    </span>
                    <div className="my_schedule_match_bottom">
                    <div className="my_schedule_match_media">
                      <img className="my_schedule_match_thumb" src={match.imageSrc} alt="" aria-hidden="true" />
                      <div className="my_schedule_match_info">
                        <strong className="my_schedule_match_title">{match.title}</strong>
                        <div className="my_schedule_match_meta">
                          <p className="my_schedule_match_meta_row">
                            <span className="my_schedule_match_meta_label">시간</span>
                            <span className="my_schedule_match_meta_value">{match.time}</span>
                          </p>
                          <p className="my_schedule_match_meta_row">
                            <span className="my_schedule_match_meta_label">장소</span>
                            <span className="my_schedule_match_meta_value">
                              {match.region} · {match.fieldName}
                            </span>
                          </p>
                        </div>
                        <p className="my_schedule_match_meta_row">
                          <span className="my_schedule_match_meta_label">인원</span>
                          <span className="my_schedule_match_meta_value">
                            {match.currentParticipants}/{match.maxParticipants}명
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="my_schedule_match_arrow_link" aria-hidden="true">
                      <img className="my_schedule_match_arrow" src={arrowRIcon} alt="" aria-hidden="true" />
                    </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <article className="my_schedule_empty">
            <strong>{tabs.find((tab) => tab.value === selectedTab)?.label} 매치가 없어요</strong>
            <p>매치 페이지에서 새로운 일정을 찾아보세요.</p>
          </article>
        )}
        </div>
      </section>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="일정을 삭제할까요?"
        description={deleteTarget ? `"${deleteTarget.title}" 일정은 삭제 후 되돌릴 수 없어요.` : undefined}
        cancelLabel="취소"
        confirmLabel="삭제"
        closeLabel="삭제 확인창 닫기"
        tone="danger"
        onCancel={cancelDeleteMyMatch}
        onConfirm={deleteMyMatch}
      />
    </div>
  )
}
