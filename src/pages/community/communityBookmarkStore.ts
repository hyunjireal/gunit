const COMMUNITY_BOOKMARK_KEY = 'airsoft:community-bookmarked-posts'

export function readCommunityBookmarks() {
  if (typeof window === 'undefined') {
    return new Set<string>()
  }

  try {
    const rawValue = localStorage.getItem(COMMUNITY_BOOKMARK_KEY)
    const parsedValue = rawValue ? JSON.parse(rawValue) : []

    return new Set(Array.isArray(parsedValue) ? parsedValue.filter((id) => typeof id === 'string') : [])
  } catch {
    return new Set<string>()
  }
}

export function hasCommunityBookmarkStore() {
  return typeof window !== 'undefined' && localStorage.getItem(COMMUNITY_BOOKMARK_KEY) !== null
}

export function writeCommunityBookmarks(bookmarkedIds: Set<string>) {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(COMMUNITY_BOOKMARK_KEY, JSON.stringify([...bookmarkedIds]))
}

export function toggleCommunityBookmark(postId: string) {
  const bookmarkedIds = readCommunityBookmarks()

  if (bookmarkedIds.has(postId)) {
    bookmarkedIds.delete(postId)
  } else {
    bookmarkedIds.add(postId)
  }

  writeCommunityBookmarks(bookmarkedIds)

  return bookmarkedIds
}
