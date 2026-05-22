import { Link } from 'react-router-dom'
import { highlights } from '../../data/mockData'

export function HighlightList() {
  return (
    <div className="page">
      <h1 className="page_title">대회 하이라이트</h1>
      <section className="section">
        {highlights.map((highlight) => (
          <Link className="card" key={highlight.id} to={`/tournament/highlights/${highlight.id}`}>
            <div className="placeholder_image">이미지 영역</div>
            <h2>{highlight.title}</h2>
            <p>{highlight.playerName} / {highlight.teamName}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
