import { Link } from 'react-router-dom'
import { teams } from '../../data/mockData'

export function TeamList() {
  return (
    <div className="page">
      <h1 className="page_title">팀 찾기</h1>
      <section className="section">
        {teams.map((team) => (
          <Link className="card" key={team.id} to={`/team/${team.id}`}>
            <span className="badge">{team.recruiting ? '모집 중' : '모집 마감'}</span>
            <h2>{team.name}</h2>
            <p>{team.region} / {team.memberCount}명 / {team.style}</p>
            <p>{team.description}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
