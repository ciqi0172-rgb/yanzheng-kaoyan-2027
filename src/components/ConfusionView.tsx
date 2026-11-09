import React, { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, SplitSquareVertical, Sparkles } from 'lucide-react';

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

export const CONFUSION_DATA: ConfusionGroup[] = [
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
      {
        term: '党的一切工作的根本出发点和落脚点',
        hatType: '根本出发点',
        targetAnswer: '实现好、维护好、发展好最广大人民根本利益',
        trapWarning: '不要误选“经济增长”或“维护国家安全”。最广大人民根本利益是唯一的落脚点。',
        subject: '新思想',
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
      {
        term: '马克思主义政党第一位的能力',
        hatType: '第一位能力',
        targetAnswer: '政治领导力',
        trapWarning: '政治领导力是第一位的，统领思想引领力、群众组织力、社会号召力。',
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
      {
        term: '生态文明建设的核心',
        hatType: '核心',
        targetAnswer: '坚持人与自然和谐共生',
        trapWarning: '生态兴则文明兴。绿水青山就是金山银山是核心理念。',
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
  {
    id: 'biaozhi',
    title: '【标志/转折】党史与革命重大历史节点',
    category: '标志',
    description: '重大会议、思想萌芽、阶段划分等标志性考点。',
    items: [
      {
        term: '毛泽东思想萌芽的标志',
        hatType: '萌芽标志',
        targetAnswer: '新民主主义革命基本思想的提出',
        trapWarning: '初步形成标志是“农村包围城市、武装夺取政权”道路理论；成熟标志是“新民主主义理论系统阐述”。',
        subject: '毛中特/史纲',
      },
      {
        term: '党历史上生死攸关的转折点',
        hatType: '伟大转折',
        targetAnswer: '遵义会议',
        trapWarning: '遵义会议是党历史上生死攸关的转折点；十一届三中全会是新中国成立以来具有深远意义的伟大转折。',
        subject: '史纲',
      },
      {
        term: '中国新民主主义革命开端的标志',
        hatType: '开端标志',
        targetAnswer: '五四运动',
        trapWarning: '五四运动标志着中国工人阶级以独立的姿态登上历史舞台，成为新民主主义革命的开端。',
        subject: '史纲',
      },
    ],
  },
  {
    id: 'zhidu',
    title: '【制度】根本制度/根本政治制度/基本政治制度',
    category: '制度',
    description: '把“根本制度、根本政治制度、基本政治制度”分层记忆，重点防止制度名称互相替换。',
    items: [
      {
        term: '我国的根本制度',
        hatType: '根本制度',
        targetAnswer: '社会主义制度',
        trapWarning: '“根本制度”回答我国的社会制度性质；不要与具体的政治制度名称混为一谈。',
        subject: '新思想/思修法治',
      },
      {
        term: '我国的根本政治制度',
        hatType: '根本政治制度',
        targetAnswer: '人民代表大会制度',
        trapWarning: '人民代表大会制度是我国的根本政治制度；中国共产党领导的多党合作和政治协商制度不是根本政治制度。',
        subject: '新思想/思修法治',
      },
      {
        term: '我国的基本政治制度',
        hatType: '基本政治制度',
        targetAnswer: '中国共产党领导的多党合作和政治协商制度、民族区域自治制度、基层群众自治制度',
        trapWarning: '这三项属于基本政治制度；不要把其中任何一项单独替换为根本政治制度。',
        subject: '新思想/思修法治',
      },
      {
        term: '社会主义民主政治的本质和核心',
        hatType: '本质和核心',
        targetAnswer: '人民当家作主',
        trapWarning: '党的领导是中国特色社会主义最本质的特征；人民当家作主强调人民在国家政治生活中的主体地位，二者不能互换。',
        subject: '新思想',
      },
      {
        term: '社会主义法治最根本的保证',
        hatType: '根本保证',
        targetAnswer: '党的领导',
        trapWarning: '党的领导是社会主义法治最根本的保证；依法治国是党领导人民治理国家的基本方式。',
        subject: '思修法治/新思想',
      },
    ],
  },
  {
    id: 'fazhan',
    title: '【发展】第一动力/第一资源/第一要务',
    category: '发展',
    description: '同样带有“第一”字样，但对应创新、人才、发展等不同考点，必须按完整帽子定位。',
    items: [
      {
        term: '引领发展的第一动力',
        hatType: '第一动力',
        targetAnswer: '创新',
        trapWarning: '创新是引领发展的第一动力；人才是第一资源，发展是党执政兴国的第一要务。',
        subject: '新思想',
      },
      {
        term: '人才资源是第一资源中的关键表述',
        hatType: '第一资源',
        targetAnswer: '人才',
        trapWarning: '不要把“第一资源”与“第一动力”混淆：前者是人才，后者是创新。',
        subject: '新思想',
      },
      {
        term: '党执政兴国的第一要务',
        hatType: '第一要务',
        targetAnswer: '发展',
        trapWarning: '“发展”是第一要务；全面建设社会主义现代化国家的首要任务是高质量发展。',
        subject: '毛中特/新思想',
      },
      {
        term: '全面建设社会主义现代化国家的首要任务',
        hatType: '首要任务',
        targetAnswer: '高质量发展',
        trapWarning: '不能把“首要任务”直接替换为“第一动力”或“第一资源”。',
        subject: '新思想',
      },
      {
        term: '新发展理念的内容',
        hatType: '五大发展理念',
        targetAnswer: '创新、协调、绿色、开放、共享',
        trapWarning: '记住五项完整表述；创新对应第一动力，协调对应内生特点，绿色对应普遍形态，开放对应必由之路，共享对应根本目的。',
        subject: '新思想',
      },
    ],
  },
  {
    id: 'marx',
    title: '【马原】易混哲学原理辨析',
    category: '马原',
    description: '围绕常见的概念偷换与关系颠倒，区分原理适用范围，而不是只背关键词。',
    items: [
      {
        term: '哲学基本问题',
        hatType: '基本问题',
        targetAnswer: '思维和存在的关系问题',
        trapWarning: '包括两个方面：思维和存在何者是第一性，以及思维和存在有没有同一性；不能只答其中一个方面。',
        subject: '马原',
      },
      {
        term: '唯物辩证法的实质和核心',
        hatType: '实质和核心',
        targetAnswer: '对立统一规律',
        trapWarning: '对立统一规律揭示事物发展的源泉和动力；不要与质量互变规律、否定之否定规律混为一谈。',
        subject: '马原',
      },
      {
        term: '事物发展的根本动力',
        hatType: '根本动力',
        targetAnswer: '事物的内部矛盾',
        trapWarning: '矛盾是事物发展的动力；外部矛盾是变化的条件，外因通过内因起作用。',
        subject: '马原',
      },
      {
        term: '认识的本质',
        hatType: '本质',
        targetAnswer: '主体在实践基础上对客体的能动反映',
        trapWarning: '认识不是主体对客体的被动照相式反映；“实践”是认识的基础，“能动反映”强调认识的主动性与创造性。',
        subject: '马原',
      },
      {
        term: '社会存在的决定性地位对应的关系',
        hatType: '决定作用',
        targetAnswer: '社会存在决定社会意识',
        trapWarning: '社会意识具有相对独立性并能反作用于社会存在，但不能据此颠倒二者的决定与反作用关系。',
        subject: '马原',
      },
    ],
  }
];

interface ConfusionViewProps {
  onJumpToHatSearch: (term: string) => void;
}

export const ConfusionView: React.FC<ConfusionViewProps> = ({ onJumpToHatSearch }) => {
  const [activeGroup, setActiveGroup] = useState<string>('genben');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentGroup = CONFUSION_DATA.find((g) => g.id === activeGroup) || CONFUSION_DATA[0];

  const filteredItems = currentGroup.items.filter(
    (item) =>
      item.term.includes(searchQuery) ||
      item.targetAnswer.includes(searchQuery) ||
      item.hatType.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                张冠李戴粉碎机
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                横向对撞“根本”、“首要”、“本质”、“核心”、“标志”
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              政治“帽子题”高频混淆概念对撞矩阵
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              考研政治最常考、失分最严重的张冠李戴帽子题集中辨析。把相似概念横向拉平，彻底理清边界！
            </p>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索帽子或考点词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Group Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-stone-100 dark:border-stone-800">
          {CONFUSION_DATA.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeGroup === group.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {group.title.split('】')[0].replace('【', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Group Description Callout */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 space-y-1">
        <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
          {currentGroup.title}
        </h3>
        <p className="text-xs text-amber-800/90 dark:text-amber-300/80">
          {currentGroup.description}
        </p>
      </div>

      {/* Grid of Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
                  {item.subject} · 【{item.hatType}】
                </span>
                <span className="text-[10px] text-stone-400 font-mono">#{idx + 1}</span>
              </div>

              <h3 className="text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-bold mb-3 leading-relaxed">
                “{item.term}” 是什么？
              </h3>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 mb-2.5">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                  唯一标准秒选答案
                </span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item.targetAnswer}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{item.trapWarning}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => onJumpToHatSearch(item.targetAnswer)}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>在题库中专项练习此题</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-12 text-center text-xs text-stone-400 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200">
          未检索到相关的对比项，请尝试更换关键词
        </div>
      )}
    </div>
  );
};
