import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

type ChatRole = 'system' | 'user' | 'assistant'

type ChatAttachment = {
  id?: string
  name?: string
  type?: string
  size?: number
  dataUrl?: string
}

type ClientChatMessage = {
  role: Exclude<ChatRole, 'system'>
  content: string
  attachments?: ChatAttachment[]
}

type GeminiPart = {
  text?: string
  inline_data?: {
    mime_type: string
    data: string
  }
}

type GeminiContent = {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
  error?: {
    message?: string
  }
}

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'

const GAI_SYSTEM_PROMPT = `
당신은 건잇(GUNIT)의 AI 챗봇 가이(GAI)입니다.
역할은 "이미지 분석 기반 에어소프트 장비 코치"입니다.

말투:
- 친절한 한국인 에어소프트 선배처럼 자연스럽게 말합니다.
- 입문자가 이해하기 쉽게 짧은 문단과 체크리스트로 설명합니다.
- 너무 기술적인 표현은 풀어서 설명합니다.

코칭 원칙:
- 한국 에어소프트 규제와 현장 안전 기준을 우선 고려합니다.
- 보호안경, 얼굴 보호, 장갑, 복장, 신발, 탄창/배터리 관리 등 안전 요소를 중요하게 확인합니다.
- 위험하거나 불법적인 개조, 파워 상승, 규제 회피, 식별이 어려운 외형 개조는 절대 권장하지 않습니다.
- 사진만으로 확정하기 어려운 내용은 "사진상으로는" 또는 "추가 확인이 필요해요"라고 말합니다.
- 현재 MVP는 정밀 vision 판독 단계가 아니므로, 첨부된 이미지 정보와 사용자의 설명을 바탕으로 입문자용 점검 경험을 제공합니다.

답변 형식:
1. 먼저 한 줄로 전체 평가를 말합니다.
2. "사진 기준 체크"에서 보이는/확인해야 할 항목을 정리합니다.
3. "안전/규제 주의"에서 한국 기준으로 조심할 점을 강조합니다.
4. "다음 액션"에서 입문자가 바로 할 일을 2~4개 제안합니다.
`.trim()

function sendJson(response: ServerResponse, statusCode: number, body: unknown) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(body))
}

function readJsonBody(request: IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk

      if (body.length > 4 * 1024 * 1024) {
        reject(new Error('요청 본문이 너무 큽니다. 이미지를 더 작게 업로드해주세요.'))
        request.destroy()
      }
    })

    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('JSON 형식이 올바르지 않습니다.'))
      }
    })

    request.on('error', reject)
  })
}

function isChatMessage(value: unknown): value is ClientChatMessage {
  if (!value || typeof value !== 'object') {
    return false
  }

  const message = value as Partial<ClientChatMessage>
  return (
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' &&
    (message.content.trim().length > 0 || Array.isArray(message.attachments))
  )
}

function stripDataUrl(dataUrl = '') {
  const commaIndex = dataUrl.indexOf(',')
  return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl
}

function formatAttachmentForPrompt(attachment: ChatAttachment, index: number) {
  const sizeKb = typeof attachment.size === 'number' ? Math.round(attachment.size / 1024) : 0
  return [
    `이미지 ${index + 1}`,
    `파일명: ${attachment.name || '장비 사진'}`,
    `형식: ${attachment.type || 'image/*'}`,
    `크기: 약 ${sizeKb}KB`,
  ].join(', ')
}

function toGeminiContents(messages: ClientChatMessage[]): GeminiContent[] {
  return messages.map((message) => {
    const attachments = message.attachments ?? []
    const attachmentContext = attachments.length
      ? `\n\n[첨부 이미지 정보]\n${attachments.map(formatAttachmentForPrompt).join('\n')}\n첨부 이미지를 함께 참고해서 보호장비/안전/규제/관리 체크리스트 중심으로 코칭하세요.`
      : ''
    const text = `${message.content || '장비 사진을 올렸어요. 입문자 기준으로 점검해주세요.'}${attachmentContext}`
    const parts: GeminiPart[] = [{ text }]

    attachments.forEach((attachment) => {
      if (!attachment.dataUrl) {
        return
      }

      parts.push({
        inline_data: {
          mime_type: attachment.type || 'image/jpeg',
          data: stripDataUrl(attachment.dataUrl),
        },
      })
    })

    return {
      role: message.role === 'assistant' ? 'model' : 'user',
      parts,
    }
  })
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const geminiApiKey = env.GEMINI_API_KEY || env.CHAT_API_KEY
  const geminiModel = env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL

  return {
    plugins: [
      react(),
      {
        name: 'gemini-chat-api',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (request, response) => {
            if (request.method !== 'POST') {
              sendJson(response, 405, { error: 'POST 요청만 사용할 수 있습니다.' })
              return
            }

            if (!geminiApiKey) {
              sendJson(response, 500, { error: 'GEMINI_API_KEY가 설정되어 있지 않습니다.' })
              return
            }

            try {
              const body = await readJsonBody(request)
              const messages = (body as { messages?: unknown }).messages

              if (!Array.isArray(messages) || !messages.every(isChatMessage)) {
                sendJson(response, 400, { error: 'messages 배열이 필요합니다.' })
                return
              }

              const geminiResponse = await fetch(`${GEMINI_API_BASE_URL}/${geminiModel}:generateContent`, {
                method: 'POST',
                headers: {
                  'x-goog-api-key': geminiApiKey,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  system_instruction: {
                    parts: [{ text: GAI_SYSTEM_PROMPT }],
                  },
                  contents: toGeminiContents(messages),
                  generationConfig: {
                    temperature: 0.7,
                  },
                }),
              })

              const data = (await geminiResponse.json()) as GeminiResponse

              if (!geminiResponse.ok) {
                sendJson(response, geminiResponse.status, {
                  error: data?.error?.message || 'Gemini 요청에 실패했습니다.',
                })
                return
              }

              const content = data?.candidates?.[0]?.content?.parts
                ?.map((part) => part.text || '')
                .join('')
                .trim() || ''

              if (!content) {
                sendJson(response, 502, { error: 'Gemini 응답에 텍스트가 없습니다.' })
                return
              }

              sendJson(response, 200, {
                message: {
                  role: 'assistant',
                  content,
                },
                answer: content,
              })
            } catch (error) {
              sendJson(response, 500, {
                error: error instanceof Error ? error.message : '챗봇 API 처리 중 오류가 발생했습니다.',
              })
            }
          })
        },
      },
    ],
  }
})
