import React, { useState } from 'react';
import { CONFUSION_DATA } from './ConfusionView';
import { X, Search, CheckCircle2, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';

interface ConfusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter?: (term: string) => void;
}

export const ConfusionModal: React.FC<ConfusionModalProps> = ({
  isOpen,
  onClose,
  onApplyFilter,
}) => {
  const [activeGroup, setActiveGroup] = useState<string>('genben');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const currentGroup = CONFUSION_DATA.find((g) => g.id === activeGroup) || CONFUSION_DATA[0];

  const filteredItems = currentGroup.items.filter(
    (item) =>
      item.term.includes(searchQuery) ||
      item.targetAnswer.includes(searchQuery) ||
      item.hatType.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                政治“帽子题”高频混淆对撞矩阵
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                横向对照最易错的“根本”、“首要”、“本质”、“核心”高频词，消除考场张冠李戴
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="px-6 py-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {CONFUSION_DATA.map((group) => (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeGroup === group.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {group.title.split('】')[0].replace('【', '')}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜帽子或答案..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50">
            <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">
              {currentGroup.title}
            </h3>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
              {currentGroup.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                      {item.subject} · {item.hatType}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">#{idx + 1}</span>
                  </div>

                  <p className="text-xs text-stone-700 dark:text-stone-300 font-medium mb-3 leading-relaxed">
                    “{item.term}” 的准确答案是？
                  </p>

                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{item.targetAnswer}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{item.trapWarning}</span>
                  </div>
                </div>

                {onApplyFilter && (
                  <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                    <button
                      onClick={() => {
                        onApplyFilter(item.targetAnswer);
                        onClose();
                      }}
                      className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      在题库中检索该考点卡片
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-stone-400 text-xs">
              未找到匹配的对比项，请尝试更换搜索词
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/30 flex justify-between items-center text-xs text-stone-500">
          <span>共收录高频对比点：{currentGroup.items.length} 处</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            完成辨析关闭
          </button>
        </div>
      </div>
    </div>
  );
};
