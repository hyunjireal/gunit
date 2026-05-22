import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { mercenaryPosts } from '../../data/mockData'
import { RequireLoginModal } from '../../layout/RequireLoginModal'

export function MercenaryDetail() {
  const { id } = useParams()
  const [modalOpen, setModalOpen] = useState(false)
  const post = mercenaryPosts.find((item) => item.id === id)

  if (!post) {
    return <div className="page"><h1 className="page_title">모집글을 찾을 수 없어요</h1></div>
  }

  return (
    <div className="page">
      <h1 className="page_title">{post.title}</h1>
      <section className="section">
        <article className="card"><h2>모집 유형</h2><p>{post.type === 'guestWanted' ? '게스트 모집' : '용병 자리 구함'}</p></article>
        <article className="card"><h2>날짜/지역</h2><p>{post.date} / {post.region}</p></article>
        <article className="card"><h2>필드명</h2><p>{post.fieldName}</p></article>
        <article className="card"><h2>필요한 인원</h2><p>{post.currentCount} / {post.maxCount}</p></article>
        <article className="card"><h2>요구 수준</h2><p>{post.requiredLevel}</p></article>
        <article className="card"><h2>설명</h2><p>{post.description}</p></article>
        <article className="card"><h2>태그</h2><div className="chip_row">{post.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div></article>
      </section>
      <button className="button primary_button" type="button" onClick={() => setModalOpen(true)}>참여 요청하기</button>
      <RequireLoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
