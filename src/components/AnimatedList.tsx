import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import './AnimatedList.css'

type AnimatedItemProps = {
  children: ReactNode
  delay?: number
  index: number
  enableLayoutAnimation: boolean
  onMouseEnter: () => void
  onClick: () => void
}

function AnimatedItem({ children, delay = 0, index, enableLayoutAnimation, onMouseEnter, onClick }: AnimatedItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.08, once: true })
  const layoutProps = enableLayoutAnimation
    ? {
        layout: true,
        exit: { height: 0, opacity: 0, scale: 0.96, x: -120, y: 0 },
        style: { overflow: 'hidden' },
      }
    : {}

  return (
    <motion.div
      ref={ref}
      className="animated-list-item"
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.96, opacity: 0, y: 14 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.96, opacity: 0, y: 14 }}
      transition={{ duration: 0.28, delay, layout: { duration: 0.24 } }}
      {...layoutProps}
    >
      {children}
    </motion.div>
  )
}

type AnimatedListProps<T> = {
  items: T[]
  onItemSelect?: (item: T, index: number) => void
  renderItem?: (item: T, index: number, selected: boolean) => ReactNode
  showGradients?: boolean
  enableArrowNavigation?: boolean
  className?: string
  itemClassName?: string
  displayScrollbar?: boolean
  enableLayoutAnimation?: boolean
  getItemKey?: (item: T, index: number) => string | number
  initialSelectedIndex?: number
  ariaLabel?: string
}

export default function AnimatedList<T>({
  items,
  onItemSelect,
  renderItem,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  itemClassName = '',
  displayScrollbar = true,
  enableLayoutAnimation = false,
  getItemKey,
  initialSelectedIndex = -1,
  ariaLabel,
}: AnimatedListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex)
  const [keyboardNav, setKeyboardNav] = useState(false)
  const [topGradientOpacity, setTopGradientOpacity] = useState(0)
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1)

  useEffect(() => {
    setSelectedIndex(initialSelectedIndex)
  }, [initialSelectedIndex])

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const handleItemClick = useCallback(
    (item: T, index: number) => {
      setSelectedIndex(index)
      onItemSelect?.(item, index)
    },
    [onItemSelect],
  )

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    setTopGradientOpacity(Math.min(scrollTop / 50, 1))
    const bottomDistance = scrollHeight - (scrollTop + clientHeight)
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1))
  }, [])

  useEffect(() => {
    if (!enableArrowNavigation) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
        event.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex((index) => Math.min(index + 1, items.length - 1))
      } else if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
        event.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex((index) => Math.max(index - 1, 0))
      } else if (event.key === 'Enter' && selectedIndex >= 0 && selectedIndex < items.length) {
        event.preventDefault()
        onItemSelect?.(items[selectedIndex], selectedIndex)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enableArrowNavigation, items, onItemSelect, selectedIndex])

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return

    const container = listRef.current
    const selectedItem = container.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`)

    if (selectedItem) {
      const extraMargin = 50
      const containerScrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      const itemTop = selectedItem.offsetTop
      const itemBottom = itemTop + selectedItem.offsetHeight

      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' })
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth',
        })
      }
    }

    setKeyboardNav(false)
  }, [keyboardNav, selectedIndex])

  return (
    <div className={`scroll-list-container ${className}`}>
      <div
        ref={listRef}
        className={`scroll-list ${!displayScrollbar ? 'no-scrollbar' : ''}`}
        aria-label={ariaLabel}
        onScroll={handleScroll}
      >
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <AnimatedItem
              key={getItemKey ? getItemKey(item, index) : index}
              delay={Math.min(index * 0.045, 0.18)}
              index={index}
              enableLayoutAnimation={enableLayoutAnimation}
              onMouseEnter={() => handleItemMouseEnter(index)}
              onClick={() => handleItemClick(item, index)}
            >
              {renderItem ? (
                renderItem(item, index, selectedIndex === index)
              ) : (
                <div className={`item ${selectedIndex === index ? 'selected' : ''} ${itemClassName}`}>
                  <p className="item-text">{String(item)}</p>
                </div>
              )}
            </AnimatedItem>
          ))}
        </AnimatePresence>
      </div>
      {showGradients ? (
        <>
          <div className="top-gradient" style={{ opacity: topGradientOpacity }} />
          <div className="bottom-gradient" style={{ opacity: bottomGradientOpacity }} />
        </>
      ) : null}
    </div>
  )
}
