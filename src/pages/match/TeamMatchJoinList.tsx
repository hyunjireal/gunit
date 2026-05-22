import { useState } from 'react'
import { Link } from 'react-router-dom'
import { teamMatchEvents } from '../../data/teamMatches'
import './match.css'

export function TeamMatchJoinList() {
  const [dateFilter, setDateFilter] = useState('전체')
  const [regionFilter, setRegionFilter] = useState('전체')
  const [difficultyFilter, setDifficultyFilter] = useState('전체')
  const filteredEvents = teamMatchEvents.filter((event) => {
    const matchesDate = dateFilter === '전체' || event.date.includes(dateFilter)
    const matchesRegion = regionFilter === '전체' || event.region === regionFilter
    const matchesDifficulty = difficultyFilter === '전체' || event.difficulty === difficultyFilter
    return matchesDate && matchesRegion && matchesDifficulty
  })

  return (
    <div className="page">
      <h1 className="page_title">우리 팀의 다음 격전지는? 팀 단위로 출격할 매치 찾기 🤝</h1>

      <section className="section">
        <article className="card">
          <h2>필터</h2>
          <label className="field">
            날짜
            <select className="select" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
              <option>전체</option>
              <option>이번 주 토요일</option>
              <option>이번 주 일요일</option>
            </select>
          </label>
          <label className="field">
            지역
            <select className="select" value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
              <option>전체</option>
              <option>하남</option>
              <option>용인</option>
            </select>
          </label>
          <label className="field">
            난이도
            <select className="select" value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}>
              <option>전체</option>
              <option>초보 가능</option>
              <option>중급 이상</option>
            </select>
          </label>
        </article>
      </section>

      <section className="section">
        {filteredEvents.map((event) => (
          <Link className="card team_match_card" key={event.id} to={`/match/join/team/${event.id}`}>
            <span className="badge">{event.status}</span>
            <h2>{event.title}</h2>
            <p>{event.date} / {event.region} / {event.difficulty}</p>
          </Link>
        ))}
        {filteredEvents.length === 0 ? <article className="card">조건에 맞는 팀 매치가 없습니다.</article> : null}
      </section>
    </div>
  )
}
