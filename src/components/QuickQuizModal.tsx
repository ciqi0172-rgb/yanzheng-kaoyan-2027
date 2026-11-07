import React, { useState, useEffect, useMemo } from 'react';
import { HatQuestion } from '../types';
import { 
  X, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  Trophy, 
  AlertTriangle,
  ArrowRight,
  Eye
} from 'lucide-react';
import { recordReviewAttempt } from '../services/ebbinghausStorage';

interface QuickQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: HatQuestion[];
  onReviewUpdated: () => void;
}

export const QuickQuizModal: React.FC<QuickQuizModalProps> = ({
  isOpen,
  onClose,
  questions,
  onReviewUpdated,
}) => {
  const [quizList, setQuizList] = useState<HatQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [revealedCurrent, setRevealedCurrent] = useState<boolean>(false);
  const [currentInput, setCurrentInput] = useState<string>('');

  // Initialize a random 10 questions when modal opens
  useEffect(() => {
    if (isOpen && questions.length > 0) {
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      setQuizList(shuffled.slice(0, 10));
      setCurrentIndex(0);
      setUserAnswers({});
      setIsSubmitted(false);
      setRevealedCurrent(false);
      setCurrentInput('');
    }
  }, [isOpen, questions]);

  if (!isOpen) return null;

  const currentQ = quizList[currentIndex];

  const handleNext = (rating: 'easy' | 'forgot') => {
    if (!currentQ) return;
    
    // Save attempt to user answers
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: rating,
    }));

    // Record into Ebbinghaus
    recordReviewAttempt(currentQ.id, 'hat', rating);
    onReviewUpdated();

    if (currentIndex + 1 < quizList.length) {
      setCurrentIndex((prev) => prev + 1);
      setRevealedCurrent(false);
      setCurrentInput('');
    } else {
      setIsSubmitted(true);
    }
  };

  const handleRestart = () => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setQuizList(shuffled.slice(0, 10));
    setCurrentIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setRevealedCurrent(false);
    setCurrentInput('');
  };

  const correctCount = Object.values(userAnswers).filter((v) => v === 'easy').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600 text-white">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                10题考研帽子题·闪电突击测
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                每题见题干先在大脑中秒出帽子词，检验实战提取敏锐度
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isSubmitted && currentQ ? (
            <div className="space-y-5">
              {/* Progress & Badge */}
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  题目：{currentIndex + 1} / {quizList.length}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
                  {currentQ.subject} · 【{currentQ.hatKeyword}】
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-rose-600 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / quizList.length) * 100}%` }}
                />
              </div>

              {/* Stem */}
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-relaxed">
                  {currentQ.stem}
                </h3>
              </div>

              {/* Interactive Active Recall Scratch */}
              {!revealedCurrent ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="在脑中提取或在此输入帽子词..."
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setRevealedCurrent(true);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />

                  <div className="flex justify-center">
                    <button
                      onClick={() => setRevealedCurrent(true)}
                      className="px-5 py-2.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold hover:opacity-90 flex items-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>查看正确答案与陷阱 (Enter)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                    <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                      正确帽子词：
                    </div>
                    <div className="text-base font-black text-emerald-900 dark:text-emerald-200 mt-0.5">
                      {currentQ.answer}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                    <strong>肖1000陷阱点拨：</strong>{currentQ.trapAnalysis}
                  </div>

                  {/* Feedback Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleNext('easy')}
                      className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>答对了 / 秒选</span>
                    </button>

                    <button
                      onClick={() => handleNext('forgot')}
                      className="p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>答错了 / 模糊（入错题本）</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isSubmitted ? (
            /* Results Screen */
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
                  测验完成！得分：{correctCount} / {quizList.length}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {correctCount >= 8
                    ? '太强了！基础极为扎实，帽子题敏锐度处于第一梯队！'
                    : '已将易混与错误题目自动标红并排入艾宾浩斯复习舱。'}
                </p>
              </div>

              {/* Summary List */}
              <div className="space-y-2 text-left max-h-[300px] overflow-y-auto pr-1 no-scrollbar pt-2">
                {quizList.map((q, idx) => {
                  const isCorrect = userAnswers[idx] === 'easy';
                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                        isCorrect
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                          : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            #{idx + 1} 【{q.hatKeyword}】
                          </span>
                          <span className="text-[10px] text-stone-400">({q.subject})</span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-300">{q.stem}</p>
                        <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                          正解：{q.answer}
                        </p>
                      </div>

                      <div className="shrink-0 mt-1">
                        {isCorrect ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            秒对
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            已入错题
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-3 pt-3">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>再测一组10题</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold hover:opacity-90"
                >
                  返回学习舱
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
