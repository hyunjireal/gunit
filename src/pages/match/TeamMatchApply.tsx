import { useNavigate, useParams } from 'react-router-dom'
import { teamMatchEvents } from '../../data/teamMatches'
import './match.css'

export function TeamMatchApply() {
  const { teamMatchId } = useParams()
  const navigate = useNavigate()
  const event = teamMatchEvents.find((item) => item.id === teamMatchId)

  const submit = () => {
    const stored = JSON.parse(localStorage.getItem('teamMatchApplications') || '[]') as string[]
    if (teamMatchId && !stored.includes(teamMatchId)) {
      localStorage.setItem('teamMatchApplications', JSON.stringify([...stored, teamMatchId]))
    }
    navigate('/my/schedule?tab=applied')
  }

  return (
    <div className="page">
      <h1 className="page_title">팀 참가신청</h1>
      <p className="page_description">{event?.title ?? '선택한 팀 매치'} 신청 정보를 입력해요.</p>
      <section className="section">
        <label className="field">
          팀의 총인원
          <input className="input" type="number" min="1" placeholder="예: 6" />
        </label>
        <label className="field">
          장비 렌탈 필요 여부
          <select className="select">
            <option>렌탈 필요 없음</option>
            <option>일부 인원 렌탈 필요</option>
            <option>전체 인원 렌탈 필요</option>
          </select>
        </label>
        <label className="field">
          전달 사항
          <textarea className="textarea" placeholder="운영진에게 전달할 내용을 입력해 주세요." />
        </label>
      </section>
      <button className="button primary_button" type="button" onClick={submit}>신청 정보 저장하기</button>
    </div>
  )
}
