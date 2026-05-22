import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoginButton } from '../../components/LoginButton'
import { PageHeader } from '../../components/PageHeader'
import matchAlertIcon from '../../asset/icons/match_alert.svg'
import matchCalendarIcon from '../../asset/icons/match_calendar.svg'
import matchClockIcon from '../../asset/icons/match_clock.svg'
import matchImgIcon from '../../asset/icons/match_img.svg'
import matchPlusIcon from '../../asset/icons/match_plus.svg'
import matchXCircleIcon from '../../asset/icons/match_x_circle.svg'
import './match.css'

type CreatedMatch = {
  id: string
  type?: 'personal' | 'team' | 'mercenary'
  title?: string
  date?: string
  time?: string
  region?: string
  fieldName?: string
  difficulty?: string
  currentParticipants?: number
  maxParticipants?: number
  action?: string
  body?: string
  imageSrc?: string
  deadlineDate?: string
  deadlineTime?: string
}

type MatchType = NonNullable<CreatedMatch['type']>

const CREATED_MATCHES_KEY = 'airsoft:created-matches'
const CREATED_MATCH_FOCUS_DATE_KEY = 'airsoft:created-match-focus-date'

const fieldOptions: Record<string, string[]> = {
  서울: ['강남 CQB', '어반 CQB'],
  '경기 남부': ['택티컬 필드', '용인 숲 필드'],
  '경기 북부': ['포레스트 아레나', '파주 CQB 아레나'],
  인천: ['서구 야외 필드', '송도 CQB'],
}
const timeOptions = ['10:30', '12:00', '14:00', '16:00', '18:00', '19:00']
const typeOptions: Array<{ value: MatchType; label: string }> = [
  { value: 'team', label: '팀 (용병 가능)' },
  { value: 'personal', label: '개인' },
  { value: 'mercenary', label: '용병' },
]

