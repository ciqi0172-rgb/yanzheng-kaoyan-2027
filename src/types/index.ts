export type SubjectType = '全部' | '马原' | '毛中特' | '新思想' | '史纲' | '思修法治';

export type HatKeywordType = 
  | '全部'
  | '核心'
  | '本质'
  | '根本'
  | '首要'
  | '基础/前提'
  | '标志/转折'
  | '主线/关键'
  | '关键/主线'
  | '特征/优势'
  | '目的/出发点'
  | '出发点/落脚点'
  | '目的/归宿'
  | '灵魂/指南'
  | '灵魂/生命线'
  | '保障/保证'
  | '原则/准则'
  | '主题'
  | '地位'
  | '划分依据'
  | '策略/方针'
  | '评价标准'
  | '规律'
  | '其他';

export interface HatQuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect: boolean;
  trapExplanation?: string;
}

export interface HatQuestion {
  id: string;
  subject: '马原' | '毛中特' | '新思想' | '史纲' | '思修法治';
  hatKeyword: string; // e.g. "核心问题", "根本原因", "显著标志"
  hatType: HatKeywordType;
  stem: string; // 题干
  answer: string; // 正确答案/帽子对应词
  trapAnalysis: string; // 肖1000陷阱解析与深度辨析
  confusionGroup?: string; // 容易混淆的分组标签
  examType: '单选' | '多选';
  sourcePage?: string;
  options?: HatQuestionOption[]; // 精心编排的4个选项
}

export interface EssayTemplate {
  id: string;
  questionNumber: '34题' | '35题' | '36题' | '37题' | '38题';
  subject: '马原' | '新思想' | '史纲' | '思修法治' | '当代';
  theme: string; // e.g. "感性认识与理性认识", "两个结合", "中国式现代化"
  keywords: string[]; // 触发关键词，如 ["调查研究", "感性认识", "深入基层"]
  triggerConditions: string; // 题干特征
  step1Qualitative: {
    title: string;
    description: string;
    formula: string; // 点题句公式
    sampleText: string; // 示范句
  };
  step2CoreMaterial: {
    title: string;
    points: {
      subtitle: string;
      content: string;
      highlightWords: string[];
    }[];
    trapWarning?: string; // 考场易漏分提示
  };
  step3Sublimation: {
    title: string;
    closingFormula: string; // 结尾升华大局观
    sampleClosing: string;
  };
}

export interface EssayDrillQuestion {
  id: string;
  templateId: string;
  questionNumber: '34题' | '35题' | '36题' | '37题' | '38题';
  subject: string;
  theme: string;
  materialBackground: string; // 真实考研材料
  questionPrompt: string; // 真实设问
  step1Options: {
    key: string;
    text: string;
    isBest: boolean;
    scoreRationale: string;
  }[];
  step2ClozeDrills: {
    subtitle: string;
    maskedText: string;
    blanks: { index: number; answer: string; hint: string }[];
    fullAnswer: string;
  }[];
  step3Options: {
    key: string;
    text: string;
    isBest: boolean;
    rationale: string;
  }[];
  fullScoringGuide: {
    standardPoints: string[];
    trapAvoidance: string;
  };
}

export interface ClinicalPoint {
  id: string;
  discipline: '内科' | '外科' | '病理' | '生理' | '生化';
  title: string;
  category: '鉴别对比' | '首选药与治疗' | '特征病理' | '定位与分级' | '急症急救';
  keywords: string[];
  summary: string;
  comparisonTable?: {
    columns: string[];
    rows: {
      feature: string;
      values: string[];
    }[];
  };
  highYieldTips: string[];
  mnemonic?: string; // 记忆口诀
}

export type ClinicalQuestionType = 'A型题(单选)' | 'B型题(配伍)' | 'X型题(多选)' | '鉴别大表闯关题';

export interface ClinicalQuestion {
  id: string;
  pointId: string;
  discipline: '内科' | '外科' | '病理' | '生理' | '生化';
  category: string;
  questionType: ClinicalQuestionType;
  stem: string;
  options: {
    key: string;
    text: string;
    isCorrect: boolean;
    trapExplanation?: string;
  }[];
  correctKeys: string[];
  explanation: string;
  mnemonic?: string;
  relatedTableFeature?: string;
}

export type MemoryStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

export interface UserReviewItem {
  id: string; // target id (question id or clinical point id)
  type: 'hat' | 'clinical';
  level: number; // 0 to 7 (Ebbinghaus stage)
  lastReviewedAt: number; // timestamp
  nextReviewAt: number; // timestamp
  consecutiveCorrect: number;
  totalAttempts: number;
  mistakeCount: number;
  isMarkedRed: boolean; // 重点错题标记
  lastRating: 'easy' | 'fuzzy' | 'forgot' | null;
}

export interface DailyStudyLog {
  date: string; // YYYY-MM-DD
  cardsReviewed: number;
  cardsMastered: number;
  timeSpentMinutes: number;
  stageProgressDay: number;
}

