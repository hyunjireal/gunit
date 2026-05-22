import type { CSSProperties } from 'react'
import searchIcon from '../asset/icons/com_search.svg'

type SearchBarProps = {
  className?: string
  placeholder?: string
}

const searchBarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: 'fit-content',
  padding: '4px 6px',
  gap: 10,
  boxSizing: 'border-box',
}

const searchIconWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 46px',
  width: 46,
  height: 46,
  padding: 11,
  boxSizing: 'border-box',
  background: '#F1F1F1',
  borderRadius: 50,
}

const searchInputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: 0,
  outline: 0,
  padding: 0,
  color: '#222222',
  background: 'transparent',
  fontFamily: 'Pretendard Variable, Pretendard, system-ui, sans-serif',
  fontSize: 17,
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: 0,
}

function SearchBar({ className, placeholder = '검색어를 입력하세요' }: SearchBarProps) {
  return (
    <label className={className ? `search_bar ${className}` : 'search_bar'} style={searchBarStyle} aria-label="검색">
      <span className="search_bar_icon" style={searchIconWrapStyle} aria-hidden="true">
        <img src={searchIcon} alt="" />
      </span>
      <input className="search_bar_input" style={searchInputStyle} type="search" placeholder={placeholder} />
    </label>
  )
}

export default SearchBar
