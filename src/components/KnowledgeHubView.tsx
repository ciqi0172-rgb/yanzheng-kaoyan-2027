import React, { useEffect, useMemo, useState } from 'react';
import sourceHtml from '../data/hat-source.html?raw';
import { Search, FileText, LoaderCircle } from 'lucide-react';

type SourceItem = { id: number; subject: string; chapter: string; section: string; text: string; textHtml: string; sourceHtml: string; answer: string; kind: string; needsReview: boolean };

export const KnowledgeHubView: React.FC = () => {
  const [items, setItems] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('全部科目');
  const [chapterFilter, setChapterFilter] = useState('全部章节');

  useEffect(() => {
    let alive = true;
    Promise.resolve(sourceHtml)
      .then(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const parsed: SourceItem[] = [];
        let subject = '未分类';
        let chapter = '未分类章节';
        let section = '';
        let lastItem: SourceItem | null = null;

        const buildItemContent = (rawHtml: string) => {
          const fragment = new DOMParser().parseFromString('<!doctype html><html><body></body></html>', 'text/html');
          fragment.body.innerHTML = rawHtml;
          const answerNodes = Array.from(fragment.body.querySelectorAll('u'));
          const boldNodes = Array.from(fragment.body.querySelectorAll('b,strong'));
          const redStyle = 'color:#dc2626;font-weight:800;text-decoration:underline;text-decoration-color:#dc2626';
          let answer = '';
          if (answerNodes.length) {
            answer = answerNodes.map(el => (el.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean).join('；');
            answerNodes.forEach(el => {
              const span = fragment.createElement('span');
              span.setAttribute('style', redStyle);
              span.innerHTML = el.innerHTML;
              el.replaceWith(span);
            });
          } else if (boldNodes.length >= 2) {
            // In 史纲/马原 the source commonly bolds both the cue and the answer; the final bold span is the answer.
            const selected = boldNodes[boldNodes.length - 1];
            answer = (selected.textContent || '').replace(/\s+/g, ' ').trim();
            const span = fragment.createElement('span');
            span.setAttribute('style', redStyle);
            span.innerHTML = selected.innerHTML;
            selected.replaceWith(span);
          } else if (boldNodes.length === 1) {
            // In 新思想/毛中特 a lone bold span is often the cue word, while the answer follows it.
            // Highlight the trailing source text instead of incorrectly coloring the cue word as the answer.
            const cue = boldNodes[0];
            const range = fragment.createRange();
            range.setStartAfter(cue);
            if (fragment.body.lastChild) range.setEndAfter(fragment.body.lastChild);
            const tail = range.cloneContents();
            answer = (tail.textContent || '').replace(/\s+/g, ' ').trim().replace(/^(?:(?:是|为|包括|有)\s*(?:[：:]\s*)?|[：:]\s*)/, '').trim();
            if (answer) {
              const span = fragment.createElement('span');
              span.setAttribute('style', redStyle);
              span.appendChild(range.extractContents());
              range.insertNode(span);
            }
          }
          return {
            text: (fragment.body.textContent || '').replace(/\s+/g, ' ').trim(),
            textHtml: fragment.body.innerHTML,
            answer,
          };
        };

        const nodes = Array.from(doc.body.querySelectorAll('h1,h2,h3,li,p'));
        nodes.forEach(node => {
          const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
          if (!text) return;
          if (node.tagName === 'H1') { subject = text; chapter = '导论'; section = ''; lastItem = null; return; }
          if (node.tagName === 'H2') { chapter = text; section = ''; lastItem = null; return; }
          if (node.tagName === 'H3') { section = text; return; }

          const isParagraph = node.tagName === 'P';
          if (isParagraph && /^-?\s*\d+\s*-?$/.test(text)) return;
          // PDF page headers repeat inside the source and must not become searchable records.
          if (isParagraph && /^(?:27\s*)?肖\s*1000\s*帽子题/.test(text)) return;
          // Some page breaks express the question type as a paragraph instead of an h3.
          if ((node.tagName === 'P' || node.tagName === 'LI') && /^(单选|多选|单项选择|多项选择|单选题|多选题)\s*[（(]?\s*P?\d+/i.test(text)) {
            section = text;
            lastItem = null;
            return;
          }

          const isNumberedList = node.tagName === 'LI' && /^\s*\d+\s*[.、．]/.test(text);
          const isNumberedParagraph = isParagraph && /^\s*\d+\s*[.、．]/.test(text);
          const rawHtml = (node as HTMLElement).innerHTML;

          if (isNumberedList || isNumberedParagraph) {
            const built = buildItemContent(rawHtml);
            const item: SourceItem = {
              id: parsed.length + 1,
              subject,
              chapter,
              section,
              text: built.text,
              textHtml: built.textHtml,
              sourceHtml: rawHtml,
              answer: built.answer,
              kind: '题目',
              needsReview: !built.answer,
            };
            parsed.push(item);
            lastItem = item;
            return;
          }

          // Answers sometimes continue in a plain paragraph after a PDF page break.
          // Merge that fragment into the previous question instead of displaying it as a fake question.
          if (isParagraph && lastItem && lastItem.subject === subject && lastItem.chapter === chapter && lastItem.section === section && lastItem.kind === '题目') {
            lastItem.sourceHtml += ' ' + rawHtml;
            const built = buildItemContent(lastItem.sourceHtml);
            lastItem.text = built.text;
            lastItem.textHtml = built.textHtml;
            lastItem.answer = built.answer;
            lastItem.needsReview = !built.answer;
            return;
          }

          // Preserve otherwise-unclassified source text so searching never silently drops content.
          const built = buildItemContent(rawHtml);
          const item: SourceItem = {
            id: parsed.length + 1,
            subject,
            chapter,
            section,
            text: built.text,
            textHtml: built.textHtml,
            sourceHtml: rawHtml,
            answer: built.answer,
            kind: '原文',
            needsReview: !built.answer,
          };
          parsed.push(item);
          lastItem = item;
        });

        if (!alive) return;
        // Re-number after continuation paragraphs have been merged.
        parsed.forEach((item, index) => { item.id = index + 1; });
        setItems(parsed);
        setLoading(false);
      })
      .catch(error => {
        if (!alive) return;
        setLoadError(error instanceof Error ? error.message : '原文件加载失败');
        setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const subjects = useMemo(() => ['全部科目', ...Array.from(new Set(items.map(x => x.subject)))], [items]);
  const chapters = useMemo(() => ['全部章节', ...Array.from(new Set(items.filter(x => subjectFilter === '全部科目' || x.subject === subjectFilter).map(x => x.chapter)))], [items, subjectFilter]);
  const results = useMemo(() => {
    const q = submittedQuery.trim().toLocaleLowerCase();
    return items.filter(item =>
      (subjectFilter === '全部科目' || item.subject === subjectFilter) &&
      (chapterFilter === '全部章节' || item.chapter === chapterFilter) &&
      (!q || item.text.toLocaleLowerCase().includes(q) || item.subject.toLocaleLowerCase().includes(q) || item.chapter.toLocaleLowerCase().includes(q) || item.section.toLocaleLowerCase().includes(q))
    );
  }, [items, submittedQuery, subjectFilter, chapterFilter]);

  return <main className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
    <header className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400"><FileText size={20}/><span className="text-xs font-bold tracking-wide">用户提供的原始 HTML · 原文索引</span></div>
      <h1 className="mt-2 text-2xl font-black text-stone-900 dark:text-stone-100">帽子题原文检索库</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">直接读取你提供的《肖 1000 帽子题》HTML 文件，按原文件中的科目、章节和题目检索。不再使用之前那份粗糙的 OCR 数据，也不混入旧题库或模板。</p>
    </header>
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:p-6">
      <form onSubmit={e => { e.preventDefault(); setSubmittedQuery(query); }} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px_180px_auto]">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索帽子词、知识点、题干或答案" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-400 dark:border-stone-700 dark:bg-stone-800"/>
        <select value={subjectFilter} onChange={e => { setSubjectFilter(e.target.value); setChapterFilter('全部章节'); }} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm dark:border-stone-700 dark:bg-stone-800">{subjects.map(s => <option key={s}>{s}</option>)}</select>
        <select value={chapterFilter} onChange={e => setChapterFilter(e.target.value)} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm dark:border-stone-700 dark:bg-stone-800">{chapters.map(s => <option key={s}>{s}</option>)}</select>
        <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white dark:bg-stone-100 dark:text-stone-900"><Search size={16}/>检索</button>
      </form>
      {loading && <div className="flex items-center gap-2 py-8 text-sm text-stone-500"><LoaderCircle size={18} className="animate-spin"/>正在读取原始帽子题文件…</div>}
      {loadError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}。请检查内置原始题库文件是否存在。</div>}
      {!loading && !loadError && <div className="space-y-2 text-xs leading-6 text-stone-500">
        <div>已建立 {items.filter(item => item.kind === '题目').length} 道题目索引 · {items.filter(item => item.kind === '题目' && item.needsReview).length} 条答案标记待核验 · 当前匹配 {results.length} 条</div>
        <div className="flex flex-wrap gap-2">{subjects.filter(s => s !== '全部科目').map(s => <span key={s} className="rounded-full bg-stone-100 px-2 py-1 dark:bg-stone-800">{s.replace('肖 1000 帽子题', '')} · {items.filter(item => item.kind === '题目' && item.subject === s).length} 题</span>)}</div>
      </div>}
      {!loading && !loadError && results.map(item => <article key={item.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-800 dark:bg-rose-950 dark:text-rose-200">{item.subject}</span><span className="text-xs text-stone-500">{item.chapter}</span>{item.section && <span className="text-xs text-stone-500">{item.section}</span>}{item.needsReview && <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">原文答案标记待核验</span>}</div>
        <p className="break-words text-[15px] leading-7 text-stone-800 dark:text-stone-200" dangerouslySetInnerHTML={{ __html: item.textHtml }} />{item.answer && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"><span className="mr-2 font-bold">答案</span><span className="font-bold text-red-600 dark:text-red-400">{item.answer}</span></div>}
      </article>)}
      {!loading && !loadError && !results.length && <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">没有匹配结果，请尝试更短的关键词或调整科目、章节筛选。</div>}
    </section>
  </main>;
};
