import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';

interface ConfusionItem {
  term: string;
  hatType: string;
  targetAnswer: string;
  trapWarning: string;
  subject: string;
}

interface ConfusionGroup {
  id: string;
  title: string;
  category: string;
  description: string;
  items: ConfusionItem[];
}

const CONFUSION_DATA: ConfusionGroup[] = [
  {
    id: 'genben',
    title: '【根本】高危帽子概念混淆矩阵',
    category: '根本',
    description: '考研政治最常考、张冠李戴频率最高的帽子词汇，一字之差谬以千里。',
    items: [
      {
        term: '党和国家的根本所在、命脉所在 / 全国各族人民的利益所系、命运所系',
        hatType: '根本所在/命脉所在',
        targetAnswer: '中国共产党的领导',
        trapWarning: '不可偷换为“马克思主义指导”或“公有制主体地位”。这是党的领导的专属帽子。',
        subject: '新思想',
      },
      {
        term: '中国共产党区别于其他政党的根本标志 / 党的性质和宗旨的集中体现',
        hatType: '根本标志',
        targetAnswer: '勇于自我革命',
        trapWarning: '牢记：这是“跳出历史周期率的第二个答案”；区别于其他政党的宗旨是“全心全意为人民服务”，而根本标志是“自我革命”！',
        subject: '新思想/史纲',
      },
      {
        term: '全面建设社会主义现代化国家的根本保证',
        hatType: '根本保证',
        targetAnswer: '党的领导',
        trapWarning: '混淆陷阱：“制度保证”是高水平社会主义市场经济体制；“根本保证”是党的领导。',
        subject: '新思想',
      },
      {
        term: '决定国家前途命运的根本力量 / 推进中国式现代化的根本动力',
        hatType: '根本力量/根本动力',
        targetAnswer: '人民群众（推动改革开放和创新）',
        trapWarning: '人民群众是历史的创造者。不可选“科技力量”或“资金积累”。',
        subject: '马原/新思想',
      },
      {
        term: '中国特色社会主义的根本任务',
        hatType: '根本任务',
        targetAnswer: '解放和发展社会生产力',
        trapWarning: '“首要任务”是高质量发展；“根本任务”是解放和发展社会生产力！',
        subject: '毛中特/新思想',
      },
      {
        term: '我国的根本政治制度',
        hatType: '根本政治制度',
        targetAnswer: '人民代表大会制度',
        trapWarning: '“根本制度”是社会主义制度；“根本政治制度”是政协/人大的区分，政协是“基本政治制度”。',
        subject: '新思想/思修',
      },
    ],
  },
  {
    id: 'shouyao',
    title: '【首要/第一】新时代发展考点大辨析',
    category: '首要',
    description: '高质量发展、新发展理念中的第一、首要等高频设错陷阱。',
    items: [
      {
        term: '全面建设社会主义现代化国家的首要任务',
        hatType: '首要任务',
        targetAnswer: '高质量发展',
        trapWarning: '绝对不要混成“科技创新”或“共同富裕”。高频单选必考！',
        subject: '新思想',
      },
      {
        term: '引领发展的第一动力 / 现代化经济体系的战略支撑',
        hatType: '第一动力',
        targetAnswer: '创新',
        trapWarning: '绿色是普遍形态，开放是必由之路，共享是根本目的，协调是内生特点，创新是第一动力！',
        subject: '新思想',
      },
      {
        term: '新民主主义革命的首要对象 / 中国人民最凶恶的敌人',
        hatType: '首要对象',
        targetAnswer: '帝国主义',
        trapWarning: '帝国主义是中国人民第一个和最凶恶的敌人。封建主义是反动统治基础。',
        subject: '毛中特',
      },
      {
        term: '发展是党执政兴国的',
        hatType: '第一要务',
        targetAnswer: '第一要务',
        trapWarning: '注意：“第一要务”是发展，“第一动力”是创新，“第一资源”是人才。',
        subject: '新思想',
      },
    ],
  },
  {
    id: 'hexin',
    title: '【核心/中心】领导权与指导思想',
    category: '核心',
    description: '革命中心问题、全党核心理论、价值观核心等精准定位。',
    items: [
      {
        term: '新民主主义革命的核心问题 / 区分新旧民主主义革命的根本标志',
        hatType: '核心问题/根本标志',
        targetAnswer: '无产阶级的领导权',
        trapWarning: '新旧革命分水岭：旧民主主义革命是资产阶级领导，新民主主义革命是无产阶级领导。',
        subject: '毛中特/史纲',
      },
      {
        term: '社会主义核心价值体系的内核与最高抽象',
        hatType: '内核/抽象',
        targetAnswer: '社会主义核心价值观',
        trapWarning: '社会主义核心价值观是社会主义核心价值体系的内核，体现其根本性质和基本特征。',
        subject: '思修法治',
      },
      {
        term: '习近平新时代中国特色社会主义思想的核心内容',
        hatType: '核心内容',
        targetAnswer: '“十个明确”、“十四个坚持”、“十三个方面成就”',
        trapWarning: '“十个明确”是支撑性的“四梁八柱”；“十四个坚持”是治国理政行动纲领。',
        subject: '新思想',
      },
    ],
  },
  {
    id: 'benzhi',
    title: '【本质/根本要求】中国特色社会主义底色',
    category: '本质',
    description: '法治、中国式现代化、生态文明中的本质属性区分。',
    items: [
      {
        term: '中国特色社会主义最本质的特征 / 中国特色社会主义制度的最大优势',
        hatType: '最本质特征/最大优势',
        targetAnswer: '中国共产党的领导',
        trapWarning: '单选题黄金帽子！只要题干问“最本质的特征”或“制度的最大优势”，答案必选中国共产党的领导。',
        subject: '新思想',
      },
      {
        term: '中国式现代化的本质要求（首要）',
        hatType: '本质要求',
        targetAnswer: '坚持中国共产党领导，坚持中国特色社会主义',
        trapWarning: '实现全体人民共同富裕是本质要求之一，但首位是坚持中国共产党领导。',
        subject: '新思想',
      },
      {
        term: '社会主义法治的根本保证 vs 本质属性',
        hatType: '根本保证/本质属性',
        targetAnswer: '党的领导（根本保证） / 人民当家作主（本质属性）',
        trapWarning: '党的领导是根本保证；人民性是社会主义法治的本质属性。切勿颠倒！',
        subject: '思修法治',
      },
    ],
  },
];

