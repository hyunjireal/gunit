import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import More from '../../components/More'
import { PageHeader } from '../../components/PageHeader'
import arrowRightIcon from '../../asset/icons/arrow_r.svg'
import couponIcon from '../../asset/icons/coupon.svg'
import pointshopBannerImage from '../../asset/images/pointshop_bannger_img.png'
import pointshopBestImg01 from '../../asset/images/pointshop_best_img01.png'
import pointshopBestImg02 from '../../asset/images/pointshop_best_img02.png'
import pointshopBestImg03 from '../../asset/images/pointshop_best_img03.png'
import pointshopBestImg04 from '../../asset/images/pointshop_best_img04.png'
import pointshopBestImg05 from '../../asset/images/pointshop_best_img05.png'
import pointshopBestImg07 from '../../asset/images/pointshop_best_img07.png'
import './PointShop.css'

type ShopVisual =
  | {
      kind: 'image'
      alt: string
      src: string
    }
  | {
      kind: 'team'
    }

type BestItem = {
  id: string
  price: string
  titleLines: string[]
  visual: ShopVisual
}

type ShopListItem = {
  id: string
  price: string
  title: string
  visual: ShopVisual
}

const bestItems: BestItem[] = [
  {
    id: 'best-field-ticket',
    titleLines: ['필드 평일 입장권', '3,000원 할인권'],
    price: '3,000',
    visual: { kind: 'image', alt: '필드 평일 입장권 3,000원 할인권', src: pointshopBestImg01 },
  },
  {
    id: 'best-field-drink',
    titleLines: ['필드 음료 무료', '쿠폰'],
    price: '1,500',
    visual: { kind: 'image', alt: '필드 음료 무료 쿠폰', src: pointshopBestImg02 },
  },
  {
    id: 'best-protective-gear',
    titleLines: ['보호장비 대여', '무료 이용권'],
    price: '2,000',
    visual: { kind: 'image', alt: '보호장비 대여 무료 이용권', src: pointshopBestImg03 },
  },
  {
    id: 'best-bb',
    titleLines: ['BB탄 500발', '할인 쿠폰'],
    price: '2,500',
    visual: { kind: 'image', alt: 'BB탄 500발 할인 쿠폰', src: pointshopBestImg04 },
  },
  {
    id: 'best-night-game',
    titleLines: ['주말 야간전 참가', '할인권'],
    price: '4,000',
    visual: { kind: 'image', alt: '주말 야간전 참가 할인권', src: pointshopBestImg05 },
  },
  {
    id: 'best-glove',
    titleLines: ['고급 글러브', '무료 이용권'],
    price: '1,000',
    visual: { kind: 'image', alt: '고급 글러브 무료 이용권', src: pointshopBestImg07 },
  },
]

const fieldItems: ShopListItem[] = [
  {
    id: 'field-weekday',
    title: '강남 CQB 필드 평일 할인권',
    price: '3,000',
    visual: { kind: 'image', alt: '강남 CQB 필드 평일 할인권', src: pointshopBestImg01 },
  },
  {
    id: 'field-night',
    title: '주말 야간전 참가 할인권',
    price: '3,000',
    visual: { kind: 'image', alt: '주말 야간전 참가 할인권', src: pointshopBestImg05 },
  },
  {
    id: 'field-drink',
    title: '필드 음료 무료 쿠폰',
    price: '1,500',
    visual: { kind: 'image', alt: '필드 음료 무료 쿠폰', src: pointshopBestImg02 },
  },
  {
    id: 'field-team',
    title: '강남 CQB 필드 평일 할인권',
    price: '3,000',
    visual: { kind: 'team' },
  },
]

const gearItems: ShopListItem[] = [
  {
    id: 'gear-bb',
    title: 'BB탄 500발 할인 쿠폰',
    price: '2,500',
    visual: { kind: 'image', alt: 'BB탄 500발 할인 쿠폰', src: pointshopBestImg04 },
  },
  {
    id: 'gear-glove',
    title: '고급 글러브 무료 이용권',
    price: '1,000',
    visual: { kind: 'image', alt: '고급 글러브 무료 이용권', src: pointshopBestImg07 },
  },
  {
    id: 'gear-mask',
    title: '보호장비 대여 무료 이용권',
    price: '2,000',
    visual: { kind: 'image', alt: '보호장비 대여 무료 이용권', src: pointshopBestImg03 },
  },
]

