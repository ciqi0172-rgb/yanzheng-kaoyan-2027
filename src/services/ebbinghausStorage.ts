import { UserReviewItem } from '../types';

const STORAGE_KEY = 'yan_zheng_yi_ebbinghaus_v1';
const STUDY_LOG_KEY = 'yan_zheng_yi_study_log_v1';
const ACTIVE_STAGE_KEY = 'yan_zheng_yi_active_stage_v1';

// 艾宾浩斯复习间隔时间（毫秒）
// 阶段 0: 5分钟
// 阶段 1: 30分钟
// 阶段 2: 12小时
// 阶段 3: 24小时 (1天)
// 阶段 4: 48小时 (2天)
// 阶段 5: 96小时 (4天)
// 阶段 6: 168小时 (7天)
// 阶段 7: 360小时 (15天 - 彻底掌握)
export const EBBINGHAUS_INTERVALS_MS = [
  5 * 60 * 1000,
  30 * 60 * 1000,
  12 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  48 * 60 * 60 * 1000,
  96 * 60 * 60 * 1000,
  168 * 60 * 60 * 1000,
  360 * 60 * 60 * 1000,
];

export function getStoredReviews(): Record<string, UserReviewItem> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load reviews from storage:', err);
    return {};
  }
}

export function saveStoredReviews(data: Record<string, UserReviewItem>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save reviews to storage:', err);
  }
}

/**
 * 用户反馈：
 * - 'easy': 认识/熟练秒选 -> 阶段+1，下次时间向后推移
 * - 'fuzzy': 模糊/犹豫 -> 阶段重置为 1，半小时后需再次复核
 * - 'forgot': 不会/答错 -> 阶段归零，标红进入错题本，5分钟内再次提醒
 */
export function recordReviewAttempt(
  itemId: string,
  itemType: 'hat' | 'clinical',
  rating: 'easy' | 'fuzzy' | 'forgot'
): UserReviewItem {
  const reviews = getStoredReviews();
  const existing = reviews[itemId] || {
    id: itemId,
    type: itemType,
    level: 0,
    lastReviewedAt: 0,
    nextReviewAt: 0,
    consecutiveCorrect: 0,
    totalAttempts: 0,
    mistakeCount: 0,
    isMarkedRed: false,
    lastRating: null,
  };

  const now = Date.now();
  let newLevel = existing.level;
  let newConsecutive = existing.consecutiveCorrect;
  let newMistakes = existing.mistakeCount;
  let isMarkedRed = existing.isMarkedRed;

  if (rating === 'easy') {
    newLevel = Math.min(newLevel + 1, EBBINGHAUS_INTERVALS_MS.length - 1);
    newConsecutive += 1;
    // 如果已经连续对3次，自动消除标红（但保留用户自选）
    if (newConsecutive >= 3 && isMarkedRed) {
      isMarkedRed = false;
    }
  } else if (rating === 'fuzzy') {
    newLevel = Math.max(1, Math.floor(newLevel / 2));
    newConsecutive = 0;
    isMarkedRed = true;
  } else {
    // forgot
    newLevel = 0;
    newConsecutive = 0;
    newMistakes += 1;
    isMarkedRed = true;
  }

  const interval = EBBINGHAUS_INTERVALS_MS[newLevel];
  const updatedItem: UserReviewItem = {
    ...existing,
    level: newLevel,
    lastReviewedAt: now,
    nextReviewAt: now + interval,
    consecutiveCorrect: newConsecutive,
    totalAttempts: existing.totalAttempts + 1,
    mistakeCount: newMistakes,
    isMarkedRed,
    lastRating: rating,
  };

  reviews[itemId] = updatedItem;
  saveStoredReviews(reviews);
  updateTodayStudyCount();
  return updatedItem;
}

export function toggleMarkRed(itemId: string, itemType: 'hat' | 'clinical'): boolean {
  const reviews = getStoredReviews();
  const existing = reviews[itemId] || {
    id: itemId,
    type: itemType,
    level: 0,
    lastReviewedAt: 0,
    nextReviewAt: 0,
    consecutiveCorrect: 0,
    totalAttempts: 0,
    mistakeCount: 0,
    isMarkedRed: false,
    lastRating: null,
  };

  existing.isMarkedRed = !existing.isMarkedRed;
  reviews[itemId] = existing;
  saveStoredReviews(reviews);
  return existing.isMarkedRed;
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function updateTodayStudyCount(): void {
  try {
    const today = getTodayString();
    const raw = localStorage.getItem(STUDY_LOG_KEY);
    const logs: Record<string, { count: number; date: string }> = raw ? JSON.parse(raw) : {};
    if (!logs[today]) {
      logs[today] = { count: 0, date: today };
    }
    logs[today].count += 1;
    localStorage.setItem(STUDY_LOG_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to update study count:', err);
  }
}

export function getTodayStudyCount(): number {
  try {
    const today = getTodayString();
    const raw = localStorage.getItem(STUDY_LOG_KEY);
    if (!raw) return 0;
    const logs = JSON.parse(raw);
    return logs[today]?.count || 0;
  } catch {
    return 0;
  }
}

export function getActiveStage(): number {
  try {
    const stage = localStorage.getItem(ACTIVE_STAGE_KEY);
    return stage ? parseInt(stage, 10) : 1;
  } catch {
    return 1;
  }
}

export function setActiveStage(stage: number): void {
  try {
    localStorage.setItem(ACTIVE_STAGE_KEY, stage.toString());
  } catch (err) {
    console.error('Failed to set active stage:', err);
  }
}
