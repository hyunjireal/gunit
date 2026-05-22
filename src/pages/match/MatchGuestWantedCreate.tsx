import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { markMatchRegistrationToastPending } from './MatchRegistrationToast'
import KeywordTag from '../../components/KeywordTag'
import { LoginButton } from '../../components/LoginButton'
import { PageHeader } from '../../components/PageHeader'
import arrowRIcon from '../../asset/icons/arrow_r.svg'
import guestLocaIcon from '../../asset/icons/guest_loca.svg'
import guestScheduleIcon from '../../asset/icons/guest_schedule.svg'
import './match.css'

const difficultyOptions = ['초보', '숙련자', '상관없음']
const CREATED_MATCHES_KEY = 'airsoft:created-matches'
const CREATED_MATCH_FOCUS_DATE_KEY = 'airsoft:created-match-focus-date'

const fieldOptions: Record<string, string[]> = {
  서울: ['강남 CQB', '어반 CQB'],
  '경기 남부': ['택티컬 필드', '용인 숲 필드'],
  '경기 북부': ['포레스트 아레나', '파주 CQB 아레나'],
  인천: ['서구 야외 필드', '송도 CQB'],
}

const timeOptions = ['10:30', '14:00', '16:00', '19:00']

function resolveMatchDate(rawDate: string | null) {
  if (!rawDate) return '2026-05-18'

  const date = new Date(`${rawDate}T00:00:00`)
  return Number.isNaN(date.getTime()) ? '2026-05-18' : rawDate
}

