import React, { useMemo, useState } from 'react';
import { HAT_SOURCE_PAGES } from '../data/hatSourcePages';
import { Search, FileText } from 'lucide-react';

export const KnowledgeHubView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [pageFilter, setPageFilter] = useState('全部');

  const results = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    return HAT_SOURCE_PAGES.filter(page => {
      if (pageFilter !== '全部' && page.sourcePage !== Number(pageFilter)) return false;
      return !q || page.text.toLowerCase().includes(q) || String(page.sourcePage) === q;
    });
  }, [submittedQuery, pageFilter]);

  return <main className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
    <header className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400"><FileText size={20}/><span className="text-xs font-bold tracking-wide">原始 PDF · OCR 全文索引</span></div>
      <h1 className="mt-2 text-2xl font-black text-stone-900 dark:text-stone-100">帽子题 OCR 原文检索</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">仅检索《27肖1000帽子题 思修_2027版.pdf》的 48 页 OCR 文字。不混入旧结构化题库或答题模板，不自动补写答案。</p>
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">识别状态：OCR 待核验。OCR 可能存在错字、漏字和版面顺序错乱；搜索结果用于定位原文，不能直接视为标准答案。</div>
    </header>
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:p-6">
      <form onSubmit={e => { e.preventDefault(); setSubmittedQuery(query); }} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_150px_auto]">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="输入帽子词、知识点、题干关键词或页码" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-400 dark:border-stone-700 dark:bg-stone-800"/>
        <select value={pageFilter} onChange={e => setPageFilter(e.target.value)} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm dark:border-stone-700 dark:bg-stone-800">
          <option>全部</option>{HAT_SOURCE_PAGES.map(p => <option key={p.sourcePage} value={String(p.sourcePage)}>PDF 第 {p.sourcePage} 页</option>)}
        </select>
        <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white dark:bg-stone-100 dark:text-stone-900"><Search size={16}/>检索 OCR</button>
      </form>
      <div className="text-xs text-stone-500">已导入 {HAT_SOURCE_PAGES.length}/48 页 · 当前匹配 {results.length} 页</div>
      {results.map(page => <article key={page.sourcePage} className="rounded-xl border border-stone-200 p-4 dark:border-stone-800">
        <div className="mb-3 flex flex-wrap items-center gap-2"><h2 className="font-bold text-stone-900 dark:text-stone-100">PDF 第 {page.sourcePage} 页</h2><span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">{page.status || 'OCR-待人工核验'}</span></div>
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-stone-700 dark:text-stone-300">{page.text}</p>
      </article>)}
      {!results.length && <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">没有匹配到 OCR 原文。请尝试其他关键词，或按页码查看。没有匹配不代表原 PDF 不包含该知识点。</div>}
    </section>
  </main>;
};
