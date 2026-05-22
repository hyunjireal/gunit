import './match.css'

export function MatchCreateGame() {
  return (
    <div className="page">
      <h1 className="page_title">경기 생성</h1>
      <section className="section">
        <label className="field">경기명<input className="input" /></label>
        <label className="field">날짜<input className="input" /></label>
        <label className="field">지역<input className="input" /></label>
        <label className="field">난이도<select className="select"><option>입문자</option><option>초보</option><option>경험자</option></select></label>
        <button className="button primary_button" type="button">경기 생성하기</button>
      </section>
    </div>
  )
}
