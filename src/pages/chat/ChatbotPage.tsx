import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ChangeEvent, FormEvent, MouseEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LoginButton } from "../../components/LoginButton";
import { PageHeader } from "../../components/PageHeader";
import chatbotCameraIcon from "../../asset/icons/chatbot_camera.svg";
import chatbotCalendarIcon from "../../asset/icons/chatbot_cal.svg";
import chatbotResultAlertIcon from "../../asset/icons/chatbot_result_alert.svg";
import chatbotResultSafetyIcon from "../../asset/icons/chatbot_result_safety.svg";
import sendIcon from "../../asset/icons/com_send.svg";
import gaiImage from "../../asset/images/gai.png";
import sampleEquipmentImage from "../../asset/images/chatbot_sample_equipment.png";
import type { ChatAttachment, ChatMessage } from "../../services/chatApi";
import "./Chat.css";

type AnalysisTone = "good" | "warn" | "info";

type AnalysisItem = {
  label: string;
  value: string;
  detail: string;
  tone: AnalysisTone;
  icon: string;
};

type AnalysisResult = {
  title: string;
  summary: string;
  score: {
    label: string;
    value: number;
    max: number;
    rating: string;
  };
  items: AnalysisItem[];
};

type TimedChatMessage = ChatMessage & {
  time: string;
  analysis?: AnalysisResult;
};

type ChatLocationState = {
  returnTo?: string;
  from?: string;
  resumePrompt?: boolean;
  returnState?: Record<string, unknown> | null;
};

function getSafeReturnPath(path?: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/chat")) {
    return "/home";
  }

  return path;
}

const analysisThinkingSteps = [
  "사진 속 장비 구성을 분리하고 있어요",
  "보호장비와 안전 기준을 대조하고 있어요",
  "입문자 기준 위험 포인트를 골라내고 있어요",
  "추천 순서를 정리하고 있어요",
];

const chatPlaceholders = [
  "가이에게 물어보세요",
  "장비 추천이 궁금한가요?",
  "필드 매너를 물어보세요",
  "초보자 규칙부터 확인해볼까요?",
  "오늘 바로 갈 수 있는 게임은?",
];

const frequentQuestions = [
  "초보 장비 추천해줘",
  "보호장비는 뭐가 필요해?",
  "배터리 관리 방법",
  "국내 규제에서 확인할 점",
  "첫 게임 전 체크리스트",
];

const analysisLoadingLabels = [
  "사진에서 장비 구성을 확인하고 있어요",
  "보호장비와 안전 요소를 대조하고 있어요",
  "입문자 기준 추천 포인트를 정리하고 있어요",
  "필드 입장 전 체크리스트를 만들고 있어요",
];

const typingLoadingLabels = [
  "AI가 입력 중이에요",
  "질문 내용을 정리하고 있어요",
  "초보자 기준으로 답변을 준비하고 있어요",
];

const mockAnalysisResults: AnalysisResult[] = [
  {
    title: "안전 분석 요약",
    summary:
      "입문용 CQB 세팅에 적합한 전동식 에어소프트건이에요. 전반적으로 양호하지만, 개선하면 더 좋은 퍼포먼스를 낼 수 있어요!",
    score: {
      label: "종합 점수",
      value: 82,
      max: 100,
      rating: "보통",
    },
    items: [
      {
        label: "개선 필요",
        value: "3개",
        detail: "확인 필요",
        tone: "warn",
        icon: chatbotResultAlertIcon,
      },
      {
        label: "안전 상태",
        value: "양호",
        detail: "문제 없음",
        tone: "good",
        icon: chatbotResultSafetyIcon,
      },
    ],
  },
];