export function MatchGuestWantedCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [difficulty, setDifficulty] = useState('초보')
  const [headcount, setHeadcount] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [region, setRegion] = useState('서울')
  const [fieldName, setFieldName] = useState(fieldOptions['서울'][0])
  const [matchDate, setMatchDate] = useState(() => resolveMatchDate(searchParams.get('date')))
  const [matchTime, setMatchTime] = useState('14:00')
  const [openSelector, setOpenSelector] = useState<'place' | 'schedule' | null>(null)

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/match')
  }

  const changeRegion = (nextRegion: string) => {
    setRegion(nextRegion)
    setFieldName(fieldOptions[nextRegion][0])
  }

  const decreaseHeadcount = () => {
    setHeadcount((count) => Math.max(1, count - 1))
  }

  const increaseHeadcount = () => {
    setHeadcount((count) => count + 1)
  }

  const createGuestWantedMatch = () => {
    setSubmitAttempted(true)

    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()

    if (!trimmedTitle || !trimmedBody) {
      return
    }

    const savedMatches = (() => {
      try {
        const matches = JSON.parse(localStorage.getItem(CREATED_MATCHES_KEY) ?? '[]')
        return Array.isArray(matches) ? matches : []
      } catch {
        return []
      }
    })()
    const createdMatch = {
      id: `created-guest-wanted-${Date.now()}`,
      type: 'mercenary',
      title: trimmedTitle,
      time: matchTime,
      region,
      fieldName,
      difficulty: '용병',
      currentParticipants: 1,
      maxParticipants: headcount,
      action: '상세 보기',
      body: trimmedBody,
      date: matchDate,
    }

    localStorage.setItem(CREATED_MATCHES_KEY, JSON.stringify([createdMatch, ...savedMatches]))
    localStorage.setItem(CREATED_MATCH_FOCUS_DATE_KEY, matchDate)
    markMatchRegistrationToastPending()
    navigate('/match')
  }

  return (
    <div className="match_guest_create_page match_guest_wanted_create_page">
      <PageHeader
        className="match_page_header"
        backButtonClassName="match_page_back_button"
        layout="standard"
        title="용병 모집글"
        titleClassName="match_page_title match_guest_create_title"
        onBack={goBack}
      />

      <main className="match_guest_create_body">
        <section className="mgc_level_card" aria-labelledby="mgc-level-1">
          <div className="mgc_level_title">
            <span className="mgc_level_number">1</span>
            <h2 id="mgc-level-1" className="body_m_20">장소와 시간을 선택해주세요.</h2>
          </div>
          <div className="mgc_menu_group">
            <div className={`mgc_select_block ${openSelector === 'place' ? 'is_open' : ''}`}>
              <button
                className="mgc_menu"
                type="button"
                aria-expanded={openSelector === 'place'}
                onClick={() => setOpenSelector((selector) => (selector === 'place' ? null : 'place'))}
              >
                <span className="mgc_menu_left">
                  <img src={guestLocaIcon} alt="" aria-hidden="true" />
                  <span>
                    지역 / 필드 선택
                    <strong>{region} · {fieldName}</strong>
                  </span>
                </span>
                <img className="mgc_menu_arrow" src={arrowRIcon} alt="" aria-hidden="true" />
              </button>
              <div className="mgc_selector_panel">
                <label>
                  지역
                  <select value={region} onChange={(event) => changeRegion(event.target.value)}>
                    {Object.keys(fieldOptions).map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label>
                  필드
                  <select value={fieldName} onChange={(event) => setFieldName(event.target.value)}>
                    {fieldOptions[region].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className={`mgc_select_block ${openSelector === 'schedule' ? 'is_open' : ''}`}>
              <button
                className="mgc_menu"
                type="button"
                aria-expanded={openSelector === 'schedule'}
                onClick={() => setOpenSelector((selector) => (selector === 'schedule' ? null : 'schedule'))}
              >
                <span className="mgc_menu_left">
                  <img src={guestScheduleIcon} alt="" aria-hidden="true" />
                  <span>
                    날짜 / 시간 선택
                    <strong>{matchDate} · {matchTime}</strong>
                  </span>
                </span>
                <img className="mgc_menu_arrow" src={arrowRIcon} alt="" aria-hidden="true" />
              </button>
              <div className="mgc_selector_panel">
                <label>
                  날짜
                  <input type="date" value={matchDate} onChange={(event) => setMatchDate(event.target.value)} />
                </label>
                <label>
                  시간
                  <select value={matchTime} onChange={(event) => setMatchTime(event.target.value)}>
                    {timeOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="mgc_level_card" aria-labelledby="mgc-level-2">
          <div className="mgc_level_title">
            <span className="mgc_level_number">2</span>
            <h2 id="mgc-level-2" className="body_m_20">필요한 용병 정보를 입력해주세요.</h2>
          </div>
          <article className="mgc_info_card">
            <div className="mgc_info_row mgc_info_row_level">
              <span className="mgc_form_label body_m_16">난이도</span>
              <div className="mgc_tag_group" aria-label="난이도 선택">
                {difficultyOptions.map((option) => (
                  <button
                    className="mgc_tag_button"
                    type="button"
                    key={option}
                    onClick={() => setDifficulty(option)}
                  >
                    <KeywordTag className={difficulty === option ? 'mgc_tag is_active' : 'mgc_tag'}>
                      {option}
                    </KeywordTag>
                  </button>
                ))}
              </div>
            </div>
            <div className="mgc_info_row">
              <span className="mgc_count_label body_m_16">인원</span>
              <div className="mgc_count_control" aria-label="인원 선택">
                <button type="button" onClick={decreaseHeadcount} aria-label="인원 줄이기">-</button>
                <span>{headcount}</span>
                <button type="button" onClick={increaseHeadcount} aria-label="인원 늘리기">+</button>
              </div>
            </div>
          </article>
        </section>

        <section className="mgc_level_card" aria-labelledby="mgc-level-3">
          <div className="mgc_level_title">
            <span className="mgc_level_number">3</span>
            <h2 id="mgc-level-3" className="body_m_20">제목과 내용을 입력해주세요.</h2>
          </div>
          <label className="mgc_form_card mgc_text_card">
            <span className="mgc_form_label body_m_16">제목</span>
            <input
              className="mgc_text_field"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              aria-invalid={submitAttempted && !title.trim()}
              placeholder="제목을 입력하세요."
            />
            {submitAttempted && !title.trim() ? <span className="mgc_form_error">제목을 입력해주세요.</span> : null}
          </label>
          <label className="mgc_form_card mgc_text_card">
            <span className="mgc_form_label body_m_16">본문</span>
            <textarea
              className="mgc_text_field mgc_text_area"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              required
              aria-invalid={submitAttempted && !body.trim()}
              placeholder="본문을 입력하세요."
            />
            {submitAttempted && !body.trim() ? <span className="mgc_form_error">본문을 입력해주세요.</span> : null}
          </label>
        </section>
      </main>

      <div className="mgc_submit_wrap">
        <LoginButton
          style={{ background: 'var(--color-khaki)', backgroundColor: 'var(--color-khaki)', color: 'var(--color-white)', WebkitTextFillColor: 'var(--color-white)' }}
          onClick={createGuestWantedMatch}
        >
          등록하기
        </LoginButton>
      </div>
    </div>
  )
}
