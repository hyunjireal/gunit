import { Link } from 'react-router-dom'
import { highlights } from '../../data/mockData'

export function Ranking() {
  const ranking = [...highlights].sort((a, b) => b.votes - a.votes)

  return (
    <div className="page">
      <h1 className="page_title">랭킹 보기</h1>
      <section className="section">
        {ranking.map((item, index) => (
          <article className="card" key={item.id}>
            <span className="badge">{index + 1}위</span>
            <h2>{item.playerName}</h2>
            <p>{item.teamName}</p>
            <p>투표수 {item.votes}</p>
            <Link className="button" to={`/tournament/highlights/${item.id}`}>하이라이트 보기</Link>
          </article>
        ))}
      </section>
    </div>
  )
}