const quickAnswerMap: Record<string, string> = {
  "초보 장비 추천해줘":
    "처음이라면 안전 장비부터 준비하는 걸 추천해요 👍\n\n• 보호 고글\n• 하관 보호 마스크\n• 장갑\n• 긴팔 복장\n\n이 4가지는 거의 필수에 가까워요.\n총기 성능보다 안전 장비가 훨씬 중요합니다.",
  "보호장비는 뭐가 필요해?":
    "에어소프트에서는 눈 보호가 가장 중요해요 👀\n\n추천 보호 장비:\n• 고글\n• 하관 마스크\n• 장갑\n• 무릎 보호대\n\n특히 CQB 실내 필드는 얼굴 보호 장비를 필수로 요구하는 경우가 많아요.",
  "배터리 관리 방법":
    "배터리는 완전 방전 상태로 오래 두지 않는 게 좋아요 🔋\n\n사용 후 체크하면 좋은 것:\n• 발열 여부 확인\n• 커넥터 상태 점검\n• 충전 후 바로 분리\n\n리포 배터리는 전용 충전기 사용을 추천해요.",
  "국내 규제에서 확인할 점":
    "국내에서는 탄속 제한과 칼라파트 유지 여부를 꼭 확인해야 해요 ⚠️\n\n필드마다 규정이 조금씩 다를 수 있어서,\n방문 전 공지사항 확인도 추천해요.\n\n무리한 개조는 필드 입장이 제한될 수 있어요.",
  "첫 게임 전 체크리스트":
    "첫 게임 전에는 이것만 체크해도 훨씬 편해져요 ✅\n\n• 고글/마스크 챙기기\n• 여분 BB탄 준비\n• 물과 장갑 챙기기\n• 필드 규칙 미리 확인\n\n처음이라면 렌탈 장비로 먼저 경험해보는 것도 좋아요.",
};

const fallbackAnswers = [
  '궁금한 점이 있으신가요? 장비 추천, 보호장비, 배터리 관리, 국내 규제, 첫 게임 준비 등 에어소프트에 관한 건 뭐든 물어보세요 😊',
  '어떤 부분이 궁금하신가요? 초보 장비 추천이나 필드 규칙, 보호장비 같은 것도 편하게 질문해주세요!',
  '아직 잘 이해하지 못했어요. 장비, 안전, 규정, 게임 준비 중 어떤 부분이 궁금하신지 조금 더 구체적으로 알려주시면 도와드릴게요 🙌',
];

const MAX_UPLOAD_IMAGE_SIDE = 1400;
const MAX_UPLOAD_IMAGE_BYTES = 1.4 * 1024 * 1024;
const CHAT_SESSION_STORAGE_KEY = "gai_chat_messages";
const resumeQuestionPrompt = "추가로 무엇이 궁금하신가요?";

const welcomeMessage: TimedChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "",
  time: "오전 10:30",
};

const welcomeMessageText =
  "건잇 AI 챗봇 가이입니다. 장비 사진 분석을 통해 안전 체크와 장비 진단을 도와드려요. 입문자 장비 추천, 세팅, 수리·커스텀 가이드까지 지원합니다.";

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function getTypingDelay(character: string) {
  if (/\s/.test(character)) return 16;
  if (/[.!?。！？]/.test(character)) return 90;
  if (character === "\n") return 110;

  return 16;
}

function getCurrentTime() {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Seoul",
  }).format(new Date());
}

function createMessage(
  role: ChatMessage["role"],
  text: string,
  attachments?: ChatAttachment[],
  analysis?: AnalysisResult,
): TimedChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text,
    attachments,
    analysis,
    time: getCurrentTime(),
  };
}

function createWelcomeMessage(): TimedChatMessage {
  return {
    ...welcomeMessage,
    time: getCurrentTime(),
  };
}

function readStoredMessages() {
  try {
    const storedValue = sessionStorage.getItem(CHAT_SESSION_STORAGE_KEY);
    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
      return null;
    }

    return parsedValue.filter(
      (message): message is TimedChatMessage =>
        typeof message?.id === "string" &&
        (message.role === "assistant" || message.role === "user") &&
        typeof message.text === "string" &&
        typeof message.time === "string",
    );
  } catch {
    return null;
  }
}

