import { Link } from 'react-router-dom'
import './match.css'

export function MatchFilter() {
  return (
    <div className="page">
      <h1 className="page_title">일정으로 찾기</h1>
      <section className="section">
        <label className="field">지역<input className="input" placeholder="예: 서울" /></label>
        <label className="field">날짜<input className="input" placeholder="예: 이번 주" /></label>
        <label className="field">난이도<select className="select"><option>전체</option><option>입문자</option><option>초보</option><option>경험자</option></select></label>
        <Link className="button primary_button" to="/match">검색 결과 보기</Link>
      </section>
    </div>
  )
}
