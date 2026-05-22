import { Link, useParams } from 'react-router-dom'
import { teamMatchEvents } from '../../data/teamMatches'
import './match.css'

export function TeamMatchDetail() {
  const { teamMatchId } = useParams()
  const event = teamMatchEvents.find((item) => item.id === teamMatchId)

  if (!event) {
    return <div className="page"><h1 className="page_title">팀 매치를 찾을 수 없어요</h1></div>
  }

  return (
    <div className="page">
      <h1 className="page_title">{event.title}</h1>
      <section className="section">
        <article className="card">
          <h2>경기 요약 정보</h2>
          <p>일시: 이번 주 토요일 10:00 ~ 14:00</p>
          <p>장소: 하남 OOO 에어소프트 파크</p>
        </article>
        <article className="card safety_notice_card">
          <h2>🚨 필수 안전 및 규정 안내</h2>
          <p>본 필드는 0.2J 탄속 규정을 엄격히 준수합니다. 게임 전 현장에서 탄속 측정이 진행됩니다.</p>
          <p>야외 필드 특성상 친환경 생분해성 바이오 BB탄 사용이 필수입니다.</p>
        </article>
        <article className="card">
          <h2>비용 안내</h2>
          <p>참가비: 30,000원 (필드 종일 이용료 포함)</p>
        </article>
      </section>
      <Link className="button primary_button" to={`/match/join/team/${event.id}/apply`}>참가신청</Link>
    </div>
  )
}
