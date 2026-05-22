import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoginButton } from '../../components/LoginButton'
import { PageHeader } from '../../components/PageHeader'
import arrowDownIcon from '../../asset/icons/arrow_down.svg'
import { matches } from '../../data/mockData'
import { findGeneratedMatchSchedule } from './generatedMatchSchedules'
import { cacheMatchSnapshot, markMatchJoined, readMatchSnapshot } from './matchApplicationStorage'
import './match.css'

const checks = [
  '안전수칙과 현장 규정을 확인했어요.',
  '신청 후 팀장 승인 여부를 기다릴게요.',
  '노쇼 없이 참석하거나 미리 취소 연락할게요.',
]

export function MatchApply() {
  const { id } = useParams()
  const navigate = useNavigate()
  const cachedMatch = readMatchSnapshot(id)
  const defaultMatch = matches.find((item) => item.id === id) ?? findGeneratedMatchSchedule(id)
  const match = cachedMatch ?? defaultMatch
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [rental, setRental] = useState('')
  const [buddyMatching, setBuddyMatching] = useState('')
  const [checked, setChecked] = useState<string[]>([])
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const allChecked = checked.length === checks.length
  const canSubmit = Boolean(nickname.trim() && phone.trim() && rental && buddyMatching && allChecked)
  const rentalAvailable = match && 'rentalAvailable' in match ? match.rentalAvailable : true
  const matchTitle = match?.title ?? '서울 CQB 입문 경기'
  const matchRegion = match?.region ?? '서울'
  const matchFieldName = match?.fieldName ?? '어반 CQB'
  const matchTime = match?.time ?? '12:00'
  const matchDate = cachedMatch?.dateValue ?? cachedMatch?.date ?? defaultMatch?.dateValue ?? defaultMatch?.date

  const toggleAll = () => {
    setChecked((prev) => (prev.length === checks.length ? [] : checks))
  }

  const complete = () => {
    if (id) {
      if (match) {
        cacheMatchSnapshot({
          id,
          type: cachedMatch?.type,
          title: match.title,
          date: cachedMatch?.date ?? defaultMatch?.date,
          dateValue: cachedMatch?.dateValue ?? defaultMatch?.dateValue,
          time: match.time,
          region: match.region,
          fieldName: match.fieldName,
          difficulty: match.difficulty,
          currentParticipants: match.currentParticipants,
          maxParticipants: match.maxParticipants,
          imageSrc: cachedMatch?.imageSrc ?? ('imageSrc' in match ? match.imageSrc : undefined),
        })
      }
      markMatchJoined(id)
    }
    navigate(`/match/${id}/complete`)
  }

  const handleSubmit = () => {
    setSubmitAttempted(true)
    if (!canSubmit) return
    complete()
  }

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate(`/match/schedule/${id ?? 'match-003'}/join`)
  }

  return (
    <div className="match_apply_page match_flow_page">
      <PageHeader
        className="schedule_join_top match_apply_top"
        groupClassName="schedule_join_tit match_apply_tit"
        backButtonClassName="schedule_join_back"
        title="참가신청"
        titleClassName="body_b_28"
        onBack={goBack}
      />

      <main className="match_apply_main">
        <p className="match_apply_description body_m_16">{matchTitle}에 신청할 정보를 입력해주세요.</p>

        <section className="match_apply_summary match_apply_intro_summary">
          <strong>{matchFieldName}</strong>
          <p>{[matchDate, matchTime, matchRegion].filter(Boolean).join(' · ')}</p>
        </section>

        <section className="match_apply_form" aria-label="신청자 정보">
          <label>
            <span className="match_apply_label">이름 또는 닉네임</span>
            <input
              className="input"
              name="nickname"
              placeholder="예 : 홍길동"
              required
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              aria-invalid={submitAttempted && !nickname.trim()}
            />
            {submitAttempted && !nickname.trim() ? <p className="match_apply_error">이름 또는 닉네임을 입력하시오.</p> : null}
          </label>
          <label>
            <span className="match_apply_label">연락처</span>
            <input
              className="input"
              name="phone"
              inputMode="tel"
              placeholder="예 : 010-1234-5678"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              aria-invalid={submitAttempted && !phone.trim()}
            />
            {submitAttempted && !phone.trim() ? <p className="match_apply_error">연락처를 입력하시오.</p> : null}
          </label>
          <label>
            <span className="match_apply_label">장비 렌탈 필요 여부</span>
            <span className="match_apply_select_wrap">
              <select
                className="select"
                name="rental"
                required
                value={rental}
                onChange={(event) => setRental(event.target.value)}
                aria-invalid={submitAttempted && !rental}
              >
                <option value="" disabled>선택해주세요</option>
                <option>렌탈 필요 없음</option>
                <option disabled={!rentalAvailable}>렌탈 필요</option>
              </select>
              <img src={arrowDownIcon} alt="" aria-hidden="true" />
            </span>
            {submitAttempted && !rental ? <p className="match_apply_error">장비 렌탈 필요 여부를 선택하시오.</p> : null}
          </label>
          <label>
            <span className="match_apply_label">버디 매칭 필요 여부</span>
            <span className="match_apply_select_wrap">
              <select
                className="select"
                name="buddyMatching"
                required
                value={buddyMatching}
                onChange={(event) => setBuddyMatching(event.target.value)}
                aria-invalid={submitAttempted && !buddyMatching}
              >
                <option value="" disabled>선택해주세요</option>
                <option>필요없음</option>
                <option>필요</option>
              </select>
              <img src={arrowDownIcon} alt="" aria-hidden="true" />
            </span>
            {submitAttempted && !buddyMatching ? <p className="match_apply_error">버디 매칭 필요 여부를 선택하시오.</p> : null}
          </label>
        </section>

        <section className="match_checklist" aria-label="신청 전 체크리스트">
          <label className="match_check_item match_check_all">
            <input type="checkbox" checked={allChecked} onChange={toggleAll} />
            전체 선택
          </label>
          {checks.map((check) => (
            <label className="match_check_item" key={check}>
              <input
                type="checkbox"
                checked={checked.includes(check)}
                onChange={() =>
                  setChecked((prev) => (prev.includes(check) ? prev.filter((item) => item !== check) : [...prev, check]))
                }
              />
              <span>{check}</span>
            </label>
          ))}
        </section>
        {submitAttempted && !allChecked ? <p className="match_apply_error match_apply_check_error">신청 전 체크리스트를 모두 확인하시오.</p> : null}
      </main>

      <div className="match_apply_actions">
        <LoginButton variant="apply" onClick={handleSubmit}>
          신청하기
        </LoginButton>
      </div>
    </div>
  )
}
