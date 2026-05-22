import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import pinIcon from "../../asset/icons/com_pin.svg";
import chatSmallIcon from "../../asset/icons/com_chat02.svg";
import eyesIcon from "../../asset/icons/com_eyes.svg";
import aiIcon from "../../asset/icons/com_ai.svg";
import guyFaceSmileIcon from "../../asset/icons/guy-face-caret-circle-caret.svg";
import guyFaceTalkIcon from "../../asset/icons/guy-face-owo.svg";
import guyFaceThinkIcon from "../../asset/icons/guy-face-plus-underscore-plus.svg";
import guyFaceArcSmileIcon from "../../asset/icons/guy-face-arc-smile.svg";
import guyFaceHeartSmileIcon from "../../asset/icons/guy-face-heart-smile.svg";
import safetyIcon from "../../asset/icons/com_safety.svg";
import sendIcon from "../../asset/icons/com_send.svg";
import beginnerGuideBookImage from "../../asset/images/com_beginner_card_book.png";
import beginnerGuideQuestionImage from "../../asset/images/com_beginner_card_question.png";
import CategoryTag from "../../components/CategoryTag";
import KeywordTag from "../../components/KeywordTag";
import More from "../../components/More";
import { ToastMessage, useToastMessage } from "../../components/ToastMessage";
import {
  hasCommunityBookmarkStore,
  readCommunityBookmarks,
  toggleCommunityBookmark,
  writeCommunityBookmarks,
} from "./communityBookmarkStore";
import { getCommunityRelativeTime, readCommunityPosts } from "./communityPostStore";
import "./Community.css";

const categoryTabs = [
  "전체",
  "법규/규정",
  "장비",
  "안전",
  "게임/전술",
  "수리/튜닝",
] as const;

type CategoryTab = (typeof categoryTabs)[number];

type QuestionCategory = Exclude<CategoryTab, "전체">;

type RecentQuestion = {
  id: string;
  title: string;
  category: QuestionCategory;
  author: string;
  time: string;
  views: string;
  comments: string;
  recommended?: boolean;
  isNew?: boolean;
};

type BeginnerBoardLocationState = {
  focusPostId?: string;
  newPostId?: string;
  toastMessage?: string;
  tabSlide?: 'from-left' | 'from-right';
};

const quickQuestions = [
  "초보가 먼저 알아야 할 것",
  "맞으면 어떻게 해?",
  "필드 규칙 알려줘",
];

const gaiPromptStates = [
  { placeholder: "가이에게 물어보세요", face: guyFaceTalkIcon },
  { placeholder: "장비 추천이 궁금한가요?", face: guyFaceThinkIcon },
  { placeholder: "필드 매너를 물어보세요", face: guyFaceSmileIcon },
  { placeholder: "초보자 규칙부터 확인해볼까요?", face: guyFaceArcSmileIcon },
  { placeholder: "오늘 바로 갈 수 있는 게임은?", face: guyFaceHeartSmileIcon },
];

const INITIAL_VISIBLE_QUESTION_COUNT = 5;

