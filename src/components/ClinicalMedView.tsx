import React, { useState, useMemo } from 'react';
import { ClinicalPoint, ClinicalQuestion, UserReviewItem, ClinicalQuestionType } from '../types';
import { CLINICAL_QUESTIONS } from '../data/clinicalQuestions';
import { 
  Search, 
  Activity, 
  Sparkles, 
  Bookmark, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  Table, 
  Lightbulb, 
  Copy, 
  Check,
  ChevronRight,
  ChevronLeft,
  CheckSquare,
  Layers,
  FileQuestion,
  RotateCw,
  Shuffle,
  Eye,
  EyeOff
} from 'lucide-react';
import { recordReviewAttempt, toggleMarkRed } from '../services/ebbinghausStorage';

interface ClinicalMedViewProps {
  points: ClinicalPoint[];
  reviews: Record<string, UserReviewItem>;
  onReviewUpdated: () => void;
  initialSearch?: string;
}

const DISCIPLINES: ('全部' | '内科' | '外科' | '病理' | '生理' | '生化')[] = [
  '全部',
  '内科',
  '外科',
  '病理',
  '生理',
  '生化',
];

const QUESTION_TYPES: ('全部' | 'A型题(单选)' | 'B型题(配伍)' | 'X型题(多选)' | '鉴别大表闯关题')[] = [
  '全部',
  'A型题(单选)',
  'B型题(配伍)',
  'X型题(多选)',
  '鉴别大表闯关题',
];

