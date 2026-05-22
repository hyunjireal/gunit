import { Link } from 'react-router-dom'
import './Guide.css'

export function EtiquetteGuide() {
  const items = [
    '처음이라면 시작 전에 초보라고 먼저 알려도 좋아요.',
    '모르는 규칙은 현장에서 바로 질문해도 괜찮아요.',
    '상대가 히트를 선언하면 과도한 추가 사격은 피해야 해요.',
    '장비를 빌렸다면 사용 후 상태를 확인하고 반납해요.',
  ]

  return (
    <div className="page">
      <h1 className="page_title">매너와 주의사항</h1>
      <section className="section">{items.map((item) => <article className="card" key={item}>{item}</article>)}</section>
      <Link className="button primary_button" to="/guide/quiz">퀴즈 풀기</Link>
    </div>
  )
}