export const recentQuestions: RecentQuestion[] = [
  {
    id: "q-001",
    title: "서바이벌 게임에서 꼭 지켜야 할 기본 규칙이 궁금해요!",
    category: "법규/규정",
    author: "진짜초보",
    time: "2시간 전",
    views: "999+",
    comments: "567",
    recommended: true,
  },
  {
    id: "q-002",
    title: "처음 가는 필드에서는 어떤 장비를 우선으로 준비하면 좋나요?",
    category: "장비",
    author: "게임마스터",
    time: "1시간 전",
    views: "150",
    comments: "120",
  },
  {
    id: "q-003",
    title: "팀플레이 입문자가 알아두면 좋은 기본 전술 팁이 있을까요?",
    category: "게임/전술",
    author: "전술고수",
    time: "30분 전",
    views: "200",
    comments: "150",
  },
  {
    id: "q-004",
    title: "보호장비는 어느 정도까지 챙겨야 안전하게 즐길 수 있나요?",
    category: "안전",
    author: "에솦러",
    time: "4시간 전",
    views: "188",
    comments: "42",
  },
  {
    id: "q-005",
    title: "초보자가 필드 브리핑에서 꼭 체크해야 할 규정은 뭐가 있나요?",
    category: "법규/규정",
    author: "룰체크",
    time: "15분 전",
    views: "83",
    comments: "19",
  },
  {
    id: "q-006",
    title: "배터리랑 비비탄은 처음에 어떤 걸 사면 무난할까요?",
    category: "장비",
    author: "장비입문",
    time: "50분 전",
    views: "96",
    comments: "27",
  },
  {
    id: "q-007",
    title: "근거리에서 마주쳤을 때 초보자는 어떻게 움직이는 게 좋나요?",
    category: "게임/전술",
    author: "첫게임준비중",
    time: "1시간 전",
    views: "121",
    comments: "31",
  },
  {
    id: "q-008",
    title: "안개 낀 날에도 고글 김서림 방지 없이 플레이해도 괜찮나요?",
    category: "안전",
    author: "고글초보",
    time: "1시간 전",
    views: "145",
    comments: "38",
  },
  {
    id: "q-009",
    title: "처음 산 전동건에서 소리가 이상한데 바로 수리 맡겨야 하나요?",
    category: "수리/튜닝",
    author: "기어박스무서워",
    time: "1시간 전",
    views: "77",
    comments: "14",
  },
  {
    id: "q-010",
    title: "세이프존에서 탄창 분리만 하면 공탄 확인은 꼭 안 해도 되나요?",
    category: "법규/규정",
    author: "필드첫방문",
    time: "2시간 전",
    views: "167",
    comments: "44",
  },
  {
    id: "q-011",
    title: "초보자용 장갑은 어떤 형태가 제일 편했는지 추천 부탁드려요",
    category: "장비",
    author: "뉴비손시림",
    time: "2시간 전",
    views: "132",
    comments: "23",
  },
  {
    id: "q-012",
    title: "히트 후 리스폰까지 이동할 때 길막처럼 안 보이려면 어떻게 해야 하나요?",
    category: "게임/전술",
    author: "히트헷갈림",
    time: "2시간 전",
    views: "114",
    comments: "29",
  },
  {
    id: "q-013",
    title: "여름철 게임할 때 열사병 예방용으로 꼭 챙겨야 할 게 있나요?",
    category: "안전",
    author: "여름필드초보",
    time: "2시간 전",
    views: "158",
    comments: "34",
  },
  {
    id: "q-014",
    title: "홉업 조절하다가 탄이 너무 뜨는데 초보도 직접 만져봐도 될까요?",
    category: "수리/튜닝",
    author: "홉업초보",
    time: "3시간 전",
    views: "90",
    comments: "18",
  },
  {
    id: "q-015",
    title: "필드마다 복장 규정이 다른가요, 청바지로 가면 안 되나요?",
    category: "법규/규정",
    author: "복장고민중",
    time: "3시간 전",
    views: "143",
    comments: "26",
  },
  {
    id: "q-016",
    title: "고글, 마스크, 체스트리그까지 다 사기 부담되면 우선순위가 어떻게 될까요?",
    category: "장비",
    author: "월급전뉴비",
    time: "3시간 전",
    views: "176",
    comments: "52",
  },
  {
    id: "q-017",
    title: "엄폐할 때 몸을 너무 많이 내민다고 하는데 감 잡는 팁이 있을까요?",
    category: "게임/전술",
    author: "코너약함",
    time: "4시간 전",
    views: "109",
    comments: "17",
  },
  {
    id: "q-018",
    title: "맞았는지 애매할 때 초보자는 무조건 히트 선언하는 게 맞나요?",
    category: "안전",
    author: "매너배우는중",
    time: "4시간 전",
    views: "240",
    comments: "61",
    recommended: true,
  },
  {
    id: "q-019",
    title: "배럴 청소는 게임 몇 번마다 한 번씩 해주는 게 적당한가요?",
    category: "수리/튜닝",
    author: "청소타이밍",
    time: "5시간 전",
    views: "68",
    comments: "9",
  },
  {
    id: "q-020",
    title: "공공장소 이동할 때 장비를 차에 싣는 방식도 규정 위반이 될 수 있나요?",
    category: "법규/규정",
    author: "이동걱정",
    time: "5시간 전",
    views: "201",
    comments: "35",
  },
  {
    id: "q-021",
    title: "예비 탄창은 첫 게임에 몇 개 정도 챙기면 충분할까요?",
    category: "장비",
    author: "탄창몇개",
    time: "6시간 전",
    views: "117",
    comments: "20",
  },
  {
    id: "q-022",
    title: "초보자가 팀원이랑 콜사인을 맞출 때 자주 쓰는 말이 뭔가요?",
    category: "게임/전술",
    author: "콜사인헷갈림",
    time: "6시간 전",
    views: "104",
    comments: "16",
  },
  {
    id: "q-023",
    title: "귀 보호는 다들 어떻게 하시나요? 안 아프게 맞는 팁도 궁금해요",
    category: "안전",
    author: "귀아픔",
    time: "7시간 전",
    views: "136",
    comments: "22",
  },
  {
    id: "q-024",
    title: "모터 높이 조절은 초보가 건드리기 위험한 편인가요?",
    category: "수리/튜닝",
    author: "셀프정비입문",
    time: "7시간 전",
    views: "59",
    comments: "11",
  },
  {
    id: "q-025",
    title: "야외 필드와 CQB 필드의 규칙 차이는 초보가 어떤 부분부터 알아야 하나요?",
    category: "법규/규정",
    author: "필드비교중",
    time: "8시간 전",
    views: "124",
    comments: "24",
  },
  {
    id: "q-026",
    title: "렌탈 장비만으로도 첫 경기 충분히 즐길 수 있을까요?",
    category: "장비",
    author: "렌탈도전",
    time: "8시간 전",
    views: "165",
    comments: "37",
    recommended: true,
  },
  {
    id: "q-027",
    title: "초보가 후방 커버 맡았을 때 가장 먼저 신경 써야 할 포인트는 뭔가요?",
    category: "게임/전술",
    author: "역할연습중",
    time: "9시간 전",
    views: "94",
    comments: "13",
  },
  {
    id: "q-028",
    title: "장비 이상이 생겼을 때 바로 손들고 빠지는 게 안전상 맞는 대응인가요?",
    category: "안전",
    author: "운영자호출",
    time: "9시간 전",
    views: "118",
    comments: "21",
  },
  {
    id: "q-029",
    title: "비비탄이 자주 걸리는데 노즐 문제인지 탄 문제인지 구분하는 법이 있나요?",
    category: "수리/튜닝",
    author: "급탄불량",
    time: "10시간 전",
    views: "72",
    comments: "12",
  },
];

