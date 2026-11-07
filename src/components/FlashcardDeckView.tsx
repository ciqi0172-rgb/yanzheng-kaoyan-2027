import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  HatQuestion, 
  SubjectType, 
  HatKeywordType, 
  UserReviewItem 
} from '../types';
import { 
  RotateCw, 
  Bookmark, 
  Sparkles, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  HelpCircle,
  Eye, 
  EyeOff,
  Copy, 
  Check,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  Layers,
  Volume2,
  Play,
  Pause,
  ArrowRight,
  Flame
} from 'lucide-react';
import { recordReviewAttempt, toggleMarkRed } from '../services/ebbinghausStorage';

interface FlashcardDeckViewProps {
  questions: HatQuestion[];
  reviews: Record<string, UserReviewItem>;
  onReviewUpdated: () => void;
  onOpenConfusionModal: () => void;
  initialSubject?: SubjectType;
}

const SUBJECT_LIST: SubjectType[] = ['全部', '马原', '毛中特', '新思想', '史纲', '思修法治'];

const HAT_KEYWORD_LIST: HatKeywordType[] = [
  '全部',
  '核心',
  '本质',
  '根本',
  '首要',
  '基础/前提',
  '标志/转折',
  '关键/主线',
  '特征/优势',
  '出发点/落脚点',
  '目的/归宿',
  '灵魂/生命线',
  '保障/保证',
  '原则/准则',
];

