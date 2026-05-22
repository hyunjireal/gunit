import { useNavigate } from 'react-router-dom'

export function TeamCreate() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <h1 className="page_title">팀 만들기</h1>
      <section className="section">
        <label className="field">팀명<input className="input" /></label>
        <label className="field">활동 지역<input className="input" /></label>
        <label className="field">플레이 스타일<input className="input" /></label>
        <label className="field">팀 소개<textarea className="textarea" /></label>
        <button className="button primary_button" type="button" onClick={() => navigate('/team/list')}>등록하기</button>
      </section>
    </div>
  )
}
