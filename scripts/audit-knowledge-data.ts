import { readFileSync } from 'node:fs';
import { HAT_QUESTIONS } from '../src/data/hatQuestions';
import { ESSAY_TEMPLATES } from '../src/data/essayTemplates';

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
for (const q of HAT_QUESTIONS) {
  for (const field of ['subject', 'hatType', 'hatKeyword', 'examType', 'sourcePage', 'stem', 'answer', 'trapAnalysis'] as const) {
    if (!String(q[field] ?? '').trim()) {
      issues.push({ dataset: '帽子题结构化数据', id: q.id, field, message: '必填字段为空' });
    }
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
const sourceQuestionsWithoutFormatting: Array<{ subject: string; text: string }> = [];
let currentSubject = '未分类';
const tokenPattern = /<(h1|h2|h3|li|p)\\b[^>]*>([\\s\\S]*?)<\\/\\1>/gi;
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
    .replace(/\\s+/g, ' ')
    .trim();
  if (tag === 'h1') {
    currentSubject = text;
    actualBySubject[currentSubject] ??= 0;
    continue;
  }
  if (tag !== 'li' && tag !== 'p') continue;
  if (!text || /^-?\\s*\\d+\\s*-?$/.test(text) || /^(?:27\\s*)?肖\\s*1000\\s*帽子题/.test(text)) continue;
  if (!/^\\d+\\s*[.、．]/.test(text)) continue;
  actualBySubject[currentSubject] = (actualBySubject[currentSubject] ?? 0) + 1;
  if (!/<u\\b|<b\\b|<strong\\b/i.test(raw)) {
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
if (sourceQuestionsWithoutFormatting.length) {
  warnings.push({
    dataset: '原始帽子题 HTML',
    id: 'answer-formatting',
    message: `${sourceQuestionsWithoutFormatting.length} 个编号段落没有 <u>/<b>/<strong> 答案标记；需结合跨页续接判断，不自动编造答案。`,
  });
}

const sourceQuestionCount = Object.values(actualBySubject).reduce((sum, count) => sum + count, 0);
const counts = {
  searchableSourceQuestions: sourceQuestionCount,
  sourceQuestionsBySubject: actualBySubject,
  structuredHatQuestions: HAT_QUESTIONS.length,
  essayTemplates: ESSAY_TEMPLATES.length,
  sourceFile: 'src/data/hat-source.html',
  issues: issues.length,
  warnings: warnings.length,
};
console.log(JSON.stringify({ counts, issues, warnings }, null, 2));
if (issues.length) process.exitCode = 1;
