// Structured, shared confusion matrix used by both the UI and quiz distractor generator.
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
        term: '决定国家前途命运的根本力量',
        hatType: '根本力量',
        targetAnswer: '人民',
        trapWarning: '人民是决定党和国家前途命运的根本力量；不要与推进中国式现代化的根本动力“改革”混淆。',
        subject: '新思想',
      },
      {
        term: '推进中国式现代化的根本动力',
        hatType: '根本动力',
        targetAnswer: '改革',
        trapWarning: '这里强调改革对中国式现代化的动力作用，不要与“人民是决定党和国家前途命运的根本力量”混淆。',
        subject: '新思想',
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
        trapWarning: '社会主义制度是我国的根本制度；人民代表大会制度是根本政治制度。中国共产党领导的多党合作和政治协商制度属于基本政治制度。',
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
        term: '社会主义法治的根本保证',
        hatType: '根本保证',
        targetAnswer: '党的领导',
        trapWarning: '不要与社会主义法治的本质属性“人民性”混淆。',
        subject: '思修法治',
      },
      {
        term: '社会主义法治的本质属性',
        hatType: '本质属性',
        targetAnswer: '人民性',
        trapWarning: '这里问法治的本质属性，规范答案是“人民性”；不要直接替换为社会主义民主政治的本质和核心“人民当家作主”。',
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
  },
  {
    id: 'ma-yuan-bian-zheng',
    title: '【马原】矛盾与规律易混关系',
    category: '马原',
    description: '集中辨析层级偷换、逻辑方向颠倒和规律定位混淆。',
    items: [
      { term: '主要矛盾与矛盾的主要方面', hatType: '矛盾层级', targetAnswer: '主要矛盾看复杂事物中多种矛盾的主次；矛盾的主要方面看同一矛盾双方的主次', trapWarning: '前者问“多个矛盾中哪个主要”，后者问“一个矛盾的双方谁占主导”，不能把两个“主要”当成同一概念。', subject: '马原' },
      { term: '量变与质变的关系', hatType: '发展状态', targetAnswer: '量变是质变的必要准备，质变是量变的必然结果', trapWarning: '不能调换“必要准备”和“必然结果”；量变达到一定程度会引起质变，二者相互渗透。', subject: '马原' },
      { term: '社会存在与社会意识的关系', hatType: '决定与反作用', targetAnswer: '社会存在决定社会意识，社会意识具有相对独立性并反作用于社会存在', trapWarning: '“相对独立性”不等于“完全独立性”；社会意识的反作用不能替换社会存在的决定作用。', subject: '马原' },
      { term: '生产力与生产关系的关系', hatType: '决定与反作用', targetAnswer: '生产力决定生产关系，生产关系对生产力具有能动的反作用', trapWarning: '不能颠倒决定方向；生产关系适合生产力状况时促进生产力发展，不适合时会阻碍其发展。', subject: '马原' },
      { term: '感性认识与理性认识', hatType: '认识阶段', targetAnswer: '感性认识是认识的初级阶段，理性认识是认识的高级阶段', trapWarning: '感性认识侧重现象和外部联系，理性认识侧重本质和内部联系；二者相互依赖、相互渗透。', subject: '马原' },
      { term: '实践与认识的关系', hatType: '来源与反作用', targetAnswer: '实践是认识的基础，认识对实践具有能动反作用', trapWarning: '实践是认识的来源、动力、检验真理的标准和目的；不能把认识的反作用夸大成认识决定实践。', subject: '马原' }
    ]
  },
  {
    id: 'shi-gang-shijian',
    title: '【史纲】革命阶段与历史节点辨析',
    category: '史纲',
    description: '区分开端、成立、转折和进入新时期等不同历史定位。',
    items: [
      { term: '中国新民主主义革命的开端', hatType: '革命开端', targetAnswer: '五四运动', trapWarning: '五四运动是新民主主义革命的开端；中国共产党成立标志着中国革命面貌焕然一新，二者历史定位不同。', subject: '史纲' },
      { term: '中国共产党成立的历史意义', hatType: '成立意义', targetAnswer: '中国革命有了坚强的领导力量，中国革命的面貌从此焕然一新', trapWarning: '不要把“新民主主义革命开端”直接当作党的成立标志；五四运动与中共一大承担不同历史定位。', subject: '史纲' },
      { term: '新中国成立以来党的历史上具有深远意义的伟大转折', hatType: '伟大转折', targetAnswer: '党的十一届三中全会', trapWarning: '不要与遵义会议的“生死攸关的转折点”混为一谈；题干限定语决定答案。', subject: '史纲' },
      { term: '中国进入改革开放和社会主义现代化建设新时期的标志', hatType: '新时期标志', targetAnswer: '党的十一届三中全会', trapWarning: '注意题干中的“进入新时期”限定，不要与新中国成立、社会主义基本制度确立等阶段性标志混淆。', subject: '史纲' }
    ]
  },
  {
    id: 'si-xiu-fazhi',
    title: '【思修法治】核心价值观与法治定位',
    category: '思修法治',
    description: '把国家、社会、公民个人三个层面的价值要求分开，并辨析法治建设中的不同定位。',
    items: [
      { term: '社会主义核心价值观国家层面的价值目标', hatType: '国家价值目标', targetAnswer: '富强、民主、文明、和谐', trapWarning: '社会层面是自由、平等、公正、法治；公民个人层面是爱国、敬业、诚信、友善。', subject: '思修法治' },
      { term: '社会主义核心价值观社会层面的价值取向', hatType: '社会价值取向', targetAnswer: '自由、平等、公正、法治', trapWarning: '不要与国家层面的“富强、民主、文明、和谐”或个人层面的“爱国、敬业、诚信、友善”交叉混写。', subject: '思修法治' },
      { term: '社会主义核心价值观公民个人层面的价值准则', hatType: '个人价值准则', targetAnswer: '爱国、敬业、诚信、友善', trapWarning: '这是公民个人层面的价值准则，不是国家层面的价值目标，也不是社会层面的价值取向。', subject: '思修法治' },
    ]
  }
];