export const FlashcardDeckView: React.FC<FlashcardDeckViewProps> = ({
  questions,
  reviews,
  onReviewUpdated,
  onOpenConfusionModal,
  initialSubject = '全部',
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>(initialSubject);
  const [selectedHat, setSelectedHat] = useState<HatKeywordType>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyRedMarked, setOnlyRedMarked] = useState<boolean>(false);
  const [onlyDueReview, setOnlyDueReview] = useState<boolean>(false);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [scratchInput, setScratchInput] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-play state
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);

  // Filtered Cards
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedSubject !== '全部' && q.subject !== selectedSubject) return false;
      if (selectedHat !== '全部' && q.hatType !== selectedHat) return false;
      
      const review = reviews[q.id];
      if (onlyRedMarked && !review?.isMarkedRed) return false;
      if (onlyDueReview) {
        const now = Date.now();
        if (!review || review.nextReviewAt > now) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          q.stem.toLowerCase().includes(query) ||
          q.answer.toLowerCase().includes(query) ||
          q.hatKeyword.toLowerCase().includes(query) ||
          q.trapAnalysis.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [questions, selectedSubject, selectedHat, onlyRedMarked, onlyDueReview, searchQuery, reviews]);

  const activeQuestion: HatQuestion | undefined = filteredQuestions[currentIndex];

  const handleNext = useCallback(() => {
    if (filteredQuestions.length === 0) return;
    setIsFlipped(false);
    setScratchInput('');
    setCurrentIndex((prev) => (prev + 1) % filteredQuestions.length);
  }, [filteredQuestions.length]);

  const handlePrev = useCallback(() => {
    if (filteredQuestions.length === 0) return;
    setIsFlipped(false);
    setScratchInput('');
    setCurrentIndex((prev) => (prev - 1 + filteredQuestions.length) % filteredQuestions.length);
  }, [filteredQuestions.length]);

  const handleShuffle = () => {
    if (filteredQuestions.length <= 1) return;
    const rand = Math.floor(Math.random() * filteredQuestions.length);
    setIsFlipped(false);
    setScratchInput('');
    setCurrentIndex(rand);
  };

  const handleRate = (rating: 'easy' | 'fuzzy' | 'forgot') => {
    if (!activeQuestion) return;
    recordReviewAttempt(activeQuestion.id, 'hat', rating);
    onReviewUpdated();
    setTimeout(() => {
      handleNext();
    }, 280);
  };

  const handleToggleRed = (id: string) => {
    toggleMarkRed(id, 'hat');
    onReviewUpdated();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') {
        if (e.key === 'Enter') {
          setIsFlipped(true);
        }
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (isFlipped) {
        if (e.key === '1') handleRate('easy');
        else if (e.key === '2') handleRate('fuzzy');
        else if (e.key === '3') handleRate('forgot');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleNext, handlePrev]);

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isAutoPlay && filteredQuestions.length > 0) {
      timer = setTimeout(() => {
        if (!isFlipped) {
          setIsFlipped(true);
        } else {
          handleNext();
        }
      }, 3500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAutoPlay, isFlipped, filteredQuestions.length, handleNext]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                Active Recall 3D 背诵舱
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                肖1000 全量帽子题卡片 · 共 <strong className="text-stone-800 dark:text-stone-200">{questions.length}</strong> 张
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              全量帽子题·卡片翻转主动背诵
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              科学记忆核心：先在脑海中/草稿纸完成主动提取（Active Recall），再点击翻转核验答案与设错陷阱。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isAutoPlay
                  ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
                  : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
              }`}
              title="自动循环翻牌"
            >
              {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoPlay ? '暂停自动播卡' : '自动连刷模式'}</span>
            </button>

            <button
              onClick={onOpenConfusionModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition-all shadow-sm"
            >
              <span>混淆矩阵对撞</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-stone-100 dark:border-stone-800">
          <span className="text-xs text-stone-400 shrink-0 mr-1">科目：</span>
          {SUBJECT_LIST.map((subject) => (
            <button
              key={subject}
              onClick={() => {
                setSelectedSubject(subject);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedSubject === subject
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>

        {/* Hat Type Chips & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
            <span className="text-xs text-stone-400 shrink-0 mr-1">帽子分类：</span>
            {HAT_KEYWORD_LIST.map((hat) => (
              <button
                key={hat}
                onClick={() => {
                  setSelectedHat(hat);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedHat === hat
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {hat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[180px] sm:min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索题干、答案或帽子词..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentIndex(0);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <button
              onClick={() => {
                setOnlyRedMarked(!onlyRedMarked);
                setCurrentIndex(0);
              }}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                onlyRedMarked
                  ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
              }`}
              title="仅看标红错题"
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyRedMarked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="hidden sm:inline">标红卡片</span>
            </button>

            <button
              onClick={() => {
                setOnlyDueReview(!onlyDueReview);
                setCurrentIndex(0);
              }}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                onlyDueReview
                  ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
              }`}
              title="仅看到期复习"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">今日到期</span>
            </button>
          </div>
        </div>
      </div>

      {/* The 3D Flashcard Presentation Deck */}
      <div className="max-w-3xl mx-auto space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200 dark:border-stone-800">
            <Sparkles className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-700 dark:text-stone-300">
              当前分类下暂无匹配的帽子背诵卡片
            </h3>
            <button
              onClick={() => {
                setSelectedSubject('全部');
                setSelectedHat('全部');
                setSearchQuery('');
                setOnlyRedMarked(false);
                setOnlyDueReview(false);
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold"
            >
              重置筛选条件
            </button>
          </div>
        ) : activeQuestion ? (
          <div className="space-y-4">
            {/* Navigation Meta */}
            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  卡片 {currentIndex + 1} / {filteredQuestions.length}
                </span>
                {reviews[activeQuestion.id]?.level !== undefined && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                    阶段 {reviews[activeQuestion.id].level} · 错 {reviews[activeQuestion.id].mistakeCount} 次
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShuffle}
                  className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
                  title="随机乱序抽卡"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleRed(activeQuestion.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    reviews[activeQuestion.id]?.isMarkedRed
                      ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
                      : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                  title="加入/移出重点标红错题本"
                >
                  <Bookmark className={`w-4 h-4 ${reviews[activeQuestion.id]?.isMarkedRed ? 'fill-rose-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* The Flashcard Body */}
            <div
              className={`relative bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-9 border shadow-sm transition-all duration-300 ${
                reviews[activeQuestion.id]?.isMarkedRed
                  ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-200 dark:ring-rose-950'
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              {/* Card Header Tags */}
              <div className="flex items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-rose-600 text-white">
                    {activeQuestion.subject}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200">
                    【{activeQuestion.hatKeyword}】
                  </span>
                  <span className="text-[11px] text-stone-400 font-semibold">
                    肖1000标准{activeQuestion.examType}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {activeQuestion.sourcePage && (
                    <span className="text-[10px] text-stone-400 font-mono">
                      {activeQuestion.sourcePage}
                    </span>
                  )}
                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                    title="翻转卡片"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CARD FRONT: The Question Stem */}
              <div className="min-h-[100px] flex items-center mb-6">
                <h2 className="text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 leading-relaxed font-serif">
                  {activeQuestion.stem}
                </h2>
              </div>

              {/* ACTIVE RECALL SCRATCHPAD (Shown when front is active) */}
              {!isFlipped && (
                <div className="pt-5 border-t border-dashed border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>先提笔在脑中提取帽子词（支持在此盲打）：</span>
                    </label>
                    <span className="text-[11px] text-stone-400">
                      按 Space 或 Enter 键翻牌
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="在脑中回忆出准确词语，或在此输入..."
                    value={scratchInput}
                    onChange={(e) => setScratchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsFlipped(true);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setIsFlipped(true)}
                      className="px-8 py-3 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>翻开卡片 · 显示标准答案与肖1000陷阱</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CARD BACK: Answer, Pitfalls & Confusions Revealed */}
              {isFlipped && (
                <div className="pt-5 border-t border-stone-200 dark:border-stone-800 space-y-4 animate-in fade-in duration-300">
                  {/* User scratch recall contrast */}
                  {scratchInput.trim() && (
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-stone-400">你刚刚提取的词：</span>
                        <span className="font-bold text-stone-800 dark:text-stone-200 ml-1">
                          {scratchInput}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400">对照正解 ⬇️</span>
                    </div>
                  )}

                  {/* Standard Answer Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                        精准秒选答案（帽子词）
                      </span>
                      <div className="text-lg sm:text-2xl font-black text-emerald-950 dark:text-emerald-200">
                        {activeQuestion.answer}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(activeQuestion.answer, activeQuestion.id)}
                      className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition-colors text-xs flex items-center gap-1 shadow-xs"
                      title="复制答案"
                    >
                      {copiedId === activeQuestion.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10px] font-bold">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold">复制</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Xiao 1000 Trap Analysis */}
                  <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 space-y-1.5 text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>【肖1000 经典设错陷阱与辨析】：</span>
                    </div>
                    <p>{activeQuestion.trapAnalysis}</p>
                  </div>

                  {/* Confusion Matrix Link */}
                  {activeQuestion.confusionGroup && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                      <span>
                        <strong>对比警报：</strong>同类混淆概念属于【{activeQuestion.confusionGroup}】
                      </span>
                      <button
                        onClick={onOpenConfusionModal}
                        className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        横向对撞矩阵 ↗
                      </button>
                    </div>
                  )}

                  {/* 3-Tier Ebbinghaus Self-Feedback */}
                  <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                    <div className="text-center mb-2.5">
                      <span className="text-[11px] font-semibold text-stone-500">
                        主动反馈记忆状态（按键盘 1 / 2 / 3 键）：
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        onClick={() => handleRate('easy')}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-800 dark:text-emerald-200 transition-all active:scale-95"
                      >
                        <div className="flex items-center gap-1 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>1. 认识 / 秒选</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 mt-0.5">
                          阶段 +1，下次后延
                        </span>
                      </button>

                      <button
                        onClick={() => handleRate('fuzzy')}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 border border-amber-300 text-amber-800 dark:text-amber-200 transition-all active:scale-95"
                      >
                        <div className="flex items-center gap-1 text-xs font-bold">
                          <HelpCircle className="w-4 h-4 text-amber-600" />
                          <span>2. 模糊 / 犹豫</span>
                        </div>
                        <span className="text-[10px] text-amber-600 mt-0.5">
                          标红，30分后复测
                        </span>
                      </button>

                      <button
                        onClick={() => handleRate('forgot')}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 border border-rose-300 text-rose-800 dark:text-rose-200 transition-all active:scale-95"
                      >
                        <div className="flex items-center gap-1 text-xs font-bold">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>3. 不会 / 做错</span>
                        </div>
                        <span className="text-[10px] text-rose-600 mt-0.5">
                          阶段归零，进错题本
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>上一张 (←)</span>
              </button>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isFlipped ? '翻回正面' : '翻开答案 (Space)'}</span>
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:opacity-90"
              >
                <span>下一张 (→)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
