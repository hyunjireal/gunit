import { Link, useParams } from 'react-router-dom'
import { highlights } from '../../data/mockData'

export function HighlightDetail() {
  const { id } = useParams()
  const highlight = highlights.find((item) => item.id === id)

  if (!highlight) {
    return <div className="page"><h1 className="page_title">하이라이트를 찾을 수 없어요</h1></div>
  }

  return (
    <div className="page">
      <h1 className="page_title">{highlight.title}</h1>
      <section className="section">
        <div className="placeholder_image">영상 영역</div>
        <article className="card"><h2>선수명</h2><p>{highlight.playerName}</p></article>
        <article className="card"><h2>팀명</h2><p>{highlight.teamName}</p></article>
        <article className="card"><h2>하이라이트 설명</h2><p>{highlight.description}</p></article>
      </section>
      <Link className="button primary_button" to="/tournament/mvp-vote">MVP 후보로 보기</Link>
    </div>
  )
}