function dataUrlToAttachment(
  dataUrl: string,
  name = "gai-equipment-photo.jpg",
): ChatAttachment {
  const size = Math.round((dataUrl.length * 3) / 4);

  return {
    id: `image-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    type: "image/jpeg",
    size,
    dataUrl,
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(
        new Error("사진을 불러오지 못했어요. 다른 사진으로 다시 시도해주세요."),
      );
    reader.readAsDataURL(file);
  });
}

function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("샘플 이미지를 불러오지 못했어요."));
    reader.readAsDataURL(blob);
  });
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error("사진을 처리하지 못했어요. 다른 사진으로 다시 시도해주세요."),
      );
    image.src = dataUrl;
  });
}

function getDataUrlBytes(dataUrl: string) {
  return Math.round((dataUrl.length * 3) / 4);
}

function drawCompressedImage(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  initialQuality = 0.82,
) {
  const scale = Math.min(
    1,
    MAX_UPLOAD_IMAGE_SIDE / Math.max(sourceWidth, sourceHeight),
  );
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("사진을 압축하지 못했어요. 다시 시도해주세요.");
  }

  context.drawImage(source, 0, 0, width, height);

  let quality = initialQuality;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);

  while (getDataUrlBytes(dataUrl) > MAX_UPLOAD_IMAGE_BYTES && quality > 0.54) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  return dataUrl;
}

async function readCompressedImageAsDataUrl(file: File) {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  return drawCompressedImage(
    image,
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
  );
}

function renderMessageText(text: string) {
  return (
    <div className="chat_text">
      {text.split("\n").map((line, index) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          return (
            <span
              className="chat_text_spacer"
              key={`spacer-${index}`}
              aria-hidden="true"
            />
          );
        }

        return (
          <span className="chat_text_line" key={`${trimmedLine}-${index}`}>
            {trimmedLine}
          </span>
        );
      })}
    </div>
  );
}

type TypewriterTextProps = {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
};

function TypewriterText({
  text,
  delay = 0,
  speed = 24,
  className,
}: TypewriterTextProps) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    if (prefersReducedMotion) {
      setVisibleText(text);
      return;
    }

    const timers: number[] = [];
    setVisibleText("");

    const startTimer = window.setTimeout(() => {
      let characterIndex = 0;

      const typeNextCharacter = () => {
        characterIndex += 1;
        setVisibleText(text.slice(0, characterIndex));

        if (characterIndex < text.length) {
          timers.push(window.setTimeout(typeNextCharacter, speed));
        }
      };

      typeNextCharacter();
    }, delay);

    timers.push(startTimer);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [delay, speed, text]);

  return (
    <span className={["chat_result_type_text", className].filter(Boolean).join(" ")} aria-label={text}>
      {visibleText}
    </span>
  );
}

function renderAnalysisCard(analysis: AnalysisResult, onDetail?: () => void) {
  return (
    <section className="chat_result_card" aria-label="AI 분석 결과 카드">
      <div className="chat_result_card_head">
        <div>
          <span className="chat_result_badge">
            <TypewriterText text="AI 분석 결과" delay={120} speed={26} />
          </span>
          <strong>
            <TypewriterText text={analysis.title} delay={420} speed={30} />
          </strong>
        </div>
      </div>
      <div className="chat_result_overview">
        <div className="chat_result_score">
          <span>
            <TypewriterText text={analysis.score.label} delay={760} speed={28} />
          </span>
          <strong>
            <TypewriterText
              className="chat_result_score_value"
              text={String(analysis.score.value)}
              delay={980}
              speed={90}
            />
            <small>
              <TypewriterText text={`/${analysis.score.max}`} delay={1180} speed={60} />
            </small>
          </strong>
          <em>
            <TypewriterText text={analysis.score.rating} delay={1380} speed={70} />
          </em>
        </div>
        <p>
          <TypewriterText text={analysis.summary} delay={900} speed={22} />
        </p>
      </div>
      <div className="chat_result_grid">
        {analysis.items.map((item, index) => (
          <article
            className={`chat_result_item is_${item.tone}`}
            key={item.label}
            style={{ "--result-index": index } as CSSProperties}
          >
            <img src={item.icon} alt="" aria-hidden="true" />
            <div>
              <span>
                <TypewriterText text={item.label} delay={1700 + index * 260} speed={30} />
              </span>
              <strong>
                <TypewriterText text={item.value} delay={1880 + index * 260} speed={70} />
              </strong>
              <small>
                <TypewriterText text={item.detail} delay={2060 + index * 260} speed={32} />
              </small>
            </div>
          </article>
        ))}
      </div>
      <LoginButton className="chat_result_cta" variant="accent" onClick={onDetail}>
        <TypewriterText text="상세 결과 보기" delay={2520} speed={32} />
      </LoginButton>
    </section>
  );
}

function renderAnalysisThinkingState(currentStep: number, loadingText: string) {
  return (
    <div className="chat_analysis_state chat_analysis_state_steps">
      <div className="chat_analysis_state_header">
        <span className="chat_analysis_orbit" aria-hidden="true" />
        <div>
          <strong>AI가 분석 중이에요</strong>
          <span>{loadingText}</span>
        </div>
      </div>
      <div className="chat_analysis_progress" aria-label="AI 분석 진행 단계">
        {analysisThinkingSteps.map((step, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div
              className={`chat_analysis_progress_item${isDone ? " is_done" : ""}${isActive ? " is_active" : ""}`}
              key={step}
            >
              <span aria-hidden="true">{isDone ? "✓" : index + 1}</span>
              <p>{step}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChatbotPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locationState = location.state as ChatLocationState | null;
  const returnTo = getSafeReturnPath(locationState?.returnTo ?? locationState?.from);
  const initialQuestionSent = useRef(false);
  const chatScrollRef = useRef<HTMLElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const faqTagsRef = useRef<HTMLDivElement | null>(null);
  const faqDrag = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });
  const faqPausedRef = useRef(false);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const albumInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const initialMessages = useMemo(() => {
    const storedMessages = readStoredMessages();

    return {
      messages: storedMessages?.length ? storedMessages : [createWelcomeMessage()],
      restored: Boolean(storedMessages?.length),
    };
  }, []);
  const restoredReplayMessage = useMemo(() => {
    if (
      !initialMessages.restored ||
      locationState?.resumePrompt ||
      searchParams.get("question")
    ) {
      return null;
    }

    const targetMessage = [...initialMessages.messages]
      .reverse()
      .find((message) => message.role === "assistant" && message.text.trim() && !message.analysis);

    return targetMessage
      ? {
          id: targetMessage.id,
          text: targetMessage.text,
        }
      : null;
  }, [initialMessages.messages, initialMessages.restored, locationState?.resumePrompt, searchParams]);
  const restoredMessagesRef = useRef(initialMessages.restored);
  const resumePromptSentRef = useRef(false);
  const skipNextStorageWriteRef = useRef(Boolean(restoredReplayMessage));
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<TimedChatMessage[]>(() =>
    restoredReplayMessage
      ? initialMessages.messages.map((message) =>
          message.id === restoredReplayMessage.id ? { ...message, text: "" } : message,
        )
      : initialMessages.messages,
  );
  const [isIntroComplete, setIsIntroComplete] = useState(
    initialMessages.restored,
  );
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [loadingMode, setLoadingMode] = useState<"analysis" | "typing">(
    "analysis",
  );
  const [analysisThinkingStep, setAnalysisThinkingStep] = useState(0);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const loadingText = useMemo(() => {
    const labels =
      loadingMode === "analysis" ? analysisLoadingLabels : typingLoadingLabels;
    return labels[loadingIndex % labels.length];
  }, [loadingIndex, loadingMode]);

  useEffect(() => {
    if (inputFocused || input.trim()) {
      return;
    }

    const timer = window.setInterval(() => {
      setPromptIndex((index) => (index + 1) % chatPlaceholders.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [input, inputFocused]);

  const scrollToLatestMessage = () => {
    if (scrollFrameRef.current) {
      window.cancelAnimationFrame(scrollFrameRef.current);
    }
    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current);
    }

    const pinToBottom = () => {
      const chat = chatScrollRef.current;

      if (!chat) {
        return;
      }

      chat.scrollTo({
        top: chat.scrollHeight,
        behavior: "auto",
      });
    };

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      pinToBottom();

      scrollFrameRef.current = window.requestAnimationFrame(() => {
        pinToBottom();
        scrollFrameRef.current = null;
      });
    });

    scrollTimerRef.current = window.setTimeout(() => {
      pinToBottom();
      threadEndRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
      scrollTimerRef.current = null;
    }, 180);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraReady(false);
  };

  const typeAssistantAnswer = (answer: string) =>
    new Promise<void>((resolve) => {
      const assistantMessage = createMessage("assistant", "");
      const characters = Array.from(answer);
      let index = 0;

      setTypingMessageId(assistantMessage.id);
      setMessages((current) => [...current, assistantMessage]);

      const typeNextCharacter = () => {
        index += 1;
        const nextText = characters.slice(0, index).join("");

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessage.id
              ? {
                  ...message,
                  text: nextText,
                }
              : message,
          ),
        );

        if (index >= characters.length) {
          setTypingMessageId(null);
          typingTimerRef.current = null;
          resolve();
          return;
        }

        typingTimerRef.current = window.setTimeout(
          typeNextCharacter,
          getTypingDelay(characters[index - 1]),
        );
      };

      typeNextCharacter();
    });

  const typeExistingAssistantMessage = (messageId: string, answer: string) =>
    new Promise<void>((resolve) => {
      const characters = Array.from(answer);
      let index = 0;

      setTypingMessageId(messageId);

      const typeNextCharacter = () => {
        index += 1;
        const nextText = characters.slice(0, index).join("");

        setMessages((current) =>
          current.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  text: nextText,
                }
              : message,
          ),
        );

        if (index >= characters.length) {
          setTypingMessageId(null);
          typingTimerRef.current = null;
          resolve();
          return;
        }

        typingTimerRef.current = window.setTimeout(
          typeNextCharacter,
          getTypingDelay(characters[index - 1]),
        );
      };

      typeNextCharacter();
    });

  const appendAnalysisCard = (analysis: AnalysisResult) => {
    setMessages((current) => [
      ...current,
      createMessage("assistant", "", undefined, analysis),
    ]);
  };

  const sendEquipmentPhoto = async (attachment: ChatAttachment) => {
    if (isSending) {
      return;
    }

    if (attachment.dataUrl) {
      sessionStorage.setItem('gai_analysis_image', attachment.dataUrl)
    }

    const userMessage = createMessage(
      "user",
      "장비 사진을 보냈어요. 초보자 기준으로 추천 장비와 안전 체크를 해주세요.",
      [attachment],
    );
    setMessages((current) => [...current, userMessage]);
    setIsSending(true);
    setLoadingIndex(0);
    setLoadingMode("analysis");
    setAnalysisThinkingStep(0);

    const analysis = pickRandom(mockAnalysisResults);

    for (
      let stepIndex = 0;
      stepIndex < analysisThinkingSteps.length;
      stepIndex += 1
    ) {
      setAnalysisThinkingStep(stepIndex);
      await wait(900 + stepIndex * 170);
    }

    setAnalysisThinkingStep(analysisThinkingSteps.length);
    await wait(520);
    setIsSending(false);
    await typeAssistantAnswer(
      "사진 확인했어요. 장비 구성과 안전 포인트를 기준으로 빠르게 정리해드릴게요.",
    );
    await wait(620);
    appendAnalysisCard(analysis);
  };

  const sendText = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage = createMessage("user", trimmed);
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);
    setLoadingIndex(0);
    setLoadingMode("typing");
    setAnalysisThinkingStep(0);

    const answer = quickAnswerMap[trimmed] ?? pickRandom(fallbackAnswers);

    await wait(1200 + Math.floor(Math.random() * 800));
    setIsSending(false);
    await typeAssistantAnswer(answer);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendText();
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      fileInputRef.current?.click();
      return;
    }

    setCameraError("");
    setIsCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 1920 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraReady(true);
    } catch {
      setCameraError("카메라 권한을 사용할 수 없어 사진 선택으로 전환했어요.");
      fileInputRef.current?.click();
    }
  };

  const closeCamera = () => {
    stopCamera();
    setIsCameraOpen(false);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !isCameraReady) {
      return;
    }

    const width = video.videoWidth || 1080;
    const height = video.videoHeight || 1440;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    const dataUrl = drawCompressedImage(video, width, height, 0.82);
    closeCamera();
    await sendEquipmentPhoto(dataUrlToAttachment(dataUrl));
  };

  const selectFallbackPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      await typeAssistantAnswer(
        "사진 파일만 사용할 수 있어요. 장비 사진으로 다시 선택해주세요.",
      );
      return;
    }

    try {
      const dataUrl = await readCompressedImageAsDataUrl(file);
      closeCamera();
      await sendEquipmentPhoto(dataUrlToAttachment(dataUrl, file.name));
    } catch {
      await typeAssistantAnswer(
        "사진을 처리하지 못했어요. 다른 사진을 선택해주시면 바로 다시 분석해볼게요.",
      );
    }
  };

  const onFaqMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const el = faqTagsRef.current;
    if (!el) return;
    faqPausedRef.current = true;
    faqDrag.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
    el.classList.add("is_dragging");
  };

  const onFaqMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!faqDrag.current.active) return;
    const el = faqTagsRef.current;
    if (!el) return;
    const dx = e.clientX - faqDrag.current.startX;
    if (Math.abs(dx) > 3) faqDrag.current.moved = true;
    el.scrollLeft = faqDrag.current.scrollLeft - dx;
  };

  const stopFaqDrag = () => {
    faqDrag.current.active = false;
    faqPausedRef.current = false;
    faqTagsRef.current?.classList.remove("is_dragging");
  };

  const onFaqClickCapture = (e: MouseEvent) => {
    if (faqDrag.current.moved) {
      e.stopPropagation();
      faqDrag.current.moved = false;
    }
  };

  const onFaqTouchStart = () => {
    faqPausedRef.current = true;
  };

  const onFaqTouchEnd = () => {
    faqPausedRef.current = false;
  };

  const openMediaPicker = () => {
    setIsMediaPickerOpen(true);
  };

  const pickCamera = () => {
    setIsMediaPickerOpen(false);
    void openCamera();
  };

  const pickAlbum = () => {
    setIsMediaPickerOpen(false);
    albumInputRef.current?.click();
  };

  const pickSamplePhoto = async () => {
    if (isSending) {
      return;
    }

    setIsMediaPickerOpen(false);
    closeCamera();

    try {
      const response = await fetch(sampleEquipmentImage);
      const blob = await response.blob();
      const dataUrl = await readBlobAsDataUrl(blob);
      await sendEquipmentPhoto(
        dataUrlToAttachment(dataUrl, "demo-equipment-sample.png"),
      );
    } catch {
      await typeAssistantAnswer(
        "예시 이미지를 불러오지 못했어요. 앨범에서 이미지를 선택해 주세요.",
      );
    }
  };

  const goBack = () => {
    const shouldReplaceReturn = returnTo === "/guide" || returnTo.startsWith("/guide/");
    navigate(returnTo, {
      replace: shouldReplaceReturn,
      state: locationState?.returnState ?? null,
    });
  };

  useEffect(() => {
    const question = searchParams.get("question");
    if (!question || initialQuestionSent.current || !isIntroComplete) {
      return;
    }

    initialQuestionSent.current = true;
    void sendText(question);
  }, [searchParams, isIntroComplete]);

  useEffect(() => {
    if (
      !locationState?.resumePrompt ||
      !restoredMessagesRef.current ||
      resumePromptSentRef.current
    ) {
      return;
    }

    resumePromptSentRef.current = true;
    navigate(location.pathname, { replace: true, state: { returnTo } });

    const showResumePrompt = async () => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "assistant" && lastMessage.text === resumeQuestionPrompt) {
        return;
      }

      setIsSending(true);
      setLoadingIndex(0);
      setLoadingMode("typing");
      await wait(900);
      setIsSending(false);
      await typeAssistantAnswer(resumeQuestionPrompt);
    };

    void showResumePrompt();
  }, [location.pathname, locationState?.resumePrompt, navigate, returnTo]);

  useEffect(() => {
    if (skipNextStorageWriteRef.current) {
      skipNextStorageWriteRef.current = false;
      return;
    }

    try {
      sessionStorage.setItem(CHAT_SESSION_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // If the uploaded image payload is too large for sessionStorage, keep the live chat intact.
    }
  }, [messages]);

  useEffect(() => {
    if (restoredReplayMessage) {
      let isCancelled = false;

      const timer = window.setTimeout(() => {
        void typeExistingAssistantMessage(
          restoredReplayMessage.id,
          restoredReplayMessage.text,
        ).then(() => {
          if (!isCancelled) {
            setIsIntroComplete(true);
          }
        });
      }, 420);

      return () => {
        isCancelled = true;
        window.clearTimeout(timer);
      };
    }

    if (restoredMessagesRef.current) {
      return;
    }

    let isCancelled = false;

    const timer = window.setTimeout(() => {
      void typeExistingAssistantMessage(
        welcomeMessage.id,
        welcomeMessageText,
      ).then(() => {
        if (!isCancelled) {
          setIsIntroComplete(true);
        }
      });
    }, 760);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [restoredReplayMessage]);

  useEffect(() => {
    if (!isSending) {
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingIndex((current) => current + 1);
    }, 620);

    return () => {
      window.clearInterval(timer);
    };
  }, [isSending]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
      if (scrollFrameRef.current) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current);
      }
      stopCamera();
    };
  }, []);

  useLayoutEffect(() => {
    scrollToLatestMessage();
  }, [messages, isSending, loadingText, typingMessageId, analysisThinkingStep]);

  useEffect(() => {
    const page = pageRef.current;
    const bottom = bottomRef.current;

    if (!page || !bottom) {
      return;
    }

    const updateBottomSpace = () => {
      const height = Math.ceil(bottom.getBoundingClientRect().height + 44);
      page.style.setProperty("--chat-bottom-height", `${height}px`);

      scrollToLatestMessage();
    };

    updateBottomSpace();

    const observer = new ResizeObserver(updateBottomSpace);
    observer.observe(bottom);
    window.addEventListener("resize", updateBottomSpace);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateBottomSpace);
    };
  }, []);

  return (
    <div className="chat_page" ref={pageRef}>
      <div className="chat_con">
        <PageHeader
          title={(
            <span className="chat_header_title">
              <span className="chat_header_title_main">AI 챗봇</span>
              <span className="chat_header_title_gai">가이</span>
            </span>
          )}
          onBack={goBack}
        />

        <main className="chat" ref={chatScrollRef}>
          <section className="chat_thread" aria-live="polite">
            <div className="chat_day_marker">
              <img src={chatbotCalendarIcon} alt="" aria-hidden="true" />
              오늘
            </div>

            {messages.map((message, index) => {
              const isTyping = message.id === typingMessageId;

              return (
                <Fragment key={message.id}>
                  <article
                    className={`chat_message_frame ${message.role} is_entering`}
                  >
                    {message.role === "assistant" ? (
                      <img
                        className="chat_gai"
                        src={gaiImage}
                        alt=""
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="chat_message_stack">
                      <div
                        className={`chat_bubble${isTyping ? " is_typing" : ""}${message.analysis ? " has_result_card" : ""}`}
                      >
                        {message.attachments?.map((attachment) => (
                          <img
                            className="chat_uploaded_image"
                            key={attachment.id}
                            src={attachment.dataUrl}
                            alt={attachment.name}
                          />
                        ))}
                        {message.text ? renderMessageText(message.text) : null}
                        {isTyping && !message.text ? (
                          <span
                            className="chat_inline_typing"
                            aria-label="AI가 입력 중"
                          >
                            <i />
                            <i />
                            <i />
                          </span>
                        ) : null}
                        {message.analysis
                          ? renderAnalysisCard(message.analysis, () => navigate('/chat/analysis', { state: { returnTo, returnState: locationState?.returnState ?? null } }))
                          : null}
                      </div>
                      <time>{message.time}</time>
                    </div>
                  </article>
                  {index === 0 ? (
                    <div className="chat_scan_prompt">
                      <img src={gaiImage} alt="" aria-hidden="true" />
                      <div>
                        <strong>장비 전체 사진을 보내주세요</strong>
                        <span>
                          정면이 잘 보이게 촬영하면 더 정확하게 분석할 수 있어요
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={openCamera}
                        disabled={isSending}
                      >
                        <img src={chatbotCameraIcon} alt="" aria-hidden="true" />
                        사진 촬영하기
                      </button>
                    </div>
                  ) : null}
                </Fragment>
              );
            })}

            {isSending && !typingMessageId ? (
              <article className="chat_message_frame assistant is_entering">
                <img
                  className="chat_gai"
                  src={gaiImage}
                  alt=""
                  aria-hidden="true"
                />
                <div className="chat_message_stack">
                  {loadingMode === "analysis" ? (
                    renderAnalysisThinkingState(
                      analysisThinkingStep,
                      loadingText,
                    )
                  ) : (
                    <div className="chat_analysis_state">
                      <span
                        className="chat_analysis_orbit"
                        aria-hidden="true"
                      />
                      <span>{loadingText}</span>
                      <span className="chat_typing_dots" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    </div>
                  )}
                </div>
              </article>
            ) : null}
            <div
              className="chat_thread_end"
              ref={threadEndRef}
              aria-hidden="true"
            />
          </section>
        </main>

        <div className="chat_bottom chat_bottom_scan" ref={bottomRef}>
          <div className="chat_faq">
            <p className="body_m_14">자주 묻는 질문</p>
            <div
              className="chat_faq_tags"
              ref={faqTagsRef}
              onMouseDown={onFaqMouseDown}
              onMouseMove={onFaqMouseMove}
              onMouseUp={stopFaqDrag}
              onMouseLeave={stopFaqDrag}
              onTouchStart={onFaqTouchStart}
              onTouchEnd={onFaqTouchEnd}
              onClickCapture={onFaqClickCapture}
            >
              <div className="chat_faq_track">
                <div className="chat_faq_group">
                  {frequentQuestions.map((question) => (
                    <button
                      className="chat_faq_tag"
                      key={question}
                      type="button"
                      onClick={() => void sendText(question)}
                      disabled={isSending}
                    >
                      {question}
                    </button>
                  ))}
                </div>
                <div className="chat_faq_group" aria-hidden="true">
                  {frequentQuestions.map((question) => (
                    <button
                      className="chat_faq_tag"
                      key={`loop-${question}`}
                      type="button"
                      onClick={() => void sendText(question)}
                      disabled={isSending}
                      tabIndex={-1}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <form className="chat_form" onSubmit={submit}>
            <button
              className="chat_capture_inline"
              type="button"
              onClick={openMediaPicker}
              disabled={isSending}
              aria-label="사진 추가"
            >
              <img src={chatbotCameraIcon} alt="" aria-hidden="true" />
            </button>
            <div className={`chat_input_bar${input.trim() ? " is_ready" : ""}`}>
              {!input && !inputFocused ? (
                <span
                  className="chat_input_placeholder"
                  key={promptIndex}
                  aria-hidden="true"
                >
                  {chatPlaceholders[promptIndex]}
                </span>
              ) : null}
              <input
                value={input}
                placeholder={
                  inputFocused
                    ? "에어소프트에 대해 물어보세요!"
                    : ""
                }
                onChange={(event) => setInput(event.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                disabled={isSending}
              />
              <button
                className="chat_send_button"
                type="submit"
                aria-label="보내기"
                disabled={isSending}
              >
                {isSending ? (
                  <span className="chat_send_loading" aria-hidden="true" />
                ) : (
                  <img src={sendIcon} alt="" />
                )}
              </button>
            </div>
          </form>
        </div>

        <input
          ref={fileInputRef}
          className="chat_file_input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={selectFallbackPhoto}
        />
        <input
          ref={albumInputRef}
          className="chat_file_input"
          type="file"
          accept="image/*"
          onChange={selectFallbackPhoto}
        />
        <canvas ref={canvasRef} className="chat_capture_canvas" />

        {isMediaPickerOpen ? (
          <div
            className="chat_media_picker_overlay"
            onClick={() => setIsMediaPickerOpen(false)}
          >
            <div
              className="chat_media_picker"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="chat_media_picker_handle" />
              <button
                className="chat_media_picker_item"
                type="button"
                onClick={pickCamera}
              >
                <span>사진 촬영하기</span>
              </button>
              <button
                className="chat_media_picker_item"
                type="button"
                onClick={pickAlbum}
              >
                <span>앨범에서 가져오기</span>
              </button>
              <button
                className="chat_media_picker_sample"
                type="button"
                onClick={() => void pickSamplePhoto()}
                disabled={isSending}
              >
                <span>
                  <strong>예시 이미지 사용하기</strong>
                </span>
              </button>
              <button
                className="chat_media_picker_cancel"
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
              >
                취소
              </button>
            </div>
          </div>
        ) : null}

        {isCameraOpen ? (
          <div className="gai_camera_overlay">
            <video
              ref={videoRef}
              className="gai_camera_video"
              playsInline
              muted
            />
            <div className="gai_camera_scrim" />
            <div className="gai_camera_topbar">
              <button
                type="button"
                aria-label="카메라 닫기"
                onClick={closeCamera}
              >
                ×
              </button>
              <strong>장비 스캔</strong>
            </div>
            <div className="gai_camera_hint">
              <strong>장비가 프레임 안에 들어오게 맞춰주세요</strong>
              <span>안전 장비와 관리 포인트를 함께 체크할게요.</span>
            </div>
            <div className="gai_scan_frame" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            {cameraError ? (
              <p className="gai_camera_error">{cameraError}</p>
            ) : null}
            {!isCameraReady && !cameraError ? (
              <p className="gai_camera_error">카메라를 준비하고 있어요.</p>
            ) : null}
            <button
              className="gai_camera_sample_button"
              type="button"
              onClick={() => void pickSamplePhoto()}
              disabled={isSending}
            >
              <img src={sampleEquipmentImage} alt="" aria-hidden="true" />
              <span>예시 이미지</span>
            </button>
            <div className="gai_camera_actions">
              <LoginButton
                className="gai_camera_capture_button"
                variant="accent"
                onClick={capturePhoto}
                disabled={!isCameraReady}
              >
                사진 촬영하기
              </LoginButton>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
