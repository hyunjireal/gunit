export type ChatRole = 'user' | 'assistant'

export interface ChatAttachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
}

export interface ChatMessage {
  id: string
  role: ChatRole
  text: string
  attachments?: ChatAttachment[]
}

export interface ChatApiMessage {
  role: ChatRole
  content: string
  attachments?: ChatAttachment[]
}

type ChatApiResponse = {
  message?: {
    role?: 'assistant'
    content?: string
  }
  answer?: string
  error?: string
}

function toApiMessages(messages: ChatMessage[]): ChatApiMessage[] {
  return messages
    .filter((message) => message.text.trim().length > 0 || (message.attachments?.length ?? 0) > 0)
    .map((message) => ({
      role: message.role,
      content: message.text,
      attachments: message.attachments,
    }))
}

export async function requestChatAnswer(messages: ChatMessage[]) {
  const endpoint = import.meta.env.VITE_CHAT_API_URL || '/api/chat'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: toApiMessages(messages),
    }),
  })

  const data = (await response.json().catch(() => ({}))) as ChatApiResponse

  if (!response.ok) {
    throw new Error(data.error || '챗봇 API 요청에 실패했습니다.')
  }

  const content = data.message?.content || data.answer

  if (!content) {
    throw new Error('챗봇 응답이 비어 있습니다.')
  }

  return content
}
