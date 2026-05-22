import { useState } from 'react'
import { Link } from 'react-router-dom'

const categories = ['안전/규칙', '장비/복장', '경기 참여', '팀/용병', '용어', '기타']

export function QuestionCategory() {
  const [selected, setSelected] = useState(categories[0])

  return (
    <div className="page">
      <h1 className="page_title">질문 카테고리</h1>
      <div className="chip_row">
        {categories.map((category) => (
          <button className="chip" key={category} type="button" onClick={() => setSelected(category)}>
            {selected === category ? '선택됨: ' : ''}{category}
          </button>
        ))}
      </div>
      <section className="section">
        <Link className="button primary_button" to="/question/write">다음</Link>
      </section>
    </div>
  )
}
