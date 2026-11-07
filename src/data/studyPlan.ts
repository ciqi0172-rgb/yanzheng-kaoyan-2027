export interface DayTask {
  id: string;
  dayNumber: number;
  stage: 1 | 2 | 3;
  title: string;
  focus: '帽子卡片背诵' | '四选一做题' | '万能大题' | '混淆对撞' | '错题歼灭';
  goal: string;
  checklist: {
    id: string;
    text: string;
    targetCount?: number;
    actionType?: 'flashcard' | 'exam' | 'essay' | 'confusion' | 'wrongbook';
  }[];
  tips: string;
}

export interface StageInfo {
  stage: 1 | 2 | 3;
  title: string;
  dayRange: string;
  badge: string;
  target: string;
  coreStrategy: string;
  dailyQuota: string;
}

export const STAGES_CONFIG: StageInfo[] = [
  {
    stage: 1,
    title: '第一阶段：骨架搭建与“帽子”通关',
    dayRange: '第 1 - 3 天',
    badge: '骨架扫雷',
    target: '理顺政治各科底层逻辑，清剿选择题“帽子题”失分盲区，建立条件反射秒选。',
    coreStrategy: '主动提取（Active Recall）+ 对比辨析法。看到题干先脑中提取帽子词，再翻卡对答案。',
    dailyQuota: '每日通关 50 张帽子题卡片，完成 1 次混淆对撞矩阵，熟记 5 大主观题万能开头与结尾。',
  },
  {
    stage: 2,
    title: '第二阶段：主观题逻辑链条内化 + 四选一实做突破',
    dayRange: '第 4 - 10 天',
    badge: '链条内化',
    target: '1 分钟内在本子上列出“点题 ➡️ 素材 ➡️ 升华”答题提纲；四选一实做正确率稳在 90% 以上。',
    coreStrategy: '逻辑树链条法 + 真题材料实战模拟。大题拒绝死背孤立字句，按因果闭环输出。',
    dailyQuota: '每日演练 2 道政治大题（34-38题轮动）+ 四选一实做 30 题 + 清理当日到期复习。',
  },
  {
    stage: 3,
    title: '第三阶段：全真模拟与错题收割',
    dayRange: '考前冲刺阶段',
    badge: '错题收割',
    target: '达成“帽子题秒选，大题材料话术信手拈来，肖1000陷阱零失误”的冲刺巅峰状态。',
    coreStrategy: '靶向错题消灭（艾宾浩斯标红池清零）+ 限时模拟答题。',
    dailyQuota: '每日消灭全部 Ebbinghaus 待复习卡片 + 重点标红错题库循环筛查 + 完整答题默写 1 套。',
  },
];

