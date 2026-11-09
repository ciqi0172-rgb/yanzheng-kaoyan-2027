import React, { useEffect, useMemo, useState } from 'react';
import { Search, FileText, LoaderCircle } from 'lucide-react';

type SourceItem = { id: number; subject: string; chapter: string; section: string; text: string; answer: string; kind: string };

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
    fetch(`${import.meta.env.BASE_URL}hat-source.html`)
      .then(response => {
        if (!response.ok) throw new Error(`读取原文件失败（HTTP ${response.status}）`);
        return response.text();
      })
      .then(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const parsed: SourceItem[] = [];
        let subject = '未分类';
        let chapter = '未分类章节';
        let section = '';
        doc.body.querySelectorAll('h1,h2,h3,li,p').forEach(node => {
          const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
          if (!text) return;
          if (node.tagName === 'H1') { subject = text; chapter = '导论'; section = ''; return; }
          if (node.tagName === 'H2') { chapter = text; section = ''; return; }
          if (node.tagName === 'H3') { section = text; return; }
          if (node.tagName === 'P' && /^-?\\s*\\d+\\s*-?$/.test(text)) return;
          if (node.tagName === 'LI' || node.tagName === 'P') {
            const answer = node.querySelector('u')?.textContent?.replace(/\s+/g, ' ').trim() || '';
            const cleanText = text.replace(/\s+/g, ' ').trim();
            parsed.push({ id: parsed.length + 1, subject, chapter, section, text: cleanText, answer, kind: node.tagName === 'LI' ? '题目' : '原文' });
          }
        });
        if (!alive) return;
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
      {loadError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}。请检查部署文件 public/hat-source.html 是否存在。</div>}
      {!loading && !loadError && <div className="text-xs text-stone-500">已读取 {items.length} 条原文条目 · 当前匹配 {results.length} 条</div>}
      {!loading && !loadError && results.map(item => <article key={item.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-800 dark:bg-rose-950 dark:text-rose-200">{item.subject}</span><span className="text-xs text-stone-500">{item.chapter}</span>{item.section && <span className="text-xs text-stone-500">{item.section}</span>}</div>
        <p className="break-words text-[15px] leading-7 text-stone-800 dark:text-stone-200">{item.text}</p>{item.answer && <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-900 dark:bg-rose-950/50 dark:text-rose-100"><span className="mr-2 font-semibold">原文答案</span>{item.answer}</div>}
      </article>)}
      {!loading && !loadError && !results.length && <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">没有匹配结果，请尝试更短的关键词或调整科目、章节筛选。</div>}
    </section>
  </main>;
};
