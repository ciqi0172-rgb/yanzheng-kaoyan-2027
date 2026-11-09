import React, { useEffect, useMemo, useState } from 'react';
import { HAT_QUESTIONS } from '../data/hatQuestions';
import { ESSAY_TEMPLATES } from '../data/essayTemplates';
import { HAT_SOURCE_COVERAGE } from '../data/hatSourceCoverage';
import { TEMPLATE_SOURCE_COVERAGE } from '../data/templateSourceCoverage';
import { HAT_SOURCE_PAGES } from '../data/hatSourcePages';
import { Search, BookOpen, ClipboardList, Library, Plus, Trash2, Download, CheckCircle2 } from 'lucide-react';

type HubMode = 'search' | 'pending' | 'templates';
type PendingRecord = { id: string; query: string; note: string; createdAt: string; status: '待补全' | '已补充' };

const PENDING_KEY = 'yanzheng_knowledge_pending_v1';
const readPending = (): PendingRecord[] => {
  try {
    const value = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
};

export const KnowledgeHubView: React.FC = () => {
  const [mode, setMode] = useState<HubMode>('search');
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [subject, setSubject] = useState('全部');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingRecord[]>(readPending);
  const [newQuery, setNewQuery] = useState('');
  const [newNote, setNewNote] = useState('');
  const [templateQuery, setTemplateQuery] = useState('');
  const [templateNumber, setTemplateNumber] = useState('全部');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(PENDING_KEY, JSON.stringify(pending)); }, [pending]);

  const results = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    return HAT_QUESTIONS.filter(item => {
      if (subject !== '全部' && item.subject !== subject) return false;
      if (!q) return true;
      return [item.id, item.subject, item.hatType, item.hatKeyword, item.examType, item.sourcePage, item.stem, item.answer, item.trapAnalysis, item.confusionGroup || '']
        .join(' ').toLowerCase().includes(q);
    });
  }, [submittedQuery, subject]);

  const templates = useMemo(() => {
    const q = templateQuery.trim().toLowerCase();
    return ESSAY_TEMPLATES.filter(item => {
      if (templateNumber !== '全部' && item.questionNumber !== templateNumber) return false;
      if (!q) return true;
      return [item.id, item.questionNumber, item.subject, item.theme, item.keywords.join(' '), item.triggerConditions,
        item.step1Qualitative.formula, item.step1Qualitative.sampleText,
        item.step2CoreMaterial.points.map(p => p.subtitle + ' ' + p.content + ' ' + p.highlightWords.join(' ')).join(' '),
        item.step3Sublimation.closingFormula, item.step3Sublimation.sampleClosing
      ].join(' ').toLowerCase().includes(q);
    });
  }, [templateQuery, templateNumber]);

  const sourcePageResults = useMemo(() => { const q = submittedQuery.trim().toLowerCase(); if (!q) return []; return HAT_SOURCE_PAGES.filter(page => page.text.toLowerCase().includes(q) || String(page.sourcePage).includes(q)); }, [submittedQuery]);

  const selectedQuestion = HAT_QUESTIONS.find(item => item.id === selectedId);
  const selectedTemplate = ESSAY_TEMPLATES.find(item => item.id === selectedTemplateId);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    setSubmittedQuery(q);
    setSelectedId(null);
    if (q && !HAT_QUESTIONS.some(item => (subject === '全部' || item.subject === subject) && [item.id, item.subject, item.hatType, item.hatKeyword, item.examType, item.sourcePage, item.stem, item.answer, item.trapAnalysis, item.confusionGroup || ''].join(' ').toLowerCase().includes(q.toLowerCase()))) {
      setPending(old => old.some(item => item.query.toLowerCase() === q.toLowerCase() && item.status === '待补全') ? old : [
        { id: 'pending-' + Date.now(), query: q, note: '由知识点检索自动记录：当前帽子题库未找到匹配内容，请核对原始资料后补充。', createdAt: new Date().toLocaleString(), status: '待补全' }, ...old
      ]);
    }
  };

  const addPending = (event: React.FormEvent) => {
    event.preventDefault();
    const q = newQuery.trim();
    if (!q) return;
    setPending(old => [{ id: 'pending-' + Date.now(), query: q, note: newNote.trim() || '用户手动添加，待对照原始资料补全。', createdAt: new Date().toLocaleString(), status: '待补全' }, ...old]);
    setNewQuery('');
    setNewNote('');
  };

  const updatePending = (id: string, status: PendingRecord['status']) => setPending(old => old.map(item => item.id === id ? { ...item, status } : item));
  const removePending = (id: string) => setPending(old => old.filter(item => item.id !== id));
  const exportPending = () => {
    const blob = new Blob([JSON.stringify(pending, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = '帽子题待补全记录.json'; a.click(); URL.revokeObjectURL(url);
  };

  const panel = 'rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900';
  const inputClass = 'w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2.5 text-sm text-stone-800 dark:text-stone-100 outline-none focus:ring-2 focus:ring-rose-400';
  const buttonClass = 'rounded-xl px-3 py-2 text-sm font-semibold transition-colors';
  return <div className="space-y-6">
    <section className={panel + ' p-5 sm:p-6'}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-bold tracking-wide text-rose-600 dark:text-rose-400">独立新增模块 · 不修改原有自检遮盖</div>
          <h1 className="mt-1 text-2xl font-black text-stone-900 dark:text-stone-100">知识点检索与答题模板库</h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">结构化题库与原始资料核对状态分开管理；检索不到的关键词会进入待补全清单，不会自动编造答案。</p>
        </div>
        <div className="text-sm text-stone-500">结构化帽子题 {HAT_QUESTIONS.length} 条 · 大题模板 {ESSAY_TEMPLATES.length} 条</div>
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3 text-sm text-amber-900 dark:text-amber-200"><strong>原始资料核验进度：</strong>《{HAT_SOURCE_COVERAGE.sourceFile}》共 {HAT_SOURCE_COVERAGE.totalPages} 页，已建立 {HAT_SOURCE_COVERAGE.extractedPages} 页 OCR 底稿；人工核验 {HAT_SOURCE_COVERAGE.verifiedPages} 页，{HAT_SOURCE_COVERAGE.pendingManualVerificationPages.length} 页仍待逐页核对。OCR 仅供检索定位，不能直接视为标准答案。</div>
      <div className="mt-2 rounded-xl border border-sky-200 bg-sky-50 dark:bg-sky-950/20 dark:border-sky-900 p-3 text-sm text-sky-900 dark:text-sky-200"><strong>答题模板核验进度：</strong>《{TEMPLATE_SOURCE_COVERAGE.sourceFile}》共 {TEMPLATE_SOURCE_COVERAGE.totalPages} 页，目前结构化模板 {TEMPLATE_SOURCE_COVERAGE.structuredTemplateCount} 条；人工逐页核验 {TEMPLATE_SOURCE_COVERAGE.verifiedPages} 页，{TEMPLATE_SOURCE_COVERAGE.pendingManualVerificationPages.length} 页待核对。条目数量不代表原文覆盖完整。</div>
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button onClick={() => setMode('search')} className={buttonClass + ' flex items-center justify-center gap-2 ' + (mode === 'search' ? 'bg-rose-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200')}><Search size={16}/>知识点检索</button>
        <button onClick={() => setMode('pending')} className={buttonClass + ' flex items-center justify-center gap-2 ' + (mode === 'pending' ? 'bg-rose-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200')}><ClipboardList size={16}/>待补全题库 <span className="rounded-full bg-amber-100 text-amber-800 px-2 text-xs">{pending.filter(p => p.status === '待补全').length}</span></button>
        <button onClick={() => setMode('templates')} className={buttonClass + ' flex items-center justify-center gap-2 ' + (mode === 'templates' ? 'bg-rose-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200')}><BookOpen size={16}/>答题模板</button>
      </div>
    </section>

    {mode === 'search' && <section className={panel + ' p-4 sm:p-6 space-y-4'}>
      <form onSubmit={submitSearch} className="grid grid-cols-1 sm:grid-cols-[1fr_160px_auto] gap-2">
        <input className={inputClass} value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索题干、答案、帽子词、解析、科目、页码……"/>
        <select className={inputClass} value={subject} onChange={e => setSubject(e.target.value)}>{['全部','马原','毛中特','新思想','史纲','思修法治'].map(s => <option key={s}>{s}</option>)}</select>
        <button className={buttonClass + ' bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'} type="submit">搜索题库</button>
      </form>
      <div className="text-xs text-stone-500">结构化题目 {results.length} 条 · 原文页面匹配 {sourcePageResults.length} 页。原文索引目前为逐页录入的起始批次，尚非完整 48 页。</div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-4">
        <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
          {results.map(item => <button key={item.id} onClick={() => setSelectedId(item.id)} className={'w-full text-left rounded-xl border p-3 transition-colors ' + (selectedId === item.id ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30' : 'border-stone-200 dark:border-stone-800 hover:border-stone-400')}>
            <div className="flex flex-wrap gap-1.5 mb-2"><span className="text-[11px] rounded bg-stone-100 dark:bg-stone-800 px-2 py-0.5">{item.subject}</span><span className="text-[11px] rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-2 py-0.5">{item.hatKeyword}</span><span className="text-[11px] text-stone-400">{item.sourcePage || '未标来源页'}</span></div>
            <div className="text-sm font-semibold leading-relaxed text-stone-800 dark:text-stone-100">{item.stem}</div>
            <div className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-400">答案：{item.answer}</div>
          </button>)}
          {!results.length && <div className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">没有找到匹配项。提交搜索后，该关键词会自动记入“待补全题库”。</div>}
        </div>
        <div className="rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-4 min-h-48">
          {selectedQuestion ? <div className="space-y-4">
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-rose-600">{selectedQuestion.id} · {selectedQuestion.examType}</span><span className="text-xs text-stone-500">{selectedQuestion.sourcePage || '来源页码待核对'}</span></div>
            <h2 className="text-lg font-bold">{selectedQuestion.stem}</h2>
            <div><div className="text-xs font-bold text-stone-500 mb-1">标准答案 / 帽子对应词</div><div className="text-base font-bold text-emerald-700 dark:text-emerald-400">{selectedQuestion.answer}</div></div>
            <div><div className="text-xs font-bold text-stone-500 mb-1">考点分类</div><div className="text-sm">{selectedQuestion.subject} · {selectedQuestion.hatType} · {selectedQuestion.hatKeyword}</div></div>
            {selectedQuestion.options?.length ? <div><div className="text-xs font-bold text-stone-500 mb-2">选项</div><div className="space-y-2">{selectedQuestion.options.map(option => <div key={option.key} className={'rounded-lg p-2 text-sm ' + (option.isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' : 'bg-white dark:bg-stone-900')}>{option.key}. {option.text}{option.isCorrect ? ' ✓' : ''}{option.trapExplanation && <p className="mt-1 text-xs opacity-80">{option.trapExplanation}</p>}</div>)}</div></div> : null}
            <div><div className="text-xs font-bold text-stone-500 mb-1">易错点与辨析</div><p className="whitespace-pre-line text-sm leading-7">{selectedQuestion.trapAnalysis || '原始记录未提供解析。'}</p></div>
            {selectedQuestion.confusionGroup && <div className="text-xs text-stone-500">易混分组：{selectedQuestion.confusionGroup}</div>}
          </div> : <div className="h-full min-h-48 flex flex-col items-center justify-center text-center text-stone-400"><Library size={28}/><p className="mt-2 text-sm">选择左侧知识点，查看完整题干、答案和辨析</p></div>}
        </div>
      </div>
      {submittedQuery.trim() && <section className="rounded-xl border border-sky-200 dark:border-sky-900 p-4 space-y-3">
        <h3 className="font-bold text-sm text-sky-800 dark:text-sky-300">原始 PDF 页面检索（摘录索引）</h3>
        <p className="text-xs text-stone-500">以下为按原始 PDF 页面录入的文字摘录，可辅助定位；仍需回看 PDF 核对完整上下文。当前仅覆盖起始页面，不代表全书检索完整。</p>
        {sourcePageResults.map(page => <article key={page.sourcePage} className="rounded-lg bg-stone-50 dark:bg-stone-950 p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs mb-2"><strong>PDF 第 {page.sourcePage} 页</strong><span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5">{page.status}</span></div>
          <p className="text-sm leading-6 whitespace-pre-wrap">{page.text}</p>
        </article>)}
        {!sourcePageResults.length && <p className="text-sm text-stone-500">当前摘录索引没有匹配。不能据此判断原 PDF 中不存在该知识点。</p>}
      </section>}
    </section>}

    {mode === 'pending' && <section className={panel + ' p-4 sm:p-6 space-y-4'}>
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold">待补全题库</h2><p className="text-sm text-stone-500 mt-1">自动收集检索无结果的关键词，也可以手动登记原始资料中尚未录入的知识点。</p></div><button onClick={exportPending} className={buttonClass + ' bg-stone-100 dark:bg-stone-800 flex items-center gap-2'}><Download size={15}/>导出 JSON</button></div>
      <form onSubmit={addPending} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input className={inputClass} value={newQuery} onChange={e => setNewQuery(e.target.value)} placeholder="知识点 / 原题关键词（必填）" required/>
        <input className={inputClass} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="备注：来源章节、页码、缺失内容等"/>
        <button type="submit" className={buttonClass + ' bg-rose-600 text-white sm:col-span-2 flex items-center justify-center gap-2'}><Plus size={16}/>添加待补全记录</button>
      </form>
      <div className="space-y-2">{pending.map(item => <article key={item.id} className="rounded-xl border border-stone-200 dark:border-stone-800 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="font-bold break-words">{item.query}</div><p className="mt-1 text-sm text-stone-600 dark:text-stone-300 whitespace-pre-wrap">{item.note}</p><p className="mt-2 text-xs text-stone-400">{item.createdAt}</p></div><span className={'text-xs rounded-full px-2 py-1 ' + (item.status === '待补全' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')}>{item.status}</span></div>
        <div className="mt-3 flex flex-wrap gap-2">{item.status === '待补全' && <button onClick={() => updatePending(item.id, '已补充')} className={buttonClass + ' bg-emerald-100 text-emerald-800 flex items-center gap-1'}><CheckCircle2 size={14}/>标记已补充</button>}<button onClick={() => removePending(item.id)} className={buttonClass + ' bg-stone-100 dark:bg-stone-800 text-stone-600 flex items-center gap-1'}><Trash2 size={14}/>删除</button></div>
      </article>)}
      {!pending.length && <div className="text-center rounded-xl border border-dashed border-stone-300 p-8 text-sm text-stone-500">目前没有待补全记录。检索不到的关键词会在提交搜索后自动出现在这里。</div>}</div>
    </section>}

    {mode === 'templates' && <section className={panel + ' p-4 sm:p-6 space-y-4'}>
      <div><h2 className="text-lg font-bold">答题模板库</h2><p className="mt-1 text-sm text-stone-500">独立于帽子题检索。按题号、主题、关键词或模板正文检索，展开后查看三步法、踩分点和易漏点。</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_150px] gap-2"><input className={inputClass} value={templateQuery} onChange={e => setTemplateQuery(e.target.value)} placeholder="搜索主题、触发条件、关键词、标准句……"/><select className={inputClass} value={templateNumber} onChange={e => setTemplateNumber(e.target.value)}>{['全部','34题','35题','36题','37题','38题'].map(n => <option key={n}>{n}</option>)}</select></div>
      <div className="text-xs text-stone-500">匹配 {templates.length} / {ESSAY_TEMPLATES.length} 个模板</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{templates.map(item => <button key={item.id} onClick={() => setSelectedTemplateId(selectedTemplateId === item.id ? null : item.id)} className={'text-left rounded-xl border p-4 ' + (selectedTemplateId === item.id ? 'border-rose-400 bg-rose-50/60 dark:bg-rose-950/20' : 'border-stone-200 dark:border-stone-800 hover:border-stone-400')}>
        <div className="flex items-center gap-2 text-xs"><span className="rounded bg-rose-100 text-rose-800 px-2 py-1">{item.questionNumber}</span><span className="rounded bg-stone-100 dark:bg-stone-800 px-2 py-1">{item.subject}</span><span className="text-stone-400">{item.id}</span></div>
        <h3 className="mt-2 font-bold leading-relaxed">{item.theme}</h3><p className="mt-2 text-xs leading-5 text-stone-500">{item.keywords.join(' · ')}</p>
        {selectedTemplateId === item.id && <div className="mt-4 space-y-4 border-t border-stone-200 dark:border-stone-700 pt-4" onClick={e => e.stopPropagation()}>
          <div><h4 className="font-bold text-sm">触发条件</h4><p className="mt-1 text-sm leading-6">{item.triggerConditions}</p></div>
          <div><h4 className="font-bold text-sm">第一步：点题定性</h4><p className="mt-1 text-sm leading-6">{item.step1Qualitative.description}</p><p className="mt-2 rounded-lg bg-white dark:bg-stone-900 p-3 text-sm leading-6">{item.step1Qualitative.formula}</p><p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">示范句：{item.step1Qualitative.sampleText}</p></div>
          <div><h4 className="font-bold text-sm">第二步：核心踩分点</h4><div className="space-y-3 mt-2">{item.step2CoreMaterial.points.map((point, index) => <div key={index} className="rounded-lg bg-white dark:bg-stone-900 p-3"><div className="font-semibold text-sm">{point.subtitle}</div><p className="mt-1 text-sm leading-6">{point.content}</p><p className="mt-2 text-xs text-rose-600 dark:text-rose-400">关键词：{point.highlightWords.join(' · ')}</p></div>)}</div>{item.step2CoreMaterial.trapWarning && <p className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-400">{item.step2CoreMaterial.trapWarning}</p>}</div>
          <div><h4 className="font-bold text-sm">第三步：升华收尾</h4><p className="mt-1 text-sm leading-6">{item.step3Sublimation.closingFormula}</p><p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">示范结尾：{item.step3Sublimation.sampleClosing}</p></div>
        </div>}
      </button>)}</div>
    </section>}
  </div>;
};
