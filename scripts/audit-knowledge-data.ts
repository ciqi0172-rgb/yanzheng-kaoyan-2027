import { HAT_QUESTIONS } from '../src/data/hatQuestions';
import { ESSAY_TEMPLATES } from '../src/data/essayTemplates';
import { HAT_SOURCE_PAGES } from '../src/data/hatSourcePages';

type Issue = { dataset: string; id: string; field: string; message: string };
const issues: Issue[] = [];

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

checkUniqueIds('帽子题', HAT_QUESTIONS);
for (const q of HAT_QUESTIONS) {
  for (const field of ['subject', 'hatType', 'hatKeyword', 'examType', 'sourcePage', 'stem', 'answer', 'trapAnalysis'] as const) {
    if (!String(q[field] ?? '').trim()) {
      issues.push({ dataset: '帽子题', id: q.id, field, message: '必填字段为空' });
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

const sourcePages = new Set<number>();
for (const page of HAT_SOURCE_PAGES) {
  if (!Number.isInteger(page.sourcePage) || page.sourcePage < 1 || page.sourcePage > 48) issues.push({ dataset: '原文页面索引', id: String(page.sourcePage), field: 'sourcePage', message: 'PDF 页码必须在 1–48 范围内' });
  if (sourcePages.has(page.sourcePage)) issues.push({ dataset: '原文页面索引', id: String(page.sourcePage), field: 'sourcePage', message: 'PDF 页码重复' });
  sourcePages.add(page.sourcePage);
  if (!page.text?.trim()) issues.push({ dataset: '原文页面索引', id: String(page.sourcePage), field: 'text', message: '页面摘录为空' });
  if (page.status !== 'OCR-待人工核验') issues.push({ dataset: '原文页面索引', id: String(page.sourcePage), field: 'status', message: '原文 OCR 必须保持待人工核验状态' });
}

const counts = { hatQuestions: HAT_QUESTIONS.length, essayTemplates: ESSAY_TEMPLATES.length, sourcePages: HAT_SOURCE_PAGES.length, issues: issues.length };
console.log(JSON.stringify({ counts, issues }, null, 2));
if (issues.length) process.exitCode = 1;
