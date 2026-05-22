import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { boardPosts, guideCards, matches, mercenaryPosts, teams } from '../../data/mockData'

export function Search() {
  const [query, setQuery] = useState('')
  const normalized = query.trim()
  const results = useMemo(() => ({
    matches: matches.filter((item) => item.title.includes(normalized) || item.description.includes(normalized)),
    posts: boardPosts.filter((item) => item.title.includes(normalized) || item.content.includes(normalized)),
    guides: guideCards.filter((item) => item.title.includes(normalized) || item.description.includes(normalized)),
    teamMercenary: [
      ...teams.filter((item) => item.name.includes(normalized) || item.description.includes(normalized)),
      ...mercenaryPosts.filter((item) => item.title.includes(normalized) || item.description.includes(normalized)),
    ],
  }), [normalized])

  return (
    <div className="page">
      <h1 className="page_title">검색</h1>
      <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="전체 검색" />
      <section className="section">
        <Result title="경기" items={results.matches.map((item) => [item.title, `/match/${item.id}`])} />
        <Result title="게시글" items={results.posts.map((item) => [item.title, `/community/post/${item.id}`])} />
        <Result title="가이드" items={results.guides.map((item) => [item.title, item.route])} />
        <Result title="팀/용병" items={results.teamMercenary.map((item) => ['name' in item ? item.name : item.title, 'name' in item ? `/team/${item.id}` : `/mercenary/${item.id}`])} />
      </section>
    </div>
  )
}

function Result({ title, items }: { title: string; items: string[][] }) {
  return (
    <article className="card">
      <h2>{title}</h2>
      <div className="list">
        {items.slice(0, 4).map(([label, route]) => <Link key={`${title}-${label}`} to={route}>{label}</Link>)}
      </div>
    </article>
  )
}
