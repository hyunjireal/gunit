export type CommunityBoardContext = 'beginner' | 'general'

export type CommunityStoredReply = {
  id: string
  author: string
  time: string
  dateTime: string
  body: string
  likeCount: number
  liked?: boolean
}

export type CommunityStoredComment = {
  id: string
  author: string
  badge?: string
  time: string
  dateTime: string
  body: string
  likeCount: number
  liked?: boolean
  replies: CommunityStoredReply[]
}

export type CommunityStoredImage = {
  id: string
  name: string
  dataUrl: string
  type: string
}

export type CommunityStoredPost = {
  id: string
  boardContext: CommunityBoardContext
  category: string
  title: string
  body: string
  author: string
  createdAt: string
  createdAtISO: string
  views: number
  commentsCount: number
  likeCount: number
  liked: boolean
  fileName?: string
  images?: CommunityStoredImage[]
  isNew?: boolean
  comments: CommunityStoredComment[]
}

const COMMUNITY_POST_KEY = 'airsoft:community-posts:v1'
const NICKNAME_KEY = 'nickname'
const DEFAULT_CURRENT_USER_NAME = 'Lo으님'

const hasStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const formatNow = () => {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return {
    time: `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    dateTime: now.toISOString(),
  }
}

const countComments = (comments: CommunityStoredComment[]) =>
  comments.reduce((total, comment) => total + 1 + comment.replies.length, 0)

const normalizePost = (post: CommunityStoredPost): CommunityStoredPost => ({
  ...post,
  views: Number.isFinite(Number(post.views)) ? Number(post.views) : 0,
  comments: Array.isArray(post.comments) ? post.comments : [],
  commentsCount: countComments(Array.isArray(post.comments) ? post.comments : []),
  likeCount: Number.isFinite(Number(post.likeCount)) ? Number(post.likeCount) : 0,
  liked: Boolean(post.liked),
  images: Array.isArray(post.images) ? post.images : [],
  isNew: Boolean(post.isNew),
})

export const getCommunityCurrentUserName = () => {
  if (!hasStorage()) {
    return DEFAULT_CURRENT_USER_NAME
  }

  return localStorage.getItem(NICKNAME_KEY) || DEFAULT_CURRENT_USER_NAME
}

export const getCommunityRelativeTime = (dateTime: string, now = Date.now()) => {
  const targetTime = new Date(dateTime).getTime()

  if (!Number.isFinite(targetTime)) {
    return '방금 전'
  }

  const diffMinutes = Math.max(0, Math.floor((now - targetTime) / 60000))

  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}시간 전`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}일 전`

  const date = new Date(dateTime)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

export const readCommunityPosts = (): CommunityStoredPost[] => {
  if (!hasStorage()) {
    return []
  }

  try {
    const rawValue = localStorage.getItem(COMMUNITY_POST_KEY)
    if (!rawValue) return []

    const parsed = JSON.parse(rawValue)
    if (!Array.isArray(parsed)) return []

    return parsed.map(normalizePost)
  } catch {
    return []
  }
}

export const writeCommunityPosts = (posts: CommunityStoredPost[]) => {
  if (!hasStorage()) {
    return
  }

  localStorage.setItem(COMMUNITY_POST_KEY, JSON.stringify(posts.map(normalizePost)))
}

export const findCommunityPost = (postId?: string) => {
  if (!postId) return null
  return readCommunityPosts().find((post) => post.id === postId) ?? null
}

export const createCommunityPost = ({
  boardContext,
  body,
  category,
  fileName,
  images,
  title,
}: {
  boardContext: CommunityBoardContext
  body: string
  category: string
  fileName?: string
  images?: CommunityStoredImage[]
  title: string
}) => {
  const { dateTime } = formatNow()
  const post: CommunityStoredPost = {
    id: createId('community-post'),
    boardContext,
    category,
    title,
    body,
    author: getCommunityCurrentUserName(),
    createdAt: getCommunityRelativeTime(dateTime),
    createdAtISO: dateTime,
    views: 0,
    commentsCount: 0,
    likeCount: 0,
    liked: false,
    fileName,
    images: images ?? [],
    isNew: true,
    comments: [],
  }

  writeCommunityPosts([post, ...readCommunityPosts()])

  return post
}

export const updateCommunityPost = (
  postId: string,
  updater: (post: CommunityStoredPost) => CommunityStoredPost,
): CommunityStoredPost | null => {
  let updatedPost: CommunityStoredPost | null = null
  const nextPosts = readCommunityPosts().map((post) => {
    if (post.id !== postId) {
      return post
    }

    updatedPost = normalizePost(updater(post))
    return updatedPost
  })

  if (updatedPost) {
    writeCommunityPosts(nextPosts)
  }

  return updatedPost
}

export const toggleStoredPostLike = (postId: string) =>
  updateCommunityPost(postId, (post) => ({
    ...post,
    liked: !post.liked,
    likeCount: Math.max(0, post.likeCount + (post.liked ? -1 : 1)),
  }))

export const editStoredPost = (postId: string, title: string, body: string) =>
  updateCommunityPost(postId, (post) => ({
    ...post,
    title,
    body,
  }))

export const editStoredPostContent = (
  postId: string,
  {
    boardContext,
    body,
    category,
    fileName,
    images,
    title,
  }: {
    boardContext: CommunityBoardContext
    body: string
    category: string
    fileName?: string
    images?: CommunityStoredImage[]
    title: string
  },
) =>
  updateCommunityPost(postId, (post) => ({
    ...post,
    boardContext,
    body,
    category,
    fileName,
    images: images ?? [],
    title,
  }))

export const deleteStoredPost = (postId: string) => {
  const nextPosts = readCommunityPosts().filter((post) => post.id !== postId)
  writeCommunityPosts(nextPosts)
}

export const addStoredPostComment = (postId: string, body: string, author: string) => {
  let nextCommentId = ''

  const updatedPost = updateCommunityPost(postId, (post) => {
    const { dateTime, time } = formatNow()
    const nextComment: CommunityStoredComment = {
      id: createId('comment-user'),
      author,
      time,
      dateTime,
      body,
      likeCount: 0,
      replies: [],
    }
    nextCommentId = nextComment.id

    return {
      ...post,
      comments: [...post.comments, nextComment],
    }
  })

  return { post: updatedPost, commentId: nextCommentId }
}

export const addStoredPostReply = (
  postId: string,
  commentId: string,
  body: string,
  author: string,
  mentionTarget?: string,
) => {
  let nextReplyId = ''

  const updatedPost = updateCommunityPost(postId, (post) => {
    const { dateTime, time } = formatNow()
    const replyBody = mentionTarget ? `@${mentionTarget} ${body}` : body
    const reply: CommunityStoredReply = {
      id: createId('reply-user'),
      author,
      time,
      dateTime,
      body: replyBody,
      likeCount: 0,
    }
    nextReplyId = reply.id

    return {
      ...post,
      comments: post.comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment,
      ),
    }
  })

  return { post: updatedPost, replyId: nextReplyId }
}

export const toggleStoredCommentLike = (postId: string, commentId: string) =>
  updateCommunityPost(postId, (post) => ({
    ...post,
    comments: post.comments.map((comment) =>
      comment.id === commentId
        ? {
            ...comment,
            liked: !comment.liked,
            likeCount: Math.max(0, comment.likeCount + (comment.liked ? -1 : 1)),
          }
        : comment,
    ),
  }))

export const editStoredComment = (postId: string, commentId: string, body: string) =>
  updateCommunityPost(postId, (post) => ({
    ...post,
    comments: post.comments.map((comment) =>
      comment.id === commentId ? { ...comment, body } : comment,
    ),
  }))

export const deleteStoredComment = (postId: string, commentId: string) =>
  updateCommunityPost(postId, (post) => ({
    ...post,
    comments: post.comments.filter((comment) => comment.id !== commentId),
  }))

export const toggleStoredReplyLike = (postId: string, commentId: string, replyId: string) =>
  updateCommunityPost(postId, (post) => ({
    ...post,
    comments: post.comments.map((comment) =>
      comment.id === commentId
        ? {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === replyId
                ? {
                    ...reply,
                    liked: !reply.liked,
                    likeCount: Math.max(0, reply.likeCount + (reply.liked ? -1 : 1)),
                  }
                : reply,
            ),
          }
        : comment,
    ),
  }))

export const editStoredReply = (
  postId: string,
  commentId: string,
  replyId: string,
  body: string,
) =>
  updateCommunityPost(postId, (post) => ({
    ...post,
    comments: post.comments.map((comment) =>
      comment.id === commentId
        ? {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === replyId ? { ...reply, body } : reply,
            ),
          }
        : comment,
    ),
  }))

export const deleteStoredReply = (postId: string, commentId: string, replyId: string) =>
  updateCommunityPost(postId, (post) => ({
    ...post,
    comments: post.comments.map((comment) =>
      comment.id === commentId
        ? {
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== replyId),
          }
        : comment,
    ),
  }))