export const ClinicalMedView: React.FC<ClinicalMedViewProps> = ({
  points,
  reviews,
  onReviewUpdated,
  initialSearch = '',
}) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('全部');
  const [selectedType, setSelectedType] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [onlyRedMarked, setOnlyRedMarked] = useState<boolean>(false);
  
  // Active Question State
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [selectedSingleKey, setSelectedSingleKey] = useState<string | null>(null);
  const [selectedMultiKeys, setSelectedMultiKeys] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Table Matrix Drill Sub-mode
  const [activeTablePointId, setActiveTablePointId] = useState<string>(points[0]?.id || '');
  const [revealedCells, setRevealedCells] = useState<Record<string, boolean>>({});

  // Filter Clinical Questions
  const filteredQuestions = useMemo(() => {
    return CLINICAL_QUESTIONS.filter((q) => {
      if (selectedDiscipline !== '全部' && q.discipline !== selectedDiscipline) {
        return false;
      }
      if (selectedType !== '全部' && q.questionType !== selectedType) {
        return false;
      }
      const review = reviews[q.id];
      if (onlyRedMarked && !review?.isMarkedRed) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inStem = q.stem.toLowerCase().includes(query);
        const inExpl = q.explanation.toLowerCase().includes(query);
        const inMnemonic = q.mnemonic?.toLowerCase().includes(query) || false;
        const inOptions = q.options.some((o) => o.text.toLowerCase().includes(query));
        return inStem || inExpl || inMnemonic || inOptions;
      }
      return true;
    });
  }, [selectedDiscipline, selectedType, onlyRedMarked, searchQuery, reviews]);

  const activeQuestion: ClinicalQuestion | undefined = filteredQuestions[questionIndex];

  // Table Drill Point
  const activeTablePoint = useMemo(() => {
    return points.find((p) => p.id === activeTablePointId) || points[0];
  }, [points, activeTablePointId]);

  const handleNextQuestion = () => {
    if (filteredQuestions.length === 0) return;
    setSelectedSingleKey(null);
    setSelectedMultiKeys([]);
    setHasSubmitted(false);
    setQuestionIndex((prev) => (prev + 1) % filteredQuestions.length);
  };

  const handlePrevQuestion = () => {
    if (filteredQuestions.length === 0) return;
    setSelectedSingleKey(null);
    setSelectedMultiKeys([]);
    setHasSubmitted(false);
    setQuestionIndex((prev) => (prev - 1 + filteredQuestions.length) % filteredQuestions.length);
  };

  const handleSingleAnswer = (key: string, isCorrect: boolean) => {
    if (hasSubmitted || !activeQuestion) return;
    setSelectedSingleKey(key);
    setHasSubmitted(true);

    if (isCorrect) {
      recordReviewAttempt(activeQuestion.id, 'clinical', 'easy');
    } else {
      recordReviewAttempt(activeQuestion.id, 'clinical', 'forgot');
    }
    onReviewUpdated();
  };

  const handleToggleMultiKey = (key: string) => {
    if (hasSubmitted) return;
    setSelectedMultiKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmitMultiAnswer = () => {
    if (hasSubmitted || !activeQuestion) return;
    setHasSubmitted(true);

    // Check if selected matches correctKeys exactly
    const correct = activeQuestion.correctKeys.sort().join(',');
    const userSelected = [...selectedMultiKeys].sort().join(',');
    const isFullCorrect = correct === userSelected;

    if (isFullCorrect) {
      recordReviewAttempt(activeQuestion.id, 'clinical', 'easy');
    } else {
      recordReviewAttempt(activeQuestion.id, 'clinical', 'forgot');
    }
    onReviewUpdated();
  };

  const handleToggleRed = (id: string) => {
    toggleMarkRed(id, 'clinical');
    onReviewUpdated();
  };

  const toggleCellMask = (key: string) => {
    setRevealedCells((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const revealAllCells = () => {
    const allRev: Record<string, boolean> = {};
    activeTablePoint?.comparisonTable?.rows.forEach((row, rIdx) => {
      row.values.forEach((_, vIdx) => {
        allRev[`${rIdx}-${vIdx}`] = true;
      });
    });
    setRevealedCells(allRev);
  };

  const hideAllCells = () => {
    setRevealedCells({});
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                天天师兄 西综全真题库
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                收录标准 A型病例分析 · B型配伍 · X型多选 · 鉴别大表闯关题
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              西综高频核心考点·实战做题与通关测验
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              每一个病种、指标、心电图与首选药均已整编为高仿真考题。拒绝死记硬背，实战见真章！
            </p>
          </div>

          {/* Quick Stats or Table Mode Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (selectedType === '鉴别大表闯关题') {
                  setSelectedType('全部');
                } else {
                  setSelectedType('鉴别大表闯关题');
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                selectedType === '鉴别大表闯关题'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>{selectedType === '鉴别大表闯关题' ? '返回全真题库' : '切换鉴别大表闯关'}</span>
            </button>
          </div>
        </div>

        {/* Question Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-stone-100 dark:border-stone-800">
          <span className="text-xs text-stone-400 shrink-0 mr-1">题型分类：</span>
          {QUESTION_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setQuestionIndex(0);
                setHasSubmitted(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedType === type
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Discipline Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
            <span className="text-xs text-stone-400 shrink-0 mr-1">学科：</span>
            {DISCIPLINES.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setSelectedDiscipline(d);
                  setQuestionIndex(0);
                  setHasSubmitted(false);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedDiscipline === d
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索疾病、药物、口诀或题干..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setQuestionIndex(0);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => {
                setOnlyRedMarked(!onlyRedMarked);
                setQuestionIndex(0);
              }}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                onlyRedMarked
                  ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
              }`}
              title="仅看重点标红考题"
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyRedMarked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="hidden sm:inline">标红错题</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: STANDARD CLINICAL QUESTIONS DRILL (A型, B型, X型) */}
      {selectedType !== '鉴别大表闯关题' && (
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-12 text-center border border-stone-200 dark:border-stone-800">
              <Sparkles className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-700 dark:text-stone-300">
                暂无符合筛选条件的西综试题
              </h3>
              <button
                onClick={() => {
                  setSelectedDiscipline('全部');
                  setSelectedType('全部');
                  setSearchQuery('');
                  setOnlyRedMarked(false);
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
                    第 {questionIndex + 1} / {filteredQuestions.length} 题
                  </span>
                  {reviews[activeQuestion.id]?.level !== undefined && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                      阶段 {reviews[activeQuestion.id].level} · 错 {reviews[activeQuestion.id].mistakeCount} 次
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRed(activeQuestion.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      reviews[activeQuestion.id]?.isMarkedRed
                        ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
                        : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                    }`}
                    title="重点标红"
                  >
                    <Bookmark className={`w-4 h-4 ${reviews[activeQuestion.id]?.isMarkedRed ? 'fill-rose-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Question Card */}
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
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-700 text-white">
                      {activeQuestion.discipline}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {activeQuestion.questionType}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      考点：{activeQuestion.category}
                    </span>
                  </div>

                  {activeQuestion.relatedTableFeature && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                      溯源大表：{activeQuestion.relatedTableFeature}
                    </span>
                  )}
                </div>

                {/* Stem */}
                <div className="mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-relaxed whitespace-pre-line">
                    {activeQuestion.stem}
                  </h2>
                </div>

                {/* SINGLE-CHOICE (A-Type & B-Type) */}
                {activeQuestion.questionType !== 'X型题(多选)' ? (
                  <div className="space-y-2.5">
                    {activeQuestion.options.map((opt) => {
                      const isSelected = selectedSingleKey === opt.key;
                      const showCorrect = hasSubmitted && opt.isCorrect;
                      const showWrong = hasSubmitted && isSelected && !opt.isCorrect;

                      return (
                        <button
                          key={opt.key}
                          disabled={hasSubmitted}
                          onClick={() => handleSingleAnswer(opt.key, opt.isCorrect)}
                          className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                            showCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-300 dark:ring-emerald-900'
                              : showWrong
                              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-700 ring-2 ring-rose-300 dark:ring-rose-900'
                              : hasSubmitted
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
                                : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-300'
                            }`}
                          >
                            {opt.key}
                          </span>

                          <div className="flex-1">
                            <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                              {opt.text}
                            </span>
                            {hasSubmitted && isSelected && !opt.isCorrect && (
                              <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-1 font-medium">
                                {opt.trapExplanation}
                              </p>
                            )}
                          </div>

                          {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                          {showWrong && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* MULTI-CHOICE (X-Type) */
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                      ⚠️ 本题为西综X型多选题（正确选项为2-4个，多选、少选、错选均不得分）：
                    </div>

                    <div className="space-y-2.5">
                      {activeQuestion.options.map((opt) => {
                        const isChecked = selectedMultiKeys.includes(opt.key);
                        const isCorrectOption = opt.isCorrect;
                        const showCorrect = hasSubmitted && isCorrectOption;
                        const showMissed = hasSubmitted && isCorrectOption && !isChecked;
                        const showWrongChosen = hasSubmitted && !isCorrectOption && isChecked;

                        return (
                          <div
                            key={opt.key}
                            onClick={() => handleToggleMultiKey(opt.key)}
                            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                              showWrongChosen
                                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 ring-2 ring-rose-300'
                                : showCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-300'
                                : isChecked
                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400'
                                : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={hasSubmitted}
                              onChange={() => {}}
                              className="mt-1 w-4 h-4 text-emerald-600 rounded"
                            />

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs">{opt.key}.</span>
                                <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                                  {opt.text}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!hasSubmitted && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleSubmitMultiAnswer}
                          disabled={selectedMultiKeys.length === 0}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all"
                        >
                          提交多选答案
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Question Explanation & Tian Tian Shixiong Mnemonic Banner */}
                {hasSubmitted && (
                  <div className="mt-6 pt-5 border-t border-stone-200 dark:border-stone-800 space-y-4 animate-in fade-in duration-300">
                    {/* Correctness verdict */}
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>正确答案：{activeQuestion.correctKeys.join('、')}</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        已同步艾宾浩斯抗遗忘算法
                      </span>
                    </div>

                    {/* Mnemonic */}
                    {activeQuestion.mnemonic && (
                      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-black text-amber-900 dark:text-amber-200">
                            天天师兄 考研秒杀高分口诀：
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300 font-mono mt-0.5">
                            “{activeQuestion.mnemonic}”
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Full Explanation */}
                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-1.5 text-xs text-stone-800 dark:text-stone-200 leading-relaxed">
                      <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>【天天师兄真题深度解析】</span>
                      </div>
                      <p>{activeQuestion.explanation}</p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleNextQuestion}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold shadow-md hover:opacity-90"
                      >
                        <span>下一道题 (Enter)</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrevQuestion}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>上一题</span>
                </button>

                <div className="text-xs text-stone-400">
                  西综做题严格依托天天师兄核心资料
                </div>

                <button
                  onClick={handleNextQuestion}
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

      {/* VIEW 2: TABULAR MATRIX DRILL MODE (逐表逐格闯关测试) */}
      {selectedType === '鉴别大表闯关题' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table Selector */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs text-stone-500 font-semibold px-1">
              选择要攻克的核心鉴别大表 ({points.length} 个)：
            </div>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1 no-scrollbar">
              {points.map((p) => {
                const isActive = p.id === activeTablePoint.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActiveTablePointId(p.id);
                      setRevealedCells({});
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-xs ring-1 ring-emerald-300'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white">
                        {p.discipline}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {p.category}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {p.title}
                    </h4>

                    {p.mnemonic && (
                      <div className="mt-1.5 text-[10px] text-amber-700 dark:text-amber-400 truncate">
                        💡 口诀：{p.mnemonic}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Matrix Interactive Canvas */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                      {activeTablePoint.discipline} · {activeTablePoint.category}
                    </span>
                    <span className="text-xs text-stone-500">
                      逐格遮挡测试模式
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                    {activeTablePoint.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={revealAllCells}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>全部翻开</span>
                  </button>
                  <button
                    onClick={hideAllCells}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold flex items-center gap-1 shadow-xs"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>全部遮挡闯关</span>
                  </button>
                </div>
              </div>

              {/* Mnemonic callout */}
              {activeTablePoint.mnemonic && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-amber-900 dark:text-amber-200 font-bold">
                    天天师兄秒杀口诀：{activeTablePoint.mnemonic}
                  </span>
                </div>
              )}

              {/* The Interactive Masked Matrix Table */}
              {activeTablePoint.comparisonTable && (
                <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 font-bold">
                        {activeTablePoint.comparisonTable.columns.map((col, idx) => (
                          <th key={idx} className={`p-3 ${idx === 0 ? 'w-28 sm:w-36 bg-stone-200/60' : ''}`}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                      {activeTablePoint.comparisonTable.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-stone-50/50">
                          <td className="p-3 font-bold text-stone-800 dark:text-stone-200 bg-stone-50/60">
                            {row.feature}
                          </td>
                          {row.values.map((val, vIdx) => {
                            const key = `${rIdx}-${vIdx}`;
                            const isRevealed = !!revealedCells[key];

                            if (!isRevealed) {
                              return (
                                <td
                                  key={vIdx}
                                  onClick={() => toggleCellMask(key)}
                                  className="p-3 bg-stone-100/90 dark:bg-stone-800/90 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 cursor-pointer text-center transition-all"
                                  title="先心算回忆，点击揭晓答案"
                                >
                                  <span className="text-[11px] font-bold text-stone-400 flex items-center justify-center gap-1">
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    <span>点击揭晓</span>
                                  </span>
                                </td>
                              );
                            }

                            return (
                              <td
                                key={vIdx}
                                onClick={() => toggleCellMask(key)}
                                className="p-3 text-stone-800 dark:text-stone-200 leading-relaxed cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800"
                                title="点击可重新遮挡"
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* High Yield Pearls */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  高频真题踩分与避坑要点：
                </span>
                {activeTablePoint.highYieldTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
