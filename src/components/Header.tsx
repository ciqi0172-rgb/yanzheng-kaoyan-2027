import React from 'react';
import { 
  Sparkles, 
  Layers, 
  BookOpen, 
  CheckSquare, 
  SplitSquareVertical,
  Brain, 
  Compass, 
  Zap, 
  Moon, 
  Sun,
  Flame
} from 'lucide-react';

export type TabKey = 'flashcard' | 'exam' | 'essay' | 'confusion' | 'ebbinghaus' | 'roadmap' | 'knowledge';

interface HeaderProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenQuickQuiz: () => void;
  todayCount: number;
  dueReviewCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickQuiz,
  todayCount,
  dueReviewCount,
  darkMode,
  onToggleDarkMode,
}) => {
  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'flashcard', label: '卡片翻转背诵', icon: <Layers className="w-4 h-4" /> },
    { key: 'exam', label: '四选一实战做题', icon: <CheckSquare className="w-4 h-4" /> },
    { key: 'essay', label: '大题真题模拟场', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'confusion', label: '混淆概念对撞', icon: <SplitSquareVertical className="w-4 h-4" /> },
    { 
      key: 'ebbinghaus', 
      label: '艾宾浩斯复习舱', 
      icon: <Brain className="w-4 h-4" />, 
      badge: dueReviewCount > 0 ? dueReviewCount : undefined 
    },
    { key: 'roadmap', label: '三阶段冲刺路径', icon: <Compass className="w-4 h-4" /> },
    { key: 'knowledge', label: '知识库与模板', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('flashcard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white shadow-sm shadow-rose-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 dark:text-stone-100 tracking-tight text-base sm:text-lg">
                  研政通 · 考研政治高分通关舱
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  2027 考研政治专属
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                肖1000帽子题主动背诵翻牌 · 四选一实战做题 · 万能大题三步法解构
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onSelectTab(tab.key)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 text-xs lg:text-sm font-medium transition-all rounded-lg ${
                    isActive
                      ? 'text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 font-bold'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/70 dark:hover:bg-stone-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-rose-600 dark:bg-rose-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Today's Streak count */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300"
              title="今日已学习卡片数"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="tabular-nums font-semibold">{todayCount}</span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">已刷</span>
            </div>

            {/* Quick Quiz Button */}
            <button
              onClick={onOpenQuickQuiz}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">10题突击测</span>
              <span className="sm:hidden">测验</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={darkMode ? '切换为浅色模式' : '切换为深色模式'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-stone-100 dark:border-stone-800/80 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onSelectTab(tab.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="px-1 py-0.2 rounded-full text-[9px] font-bold bg-rose-600 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
