import { Link } from 'react-router-dom'
import './match.css'

export function MatchJoinHome() {
  return (
    <div className="page">
      <h1 className="page_title">참여하기</h1>
      <section className="section">
        <Link className="card" to="/match">
          <h2>개인</h2>
          <p>팀이 없어도 참여 가능한 경기를 찾아요.</p>
        </Link>
        <Link className="card" to="/match/join/team">
          <h2>팀</h2>
          <p>우리 팀 단위로 출격할 매치를 찾아요.</p>
        </Link>
        <Link className="card" to="/mercenary">
          <h2>게스트</h2>
          <p>용병/게스트로 참여 가능한 자리를 확인해요.</p>
        </Link>
      </section>
    </div>
  )
}
