import { useParams } from 'react-router-dom'
import { teams } from '../../data/mockData'

export function TeamDetail() {
  const { id } = useParams()
  const team = teams.find((item) => item.id === id)

  if (!team) {
    return <div className="page"><h1 className="page_title">팀을 찾을 수 없어요</h1></div>
  }

  return (
    <div className="page">
      <h1 className="page_title">{team.name}</h1>
      <section className="section">
        <article className="card"><h2>지역</h2><p>{team.region}</p></article>
        <article className="card"><h2>플레이 스타일</h2><p>{team.style}</p></article>
        <article className="card"><h2>초보 친화</h2><p>{team.beginnerFriendly ? '초보자도 문의 가능' : '경험자 중심'}</p></article>
        <article className="card"><h2>설명</h2><p>{team.description}</p></article>
      </section>
    </div>
  )
}