const questionCategoryToneClass: Record<QuestionCategory, string> = {
  "법규/규정": "is-rules",
  장비: "is-equipment",
  안전: "is-safety",
  "게임/전술": "is-tactics",
  "수리/튜닝": "is-custom",
};

function chatQuestionUrl(question: string) {
  return `/chat?question=${encodeURIComponent(question)}`;
}

export function BeginnerBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as BeginnerBoardLocationState | null;
  const focusPostId = locationState?.focusPostId;
  const newPostId = locationState?.newPostId;
  const introTimerRef = useRef<number | null>(null);
  const [enterDirection] = useState(() => locationState?.tabSlide ?? null);
  const [introComplete, setIntroComplete] = useState(false);
  const [heroCollapsed, setHeroCollapsed] = useState(false);
  const { toast } = useToastMessage(locationState?.toastMessage);
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("전체");
  const questionsSectionRef = useRef<HTMLElement | null>(null);
  const collapseTriggerRef = useRef<HTMLSpanElement | null>(null);
  const [expandedTabs, setExpandedTabs] = useState<Set<CategoryTab>>(
    () => new Set(),
  );
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    () => {
      const savedBookmarks = readCommunityBookmarks();

      if (hasCommunityBookmarkStore()) {
        return savedBookmarks;
      }

      const initialBookmarks = new Set([recentQuestions[0]?.id].filter(Boolean));
      writeCommunityBookmarks(initialBookmarks);

      return initialBookmarks;
    },
  );
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiFocused, setAiFocused] = useState(false);
  const [gaiPromptIndex, setGaiPromptIndex] = useState(0);
  const [storedPosts, setStoredPosts] = useState(() => readCommunityPosts());

  const allRecentQuestions = useMemo<RecentQuestion[]>(() => {
    const storedQuestions = storedPosts
      .filter((post) => post.boardContext === "beginner")
      .map((post) => ({
        id: post.id,
        title: post.title,
        category: post.category as QuestionCategory,
        author: post.author,
        time: getCommunityRelativeTime(post.createdAtISO),
        views: String(post.views),
        comments: String(post.commentsCount),
        isNew: post.isNew || post.id === newPostId,
      }));

    return [...storedQuestions, ...recentQuestions];
  }, [newPostId, storedPosts]);

  const filteredQuestions = useMemo(() => {
    if (activeCategory === "전체") {
      return allRecentQuestions;
    }

    return allRecentQuestions.filter(
      (question) => question.category === activeCategory,
    );
  }, [activeCategory, allRecentQuestions]);

  const orderedQuestions = useMemo(() => {
    const questionOrder = new Map(
      allRecentQuestions.map((question, index) => [question.id, index]),
    );

    return [...filteredQuestions].sort((a, b) => {
      const aBookmarked = bookmarkedIds.has(a.id);
      const bBookmarked = bookmarkedIds.has(b.id);

      if (aBookmarked !== bBookmarked) {
        return aBookmarked ? -1 : 1;
      }

      return (
        (questionOrder.get(a.id) ?? 0) -
        (questionOrder.get(b.id) ?? 0)
      );
    });
  }, [allRecentQuestions, bookmarkedIds, filteredQuestions]);

  const activeTabExpanded = expandedTabs.has(activeCategory);
  const pinnedQuestions = orderedQuestions.filter((question) => bookmarkedIds.has(question.id));
  const unpinnedQuestions = orderedQuestions.filter((question) => !bookmarkedIds.has(question.id));
  const visibleQuestions = activeTabExpanded
    ? orderedQuestions
    : [...pinnedQuestions, ...unpinnedQuestions.slice(0, INITIAL_VISIBLE_QUESTION_COUNT)];
  const hasMoreQuestions =
    unpinnedQuestions.length > INITIAL_VISIBLE_QUESTION_COUNT &&
    !activeTabExpanded;

  const askGai = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    navigate(chatQuestionUrl(trimmed), { state: { returnTo: '/community' } });
  };

  const openQuestionDetail = (questionId: string) => {
    navigate(`/community/post/${questionId}`, {
      state: {
        returnTo: "/community",
        transition: "beginner-question-slide",
      },
    });
  };

  const toggleBookmark = (questionId: string) => {
    setBookmarkedIds(toggleCommunityBookmark(questionId));
  };

  const showMoreQuestions = () => {
    setExpandedTabs((current) => {
      const next = new Set(current);
      next.add(activeCategory);
      return next;
    });
  };

  useEffect(() => {
    introTimerRef.current = window.setTimeout(() => {
      setIntroComplete(true);
    }, 760);

    return () => {
      if (introTimerRef.current !== null) {
        window.clearTimeout(introTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (aiFocused || aiQuestion) return;

    const placeholderTimer = window.setInterval(() => {
      setGaiPromptIndex((current) => (current + 1) % gaiPromptStates.length);
    }, 2800);

    return () => {
      window.clearInterval(placeholderTimer);
    };
  }, [aiFocused, aiQuestion]);

  useEffect(() => {
    const syncStoredPosts = () => {
      setStoredPosts(readCommunityPosts());
    };

    window.addEventListener("focus", syncStoredPosts);
    window.addEventListener("storage", syncStoredPosts);

    return () => {
      window.removeEventListener("focus", syncStoredPosts);
      window.removeEventListener("storage", syncStoredPosts);
    };
  }, []);

  useEffect(() => {
    if (!locationState?.toastMessage) return;

    const nextState = {
      ...(focusPostId ? { focusPostId } : {}),
      ...(newPostId ? { newPostId } : {}),
    };

    navigate(location.pathname, {
      replace: true,
      state: Object.keys(nextState).length ? nextState : null,
    });
  }, [focusPostId, location.pathname, locationState?.toastMessage, navigate, newPostId]);

  useEffect(() => {
    if (!focusPostId) return;

    const frameId = window.requestAnimationFrame(() => {
      const questionCard = document.querySelector<HTMLElement>(`[data-community-post-id="${focusPostId}"]`);
      questionCard?.scrollIntoView({ behavior: "smooth", block: "center" });
      questionCard?.focus({ preventScroll: true });
      navigate(location.pathname, { replace: true, state: null });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [focusPostId, location.pathname, navigate, visibleQuestions]);

  useEffect(() => {
    const collapseTrigger = collapseTriggerRef.current;
    if (!collapseTrigger) return undefined;

    let frameId = 0;
    const collapseOffset = 112;

    const updateHeroCollapsed = () => {
      frameId = 0;
      setHeroCollapsed(collapseTrigger.getBoundingClientRect().top <= collapseOffset);
    };

    const requestHeroCollapsedUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateHeroCollapsed);
    };

    updateHeroCollapsed();
    window.addEventListener("scroll", requestHeroCollapsedUpdate, { passive: true });
    window.addEventListener("resize", requestHeroCollapsedUpdate);

    return () => {
      window.removeEventListener("scroll", requestHeroCollapsedUpdate);
      window.removeEventListener("resize", requestHeroCollapsedUpdate);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <div
      className={`beginner_board_page${enterDirection === 'from-left' ? ' is_entering_from_left' : ''}${heroCollapsed ? ' is_hero_collapsed' : ''}`}
    >
      <ToastMessage toast={toast} />

      <section className="beginner_hero" aria-label="초보 질문방 소개">
        <div className="beginner_hero_content">
          <span className="beginner_hero_badge">
            <img src={safetyIcon} alt="" />
            입문자 전용 Q&A
          </span>

          <h1>초보 질문방</h1>

          <form
            className={`beginner_ai_search ${aiFocused || aiQuestion ? "is_active" : ""} ${aiQuestion.trim() ? "is_ready" : ""}`}
            aria-label="가이에게 질문하기"
            onSubmit={(event) => {
              event.preventDefault();
              askGai(aiQuestion);
            }}
          >
            <span className="beginner_ai_search_left">
              <img src={aiIcon} alt="" />
              {!aiFocused && !aiQuestion ? (
                <span className="beginner_ai_placeholder" key={gaiPromptStates[gaiPromptIndex].placeholder}>
                  {gaiPromptStates[gaiPromptIndex].placeholder}
                </span>
              ) : null}
              <input
                type="search"
                value={aiQuestion}
                onFocus={() => setAiFocused(true)}
                onBlur={() => setAiFocused(false)}
                onChange={(event) => setAiQuestion(event.target.value)}
                placeholder=""
              />
            </span>
            <button
              className="beginner_ai_search_send"
              type="submit"
              aria-label="질문 보내기"
            >
              <img src={sendIcon} alt="" />
            </button>
          </form>

          <div className="beginner_hero_bottom">
            <p className="beginner_hero_prompt">추천 질문</p>
            <div className="beginner_hashtags" aria-label="추천 질문">
              {quickQuestions.map((question) => (
                <button
                  className="beginner_hashtag_button"
                  type="button"
                  key={question}
                  onClick={() => askGai(question)}
                >
                  <CategoryTag className="beginner_hashtag">
                    {question}
                  </CategoryTag>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="beginner_hero_art" aria-hidden="true">
          <img
            className="beginner_gai_expression"
            key={gaiPromptStates[gaiPromptIndex].face}
            src={gaiPromptStates[gaiPromptIndex].face}
            alt=""
          />
        </div>
      </section>

      <div className="beginner_body">
        <section className="beginner_start_section">
          <h2 className="beginner_start_title">
            처음이라면
            <br />
            이렇게 시작해보세요
          </h2>

          <div className="beginner_guide_inner">
            <button
              className="beginner_start_card beginner_start_card_light beginner_start_card_book"
              type="button"
              onClick={() => navigate("/guide", { state: { returnTo: '/community' } })}
            >
              <div className="beginner_start_text">
                <h3>초보자 가이드</h3>
                <p>기본 규칙, 안전수칙, 용어를 먼저 익혀보세요.</p>
              </div>
              <KeywordTag
                style={{
                  marginTop: 'auto',
                  padding: '4px 8px',
                  background: '#a7c068',
                  color: '#5f6a19',
                  fontFamily: 'Pretendard Variable, Pretendard, system-ui, sans-serif',
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: '1.3',
                  letterSpacing: '-0.28px',
                }}
              >
                가이드 보기
              </KeywordTag>
              <span
                className="beginner_start_icon_shell beginner_start_icon_shell_book"
                aria-hidden="true"
              >
                <img
                  className="beginner_start_icon beginner_start_icon_book"
                  src={beginnerGuideBookImage}
                  alt=""
                />
              </span>
            </button>

            <button
              className="beginner_start_card beginner_start_card_blue beginner_start_card_question"
              type="button"
              onClick={() => navigate("/chat", { state: { returnTo: '/community' } })}
            >
              <div className="beginner_start_text">
                <h3>AI 가이에게<br />자주 묻는 질문</h3>
                <p>가장 많이 물어본 질문을 모아봤어요.</p>
              </div>
              <KeywordTag
                style={{
                  marginTop: 'auto',
                  padding: '4px 8px',
                  background: '#86abff',
                  color: '#212e4b',
                  fontFamily: 'Pretendard Variable, Pretendard, system-ui, sans-serif',
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: '1.3',
                  letterSpacing: '-0.28px',
                }}
              >
                자세히 보기
              </KeywordTag>
              <span
                className="beginner_start_icon_shell beginner_start_icon_shell_question"
                aria-hidden="true"
              >
                <img
                  className="beginner_start_icon beginner_start_icon_question"
                  src={beginnerGuideQuestionImage}
                  alt=""
                />
              </span>
            </button>
          </div>
        </section>

        <section className="beginner_questions_section" ref={questionsSectionRef}>
          <span className="beginner_questions_collapse_trigger" ref={collapseTriggerRef} aria-hidden="true" />
          <div className="beginner_question_header">
            <div className="beginner_question_heading">
              <h2>최근 올라온 질문</h2>
              <p>다른 입문자들의 고민과 답변을 확인해보세요</p>
            </div>
          </div>

          <div className="beginner_question_inner">
            <div className="beginner_question_tags" aria-label="질문 카테고리">
              {categoryTabs.map((tab) => (
                <button
                  className="beginner_question_tag_button"
                  type="button"
                  key={tab}
                  onClick={() => setActiveCategory(tab)}
                  aria-pressed={activeCategory === tab}
                >
                  <span
                    className={`beginner_question_chip ${
                      activeCategory === tab
                        ? "is-active"
                        : tab === "전체"
                          ? "is-neutral"
                          : questionCategoryToneClass[tab]
                    }`}
                  >
                    {tab}
                  </span>
                </button>
              ))}
            </div>

            <div className="beginner_question_card_list community_animated_list">
              {visibleQuestions.map((question, questionIndex) => {
                const bookmarked = bookmarkedIds.has(question.id);

                return (
	                  <article
	                    className="beginner_question_card"
	                    key={question.id}
                      data-community-post-id={question.id}
                      tabIndex={-1}
                      style={{
                        animationDelay: introComplete
                          ? `${questionIndex * 0.035}s`
                          : `${0.18 + questionIndex * 0.025}s`,
                      }}
	                    onClick={() => openQuestionDetail(question.id)}
	                  >
                    <div className="beginner_question_card_header">
                      <div className="beginner_question_labels">
                        <span className="beginner_question_card_category">
                          {question.category}
                        </span>
                        {question.isNew || question.id === newPostId ? (
                          <span className="community_new_badge">NEW</span>
                        ) : null}
                      </div>

                      <button
                        className={`beginner_question_bookmark${bookmarked ? " is_active" : ""}`}
                        type="button"
                        aria-label={`${question.title} 북마크`}
                        aria-pressed={bookmarked}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleBookmark(question.id);
                        }}
                      >
                        <img
                          src={pinIcon}
                          alt=""
                        />
                      </button>
                    </div>

                    <div className="beginner_question_card_body">
                      <h3 className="beginner_question_card_tit">
                        {question.title}
                      </h3>

                      <div className="beginner_question_info">
                        <span className="beginner_question_author">
                          {question.author} · {question.time}
                        </span>
                        <span className="beginner_question_stats">
                          <span>
                            <img src={eyesIcon} alt="" />
                            {question.views}
                          </span>
                          <span>
                            <img src={chatSmallIcon} alt="" />
                            {question.comments}
                          </span>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {hasMoreQuestions ? (
              <div className="beginner_question_more_wrap">
                <More
                  ariaLabel={`${activeCategory} 질문 더 보기`}
                  className="beginner_question_more_button"
                  onClick={showMoreQuestions}
                  style={{ fontSize: 14, fontWeight: 500, lineHeight: "18px" }}
                />
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <div className="beginner_write_notice" aria-hidden="true">
        *초보자만 글쓰기 가능해요
      </div>
    </div>
  );
}

