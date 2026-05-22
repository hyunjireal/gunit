import { useNavigate, useParams } from 'react-router-dom'
import KeywordTag from '../../components/KeywordTag'
import { LoginButton } from '../../components/LoginButton'
import { PageHeader } from '../../components/PageHeader'
import arrowRIcon from '../../asset/icons/arrow_r.svg'
import matchBagIcon from '../../asset/icons/match_bag.svg'
import matchCalendarIcon from '../../asset/icons/match_calendar.svg'
import matchCheckIcon from '../../asset/icons/match_check.svg'
import matchFieldIcon from '../../asset/icons/match_field.svg'
import matchInfoIcon from '../../asset/icons/match_info.svg'
import matchLevelIcon from '../../asset/icons/match_level.svg'
import matchNoticeIcon from '../../asset/icons/match_notice.svg'
import matchTargetIcon from '../../asset/icons/match_target.svg'
import { matches } from '../../data/mockData'
import { findGeneratedMatchSchedule } from './generatedMatchSchedules'
import { cacheMatchSnapshot, readMatchSnapshot, type MatchApplicationSnapshot } from './matchApplicationStorage'
import './match.css'

const preparationItems = [
  '안티포그 처리된 고글',
  '미끄럼이 적은 운동화',
  '무릎 보호대 권장',
  '렌탈용 신분증',
]

const noticeCards = [
  {
    icon: matchLevelIcon,
    title: '숙련도 안내',
    lines: ['처음 실내전을 뛰는 분도 참여 가능합니다.', '좁은 공간 이동과 콜 사인을 천천히 맞춰봐요.'],
  },
  {
    icon: matchNoticeIcon,
    title: '경기 안내사항',
    lines: ['마감 임박 일정은 노쇼 방지를 위해 신청 후 승인 메시지를 확인해주세요.', '참석이 어려우면 미리 취소 연락을 남겨주세요.'],
  },
]

function getTypeLabel(type?: MatchApplicationSnapshot['type']) {
  if (type === 'team') return '팀'
  if (type === 'mercenary') return '용병'
  return '개인'
}

function createFallbackSnapshot(matchId: string): MatchApplicationSnapshot {
  const generatedMatch = findGeneratedMatchSchedule(matchId)
  if (generatedMatch) {
    return generatedMatch
  }

  const match = matches.find((item) => item.id === matchId)

  return {
    id: matchId,
    type: 'personal',
    title: match?.title ?? '서울 CQB 입문 경기',
    date: match?.date,
    dateValue: match?.dateValue,
    time: match?.time ?? '12:00',
    region: match?.region ?? '서울',
    fieldName: match?.fieldName ?? '어반 CQB',
    difficulty: match?.difficulty ?? '초보 가능',
    currentParticipants: match?.currentParticipants ?? 14,
    maxParticipants: match?.maxParticipants ?? 16,
  }
}

function getDateTimeLabel(match: MatchApplicationSnapshot) {
  const date = match.dateValue ?? match.date

  return date ? `${date.replaceAll('-', '.')} ${match.time}` : match.time
}

export function MatchScheduleJoin() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const targetMatchId = matchId ?? 'match-003'
  const match = readMatchSnapshot(targetMatchId) ?? createFallbackSnapshot(targetMatchId)

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/match')
  }

  const goApply = () => {
    cacheMatchSnapshot(match)
    navigate(`/match/${targetMatchId}/apply`)
  }

  return (
    <div className="schedule_join_page">
      <PageHeader
        className="schedule_join_top"
        groupClassName="schedule_join_tit"
        backButtonClassName="schedule_join_back"
        title="매치 상세"
        titleClassName="schedule_join_header_title"
        onBack={goBack}
      />

      <main className="schedule_join_main_body">
        <section className="schedule_join_summary_card" aria-labelledby="schedule-join-title">
          <img className="schedule_join_target_icon" src={matchTargetIcon} alt="" aria-hidden="true" />
          <div className="schedule_join_summary_text">
            <div className="schedule_join_title_group">
              <KeywordTag className="schedule_join_keyword">{match.difficulty ?? '초보 가능'}</KeywordTag>
              <h1 id="schedule-join-title">{match.title}</h1>
            </div>
            <p>
              {match.region} · {match.fieldName} · {getTypeLabel(match.type)}
            </p>
          </div>
        </section>

        <section className="schedule_join_card_section" aria-label="경기 핵심 정보">
          <div className="schedule_join_card_top">
            <article className="schedule_join_info_card">
              <div className="schedule_join_info_head">
                <span className="schedule_join_info_icon">
                  <img src={matchFieldIcon} alt="" aria-hidden="true" />
                </span>
                <span className="body_sb_22">필드</span>
              </div>
              <div className="schedule_join_info_text">
                <strong className="body_sb_20">{match.fieldName}</strong>
                <p className="body_m_14">{match.region} · {match.fieldName}</p>
              </div>
              <div className="schedule_join_tag_link" aria-hidden="true">
                <KeywordTag className="schedule_join_soft_tag">
                  필드 정보
                  <img src={arrowRIcon} alt="" aria-hidden="true" />
                </KeywordTag>
              </div>
            </article>

            <article className="schedule_join_info_card">
              <div className="schedule_join_info_head">
                <span className="schedule_join_info_icon">
                  <img src={matchCalendarIcon} alt="" aria-hidden="true" />
                </span>
                <span className="body_sb_22">일정</span>
              </div>
              <div className="schedule_join_info_text">
                <strong className="body_sb_20">{getDateTimeLabel(match)}</strong>
                <p className="body_m_14">
                  {match.currentParticipants} / {match.maxParticipants}명 참여 중
                </p>
                <p className="body_m_14">{match.difficulty ?? '초보 가능'}</p>
              </div>
              <KeywordTag className="schedule_join_soft_tag">참가비 40,000</KeywordTag>
            </article>
          </div>

          <article className="schedule_join_info_card schedule_join_prepare_card">
            <div className="schedule_join_info_head">
              <span className="schedule_join_info_icon">
                <img src={matchBagIcon} alt="" aria-hidden="true" />
              </span>
              <span className="body_sb_22">준비물</span>
            </div>

            <ul className="schedule_join_info_list">
              {preparationItems.map((item) => (
                <li key={item}>
                  <img src={matchCheckIcon} alt="" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="schedule_join_rental_box">
              <div className="schedule_join_rental_status">
                <img src={matchInfoIcon} alt="" aria-hidden="true" />
                <strong className="body_sb_14">장비 렌탈 가능</strong>
              </div>
              <span className="schedule_join_dotted_rule" aria-hidden="true" />
              <p className="body_m_14">신청서에서 렌탈 필요 여부를 표시해주세요.</p>
            </div>
          </article>
        </section>

        <section className="schedule_join_notice_section" aria-label="안내사항">
          {noticeCards.map((card) => (
            <article className="schedule_join_notice_card" key={card.title}>
              <img className="schedule_join_notice_icon" src={card.icon} alt="" aria-hidden="true" />
              <div className="schedule_join_notice_text">
                <div className="schedule_join_notice_top">
                  <h2>{card.title}</h2>
                  <img src={arrowRIcon} alt="" aria-hidden="true" />
                </div>
                <div className="schedule_join_notice_lines">
                  {card.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <div className="schedule_join_cta">
        <LoginButton
          onClick={goApply}
          style={{
            background: 'var(--color-khaki)',
            color: 'var(--color-white)',
            WebkitTextFillColor: 'var(--color-white)',
          }}
        >
          참가 신청하기
        </LoginButton>
      </div>
    </div>
  )
}