export const STUDY_ROADMAP: DayTask[] = [
  {
    id: 'day-1',
    dayNumber: 1,
    stage: 1,
    title: '马原 & 毛中特：帽子题基石攻坚',
    focus: '帽子卡片背诵',
    goal: '攻克马克思主义基本原理核心帽子（对立统一、实践客体、矛盾根本属性）与新民主主义革命核心问题。',
    checklist: [
      { id: 'd1-1', text: '完成 30 道马原核心/根本/本质类帽子卡片提取翻牌', targetCount: 30, actionType: 'flashcard' },
      { id: 'd1-2', text: '完成毛中特无产阶级领导权、新民主主义三大法宝四选一做题', targetCount: 20, actionType: 'exam' },
      { id: 'd1-3', text: '初探 34 题（马原矛盾/实践/认识论）万能点题公式与升华金句', targetCount: 1, actionType: 'essay' },
    ],
    tips: '背“根本原因/根本保证”时，务必对比“最大优势/首要任务”，区分主体与客体边界。',
  },
  {
    id: 'day-2',
    dayNumber: 2,
    stage: 1,
    title: '新思想 & 史纲：重磅标志与转折点清剿',
    focus: '帽子卡片背诵',
    goal: '全面掌握中共党史重大会议标志（八七、遵义、十一届三中全会）与新时代新思想首要任务。',
    checklist: [
      { id: 'd2-1', text: '完成 50 道史纲与新思想帽子题辨析卡片翻牌', targetCount: 50, actionType: 'flashcard' },
      { id: 'd2-2', text: '利用混淆对撞矩阵，对比“最大政治优势”与“根本工作路线”', targetCount: 1, actionType: 'confusion' },
      { id: 'd2-3', text: '完成首轮 5 分钟与 30 分钟艾宾浩斯复习队列清理', targetCount: 10, actionType: 'wrongbook' },
    ],
    tips: '做题时先看清楚问的是“根本保证”还是“根本前提”，不要看到“中国共产党”就盲选。',
  },
  {
    id: 'day-3',
    dayNumber: 3,
    stage: 1,
    title: '思修法治攻坚 + 首阶段通关测试',
    focus: '四选一做题',
    goal: '拿下思修法治全部高频帽子（社会主义核心价值观核心、法治思维根本底线），完成阶段模拟。',
    checklist: [
      { id: 'd3-1', text: '通关思修法治核心帽子卡片（法治与德治、理想信念、爱国主义本质）', targetCount: 40, actionType: 'flashcard' },
      { id: 'd3-2', text: '在错题本中标记模糊与错误题目，启动错题歼灭战', targetCount: 1, actionType: 'wrongbook' },
      { id: 'd3-3', text: '进行 10 题帽子题极速连击测试，正确率达成 90% 以上', targetCount: 10, actionType: 'exam' },
    ],
    tips: '社会主义核心价值观是“当代中国精神的集中体现”，爱国主义本质是“坚持爱国和爱党、爱社会主义高度统一”。',
  },
  {
    id: 'day-4',
    dayNumber: 4,
    stage: 2,
    title: '第34题马原认识论/矛盾论大题实战',
    focus: '万能大题',
    goal: '运用大题解构器模拟真题（调查研究/真理与价值），内化答题三步法。',
    checklist: [
      { id: 'd4-1', text: '在第 34 题实战考场完成：定性点题选择 + 踩分词填空 + 升华收官', targetCount: 1, actionType: 'essay' },
      { id: 'd4-2', text: '默写第 34 题感性上升到理性飞跃的“两个基本条件”', targetCount: 1, actionType: 'essay' },
      { id: 'd4-3', text: '实战刷 20 道马原认识论与唯物辩证法四选一题目', targetCount: 20, actionType: 'exam' },
    ],
    tips: '大题绝不仅是背诵，必须把题干材料中的具体事例翻译为“认识源于实践”、“感性认识到理性认识”的专业术语。',
  },
  {
    id: 'day-5',
    dayNumber: 5,
    stage: 2,
    title: '第35题新思想经济政治链条大题',
    focus: '万能大题',
    goal: '掌握新时代高质量发展、新质生产力、中国式现代化的大题模板。',
    checklist: [
      { id: 'd5-1', text: '演练 35 题新思想：“高质量发展”与“新质生产力”因果逻辑链条', targetCount: 1, actionType: 'essay' },
      { id: 'd5-2', text: '默写新思想核心答题句：“新质生产力以创新为主导，全要素生产率大幅提升为核心标志...”', targetCount: 1, actionType: 'essay' },
      { id: 'd5-3', text: '四选一做题巩固新发展理念与中国式现代化帽子题', targetCount: 20, actionType: 'exam' },
    ],
    tips: '发展新质生产力因地制宜，绝不能写成“一刀切、全部放弃传统产业”！',
  },
  {
    id: 'day-6',
    dayNumber: 6,
    stage: 2,
    title: '第36题史纲历史选择逻辑大题',
    focus: '万能大题',
    goal: '掌握史纲“为什么选择马克思主义/社会主义/中国共产党”的大题因果套路。',
    checklist: [
      { id: 'd6-1', text: '拆解 36 题历史选择题：“历史和人民为什么选择了中国共产党”三步法', targetCount: 1, actionType: 'essay' },
      { id: 'd6-2', text: '默写跳出治乱兴衰历史周期率的“两个答案”（人民监督 + 自我革命）', targetCount: 1, actionType: 'essay' },
      { id: 'd6-3', text: '史纲中共重大历史会议标志卡片全量过关', targetCount: 25, actionType: 'flashcard' },
    ],
    tips: '做史纲大题时牢记“两个答案”：中国共产党给出了自我革命这一跳出治乱兴衰历史周期率的第二个答案。',
  },
  {
    id: 'day-7',
    dayNumber: 7,
    stage: 2,
    title: '第37题思修法治情理交融大题',
    focus: '万能大题',
    goal: '掌握理想信念、法治精神、传统文化大题套路与踩分点。',
    checklist: [
      { id: 'd7-1', text: '演练 37 题“理想与现实”、“法治与德治”辩证关系答题套路', targetCount: 1, actionType: 'essay' },
      { id: 'd7-2', text: '默写“实践是通往理想的唯一桥梁”与法安天下德润人心采分词', targetCount: 1, actionType: 'essay' },
      { id: 'd7-3', text: '刷 25 道思修法治四选一单选题', targetCount: 25, actionType: 'exam' },
    ],
    tips: '法治是刚性底线，德治是高线引领；法律是成文的道德，道德是内心的法律。',
  },
  {
    id: 'day-8',
    dayNumber: 8,
    stage: 2,
    title: '第38题当代大国外交大题',
    focus: '万能大题',
    goal: '掌握人类命运共同体、一带一路、多极化大题；熟记三大全球倡议。',
    checklist: [
      { id: 'd8-1', text: '解构 38 题当代大局观：“百年未有之大变局”与“人类命运共同体”升华句式', targetCount: 1, actionType: 'essay' },
      { id: 'd8-2', text: '默写全球发展倡议、全球安全倡议、全球文明倡议三大内涵', targetCount: 1, actionType: 'essay' },
      { id: 'd8-3', text: '对撞矩阵复习：“根本所在”与“最高原则”', targetCount: 1, actionType: 'confusion' },
    ],
    tips: '牢记中国角色的三大定位：世界和平的建设者、全球发展的贡献者、国际秩序的维护者。',
  },
  {
    id: 'day-9',
    dayNumber: 9,
    stage: 2,
    title: '大题全真三步法填空默写总通关',
    focus: '万能大题',
    goal: '闭卷默写 34-38 题的 Step 1 点题句与 Step 3 升华句。',
    checklist: [
      { id: 'd9-1', text: '在实战考场中通关 34-38 题全部踩分点填空', targetCount: 5, actionType: 'essay' },
      { id: 'd9-2', text: '艾宾浩斯复习舱清理过去所有沉淀错题', targetCount: 20, actionType: 'wrongbook' },
    ],
    tips: '大题提纲务必做到“三段论”清晰，阅卷老师找的是得分点术语，不是大段空话。',
  },
  {
    id: 'day-10',
    dayNumber: 10,
    stage: 2,
    title: '第二阶段大验收：五科帽子大比武',
    focus: '四选一做题',
    goal: '全真检测帽子题 50 题 + 大题 2 道，检验第二阶段突破成效。',
    checklist: [
      { id: 'd10-1', text: '帽子题混淆组辨析全面过关（无产阶级领导权、新发展理念根和魂等）', targetCount: 30, actionType: 'confusion' },
      { id: 'd10-2', text: '四选一模式随机连刷 30 题', targetCount: 30, actionType: 'exam' },
    ],
    tips: '做题时先看清楚问的是“根本保证”还是“根本前提”，不要看到“中国共产党”就盲选。',
  },
  {
    id: 'day-11',
    dayNumber: 11,
    stage: 3,
    title: '冲刺收割 Day 1：红标错题靶向轰炸',
    focus: '错题歼灭',
    goal: '集中消灭标红（isMarkedRed）的政治高频错题，实现从“模糊”到“秒选”。',
    checklist: [
      { id: 'd11-1', text: '筛选艾宾浩斯面板中所有标红错题，逐一进行主动提取与纠错', targetCount: 25, actionType: 'wrongbook' },
      { id: 'd11-2', text: '针对肖1000陷阱深度辨析，记录 5 个最易张冠李戴的干扰项特征', targetCount: 5, actionType: 'exam' },
    ],
    tips: '错题本不是装饰品，消灭一个错题等于考场多拿 1-2 分！',
  },
  {
    id: 'day-12',
    dayNumber: 12,
    stage: 3,
    title: '冲刺收割 Day 2：考场情景全真脑暴与极速秒选',
    focus: '四选一做题',
    goal: '秒出 3 步法答题链条，帽子题达成每题 15 秒内反应秒选。',
    checklist: [
      { id: 'd12-1', text: '完成 34-38 题大题模板闭卷默写框架复制', targetCount: 5, actionType: 'essay' },
      { id: 'd12-2', text: '全真帽子题 50 题极速限时挑战（每题 15 秒内反应）', targetCount: 50, actionType: 'exam' },
    ],
    tips: '秒选的秘诀在于抓住题眼帽子词，排除偷换概念的绝对化用词（如“唯一”、“已经彻底解决”）。',
  },
];
