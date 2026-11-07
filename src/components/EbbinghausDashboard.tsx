import React, { useState, useMemo } from 'react';
import { 
  UserReviewItem, 
  HatQuestion, 
  SubjectType 
} from '../types';
import { 
  Brain, 
  Clock, 
  AlertOctagon, 
  CheckCircle2, 
  RotateCw, 
  Bookmark, 
  Sparkles, 
  Layers, 
  Flame, 
  ArrowRight, 
  TrendingUp, 
  Target,
  Zap,
  BarChart3
} from 'lucide-react';
import { recordReviewAttempt, toggleMarkRed } from '../services/ebbinghausStorage';

interface EbbinghausDashboardProps {
  reviews: Record<string, UserReviewItem>;
  hatQuestions: HatQuestion[];
  todayCount: number;
  onReviewUpdated: () => void;
  onJumpToHatQuestion: (questionId: string) => void;
  onStartDrillWrong: () => void;
}

const SUBJECT_LIST: ('马原' | '毛中特' | '新思想' | '史纲' | '思修法治')[] = [
  '马原',
  '毛中特',
  '新思想',
  '史纲',
  '思修法治',
];

export const EbbinghausDashboard: React.FC<EbbinghausDashboardProps> = ({
  reviews,
  hatQuestions,
  todayCount,
  onReviewUpdated,
  onJumpToHatQuestion,
  onStartDrillWrong,
}) => {
  const [activeTab, setActiveTab] = useState<'due' | 'wrong' | 'all'>('due');

  const now = Date.now();

  const hatMap = useMemo(() => {
    const map = new Map<string, HatQuestion>();
    hatQuestions.forEach((q) => map.set(q.id, q));
    return map;
  }, [hatQuestions]);

  const allReviewList = useMemo(() => {
    return Object.values(reviews);
  }, [reviews]);

  // Due items
  const dueItems = useMemo(() => {
    return allReviewList.filter((item) => item.nextReviewAt <= now && item.totalAttempts > 0);
  }, [allReviewList, now]);

  // Marked red items (错题本)
  const redMarkedItems = useMemo(() => {
    return allReviewList.filter((item) => item.isMarkedRed);
  }, [allReviewList]);

  // Mastered items (level >= 6)
  const masteredItems = useMemo(() => {
    return allReviewList.filter((item) => item.level >= 6);
  }, [allReviewList]);

  // 8 Stages Distribution
  const stageDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0, 0];
    allReviewList.forEach((item) => {
      if (item.level >= 0 && item.level < 8) {
        counts[item.level]++;
      }
    });
    return counts;
  }, [allReviewList]);

  const STAGE_LABELS = [
    '5分钟',
    '30分钟',
    '12小时',
    '1天',
    '2天',
    '4天',
    '7天',
    '15天(牢固)',
  ];

  // Subject Stats Breakdown
  const subjectStats = useMemo(() => {
    return SUBJECT_LIST.map((subj) => {
      const subjQuestions = hatQuestions.filter((q) => q.subject === subj);
      const total = subjQuestions.length;
      let practiced = 0;
      let mastered = 0;
      let redCount = 0;

      subjQuestions.forEach((q) => {
        const rev = reviews[q.id];
        if (rev && rev.totalAttempts > 0) {
          practiced++;
          if (rev.level >= 5) mastered++;
          if (rev.isMarkedRed) redCount++;
        }
      });

      const masteryRate = total > 0 ? Math.round((mastered / total) * 100) : 0;
      return { subject: subj, total, practiced, mastered, redCount, masteryRate };
    });
  }, [hatQuestions, reviews]);

  const handleQuickResolve = (item: UserReviewItem, rating: 'easy' | 'forgot') => {
    recordReviewAttempt(item.id, 'hat', rating);
    onReviewUpdated();
  };

  const handleToggleRed = (item: UserReviewItem) => {
    toggleMarkRed(item.id, 'hat');
    onReviewUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                Spaced Repetition Engine
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                政治考点 8 级动态抗遗忘复习调度
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              艾宾浩斯智能复习与错题歼灭舱
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              根据刷题与翻卡的主动反馈，精确锁定遗忘临界点。重点消灭标红错题，直至完全掌握！
            </p>
          </div>

          <div className="flex items-center gap-2">
            {redMarkedItems.length > 0 && (
              <button
                onClick={onStartDrillWrong}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition-all"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>开启错题歼灭战 ({redMarkedItems.length})</span>
              </button>
            )}

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div>
                <div className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">今日刷卡复习</div>
                <div className="text-base font-black text-amber-900 dark:text-amber-100 tabular-nums">
                  {todayCount} 次
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Metric KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
              <span className="text-[11px] font-bold">今日到期待复习</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-rose-900 dark:text-rose-100 tabular-nums">
              {dueItems.length}
            </div>
            <p className="text-[10px] text-rose-700/80 dark:text-rose-400 mt-0.5">
              到达科学记忆临界点
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
            <div className="flex items-center justify-between text-red-600 dark:text-red-400 mb-1">
              <span className="text-[11px] font-bold">标红重点错题</span>
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-red-900 dark:text-red-100 tabular-nums">
              {redMarkedItems.length}
            </div>
            <p className="text-[10px] text-red-700/80 dark:text-red-400 mt-0.5">
              待重点靶向消灭
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
              <span className="text-[11px] font-bold">已牢固掌握考点</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100 tabular-nums">
              {masteredItems.length}
            </div>
            <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">
              达成阶段 6 以上
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between text-stone-600 dark:text-stone-300 mb-1">
              <span className="text-[11px] font-bold">已收录政治题目</span>
              <Target className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-stone-900 dark:text-stone-100 tabular-nums">
              {hatQuestions.length}
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
              肖1000高频帽子题全量
            </p>
          </div>
        </div>
      </div>

      {/* Subject Mastery Radar Cards */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
              各科考点熟练度雷达
            </h3>
          </div>
          <span className="text-[11px] text-stone-400">
            涵盖五大主考科目全景掌握率
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          {subjectStats.map((item) => (
            <div
              key={item.subject}
              className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                    {item.subject}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                    {item.masteryRate}% 牢固
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden my-2">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all"
                    style={{ width: `${item.masteryRate}%` }}
                  />
                </div>

                <div className="text-[10px] text-stone-500 dark:text-stone-400 space-y-0.5">
                  <div>总考点：{item.total} 题</div>
                  <div>已练习：{item.practiced} 题</div>
                  {item.redCount > 0 && (
                    <div className="text-rose-600 dark:text-rose-400 font-bold">
                      错题标红：{item.redCount} 题
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8-Stage Ebbinghaus Distribution Spectrum */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
              艾宾浩斯记忆生命周期分布梯队
            </h3>
          </div>
          <span className="text-[11px] text-stone-500">
            达阶段 7 (15天) 即进入永久抗遗忘区
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
          {stageDistribution.map((count, sIdx) => {
            const isHighest = Math.max(...stageDistribution) === count && count > 0;
            return (
              <div
                key={sIdx}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isHighest
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 font-bold'
                    : 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-750'
                }`}
              >
                <div className="text-[10px] text-stone-400 font-medium">阶段 {sIdx}</div>
                <div className="text-sm font-black text-stone-900 dark:text-stone-100 my-0.5 tabular-nums">
                  {count}
                </div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                  {STAGE_LABELS[sIdx]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Queue and Wrong Questions Tabs */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('due')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'due'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>今日到期 ({dueItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('wrong')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'wrong'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>标红错题库 ({redMarkedItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <span>全部足迹 ({allReviewList.length})</span>
            </button>
          </div>

          <span className="text-[11px] text-stone-400 hidden sm:block">
            可直接在此打分或一键直达卡片
          </span>
        </div>

        {/* List Content */}
        <div className="space-y-2.5">
          {activeTab === 'due' && (
            <PoliticalItemList
              items={dueItems}
              hatMap={hatMap}
              emptyMessage="太棒了！当前没有到期的政治帽子题，请继续前往卡片舱刷题背诵！"
              onJumpHat={onJumpToHatQuestion}
              onRate={handleQuickResolve}
              onToggleRed={handleToggleRed}
            />
          )}

          {activeTab === 'wrong' && (
            <PoliticalItemList
              items={redMarkedItems}
              hatMap={hatMap}
              emptyMessage="暂图标红错题！在做题遇到模糊或选错时，系统会自动标记或由你主动标红。"
              onJumpHat={onJumpToHatQuestion}
              onRate={handleQuickResolve}
              onToggleRed={handleToggleRed}
            />
          )}

          {activeTab === 'all' && (
            <PoliticalItemList
              items={allReviewList}
              hatMap={hatMap}
              emptyMessage="尚未开启任何政治题目刷练。请前往“卡片翻转背诵”或“四选一实做”开始刷题！"
              onJumpHat={onJumpToHatQuestion}
              onRate={handleQuickResolve}
              onToggleRed={handleToggleRed}
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface PoliticalItemListProps {
  items: UserReviewItem[];
  hatMap: Map<string, HatQuestion>;
  emptyMessage: string;
  onJumpHat: (id: string) => void;
  onRate: (item: UserReviewItem, rating: 'easy' | 'forgot') => void;
  onToggleRed: (item: UserReviewItem) => void;
}

const PoliticalItemList: React.FC<PoliticalItemListProps> = ({
  items,
  hatMap,
  emptyMessage,
  onJumpHat,
  onRate,
  onToggleRed,
}) => {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-stone-400 space-y-2">
        <Sparkles className="w-8 h-8 text-stone-300 mx-auto" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const hat = hatMap.get(item.id);
        const title = hat?.stem || '未知题目';
        const badge = `【${hat?.subject}】${hat?.hatKeyword}`;
        const answer = hat?.answer;

        const timeToReview = item.nextReviewAt - Date.now();
        const isDue = timeToReview <= 0;

        return (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              item.isMarkedRed
                ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-800'
            }`}
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200">
                  {badge}
                </span>

                <span className="text-[10px] text-stone-400 font-mono">
                  阶段 {item.level} · 错 {item.mistakeCount} 次
                </span>

                {isDue ? (
                  <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    <span>已到期</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400">
                    下次：{formatRemainingTime(timeToReview)}
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-snug">
                {title}
              </h4>

              {answer && (
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold truncate">
                  正解帽子：{answer}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => onRate(item, 'easy')}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 text-xs font-semibold transition-colors flex items-center gap-1"
                title="标记为熟练掌握"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>熟练</span>
              </button>

              <button
                onClick={() => onRate(item, 'forgot')}
                className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200 text-xs font-semibold transition-colors"
                title="重置复习阶段"
              >
                重背
              </button>

              <button
                onClick={() => onToggleRed(item)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  item.isMarkedRed
                    ? 'border-rose-300 text-rose-600 bg-rose-50 dark:bg-rose-950/60'
                    : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:text-rose-600'
                }`}
                title="切换标红"
              >
                <Bookmark className={`w-3.5 h-3.5 ${item.isMarkedRed ? 'fill-rose-600' : ''}`} />
              </button>

              <button
                onClick={() => onJumpHat(item.id)}
                className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors flex items-center gap-0.5"
                title="跳转到详情卡片"
              >
                <span>直达</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function formatRemainingTime(ms: number): string {
  if (ms <= 0) return '立刻';
  const mins = Math.floor(ms / (1000 * 60));
  if (mins < 60) return `${mins}分钟后`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时后`;
  const days = Math.floor(hours / 24);
  return `${days}天后`;
}
