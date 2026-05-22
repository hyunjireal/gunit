import { Link } from 'react-router-dom'
import './Guide.css'

const items = [
  '고글은 게임장 안에서 절대 임의로 벗지 않아요.',
  '세이프존과 게임장의 경계를 반드시 확인해요.',
  '탄속 체크와 현장 규정은 필수로 확인해요.',
  '필드별 규칙은 다를 수 있으니 시작 전 운영진 안내를 다시 들어요.',
  '문제가 생기면 혼자 해결하려 하지 말고 운영진에게 알려요.',
]

export function SafetyGuide() {
  return <GuideArticle title="안전수칙" items={items} nextLabel="다음: 기본 경기 규칙" next="/guide/rules" />
}

function GuideArticle({ title, items, nextLabel, next }: { title: string; items: string[]; nextLabel: string; next: string }) {
  return (
    <div className="page">
      <h1 className="page_title">{title}</h1>
      <section className="section">
        {items.map((item) => <article className="card" key={item}>{item}</article>)}
      </section>
      <Link className="button primary_button" to={next}>{nextLabel}</Link>
    </div>
  )
}
