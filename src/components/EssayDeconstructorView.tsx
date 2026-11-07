import React, { useState } from 'react';
import { EssayTemplate } from '../types';
import { ESSAY_DRILLS } from '../data/essayDrills';
import { 
  BookOpen, 
  Search, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Zap, 
  Layers,
  ArrowRight,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCw,
  FileText
} from 'lucide-react';

interface EssayDeconstructorViewProps {
  templates: EssayTemplate[];
}

export const EssayDeconstructorView: React.FC<EssayDeconstructorViewProps> = ({
  templates,
}) => {
  const [activeDrillIndex, setActiveDrillIndex] = useState<number>(0);
  const [activeMode, setActiveMode] = useState<'drill' | 'reference'>('drill');
  
  // Interactive Drill State
  const [step1SelectedKey, setStep1SelectedKey] = useState<string | null>(null);
  const [revealedBlanks, setRevealedBlanks] = useState<Record<string, boolean>>({});
  const [userBlankInputs, setUserBlankInputs] = useState<Record<string, string>>({});
  const [step3SelectedKey, setStep3SelectedKey] = useState<string | null>(null);
  const [isDrillSubmitted, setIsDrillSubmitted] = useState<boolean>(false);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  const currentDrill = ESSAY_DRILLS[activeDrillIndex] || ESSAY_DRILLS[0];

  const handleNextDrill = () => {
    setStep1SelectedKey(null);
    setRevealedBlanks({});
    setUserBlankInputs({});
    setStep3SelectedKey(null);
    setIsDrillSubmitted(false);
    setActiveDrillIndex((prev) => (prev + 1) % ESSAY_DRILLS.length);
  };

  const handleResetDrill = () => {
    setStep1SelectedKey(null);
    setRevealedBlanks({});
    setUserBlankInputs({});
    setStep3SelectedKey(null);
    setIsDrillSubmitted(false);
  };

  const toggleBlank = (key: string) => {
    setRevealedBlanks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCopyFramework = () => {
    const fullText = `【${currentDrill.questionNumber} ${currentDrill.subject}大题实战答案框架】
主题：${currentDrill.theme}

【设问】：${currentDrill.questionPrompt}

第一步：点题定性
${currentDrill.step1Options.find((o) => o.isBest)?.text}

第二步：硬核核心踩分点
${currentDrill.step2ClozeDrills.map((d) => `${d.subtitle}\n${d.fullAnswer}`).join('\n\n')}

第三步：万能升华大局观
${currentDrill.step3Options.find((o) => o.isBest)?.text}

【考场防坑红线】
${currentDrill.fullScoringGuide.trapAvoidance}
`;

    navigator.clipboard.writeText(fullText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  // Calculate score
  const isStep1Correct = step1SelectedKey && currentDrill.step1Options.find((o) => o.key === step1SelectedKey)?.isBest;
  const isStep3Correct = step3SelectedKey && currentDrill.step3Options.find((o) => o.key === step3SelectedKey)?.isBest;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                17页万能答题模板 · 实战考试场
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                涵盖 34题(马原) · 35题(新思想) · 36题(史纲) · 37题(思修) · 38题(当代)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              万能大题三步法·真题材料全真实战模拟考场
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              读真实考研材料 ➡️ 题一：定性点题实选 ➡️ 题二：核心踩分点填空闯关 ➡️ 题三：大局观升华 ➡️ 即时给出10分制阅卷报告！
            </p>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
            <button
              onClick={() => setActiveMode('drill')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMode === 'drill'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>真题大题闯关实测</span>
            </button>

            <button
              onClick={() => setActiveMode('reference')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMode === 'reference'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>高分答题框架速查</span>
            </button>
          </div>
        </div>

        {/* Drill Tabs: 34题, 35题, 36题, 37题, 38题 */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-stone-100 dark:border-stone-800">
          <span className="text-xs text-stone-400 shrink-0">选择大题：</span>
          {ESSAY_DRILLS.map((drill, idx) => (
            <button
              key={drill.id}
              onClick={() => {
                setActiveDrillIndex(idx);
                handleResetDrill();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeDrillIndex === idx
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {drill.questionNumber} ({drill.subject})
            </button>
          ))}
        </div>
      </div>

      {/* MODE 1: INTERACTIVE DRILL EXAM */}
      {activeMode === 'drill' && (
        <div className="space-y-6">
          {/* Authentic Exam Material Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-black bg-amber-600 text-white">
                  {currentDrill.questionNumber} · {currentDrill.subject} 全真模考
                </span>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  主题：{currentDrill.theme}
                </span>
              </div>

              <button
                onClick={handleCopyFramework}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopied ? '已复制框架' : '复制标准答案'}</span>
              </button>
            </div>

            {/* Material Background text */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-serif whitespace-pre-line">
              {currentDrill.materialBackground}
            </div>

            {/* Prompt */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
              🎯 【试题设问】：{currentDrill.questionPrompt}
            </div>
          </div>

          {/* STEP 1: 定性点题选择题 (2分) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  【题一·定性点题】将上述白话材料翻译为考研政治原理，最佳点题首句是？（2分）
                </h3>
              </div>
              <span className="text-xs text-blue-600 font-semibold">首句定乾坤</span>
            </div>

            <div className="space-y-2.5">
              {currentDrill.step1Options.map((opt) => {
                const isSelected = step1SelectedKey === opt.key;
                const showFeedback = isDrillSubmitted;
                const isBest = opt.isBest;

                return (
                  <div
                    key={opt.key}
                    onClick={() => !isDrillSubmitted && setStep1SelectedKey(opt.key)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      showFeedback && isBest
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-300'
                        : showFeedback && isSelected && !isBest
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 ring-2 ring-rose-300'
                        : isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400'
                        : 'bg-stone-50 dark:bg-stone-850 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-white dark:bg-stone-700 border text-stone-700 dark:text-stone-200'
                      }`}>
                        {opt.key}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 leading-relaxed">
                          {opt.text}
                        </p>
                        {showFeedback && (
                          <div className={`mt-2 text-xs font-semibold ${isBest ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                            {opt.scoreRationale}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: 硬核踩分点默写/填空闯关 (6分) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-600 text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  【题二·踩分素材填空闯关】完整背诵出材料中必须踩中的哲学/政治核心踩分点（6分）
                </h3>
              </div>
              <span className="text-xs text-amber-600 font-semibold">采分核心点</span>
            </div>

            <div className="space-y-4">
              {currentDrill.step2ClozeDrills.map((drill, dIdx) => (
                <div
                  key={dIdx}
                  className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3"
                >
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    {drill.subtitle}
                  </h4>

                  <div className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-mono">
                    {drill.maskedText.split(/【(.*?)】/).map((part, pIdx) => {
                      if (pIdx % 2 === 1) {
                        const blankKey = `${dIdx}-${pIdx}`;
                        const isRevealed = !!revealedBlanks[blankKey] || isDrillSubmitted;
                        return (
                          <span
                            key={pIdx}
                            onClick={() => toggleBlank(blankKey)}
                            className={`inline-block mx-1 px-2 py-0.5 rounded text-xs font-bold cursor-pointer transition-all ${
                              isRevealed
                                ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100'
                                : 'bg-stone-300 dark:bg-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-400'
                            }`}
                            title="点击揭晓/遮挡此空"
                          >
                            {isRevealed ? part : `[ 空格：点击揭晓 ]`}
                          </span>
                        );
                      }
                      return <span key={pIdx}>{part}</span>;
                    })}
                  </div>

                  {isDrillSubmitted && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-900 dark:text-emerald-300">
                      <strong>【阅卷采分标准】：</strong>{drill.fullAnswer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: 大局观升华测评 (2分) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  【题三·大局观升华收尾】选出最契合时代背景的万能方法论收尾句（2分）
                </h3>
              </div>
              <span className="text-xs text-emerald-600 font-semibold">收官升华点</span>
            </div>

            <div className="space-y-2.5">
              {currentDrill.step3Options.map((opt) => {
                const isSelected = step3SelectedKey === opt.key;
                const showFeedback = isDrillSubmitted;
                const isBest = opt.isBest;

                return (
                  <div
                    key={opt.key}
                    onClick={() => !isDrillSubmitted && setStep3SelectedKey(opt.key)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      showFeedback && isBest
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-300'
                        : isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400'
                        : 'bg-stone-50 dark:bg-stone-850 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-stone-700 border text-stone-700'
                      }`}>
                        {opt.key}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 leading-relaxed">
                          {opt.text}
                        </p>
                        {showFeedback && (
                          <div className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {opt.rationale}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SUBMIT BUTTON OR SCORING RESULT */}
          {!isDrillSubmitted ? (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setIsDrillSubmitted(true)}
                disabled={!step1SelectedKey || !step3SelectedKey}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                提交大题答案 · 生成考场评分报告
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-850 dark:to-stone-900 border border-amber-300 dark:border-amber-800 shadow-sm space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-600" />
                  <h3 className="text-base font-black text-amber-950 dark:text-amber-100">
                    考场阅卷评估报告（满分 10 分制）
                  </h3>
                </div>

                <div className="text-lg font-black text-amber-800 dark:text-amber-300 tabular-nums">
                  得分估算：{isStep1Correct && isStep3Correct ? '9 - 10 分（高分档）' : isStep1Correct ? '7 - 8 分（良好档）' : '5 - 6 分'}
                </div>
              </div>

              {/* Rubric Breakdown */}
              <div className="space-y-2 text-xs text-stone-800 dark:text-stone-200">
                <span className="font-bold block text-stone-900 dark:text-stone-100">
                  📋 考场官方分项采分细则对照：
                </span>
                {currentDrill.fullScoringGuide.standardPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              {/* Trap warning */}
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong>考场易漏分陷阱警示：</strong>
                  <span>{currentDrill.fullScoringGuide.trapAvoidance}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleResetDrill}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 border text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>重新演练此题</span>
                </button>

                <button
                  onClick={handleNextDrill}
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold"
                >
                  下一道真题演练 ↗
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: QUICK REFERENCE MODE (Templates view) */}
      {activeMode === 'reference' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">
                  {tpl.questionNumber} · {tpl.subject}
                </span>
                <span className="text-[10px] text-stone-400">
                  {tpl.keywords.slice(0, 3).join('、')}
                </span>
              </div>

              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {tpl.theme}
              </h4>

              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-xs text-blue-900 dark:text-blue-200">
                <strong>点题公式：</strong>{tpl.step1Qualitative.formula}
              </div>

              <div className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                <strong className="block text-amber-800 dark:text-amber-300">核心采分踩分点：</strong>
                {tpl.step2CoreMaterial.points.map((p, i) => (
                  <p key={i} className="line-clamp-2">
                    {p.subtitle}: {p.content}
                  </p>
                ))}
              </div>

              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-[11px] text-emerald-800 dark:text-emerald-300">
                <strong>升华结尾：</strong>{tpl.step3Sublimation.sampleClosing}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
