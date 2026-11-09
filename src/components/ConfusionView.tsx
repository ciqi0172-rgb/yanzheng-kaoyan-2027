import React, { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, SplitSquareVertical, Sparkles } from 'lucide-react';

import { CONFUSION_DATA } from '../data/confusionMatrix';


interface ConfusionViewProps {
  onJumpToHatSearch: (term: string) => void;
}

export const ConfusionView: React.FC<ConfusionViewProps> = ({ onJumpToHatSearch }) => {
  const [activeGroup, setActiveGroup] = useState<string>('genben');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentGroup = CONFUSION_DATA.find((g) => g.id === activeGroup) || CONFUSION_DATA[0];

  const searchPool = searchQuery.trim()
    ? CONFUSION_DATA.flatMap((group) => group.items)
    : currentGroup.items;
  const filteredItems = searchPool.filter(
    (item) =>
      item.term.includes(searchQuery) ||
      item.targetAnswer.includes(searchQuery) ||
      item.hatType.includes(searchQuery) ||
      item.trapWarning.includes(searchQuery) ||
      item.subject.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                张冠李戴粉碎机
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                横向对撞“根本”、“首要”、“本质”、“核心”、“标志”
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              政治“帽子题”高频混淆概念对撞矩阵
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              考研政治最常考、失分最严重的张冠李戴帽子题集中辨析。把相似概念横向拉平，彻底理清边界！
            </p>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索帽子或考点词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Group Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-stone-100 dark:border-stone-800">
          {CONFUSION_DATA.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeGroup === group.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {group.title.split('】')[0].replace('【', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Group Description Callout */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 space-y-1">
        <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
          {currentGroup.title}
        </h3>
        <p className="text-xs text-amber-800/90 dark:text-amber-300/80">
          {currentGroup.description}
        </p>
      </div>

      {/* Grid of Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
                  {item.subject} · 【{item.hatType}】
                </span>
                <span className="text-[10px] text-stone-400 font-mono">#{idx + 1}</span>
              </div>

              <h3 className="text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-bold mb-3 leading-relaxed">
                “{item.term}” 是什么？
              </h3>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 mb-2.5">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                  唯一标准秒选答案
                </span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item.targetAnswer}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{item.trapWarning}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => onJumpToHatSearch(item.targetAnswer)}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>在题库中专项练习此题</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-12 text-center text-xs text-stone-400 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200">
          未检索到相关的对比项，请尝试更换关键词
        </div>
      )}
    </div>
  );
};
