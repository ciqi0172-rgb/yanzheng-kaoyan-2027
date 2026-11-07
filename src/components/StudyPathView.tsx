import React, { useState, useEffect } from 'react';
import { 
  STAGES_CONFIG, 
  STUDY_ROADMAP, 
  DayTask, 
  StageInfo 
} from '../data/studyPlan';
import { 
  Compass, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  ArrowRight, 
  Target, 
  Flame, 
  Sparkles,
  BookOpen,
  Layers,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { TabKey } from './Header';

interface StudyPathViewProps {
  onNavigateTab: (tab: TabKey, filterParam?: string) => void;
}

const CHECKLIST_STORAGE_KEY = 'yan_zheng_yi_checklist_v1';

export const StudyPathView: React.FC<StudyPathViewProps> = ({ onNavigateTab }) => {
  const [selectedStage, setSelectedStage] = useState<1 | 2 | 3>(1);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const currentStageConfig: StageInfo =
    STAGES_CONFIG.find((s) => s.stage === selectedStage) || STAGES_CONFIG[0];

  const stageRoadmap = STUDY_ROADMAP.filter((d) => d.stage === selectedStage);

  // Calculate stage completion rate
  const allStageChecklistIds = stageRoadmap.flatMap((d) => d.checklist.map((c) => c.id));
  const completedInStageCount = allStageChecklistIds.filter((id) => !!completedTasks[id]).length;
  const stagePercentage = allStageChecklistIds.length > 0
    ? Math.round((completedInStageCount / allStageChecklistIds.length) * 100)
    : 0;

  const handleActionJump = (actionType?: 'flashcard' | 'exam' | 'essay' | 'confusion' | 'wrongbook') => {
    if (actionType === 'flashcard') onNavigateTab('flashcard');
    else if (actionType === 'exam') onNavigateTab('exam');
    else if (actionType === 'essay') onNavigateTab('essay');
    else if (actionType === 'confusion') onNavigateTab('confusion');
    else if (actionType === 'wrongbook') onNavigateTab('ebbinghaus');
    else onNavigateTab('flashcard');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                科学递进三部曲
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                帽子题秒选 · 四选一通关 · 大题三步法内化
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              考研政治高分进阶备考全景图
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              告别盲目死记硬背：按阶段拆解任务，建立“见题秒选、下笔成文、临床严谨”的实战肌肉记忆。
            </p>
          </div>

          {/* Stage Completion Progress */}
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-stone-600 dark:text-stone-300">本阶段完成度</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {stagePercentage}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${stagePercentage}%` }}
              />
            </div>
            <div className="text-[10px] text-stone-400 mt-1">
              已完成 {completedInStageCount} / {allStageChecklistIds.length} 项备考指标
            </div>
          </div>
        </div>

        {/* Stage Navigation Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
          {STAGES_CONFIG.map((cfg) => {
            const isSelected = selectedStage === cfg.stage;
            return (
              <div
                key={cfg.stage}
                onClick={() => setSelectedStage(cfg.stage)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 ring-2 ring-amber-300 dark:ring-amber-900'
                    : 'bg-stone-50/60 dark:bg-stone-850 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                  }`}>
                    阶段 {cfg.stage} · {cfg.badge}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-500 font-mono">
                    {cfg.dayRange}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  {cfg.title.split('：')[1]}
                </h3>

                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                  {cfg.target}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Specs */}
      <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-black text-amber-900 dark:text-amber-100">
              {currentStageConfig.title} 核心战术纲领
            </h2>
          </div>
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            {currentStageConfig.dayRange}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-amber-100 dark:border-amber-900/40">
            <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
              🎯 突破总目标：
            </span>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
              {currentStageConfig.target}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-amber-100 dark:border-amber-900/40">
            <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
              ⚡ 每日死磕配额：
            </span>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
              {currentStageConfig.dailyQuota}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-amber-800/80 dark:text-amber-300/80 font-medium pt-1">
          <strong>底层方法论：</strong>{currentStageConfig.coreStrategy}
        </div>
      </div>

      {/* Day by Day Roadmap Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span>该阶段共包含 {stageRoadmap.length} 天专项打卡计划</span>
          <span>勾选完成的任务实时自动存档</span>
        </div>

        <div className="space-y-4">
          {stageRoadmap.map((day) => {
            const dayChecklistIds = day.checklist.map((c) => c.id);
            const dayCompletedCount = dayChecklistIds.filter((id) => !!completedTasks[id]).length;
            const isDayAllDone = dayCompletedCount === dayChecklistIds.length;

            return (
              <div
                key={day.id}
                className={`p-5 rounded-2xl bg-white dark:bg-stone-900 border transition-all ${
                  isDayAllDone
                    ? 'border-emerald-300 dark:border-emerald-900/60 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800'
                }`}
              >
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900">
                      Day {day.dayNumber}
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {day.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                      主攻：{day.focus}
                    </span>
                    <span className="text-xs font-bold text-stone-500 tabular-nums">
                      {dayCompletedCount} / {dayChecklistIds.length} 完成
                    </span>
                  </div>
                </div>

                {/* Day Goal */}
                <div className="py-2.5 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  <strong>当日作战意图：</strong>{day.goal}
                </div>

                {/* Checklist items */}
                <div className="space-y-2 pt-1">
                  {day.checklist.map((item) => {
                    const isChecked = !!completedTasks[item.id];
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          isChecked
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                            : 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-800'
                        }`}
                      >
                        <div
                          onClick={() => toggleTask(item.id)}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <button
                            type="button"
                            className="text-stone-400 hover:text-emerald-600 transition-colors"
                          >
                            {isChecked ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <span
                            className={`text-xs ${
                              isChecked
                                ? 'line-through text-stone-400 dark:text-stone-500 font-normal'
                                : 'text-stone-800 dark:text-stone-200 font-medium'
                            }`}
                          >
                            {item.text}
                          </span>
                        </div>

                        {/* Action Jump Button */}
                        {item.actionType && (
                          <button
                            onClick={() => handleActionJump(item.actionType)}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-400 text-stone-700 dark:text-stone-300 text-[11px] font-semibold flex items-center gap-1 transition-all shrink-0 hover:text-amber-600"
                          >
                            <span>去执行</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Day Pro-Tip */}
                <div className="mt-3 p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-400 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>避坑指导：</strong>{day.tips}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
