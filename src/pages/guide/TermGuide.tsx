import { Link } from 'react-router-dom'
import './Guide.css'

export function TermGuide() {
  const terms = [
    '히트: 탄에 맞았을 때 스스로 맞았음을 알리는 행동',
    '세이프존: 장비를 정비하고 대기하는 안전 구역',
    '탄속: 에어소프트건의 발사 세기',
    '리스폰: 게임 중 다시 시작하는 지점',
    '용병/게스트: 특정 팀에 고정 소속되지 않고 참여하는 인원',
  ]

  return (
    <div className="page">
      <h1 className="page_title">용어 가이드</h1>
      <section className="section">{terms.map((term) => <article className="card" key={term}>{term}</article>)}</section>
      <Link className="button primary_button" to="/guide/etiquette">다음: 매너와 주의사항</Link>
    </div>
  )
}
