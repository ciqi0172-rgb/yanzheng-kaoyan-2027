import React, { useState, useMemo } from 'react';
import { 
  HatQuestion, 
  SubjectType, 
  HatKeywordType, 
  UserReviewItem 
} from '../types';
import { 
  Search, 
  RotateCw, 
  Bookmark, 
  Sparkles, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  HelpCircle,
  Eye, 
  Grid, 
  Layers, 
  SplitSquareVertical, 
  Copy, 
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  CheckSquare,
  Flame,
  ArrowRight
} from 'lucide-react';
import { recordReviewAttempt, toggleMarkRed } from '../services/ebbinghausStorage';
import { buildHatQuestionOptions } from '../services/quizGenerator';

interface HatQuestionsViewProps {
  questions: HatQuestion[];
  reviews: Record<string, UserReviewItem>;
  onReviewUpdated: () => void;
  onOpenConfusionModal: () => void;
  initialSearch?: string;
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

export const HatQuestionsView: React.FC<HatQuestionsViewProps> = ({
  questions,
  reviews,
  onReviewUpdated,
  onOpenConfusionModal,
  initialSearch = '',
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('全部');
  const [selectedHat, setSelectedHat] = useState<HatKeywordType>('全部');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [onlyRedMarked, setOnlyRedMarked] = useState<boolean>(false);
  const [onlyDueReview, setOnlyDueReview] = useState<boolean>(false);

  // Drill Mode: 'exam' (Real 4-choice question) vs 'recall' (Blank/Active recall) vs 'grid' (All questions)
  const [drillMode, setDrillMode] = useState<'exam' | 'recall' | 'grid'>('exam');
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [selectedOptionKey, setSelectedOptionKey] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [userScratchpad, setUserScratchpad] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedSubject !== '全部' && q.subject !== selectedSubject) {
        return false;
      }
      if (selectedHat !== '全部' && q.hatType !== selectedHat) {
        return false;
      }
      const review = reviews[q.id];
      if (onlyRedMarked && !review?.isMarkedRed) {
        return false;
      }
      if (onlyDueReview) {
        const now = Date.now();
        if (!review || review.nextReviewAt > now) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inStem = q.stem.toLowerCase().includes(query);
        const inAnswer = q.answer.toLowerCase().includes(query);
        const inHat = q.hatKeyword.toLowerCase().includes(query);
        const inTrap = q.trapAnalysis.toLowerCase().includes(query);
        return inStem || inAnswer || inHat || inTrap;
      }
      return true;
    });
  }, [questions, selectedSubject, selectedHat, onlyRedMarked, onlyDueReview, searchQuery, reviews]);

  const activeQuestion: HatQuestion | undefined = filteredQuestions[cardIndex];

  // Options for active question
  const activeOptions = useMemo(() => {
    if (!activeQuestion) return [];
    return buildHatQuestionOptions(activeQuestion, questions);
  }, [activeQuestion, questions]);

  const handleNextCard = () => {
    if (filteredQuestions.length === 0) return;
    setSelectedOptionKey(null);
    setHasAnswered(false);
    setIsFlipped(false);
    setUserScratchpad('');
    setCardIndex((prev) => (prev + 1) % filteredQuestions.length);
  };

  const handlePrevCard = () => {
    if (filteredQuestions.length === 0) return;
    setSelectedOptionKey(null);
    setHasAnswered(false);
    setIsFlipped(false);
    setUserScratchpad('');
    setCardIndex((prev) => (prev - 1 + filteredQuestions.length) % filteredQuestions.length);
  };

  const handleShuffle = () => {
    if (filteredQuestions.length <= 1) return;
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    setSelectedOptionKey(null);
    setHasAnswered(false);
    setIsFlipped(false);
    setUserScratchpad('');
    setCardIndex(randomIndex);
  };

  const handleSelectOption = (key: string, isCorrect: boolean) => {
    if (hasAnswered || !activeQuestion) return;
    setSelectedOptionKey(key);
    setHasAnswered(true);

    if (isCorrect) {
      recordReviewAttempt(activeQuestion.id, 'hat', 'easy');
    } else {
      recordReviewAttempt(activeQuestion.id, 'hat', 'forgot');
    }
    onReviewUpdated();
  };

  const handleRate = (rating: 'easy' | 'fuzzy' | 'forgot') => {
    if (!activeQuestion) return;
    recordReviewAttempt(activeQuestion.id, 'hat', rating);
    onReviewUpdated();
    setTimeout(() => {
      handleNextCard();
    }, 280);
  };

  const handleToggleRed = (qId: string) => {
    toggleMarkRed(qId, 'hat');
    onReviewUpdated();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                肖1000 帽子题全真题库
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                已整编为高质量实战单选题与默写题 · 共 <strong className="text-stone-800 dark:text-stone-200">{questions.length}</strong> 道
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              政治“帽子题”全真实战刷题与陷阱突破
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              题干精设4项严密选择，深度还原肖1000易混干扰项。做题即可检验知识点，做错自动归入艾宾浩斯错题库。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenConfusionModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition-all shadow-sm"
            >
              <SplitSquareVertical className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>混淆矩阵对撞</span>
            </button>

            {/* Drill Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
              <button
                onClick={() => setDrillMode('exam')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  drillMode === 'exam'
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>四选一实战做题</span>
              </button>

              <button
                onClick={() => setDrillMode('recall')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  drillMode === 'recall'
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>口述盲填/翻牌</span>
              </button>

              <button
                onClick={() => setDrillMode('grid')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  drillMode === 'grid'
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>全题目清单</span>
              </button>
            </div>
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
                setCardIndex(0);
                setSelectedOptionKey(null);
                setHasAnswered(false);
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
            <span className="text-xs text-stone-400 shrink-0 mr-1">帽子类型：</span>
            {HAT_KEYWORD_LIST.map((hat) => (
              <button
                key={hat}
                onClick={() => {
                  setSelectedHat(hat);
                  setCardIndex(0);
                  setSelectedOptionKey(null);
                  setHasAnswered(false);
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
                placeholder="搜索题干、答案或帽子..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCardIndex(0);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <button
              onClick={() => {
                setOnlyRedMarked(!onlyRedMarked);
                setCardIndex(0);
              }}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                onlyRedMarked
                  ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
              }`}
              title="仅看标红错题"
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyRedMarked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="hidden sm:inline">标红错题</span>
            </button>

            <button
              onClick={() => {
                setOnlyDueReview(!onlyDueReview);
                setCardIndex(0);
              }}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                onlyDueReview
                  ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
              }`}
              title="仅看到期复习"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">到期复习</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Single Question Drill View (Exam Mode & Recall Mode) */}
      {(drillMode === 'exam' || drillMode === 'recall') && (
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-12 text-center border border-stone-200 dark:border-stone-800">
              <Sparkles className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-700 dark:text-stone-300">
                暂无符合筛选条件的帽子题
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
                重置所有筛选
              </button>
            </div>
          ) : activeQuestion ? (
            <div className="space-y-4">
              {/* Question Navigation Meta */}
              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    第 {cardIndex + 1} / {filteredQuestions.length} 题
                  </span>
                  {reviews[activeQuestion.id]?.level !== undefined && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                      艾宾浩斯第 {reviews[activeQuestion.id].level} 阶 · 错 {reviews[activeQuestion.id].mistakeCount} 次
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShuffle}
                    className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
                    title="随机抽题"
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
                    title="加入/移出重点错题本"
                  >
                    <Bookmark className={`w-4 h-4 ${reviews[activeQuestion.id]?.isMarkedRed ? 'fill-rose-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* The Exam Question Card */}
              <div
                className={`bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border shadow-sm transition-all duration-300 ${
                  reviews[activeQuestion.id]?.isMarkedRed
                    ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-200 dark:ring-rose-950'
                    : 'border-stone-200 dark:border-stone-800'
                }`}
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                      {activeQuestion.subject}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                      【{activeQuestion.hatKeyword}】
                    </span>
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      考研标准{activeQuestion.examType}
                    </span>
                  </div>

                  {activeQuestion.sourcePage && (
                    <span className="text-[10px] text-stone-400">
                      {activeQuestion.sourcePage}
                    </span>
                  )}
                </div>

                {/* Question Stem */}
                <div className="mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-relaxed">
                    {activeQuestion.stem}
                  </h2>
                </div>

                {/* MODE 1: EXAM CHOICE DRILL */}
                {drillMode === 'exam' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2.5">
                      {activeOptions.map((opt) => {
                        const isSelected = selectedOptionKey === opt.key;
                        const showCorrect = hasAnswered && opt.isCorrect;
                        const showWrong = hasAnswered && isSelected && !opt.isCorrect;

                        return (
                          <button
                            key={opt.key}
                            disabled={hasAnswered}
                            onClick={() => handleSelectOption(opt.key, opt.isCorrect)}
                            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                              showCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-300 dark:ring-emerald-900'
                                : showWrong
                                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-700 ring-2 ring-rose-300 dark:ring-rose-900'
                                : hasAnswered
                                ? 'bg-stone-50/60 dark:bg-stone-850 border-stone-200 dark:border-stone-800 opacity-60'
                                : 'bg-stone-50/70 hover:bg-stone-100 dark:bg-stone-800/60 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-700 cursor-pointer'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${
                                showCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : showWrong
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-600'
                              }`}
                            >
                              {opt.key}
                            </span>

                            <div className="flex-1">
                              <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                                {opt.text}
                              </span>

                              {hasAnswered && isSelected && !opt.isCorrect && (
                                <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-1 font-medium">
                                  {opt.trapExplanation}
                                </p>
                              )}
                            </div>

                            {showCorrect && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            {showWrong && (
                              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanations & Xiao 1000 Pitfall Analysis (Revealed after answer) */}
                    {hasAnswered && (
                      <div className="mt-5 pt-5 border-t border-stone-200 dark:border-stone-800 space-y-3.5 animate-in fade-in duration-300">
                        {/* Status message */}
                        <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                          selectedOptionKey && activeOptions.find((o) => o.key === selectedOptionKey)?.isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
                        }`}>
                          <div className="flex items-center gap-2 text-xs font-bold">
                            {selectedOptionKey && activeOptions.find((o) => o.key === selectedOptionKey)?.isCorrect ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>回答正确！记忆稳固度 +1</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-rose-600" />
                                <span>选错掉坑！已自动加标红归入艾宾浩斯错题舱</span>
                              </>
                            )}
                          </div>

                          <span className="text-xs font-black">
                            正确答案：{activeQuestion.answer}
                          </span>
                        </div>

                        {/* Detailed Trap Analysis */}
                        <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>肖1000 经典设错陷阱与深度辨析：</span>
                          </div>
                          <p className="text-xs text-rose-900/90 dark:text-rose-200 leading-relaxed">
                            {activeQuestion.trapAnalysis}
                          </p>
                        </div>

                        {/* Confusion Matrix callout */}
                        {activeQuestion.confusionGroup && (
                          <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                            <span>所属混淆组：【{activeQuestion.confusionGroup}】</span>
                            <button
                              onClick={onOpenConfusionModal}
                              className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
                            >
                              打开混淆矩阵 ↗
                            </button>
                          </div>
                        )}

                        {/* Next question trigger */}
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={handleNextCard}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold shadow-md hover:opacity-90"
                          >
                            <span>下一道题 (Enter)</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MODE 2: ACTIVE RECALL / SCRATCHPAD FLIP DRILL */}
                {drillMode === 'recall' && (
                  <div className="space-y-4">
                    {!isFlipped ? (
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>在脑海中提取或输入你的帽子词答案（先提笔，再翻牌）：</span>
                        </label>

                        <input
                          type="text"
                          placeholder="例如：无产阶级领导权 / 高质量发展 / 勇于自我革命..."
                          value={userScratchpad}
                          onChange={(e) => setUserScratchpad(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setIsFlipped(true);
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />

                        <div className="flex justify-center pt-2">
                          <button
                            onClick={() => setIsFlipped(true)}
                            className="px-6 py-2.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>翻开核对答案与肖1000陷阱</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        {userScratchpad.trim() && (
                          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border text-xs flex items-center justify-between">
                            <div>
                              <span className="text-stone-400">你刚刚提取的词：</span>
                              <span className="font-semibold text-stone-800 dark:text-stone-200 ml-1">
                                {userScratchpad}
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-400">对照核验 ⬇️</span>
                          </div>
                        )}

                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                              精准标准帽子答案
                            </span>
                            <div className="text-base sm:text-lg font-black text-emerald-900 dark:text-emerald-200">
                              {activeQuestion.answer}
                            </div>
                          </div>

                          <button
                            onClick={() => handleCopy(activeQuestion.answer, activeQuestion.id)}
                            className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1"
                          >
                            {copiedId === activeQuestion.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                          <strong>肖1000陷阱深度辨析：</strong>{activeQuestion.trapAnalysis}
                        </div>

                        {/* Rating buttons */}
                        <div className="grid grid-cols-3 gap-2.5 pt-2">
                          <button
                            onClick={() => handleRate('easy')}
                            className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold"
                          >
                            熟练秒选
                          </button>
                          <button
                            onClick={() => handleRate('fuzzy')}
                            className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 dark:text-amber-300 text-xs font-bold"
                          >
                            模糊犹豫
                          </button>
                          <button
                            onClick={() => handleRate('forgot')}
                            className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:text-rose-300 text-xs font-bold"
                          >
                            未提取出
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrevCard}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>上一题</span>
                </button>

                <div className="text-xs text-stone-400">
                  可使用键盘快捷键或随机按钮刷题
                </div>

                <button
                  onClick={handleNextCard}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold"
                >
                  <span>下一题</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* MODE 3: GRID LIST OF ALL QUESTIONS */}
      {drillMode === 'grid' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>找到 {filteredQuestions.length} 道高频题目</span>
            <span>点击任意题目直接启动真题四选一模考</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuestions.map((q, idx) => {
              const review = reviews[q.id];
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl bg-white dark:bg-stone-850 border transition-all flex flex-col justify-between ${
                    review?.isMarkedRed
                      ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-200 dark:ring-rose-950'
                      : 'border-stone-200 dark:border-stone-750 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                          {q.subject}
                        </span>
                        <span className="text-[10px] text-stone-400 font-semibold">
                          【{q.hatKeyword}】
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleRed(q.id)}
                        className="text-stone-400 hover:text-rose-600"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${review?.isMarkedRed ? 'fill-rose-600 text-rose-600' : ''}`} />
                      </button>
                    </div>

                    <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 mb-2 leading-relaxed">
                      {q.stem}
                    </h3>

                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 mb-2">
                      <span className="text-[10px] text-emerald-600 block">标准帽子答案：</span>
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        {q.answer}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 line-clamp-2">
                      <strong className="text-rose-600">陷阱：</strong>{q.trapAnalysis}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">
                      {review ? `已做 ${review.totalAttempts} 次 · 阶段 ${review.level}` : '未做题'}
                    </span>

                    <button
                      onClick={() => {
                        const targetIdx = filteredQuestions.findIndex((item) => item.id === q.id);
                        if (targetIdx !== -1) {
                          setCardIndex(targetIdx);
                          setDrillMode('exam');
                          setSelectedOptionKey(null);
                          setHasAnswered(false);
                        }
                      }}
                      className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>进四选一实做</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
