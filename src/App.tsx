import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header, TabKey } from './components/Header';
import { FlashcardDeckView } from './components/FlashcardDeckView';
import { HatQuestionsView } from './components/HatQuestionsView';
import { EssayDeconstructorView } from './components/EssayDeconstructorView';
import { ConfusionView } from './components/ConfusionView';
import { EbbinghausDashboard } from './components/EbbinghausDashboard';
import { StudyPathView } from './components/StudyPathView';
import { KnowledgeHubView } from './components/KnowledgeHubView';
import { ConfusionModal } from './components/ConfusionModal';
import { QuickQuizModal } from './components/QuickQuizModal';

import { HAT_QUESTIONS } from './data/hatQuestions';
import { ESSAY_TEMPLATES } from './data/essayTemplates';
import { 
  getStoredReviews, 
  getTodayStudyCount 
} from './services/ebbinghausStorage';
import { UserReviewItem } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('flashcard');
  const [reviews, setReviews] = useState<Record<string, UserReviewItem>>({});
  const [todayCount, setTodayCount] = useState<number>(0);
  
  // Modals
  const [isConfusionModalOpen, setIsConfusionModalOpen] = useState<boolean>(false);
  const [isQuickQuizOpen, setIsQuickQuizOpen] = useState<boolean>(false);

  // Cross-component jump search filter
  const [hatSearchQuery, setHatSearchQuery] = useState<string>('');

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('yan_zheng_theme_v2');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('yan_zheng_theme_v2', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('yan_zheng_theme_v2', 'light');
    }
  }, [darkMode]);

  const loadData = useCallback(() => {
    const revs = getStoredReviews();
    setReviews(revs);
    setTodayCount(getTodayStudyCount());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate due review count
  const dueReviewCount = useMemo(() => {
    const now = Date.now();
    return Object.values(reviews).filter(
      (r) => r.nextReviewAt <= now && r.totalAttempts > 0
    ).length;
  }, [reviews]);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleJumpToHatQuestion = (questionId: string) => {
    const q = HAT_QUESTIONS.find((item) => item.id === questionId);
    if (q) {
      setHatSearchQuery(q.answer);
      setActiveTab('flashcard');
    }
  };

  const handleStartDrillWrong = () => {
    setActiveTab('exam');
  };

  const handleNavigateTab = (tab: TabKey, filterParam?: string) => {
    if (filterParam) {
      setHatSearchQuery(filterParam);
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Universal Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickQuiz={() => setIsQuickQuizOpen(true)}
        todayCount={todayCount}
        dueReviewCount={dueReviewCount}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab 1: 全量卡片翻转背诵舱 */}
        {activeTab === 'flashcard' && (
          <FlashcardDeckView
            questions={HAT_QUESTIONS}
            reviews={reviews}
            onReviewUpdated={loadData}
            onOpenConfusionModal={() => setIsConfusionModalOpen(true)}
          />
        )}

        {/* Tab 2: 帽子题四选一实战做题舱 */}
        {activeTab === 'exam' && (
          <HatQuestionsView
            questions={HAT_QUESTIONS}
            reviews={reviews}
            onReviewUpdated={loadData}
            onOpenConfusionModal={() => setIsConfusionModalOpen(true)}
            initialSearch={hatSearchQuery}
          />
        )}

        {/* Tab 3: 万能大题三步法实战考场 (34-38题全量题库) */}
        {activeTab === 'essay' && (
          <EssayDeconstructorView templates={ESSAY_TEMPLATES} />
        )}

        {/* Tab 4: 混淆概念横向对撞矩阵 */}
        {activeTab === 'confusion' && (
          <ConfusionView
            onJumpToHatSearch={(term) => {
              setHatSearchQuery(term);
              setActiveTab('exam');
            }}
          />
        )}

        {/* Tab 5: 艾宾浩斯抗遗忘追踪舱 */}
        {activeTab === 'ebbinghaus' && (
          <EbbinghausDashboard
            reviews={reviews}
            hatQuestions={HAT_QUESTIONS}
            todayCount={todayCount}
            onReviewUpdated={loadData}
            onJumpToHatQuestion={handleJumpToHatQuestion}
            onStartDrillWrong={handleStartDrillWrong}
          />
        )}

        {/* Tab 6: 三阶段进阶冲刺路径 */}
        {activeTab === 'roadmap' && (
          <StudyPathView onNavigateTab={handleNavigateTab} />
        )}

        {/* New standalone knowledge search, pending records, and answer templates. Existing masking code is untouched. */}
        {activeTab === 'knowledge' && <KnowledgeHubView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-6 text-center text-xs text-stone-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700 dark:text-stone-300">
              研政通 · 考研政治高分通关舱
            </span>
            <span>·</span>
            <span>肖1000 帽子题全量卡片翻牌 · 四选一全真实战做题 · 34-38题万能大题三步法数字化</span>
          </div>

          <div className="text-[11px] text-stone-400">
            主动提取 (Active Recall) · 肖1000设错陷阱 · 艾宾浩斯抗遗忘
          </div>
        </div>
      </footer>

      {/* Confusion Matrix Modal for Quick Callouts */}
      <ConfusionModal
        isOpen={isConfusionModalOpen}
        onClose={() => setIsConfusionModalOpen(false)}
        onApplyFilter={(term) => {
          setHatSearchQuery(term);
          setActiveTab('exam');
        }}
      />

      {/* Quick 10-Question Lightning Quiz Modal */}
      <QuickQuizModal
        isOpen={isQuickQuizOpen}
        onClose={() => setIsQuickQuizOpen(false)}
        questions={HAT_QUESTIONS}
        onReviewUpdated={loadData}
      />
    </div>
  );
}
