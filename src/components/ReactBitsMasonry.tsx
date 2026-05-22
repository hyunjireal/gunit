import type { CSSProperties, ReactNode } from 'react'
import './ReactBitsMasonry.css'

type ReactBitsMasonryProps<T> = {
  items: T[]
  getKey: (item: T, index: number) => string | number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  itemClassName?: string
  ariaLabel?: string
  baseDelayMs?: number
  staggerMs?: number
  revealOrder?: number[]
}

export function ReactBitsMasonry<T>({
  items,
  getKey,
  renderItem,
  className,
  itemClassName,
  ariaLabel,
  baseDelayMs = 0,
  staggerMs = 120,
  revealOrder,
}: ReactBitsMasonryProps<T>) {
  const orderedIndexes = revealOrder ?? items.map((_, index) => index)
  const revealStepByIndex = new Map(orderedIndexes.map((itemIndex, stepIndex) => [itemIndex, stepIndex]))

  return (
    <div
      className={['react_bits_masonry', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      {items.map((item, index) => {
        const revealStep = revealStepByIndex.get(index) ?? index
        const delayMs = baseDelayMs + revealStep * staggerMs

        return (
          <div
            className={['react_bits_masonry_item', itemClassName].filter(Boolean).join(' ')}
            key={getKey(item, index)}
            style={{ '--react-bits-masonry-delay': `${delayMs}ms` } as CSSProperties}
          >
            {renderItem(item, index)}
          </div>
        )
      })}
    </div>
  )
}