interface ConfusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter?: (term: string) => void;
}

export const ConfusionModal: React.FC<ConfusionModalProps> = ({
  isOpen,
  onClose,
  onApplyFilter,
}) => {
  const [activeGroup, setActiveGroup] = useState<string>('genben');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const currentGroup = CONFUSION_DATA.find((g) => g.id === activeGroup) || CONFUSION_DATA[0];

  const filteredItems = currentGroup.items.filter(
    (item) =>
      item.term.includes(searchQuery) ||
      item.targetAnswer.includes(searchQuery) ||
      item.hatType.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                政治“帽子题”高频混淆对撞矩阵
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                横向对照最易错的“根本”、“首要”、“本质”、“核心”高频词，消除考场张冠李戴
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="px-6 py-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {CONFUSION_DATA.map((group) => (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeGroup === group.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {group.title.split('】')[0].replace('【', '')}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜帽子或答案..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50">
            <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">
              {currentGroup.title}
            </h3>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
              {currentGroup.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                      {item.subject} · {item.hatType}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">#{idx + 1}</span>
                  </div>

                  <p className="text-xs text-stone-700 dark:text-stone-300 font-medium mb-3 leading-relaxed">
                    “{item.term}” 的准确答案是？
                  </p>

                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{item.targetAnswer}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{item.trapWarning}</span>
                  </div>
                </div>

                {onApplyFilter && (
                  <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                    <button
                      onClick={() => {
                        onApplyFilter(item.targetAnswer);
                        onClose();
                      }}
                      className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      在题库中检索该考点卡片
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-stone-400 text-xs">
              未找到匹配的对比项，请尝试更换搜索词
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/30 flex justify-between items-center text-xs text-stone-500">
          <span>共收录高频对比点：{currentGroup.items.length} 处</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            完成辨析关闭
          </button>
        </div>
      </div>
    </div>
  );
};