const moreActionStyle = {
  gap: 4,
  color: '#9f9f9f',
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '130%',
  letterSpacing: '-0.02em',
} as const

const MY_POINT_TOTAL = 2450

function PointBadgeIcon() {
  return (
    <span aria-hidden="true" className="point_shop_point_icon">
      P
    </span>
  )
}

function HeroArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="point_shop_hero_arrow_icon"
      viewBox="0 0 7 12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.9 0.9L5.9 5.9L0.9 10.9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function TeamGlyph() {
  return (
    <svg aria-hidden="true" className="point_shop_team_icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 8C11.0609 8 12.0783 7.57857 12.8284 6.82843C13.5786 6.07828 14 5.06087 14 4C14 2.93913 13.5786 1.92172 12.8284 1.17157C12.0783 0.421427 11.0609 0 10 0C8.93913 0 7.92172 0.421427 7.17157 1.17157C6.42143 1.92172 6 2.93913 6 4C6 5.06087 6.42143 6.07828 7.17157 6.82843C7.92172 7.57857 8.93913 8 10 8ZM3.5 11C4.16304 11 4.79893 10.7366 5.26777 10.2678C5.73661 9.79893 6 9.16304 6 8.5C6 7.83696 5.73661 7.20107 5.26777 6.73223C4.79893 6.26339 4.16304 6 3.5 6C2.83696 6 2.20107 6.26339 1.73223 6.73223C1.26339 7.20107 1 7.83696 1 8.5C1 9.16304 1.26339 9.79893 1.73223 10.2678C2.20107 10.7366 2.83696 11 3.5 11ZM19 8.5C19 9.16304 18.7366 9.79893 18.2678 10.2678C17.7989 10.7366 17.163 11 16.5 11C15.837 11 15.2011 10.7366 14.7322 10.2678C14.2634 9.79893 14 9.16304 14 8.5C14 7.83696 14.2634 7.20107 14.7322 6.73223C15.2011 6.26339 15.837 6 16.5 6C17.163 6 17.7989 6.26339 18.2678 6.73223C18.7366 7.20107 19 7.83696 19 8.5ZM10 9C11.3261 9 12.5979 9.52678 13.5355 10.4645C14.4732 11.4021 15 12.6739 15 14V20H5V14C5 12.6739 5.52678 11.4021 6.46447 10.4645C7.40215 9.52678 8.67392 9 10 9ZM3 14C3 13.307 3.1 12.638 3.288 12.006L3.118 12.02C2.26088 12.1141 1.46866 12.5213 0.893263 13.1635C0.317862 13.8057 -0.000223759 14.6377 0 15.5V20H3V14ZM20 20V15.5C20.0001 14.6084 19.6599 13.7503 19.0489 13.101C18.4378 12.4516 17.602 12.06 16.712 12.006C16.899 12.638 17 13.307 17 14V20H20Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ShopVisual({
  visual,
  className,
  imageClassName,
}: {
  visual: ShopVisual
  className: string
  imageClassName?: string
}) {
  if (visual.kind === 'team') {
    return (
      <span aria-hidden="true" className={`${className} point_shop_team_thumb`}>
        <TeamGlyph />
      </span>
    )
  }

  return (
    <span className={className}>
      <img className={imageClassName} src={visual.src} alt={visual.alt} />
    </span>
  )
}

function ShopPrice({ value }: { value: string }) {
  return (
    <span className="point_shop_price">
      <PointBadgeIcon />
      <span>{value}</span>
    </span>
  )
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="point_shop_section_heading">
      <h2 className="point_shop_section_title">{title}</h2>
      <More ariaLabel={`${title} 더보기`} className="point_shop_more_button" style={moreActionStyle} type="button" />
    </div>
  )
}

