import { readFileSync } from 'node:fs';
import { HAT_QUESTIONS } from '../src/data/hatQuestions';
import { ESSAY_TEMPLATES } from '../src/data/essayTemplates';
import { buildHatQuestionOptions } from '../src/services/quizGenerator';
import { CONFUSION_DATA } from '../src/data/confusionMatrix';

type Issue = { dataset: string; id: string; field: string; message: string };
const issues: Issue[] = [];
const warnings: Array<{ dataset: string; id: string; message: string }> = [];

function checkUniqueIds(dataset: string, rows: Array<{ id: string }>) {
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row.id?.trim()) {
      issues.push({ dataset, id: '(missing id)', field: 'id', message: '记录缺少 id' });
    } else if (seen.has(row.id)) {
      issues.push({ dataset, id: row.id, field: 'id', message: 'id 重复' });
    }
    seen.add(row.id);
  }
}

checkUniqueIds('帽子题结构化数据', HAT_QUESTIONS);

// The confusion matrix is shared by search UI and distractor generation; audit it as data.
const confusionGroupIds = new Set<string>();
const confusionPairs = new Set<string>();
for (const group of CONFUSION_DATA) {
  if (!group.id?.trim() || confusionGroupIds.has(group.id)) {
    issues.push({ dataset: '混淆矩阵', id: group.id || '(missing id)', field: 'id', message: '分组 id 缺失或重复' });
  }
  confusionGroupIds.add(group.id);
  if (!group.title?.trim() || !group.description?.trim() || !group.items.length) {
    issues.push({ dataset: '混淆矩阵', id: group.id, field: 'group', message: '分组标题、说明或条目为空' });
  }
  for (const [index, item] of group.items.entries()) {
    for (const field of ['term', 'hatType', 'targetAnswer', 'trapWarning', 'subject'] as const) {
      if (!String(item[field] ?? '').trim()) {
        issues.push({ dataset: '混淆矩阵', id: `${group.id}#${index + 1}`, field, message: '混淆矩阵条目字段为空' });
      }
    }
    const pair = normalizeMatrixText(item.term) + '|' + normalizeMatrixText(item.targetAnswer);
    if (confusionPairs.has(pair)) {
      warnings.push({ dataset: '混淆矩阵', id: `${group.id}#${index + 1}`, message: '存在题干与答案完全相同的重复对照项，请检查是否有必要重复收录' });
    }
    confusionPairs.add(pair);
  }
}
function normalizeMatrixText(value: string) {
  return value.replace(/[\s，。；;：:、（）()“”‘’]/g, '').toLocaleLowerCase();
}

for (const q of HAT_QUESTIONS) {
  for (const field of ['subject', 'hatType', 'hatKeyword', 'examType', 'stem', 'trapAnalysis'] as const) {
    if (!String(q[field] ?? '').trim()) {
      issues.push({ dataset: '帽子题结构化数据', id: q.id, field, message: '必填字段为空' });
    }
  }
  if (!q.answer?.trim() && !q.needsReview) {
    issues.push({ dataset: '帽子题结构化数据', id: q.id, field: 'answer', message: '答案为空但未标记待核验' });
  }
  if (q.needsReview && q.answer?.trim()) {
    warnings.push({ dataset: '帽子题结构化数据', id: q.id, message: '题目标记待核验但已有答案文本，请确认是否可恢复练习' });
  }
}

checkUniqueIds('答题模板', ESSAY_TEMPLATES);
for (const t of ESSAY_TEMPLATES) {
  for (const field of ['questionNumber', 'subject', 'theme', 'triggerConditions'] as const) {
    if (!String(t[field] ?? '').trim()) {
      issues.push({ dataset: '答题模板', id: t.id, field, message: '必填字段为空' });
    }
  }
  if (!t.keywords?.length) issues.push({ dataset: '答题模板', id: t.id, field: 'keywords', message: '关键词为空' });
  if (!t.step2CoreMaterial?.points?.length) issues.push({ dataset: '答题模板', id: t.id, field: 'step2CoreMaterial.points', message: '核心得分点为空' });
}