function readCreatedMatches(): CreatedMatch[] {
  try {
    const value = JSON.parse(localStorage.getItem(CREATED_MATCHES_KEY) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function writeCreatedMatches(matches: CreatedMatch[]) {
  localStorage.setItem(CREATED_MATCHES_KEY, JSON.stringify(matches))
}

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const year = String(date.getFullYear()).slice(2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}/${month}/${day} (${weekdays[date.getDay()]})`
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function MatchEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const deadlineInputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const createdMatches = useMemo(() => readCreatedMatches(), [])
  const match = createdMatches.find((item) => item.id === id)

  const [title, setTitle] = useState(match?.title ?? '')
  const [type, setType] = useState<MatchType>(match?.type ?? 'team')
  const [region, setRegion] = useState(match?.region && fieldOptions[match.region] ? match.region : '서울')
  const [fieldName, setFieldName] = useState(() => {
    const initialRegion = match?.region && fieldOptions[match.region] ? match.region : '서울'
    return match?.fieldName && fieldOptions[initialRegion].includes(match.fieldName) ? match.fieldName : fieldOptions[initialRegion][0]
  })
  const [date, setDate] = useState(match?.date ?? '2026-04-11')
  const [time, setTime] = useState(match?.time ?? '12:00')
  const [maxParticipants, setMaxParticipants] = useState(match?.maxParticipants ?? 12)
  const [body, setBody] = useState(match?.body ?? '')
  const [deadlineDate, setDeadlineDate] = useState(match?.deadlineDate ?? addDays(match?.date ?? '2026-04-11', 30))
  const [deadlineTime, setDeadlineTime] = useState(match?.deadlineTime ?? '18:00')
  const [imageSrc, setImageSrc] = useState(match?.imageSrc ?? '')
  const [openSelector, setOpenSelector] = useState<'place' | 'schedule' | null>(null)

  const currentParticipants = match?.currentParticipants ?? 1

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/my/schedule')
  }

  const updateMaxParticipants = (nextValue: number) => {
    setMaxParticipants(Math.max(currentParticipants, nextValue))
  }

  const openDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return

    if (typeof input.showPicker === 'function') {
      input.showPicker()
      return
    }

    input.focus()
  }

  const changeRegion = (nextRegion: string) => {
    setRegion(nextRegion)
    setFieldName(fieldOptions[nextRegion][0])
  }

  const changeImage = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result)
      }
    })
    reader.readAsDataURL(file)
  }

  const saveMatch = () => {
    if (!match) return

    const updatedMatches = createdMatches.map((item) => {
      if (item.id !== match.id) return item

      return {
        ...item,
        type,
        title: title.trim() || item.title || '새 매치',
        region,
        fieldName: fieldName.trim() || item.fieldName || '필드 미정',
        date,
        time,
        maxParticipants,
        body,
        deadlineDate,
        deadlineTime,
        imageSrc,
      }
    })

    writeCreatedMatches(updatedMatches)
    localStorage.setItem(CREATED_MATCH_FOCUS_DATE_KEY, date)
    navigate('/my/schedule', {
      replace: true,
      state: { toastMessage: '수정이 완료되었습니다.' },
    })
  }

  if (!match) {
    return (
      <div className="match_edit_form_page">
        <PageHeader
          className="match_edit_form_header"
          groupClassName="match_edit_form_title"
          backButtonClassName="match_edit_form_back"
          layout="standard"
          title="매치 수정"
          titleClassName="match_page_title"
          onBack={goBack}
          hideRight
        />
        <section className="match_edit_alert_section">
          <div className="match_edit_alert_box">
            <img src={matchAlertIcon} alt="" aria-hidden="true" />
            <p>수정할 수 있는 내 일정이 없어요.</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="match_edit_form_page">
      <PageHeader
        className="match_edit_form_header"
        groupClassName="match_edit_form_title"
        backButtonClassName="match_edit_form_back"
        layout="standard"
        title="매치 수정"
        titleClassName="match_page_title"
        onBack={goBack}
        hideRight
      />

      <section className="match_edit_alert_section">
        <div className="match_edit_alert_box">
          <img src={matchAlertIcon} alt="" aria-hidden="true" />
          <p>
            <span>매치 정보를 수정하고 저장하면</span>
            <span>참가자들에게 변경 사항이 안내됩니다.</span>
          </p>
        </div>
      </section>

      <main className="match_edit_form_body">
        <section className="match_edit_form_section">
          <h2>기본 정보</h2>

          <div className="match_edit_info_list">
            <label className="match_edit_field">
              <span>매치 제목</span>
              <div className="match_edit_text_input match_edit_title_input">
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="매치 제목" />
                {title ? (
                  <button className="match_edit_clear_button" type="button" onClick={() => setTitle('')} aria-label="매치 제목 지우기">
                    <img src={matchXCircleIcon} alt="" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </label>

            <div className="match_edit_field match_edit_field_selector">
              <span>일시</span>
              <div className="match_edit_mgc_select">
                <button
                  className="match_edit_removed_menu"
                  type="button"
                  aria-expanded={openSelector === 'schedule'}
                  onClick={() => setOpenSelector((selector) => (selector === 'schedule' ? null : 'schedule'))}
                >
                  <span className="mgc_menu_left match_edit_mgc_menu_left">
                    <span>
                      날짜 / 시간 선택
                      <strong>{formatDateLabel(date)} · {time}</strong>
                    </span>
                  </span>
                  <span className="match_edit_chevron" aria-hidden="true" />
                </button>
                <div className="mgc_selector_panel match_edit_selector_panel match_edit_selector_panel_direct">
                  <label>
                    날짜
                    <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                  </label>
                  <label>
                    시간
                    <select value={time} onChange={(event) => setTime(event.target.value)}>
                      {timeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="match_edit_field match_edit_field_selector">
              <span>장소</span>
              <div className="match_edit_mgc_select">
                <button
                  className="match_edit_removed_menu"
                  type="button"
                  aria-expanded={openSelector === 'place'}
                  onClick={() => setOpenSelector((selector) => (selector === 'place' ? null : 'place'))}
                >
                  <span className="mgc_menu_left match_edit_mgc_menu_left">
                    <span>
                      지역 / 필드 선택
                      <strong>{region} · {fieldName}</strong>
                    </span>
                  </span>
                  <span className="match_edit_chevron" aria-hidden="true" />
                </button>
                <div className="mgc_selector_panel match_edit_selector_panel match_edit_selector_panel_direct">
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
            </div>

            <div className="match_edit_field">
              <span>인원</span>
              <div className="match_edit_count_row">
                <div className="match_edit_count_control" aria-label="모집 인원 조절">
                  <button type="button" onClick={() => updateMaxParticipants(maxParticipants - 1)} aria-label="모집 인원 줄이기">
                    <span className="match_edit_minus_icon" aria-hidden="true" />
                  </button>
                  <span>{maxParticipants}</span>
                  <button type="button" onClick={() => updateMaxParticipants(maxParticipants + 1)} aria-label="모집 인원 늘리기">
                    <img src={matchPlusIcon} alt="" aria-hidden="true" />
                  </button>
                </div>
                <span className="match_edit_count_hint">최대 {Math.max(maxParticipants, 16)}명</span>
              </div>
            </div>

            <div className="match_edit_field">
              <span>모집 유형</span>
              <div className="match_edit_radio_group" role="radiogroup" aria-label="모집 유형">
                {typeOptions.map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name="match-type"
                      value={option.value}
                      checked={type === option.value}
                      onChange={() => setType(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="match_edit_description_section">
          <div className="match_edit_description_head">
            <div className="match_edit_optional_title">
              <h2>상세 설명</h2>
              <span>(선택)</span>
            </div>
            <span>{body.length} / 200</span>
          </div>
          <textarea
            value={body}
            maxLength={200}
            onChange={(event) => setBody(event.target.value)}
            placeholder="매치에 대한 상세 내용을 입력하세요."
          />
        </section>

        <section className="match_edit_extra_section">
          <h2>추가 설정</h2>
          <div className="match_edit_extra_content">
            <div className="match_edit_deadline">
              <h3>모집 마감</h3>
              <div className="match_edit_deadline_inputs">
                <div className="mgc_selector_panel match_edit_selector_panel match_edit_selector_panel_direct">
                  <label>
                    날짜
                    <input type="date" value={deadlineDate} onChange={(event) => setDeadlineDate(event.target.value)} />
                  </label>
                  <label>
                    시간
                    <select value={deadlineTime} onChange={(event) => setDeadlineTime(event.target.value)}>
                      {timeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <button className="match_edit_removed_menu" type="button" onClick={() => openDatePicker(deadlineInputRef.current)}>
                  <span className="match_edit_picker_value">
                    <img className="match_edit_icon_15" src={matchCalendarIcon} alt="" aria-hidden="true" />
                    <span>{formatDateLabel(deadlineDate)}</span>
                  </span>
                  <span className="match_edit_chevron" aria-hidden="true" />
                  <input
                    ref={deadlineInputRef}
                    className="match_edit_hidden_picker"
                    type="date"
                    value={deadlineDate}
                    onChange={(event) => setDeadlineDate(event.target.value)}
                    aria-label="모집 마감 날짜"
                  />
                </button>
                <label className="match_edit_removed_menu">
                  <span className="match_edit_picker_value">
                    <img className="match_edit_icon_15" src={matchClockIcon} alt="" aria-hidden="true" />
                    <select className="match_edit_time_select" value={deadlineTime} onChange={(event) => setDeadlineTime(event.target.value)} aria-label="모집 마감 시간">
                      {timeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </span>
                  <span className="match_edit_chevron" aria-hidden="true" />
                </label>
              </div>
            </div>

            <div className="match_edit_image_field">
              <h3>매치 이미지</h3>
              <div className="match_edit_image_row">
                <div className="match_edit_image_thumb">
                  <img
                    className={imageSrc ? 'match_edit_image_preview' : 'match_edit_image_placeholder'}
                    src={imageSrc || matchImgIcon}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <div className="match_edit_image_actions" onClick={() => imageInputRef.current?.click()}>
                  <input
                    ref={imageInputRef}
                    className="match_edit_image_input"
                    type="file"
                    accept="image/*"
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => changeImage(event.target.files?.[0])}
                  />
                  <button type="button">이미지 변경</button>
                  <p>권장 사이즈: 16:9 / 최대 5MB</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="match_edit_form_cta">
          <LoginButton className="match_edit_cancel_button" onClick={goBack}>
            취소
          </LoginButton>
          <LoginButton className="match_edit_submit_button" onClick={saveMatch}>
            수정 완료
          </LoginButton>
        </div>
      </main>
    </div>
  )
}
