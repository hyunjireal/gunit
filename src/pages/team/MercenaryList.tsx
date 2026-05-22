import { Link, useSearchParams } from 'react-router-dom'
import { mercenaryPosts } from '../../data/mockData'

const filters = ['전체', '게스트 모집', '용병 자리 구함', '초보 가능', '이번 주']

export function MercenaryList() {
  const [params] = useSearchParams()
  const type = params.get('type')
  const list = type ? mercenaryPosts.filter((post) => post.type === type) : mercenaryPosts

  return (
    <div className="page">
      <h1 className="page_title">용병/게스트 목록</h1>
      <div className="chip_row">{filters.map((filter) => <span className="chip" key={filter}>{filter}</span>)}</div>
      <section className="section">
        {list.map((post) => (
          <Link className="card" key={post.id} to={`/mercenary/${post.id}`}>
            <span className="badge">{post.type === 'guestWanted' ? '게스트 모집' : '용병 자리 구함'}</span>
            <h2>{post.title}</h2>
            <p>{post.date} / {post.region} / {post.fieldName}</p>
            <p>{post.currentCount} / {post.maxCount}명</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