// Audit the actual HTML source used by the search page. The expected counts are a
// regression guard: a source edit that silently drops a subject or question fails CI.
const sourcePath = new URL('../src/data/hat-source.html', import.meta.url);
const sourceHtml = readFileSync(sourcePath, 'utf8');
const expectedBySubject: Record<string, number> = {
  '肖 1000 帽子题思修': 95,
  '肖 1000 帽子题毛中特': 98,
  '肖 1000 帽子题：史纲': 144,
  '肖 1000 帽子题：马原': 176,
  '肖 1000 帽子题新思想': 171,
};
const actualBySubject: Record<string, number> = {};
const expectedPageMarkersBySubject: Record<string, number> = {
  '肖 1000 帽子题思修': 6,
  '肖 1000 帽子题毛中特': 8,
  '肖 1000 帽子题：史纲': 11,
  '肖 1000 帽子题：马原': 11,
  '肖 1000 帽子题新思想': 12,
};
const actualPageMarkersBySubject: Record<string, number> = {};
const sourceQuestionsWithoutFormatting: Array<{ subject: string; text: string }> = [];
let currentSubject = '未分类';
const tokenPattern = /<(h1|h2|h3|li|p)\b[^>]*>([\s\S]*?)<\/\1>/gi;
let match: RegExpExecArray | null;
while ((match = tokenPattern.exec(sourceHtml)) !== null) {
  const tag = match[1].toLowerCase();
  const raw = match[2];
  const text = raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (tag === 'h1') {
    currentSubject = text;
    actualBySubject[currentSubject] ??= 0;
    actualPageMarkersBySubject[currentSubject] ??= 0;
    continue;
  }
  if (tag !== 'li' && tag !== 'p') continue;
  if (tag === 'p' && /^-?\s*\d+\s*-?$/.test(text)) {
    actualPageMarkersBySubject[currentSubject] = (actualPageMarkersBySubject[currentSubject] ?? 0) + 1;
    continue;
  }
  if (!text || /^(?:27\s*)?肖\s*1000\s*帽子题/.test(text)) continue;
  if (!/^\d+\s*[.、．]/.test(text)) continue;
  actualBySubject[currentSubject] = (actualBySubject[currentSubject] ?? 0) + 1;
  if (!/<u\b|<b\b|<strong\b/i.test(raw)) {
    sourceQuestionsWithoutFormatting.push({ subject: currentSubject, text: text.slice(0, 90) });
  }
}

for (const [subject, expected] of Object.entries(expectedBySubject)) {
  const actual = actualBySubject[subject] ?? 0;
  if (actual !== expected) {
    issues.push({
      dataset: '原始帽子题 HTML',
      id: subject,
      field: 'questionCount',
      message: `题目记录数应为 ${expected}，实际为 ${actual}`,
    });
  }
}
for (const subject of Object.keys(actualBySubject)) {
  if (!(subject in expectedBySubject)) {
    issues.push({ dataset: '原始帽子题 HTML', id: subject, field: 'subject', message: '出现未登记的科目标题，请核查是否误混入其他资料' });
  }
}
for (const [subject, expected] of Object.entries(expectedPageMarkersBySubject)) {
  const actual = actualPageMarkersBySubject[subject] ?? 0;
  if (actual !== expected) {
    issues.push({
      dataset: '原始帽子题 HTML',
      id: subject,
      field: 'pageCount',
      message: `页码标记应为 ${expected} 个，实际为 ${actual} 个`,
    });
  }
}
if (sourceQuestionsWithoutFormatting.length) {
  warnings.push({
    dataset: '原始帽子题 HTML',
    id: 'answer-formatting',
    message: `${sourceQuestionsWithoutFormatting.length} 个编号段落没有 <u>/<b>/<strong> 答案标记；需结合跨页续接判断，不自动编造答案。`,
  });
}

