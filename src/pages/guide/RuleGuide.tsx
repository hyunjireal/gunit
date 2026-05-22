import { Link } from 'react-router-dom'
import './Guide.css'

export function RuleGuide() {
  const items = [
    '탄에 맞으면 손을 들고 ‘히트’라고 말해요.',
    '히트 후에는 정해진 이동 경로나 부활 지점을 따라가요.',
    '게임 방식에 따라 부활 가능 여부가 달라질 수 있어요.',
    '팀 구분을 위한 완장이나 표시를 확인해요.',
  ]

  return (
    <div className="page">
      <h1 className="page_title">기본 경기 규칙</h1>
      <section className="section">{items.map((item) => <article className="card" key={item}>{item}</article>)}</section>
      <Link className="button primary_button" to="/guide/gear">다음: 장비 가이드</Link>
    </div>
  )
}
