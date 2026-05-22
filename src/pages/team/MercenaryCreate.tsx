import { useNavigate } from 'react-router-dom'

export function MercenaryCreate() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <h1 className="page_title">모집 글 작성</h1>
      <section className="section">
        <label className="field">유형<select className="select"><option>게스트 모집</option><option>용병 자리 구함</option></select></label>
        <label className="field">제목<input className="input" /></label>
        <label className="field">날짜<input className="input" /></label>
        <label className="field">지역<input className="input" /></label>
        <label className="field">설명<textarea className="textarea" /></label>
        <button className="button primary_button" type="button" onClick={() => navigate('/mercenary/list')}>등록하기</button>
      </section>
    </div>
  )
}