const expectedStructuredCount = 684;
if (HAT_QUESTIONS.length !== expectedStructuredCount) {
  issues.push({
    dataset: '帽子题结构化数据',
    id: 'source-coverage',
    field: 'count',
    message: `结构化题库应完整收录 ${expectedStructuredCount} 道原文编号题，实际为 ${HAT_QUESTIONS.length}`,
  });
}
const structuredNeedsReview = HAT_QUESTIONS.filter(q => q.needsReview).length;
const structuredPlayable = HAT_QUESTIONS.filter(q => !q.needsReview && Boolean(q.answer?.trim())).length;
if (structuredNeedsReview + structuredPlayable !== HAT_QUESTIONS.length) {
  issues.push({ dataset: '帽子题结构化数据', id: 'review-status', field: 'count', message: '待核验题与可练习题数量无法覆盖全部题目' });
}
const expectedStructuredBySubject: Record<string, number> = {
  '思修法治': 95,
  '毛中特': 98,
  '史纲': 144,
  '马原': 176,
  '新思想': 171,
};
for (const [subject, expected] of Object.entries(expectedStructuredBySubject)) {
  const actual = HAT_QUESTIONS.filter(q => q.subject === subject).length;
  if (actual !== expected) {
    issues.push({ dataset: '帽子题结构化数据', id: subject, field: 'questionCount', message: `应有 ${expected} 道，实际为 ${actual} 道` });
  }
}
const normalizeOption = (value: string) => value.replace(/[\s，。；;：:、（）()“”‘’]/g, '').toLocaleLowerCase();
let fourChoiceReadyQuestions = 0;
let questionsMissingQualityDistractors = 0;
for (const question of HAT_QUESTIONS.filter(q => !q.needsReview && q.answer?.trim())) {
  const options = buildHatQuestionOptions(question, HAT_QUESTIONS);
  if (options.length === 0) {
    // Quality gate: do not force long or mismatched filler just to reach four options.
    questionsMissingQualityDistractors += 1;
    continue;
  }
  const uniqueOptions = new Set(options.map(option => normalizeOption(option.text)));
  const correctCount = options.filter(option => option.isCorrect).length;
  if (options.length !== 4 || uniqueOptions.size !== 4 || correctCount !== 1) {
    issues.push({
      dataset: '四选一自动组题',
      id: question.id,
      field: 'options',
      message: `应生成4个不重复选项且只有1个正确答案；实际选项数 ${options.length}，唯一选项数 ${uniqueOptions.size}，正确项数 ${correctCount}`,
    });
  } else {
    fourChoiceReadyQuestions += 1;
  }
}
if (questionsMissingQualityDistractors > 0) {
  warnings.push({
    dataset: '四选一自动组题',
    id: 'quality-gate',
    message: `${questionsMissingQualityDistractors} 道题暂时缺少足够短且合格的干扰项，暂不强行凑满四项；需补充经核验的混淆矩阵后再开放四选一。`,
  });
}
const sourceQuestionCount = Object.values(actualBySubject).reduce((sum, count) => sum + count, 0);
const counts = {
  searchableSourceQuestions: sourceQuestionCount,
  sourceQuestionsBySubject: actualBySubject,
  sourcePageMarkersBySubject: actualPageMarkersBySubject,
  sourcePageMarkers: Object.values(actualPageMarkersBySubject).reduce((sum, count) => sum + count, 0),
  structuredHatQuestions: HAT_QUESTIONS.length,
  structuredPlayableQuestions: structuredPlayable,
  structuredNeedsReviewQuestions: structuredNeedsReview,
  confusionMatrixGroups: CONFUSION_DATA.length,
  confusionMatrixItems: CONFUSION_DATA.reduce((sum, group) => sum + group.items.length, 0),
  fourChoiceReadyQuestions,
  questionsMissingQualityDistractors,
  essayTemplates: ESSAY_TEMPLATES.length,
  sourceFile: 'src/data/hat-source.html',
  issues: issues.length,
  warnings: warnings.length,
};
console.log(JSON.stringify({ counts, issues, warnings }, null, 2));
if (issues.length) process.exitCode = 1;