function BestCard({ item }: { item: BestItem }) {
  return (
    <article className="point_shop_best_card">
      <ShopVisual
        visual={item.visual}
        className="point_shop_best_media"
        imageClassName="point_shop_best_media_image"
      />
      <div className="point_shop_best_info">
        <p className="point_shop_best_title">
          {item.titleLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <ShopPrice value={item.price} />
      </div>
    </article>
  )
}

function ListSection({ title, items }: { title: string; items: ShopListItem[] }) {
  return (
    <section className="point_shop_list_section point_shop_shell">
      <SectionHeading title={title} />
      <div className="point_shop_list_box">
        {items.map((item) => (
          <button className="point_shop_list_item" key={item.id} type="button">
            <ShopVisual
              visual={item.visual}
              className="point_shop_list_thumb"
              imageClassName="point_shop_list_thumb_image"
            />
            <span className="point_shop_list_meta">
              <span className="point_shop_list_title">{item.title}</span>
              <ShopPrice value={item.price} />
            </span>
            <span className="point_shop_list_arrow_wrap" aria-hidden="true">
              <img className="point_shop_list_arrow" src={arrowRightIcon} alt="" />
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export function PointShop() {
  const navigate = useNavigate()
  const [displayedPoints, setDisplayedPoints] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayedPoints(MY_POINT_TOTAL)
      return undefined
    }

    let frameId = 0
    let startTime = 0
    const startDelay = window.setTimeout(() => {
      const animatePoints = (timestamp: number) => {
        if (!startTime) {
          startTime = timestamp
        }

        const progress = Math.min((timestamp - startTime) / 850, 1)
        const easedProgress = 1 - Math.pow(1 - progress, 3)

        setDisplayedPoints(Math.round(MY_POINT_TOTAL * easedProgress))

        if (progress < 1) {
          frameId = window.requestAnimationFrame(animatePoints)
        }
      }

      frameId = window.requestAnimationFrame(animatePoints)
    }, 1500)

    return () => {
      window.clearTimeout(startDelay)
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/my')
  }

  const goToCoupons = () => {
    navigate('/my/point-shop/coupons')
  }

  const goToPointHistory = () => {
    navigate('/my/point-shop/history')
  }

  return (
    <div className="point_shop_page">
      <div className="point_shop_content">
        <PageHeader
          className="point_shop_header point_shop_shell"
          groupClassName="point_shop_header_left"
          backButtonClassName="point_shop_back_button"
          backIconClassName="point_shop_back_icon"
          backLabel="뒤로 가기"
          layout="section"
          title="포인트 샵"
          titleClassName="point_shop_title"
          onBack={goBack}
          hideProfile
          rightTrailSlot={(
            <button className="point_shop_coupon_button" type="button" aria-label="내 쿠폰함" onClick={goToCoupons}>
              <img className="point_shop_coupon_icon" src={couponIcon} alt="" aria-hidden="true" />
            </button>
          )}
        />

        <section className="point_shop_shell">
          <button
            className="point_shop_hero_button"
            type="button"
            aria-label="포인트 적립내역 보기"
            onClick={goToPointHistory}
          >
            <div className="point_shop_hero">
              <div className="point_shop_hero_copy">
                <p className="point_shop_hero_label">내 포인트</p>
                <div className="point_shop_hero_value">
                  <PointBadgeIcon />
                  <span>{displayedPoints.toLocaleString()}P</span>
                  <span className="point_shop_hero_arrow_button" aria-hidden="true">
                    <HeroArrowIcon />
                  </span>
                </div>
              </div>
              <img
                className="point_shop_hero_image"
                src={pointshopBannerImage}
                alt=""
                aria-hidden="true"
              />
            </div>
          </button>
        </section>

        <section className="point_shop_best_section point_shop_shell">
          <div className="point_shop_best_heading">
            <h2 className="point_shop_section_title">BEST 추천 보급품</h2>
          </div>
          <div className="point_shop_best_wrap">
            <div className="point_shop_best_row" role="list" aria-label="포인트샵 추천 보급품">
              {bestItems.map((item) => (
                <BestCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

        <ListSection title="필드" items={fieldItems} />
        <ListSection title="장비" items={gearItems} />
      </div>
    </div>
  )
}
