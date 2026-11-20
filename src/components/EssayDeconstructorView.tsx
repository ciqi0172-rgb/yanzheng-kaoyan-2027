import React, { useState } from 'react';
import { EssayDrillQuestion, EssayTemplate } from '../types';
import { ESSAY_DRILLS } from '../data/essayDrills';
import { ESSAY_SOURCE_KNOWLEDGE_DRILLS } from '../data/essaySourceKnowledgeDrills';
import essaySourcePagesText from '../../all_17_pages_templates.txt?raw';


type PromptFocusOption = { key: string; text: string; correct: boolean; reason: string };
type PromptFocusCase = {
  id: string; subject: string; theme: string; material: string; prompt: string;
  clue: string; options: PromptFocusOption[]; answerScope: string; avoid: string;
};
const PROMPT_FOCUS_CASES: PromptFocusCase[] = [
  {
    id:'focus-1', subject:'马原', theme:'材料信息多，设问范围窄',
    material:'某地推进乡村振兴，干部先走访农户、记录不同村庄的产业条件和就业需求，再对大量信息进行归纳比较，发现各村发展瓶颈并不相同，最终制定差异化方案。材料还提到当地收入增长、环境改善和基层治理能力提升。',
    prompt:'运用认识论原理，说明调查研究为什么不能停留在收集材料的层面。',
    clue:'“运用认识论原理”限定学科；“不能停留在……层面”要求解释从收集感性材料到形成理性认识的过程。',
    options:[
      {key:'A',text:'重点论述乡村振兴的意义、共同富裕和基层治理现代化。',correct:false,reason:'这些是材料涉及的成果，但没有直接回答“调查研究不能停留在哪、还要完成什么认识过程”。'},
      {key:'B',text:'围绕感性认识与理性认识的关系，说明获取丰富真实材料后，还要经过分析综合和科学抽象，把握事物本质与规律。',correct:true,reason:'紧扣“认识论”“不能停留在收集材料”，把材料行为翻译成理论过程，并解释为什么。'},
      {key:'C',text:'只写实践是认识的来源，实践是检验真理的唯一标准。',correct:false,reason:'实践与认识相关，但只罗列实践的地位，漏掉题目特别强调的“收集材料之后还要做什么”。'}
    ],
    answerScope:'主线：感性认识→理性认识。①调查实践提供丰富、真实的感性材料；②运用理性思维加工材料，去粗取精、去伪存真、由此及彼、由表及里；③形成对本质和规律的认识。可点到实践是认识的基础，但不能用“实践的作用”替代核心论证。',
    avoid:'不要把收入增长、环境改善等材料结果写成主体；不要只背实践决定认识的几个分句，却不解释认识如何深化。'
  },
  {
    id:'focus-2', subject:'马原', theme:'相近原理辨析',
    material:'某城市治理交通拥堵，先在两个街区试行错峰通行，根据反馈调整方案，再逐步推广。不同城区因道路条件、人口密度不同，采用了不同措施。材料还提到市民参与和数字技术支持。',
    prompt:'结合材料，说明为什么治理方案不能简单照搬其他地区的经验。',
    clue:'“为什么不能简单照搬”是判断依据；“不同地区条件不同”指向共性与个性、普遍性与特殊性的关系及具体问题具体分析。',
    options:[
      {key:'A',text:'主要论述科技革命推动生产方式变革，数字技术促进社会进步。',correct:false,reason:'数字技术只是材料中的辅助信息，设问问的是不能照搬经验的原因。'},
      {key:'B',text:'围绕矛盾普遍性与特殊性的辩证关系，说明一般经验具有借鉴价值，但矛盾的具体特点不同，必须具体问题具体分析。',correct:true,reason:'直接解释“不能照搬”，也兼顾了经验可借鉴与方案需调整两面。'},
      {key:'C',text:'重点写人民群众是历史的创造者，因此治理必须依靠群众。',correct:false,reason:'群众参与有意义，但不能直接解释不同地区为何不能使用完全相同的方案。'}
    ],
    answerScope:'主线：矛盾的普遍性与特殊性相统一。①不同地区都存在治理问题，具有共性；②道路、人口等条件不同，矛盾有特殊性；③借鉴一般经验必须结合本地实际，具体问题具体分析。',
    avoid:'不要因为材料出现“群众”“数字技术”就转写群众史观或科技作用；先回答设问中的“为什么不能照搬”。'
  },
  {
    id:'focus-3', subject:'新思想', theme:'问“成就原因”还是“未来怎么做”',
    material:'新时代以来，某地推进产业升级、改善民生、加强生态保护，发展质量不断提高。报道还介绍了当地下一阶段将深化改革、扩大开放、加强人才培养的计划。',
    prompt:'结合新时代发展成就，分析我国推动高质量发展的制度优势和根本保证。',
    clue:'动词“分析”要求解释原因；“制度优势和根本保证”限定答案方向。材料末尾的未来计划不是本题主问。',
    options:[
      {key:'A',text:'列出深化改革、扩大开放、培养人才等下一阶段措施。',correct:false,reason:'这些是材料中的未来计划，但设问问的是成就背后的制度优势和根本保证，不是提出措施。'},
      {key:'B',text:'围绕党的领导、中国特色社会主义制度优势以及以人民为中心的发展思想，结合材料解释发展成就的制度和领导保障。',correct:true,reason:'对应“制度优势和根本保证”，既有理论判断，也需要联系材料说明。'},
      {key:'C',text:'只写高质量发展是全面建设社会主义现代化国家的首要任务。',correct:false,reason:'这句话重要，但它是对发展任务的定位，不能完整回答“制度优势和根本保证”的原因分析。'}
    ],
    answerScope:'主线是“为什么能够取得发展成就”。先明确党的领导是根本保证，再结合中国特色社会主义制度优势和以人民为中心的发展思想解释材料。可简要点明高质量发展的重要性，但不能把答案主体写成未来举措清单。',
    avoid:'看到材料中“下一阶段”不要自动答“怎么做”；要以题干的“成就”“制度优势”“根本保证”为准。'
  },
  {
    id:'focus-4', subject:'新思想', theme:'“是什么、为什么、怎么做”不能混答',
    material:'某地保护传统村落，修缮历史建筑、整理地方文献、培养非遗传承人，同时利用数字平台传播传统文化。当地也引入现代设计，使传统技艺进入当代生活。',
    prompt:'结合材料，说明推动中华优秀传统文化创造性转化、创新性发展的重要意义。',
    clue:'“说明……重要意义”问价值和作用；材料中的具体措施可作为例证，但不是要求你逐条提出工作方案。',
    options:[
      {key:'A',text:'说明创造性转化、创新性发展有利于激活传统文化生命力、满足人民精神文化需求、增强文化自信，并结合材料举例。',correct:true,reason:'“重要意义”要求回答价值和作用，材料例子用于支撑观点。'},
      {key:'B',text:'按步骤写修缮建筑、整理文献、培养传承人、建设数字平台的操作流程。',correct:false,reason:'这回答的是“具体怎么做”，没有回答题干所问的“意义”。'},
      {key:'C',text:'只讨论文化产业能增加就业、带动旅游收入。',correct:false,reason:'经济效益可以作为一个相关方面，但不能缩窄为单一经济收益，忽略文化传承与文化自信。'}
    ],
    answerScope:'主线是文化传承创新的意义：激活中华优秀传统文化生命力、满足人民精神文化需求、增强文化自信和文化主体性、推动文化繁荣发展。用修缮、传承、数字传播等材料对应说明即可。',
    avoid:'“意义”题不要写成纯措施题；也不要只写旅游收入，把文化价值缩成经济价值。'
  },
  {
    id:'focus-5', subject:'史纲', theme:'历史评价要抓评价对象',
    material:'近代中国面临民族独立和人民解放的历史任务。某次旧民主主义革命动员了群众、冲击了封建统治，但由于缺乏先进阶级领导和科学理论指导，最终未能改变中国半殖民地半封建社会的性质。材料还介绍了当时一些思想文化变化。',
    prompt:'结合材料，分析旧民主主义革命不能完成反帝反封建历史任务的原因。',
    clue:'“不能完成……的原因”要求解释失败原因，不是概述全部历史贡献，也不是只评价思想文化变化。',
    options:[
      {key:'A',text:'全面赞扬其历史贡献，重点写它推动思想解放和群众觉醒。',correct:false,reason:'贡献相关，但题目明确要求分析“不能完成历史任务的原因”，不能只写积极意义。'},
      {key:'B',text:'围绕领导阶级、指导思想、群众基础和革命道路等局限，解释旧民主主义革命失败的历史原因，并联系半殖民地半封建社会国情。',correct:true,reason:'直接回应“原因”，并把失败原因与革命所处的历史条件联系起来。'},
      {key:'C',text:'直接转入论述新时代中国式现代化取得的成就。',correct:false,reason:'属于后来的历史阶段，与本题评价对象和时间范围不符。'}
    ],
    answerScope:'主线是失败原因：旧式阶级力量及其局限、缺乏先进阶级及其政党领导、缺乏科学理论指导、未能提出彻底的反帝反封建纲领等。具体表述应以所问革命和教材对应结论为准。',
    avoid:'不要把“有历史贡献”误当成“成功完成历史任务”；注意区分历史作用与失败原因，不能跳到当代成就。'
  },
  {
    id:'focus-6', subject:'史纲', theme:'问“历史意义”不等于问“经验启示”',
    material:'中国共产党在探索革命道路的过程中，经历过挫折，也不断总结经验。遵义会议在危急关头纠正了错误军事和组织路线，确立了正确领导，推动中国革命转危为安。材料还提到此后革命力量不断发展。',
    prompt:'说明遵义会议在中国革命史上的历史地位和意义。',
    clue:'核心词是“历史地位和意义”；可写转折作用和领导集体形成，但不要把答案全部写成一般性的青年启示或做法。',
    options:[
      {key:'A',text:'重点写今天青年要坚定理想信念、勇于担当。',correct:false,reason:'价值导向正确，但不是遵义会议的历史地位和意义。'},
      {key:'B',text:'指出遵义会议在危急关头挽救党、挽救红军、挽救中国革命，是党历史上生死攸关的转折点，并说明其对独立自主解决中国革命实际问题的意义。',correct:true,reason:'直接围绕历史地位与意义组织答案，内容对象和历史阶段匹配。'},
      {key:'C',text:'只写会议召开的大致时间，不展开其历史作用。',correct:false,reason:'时间只是背景信息，不能替代题目要求的“地位和意义”。'}
    ],
    answerScope:'围绕会议本身的历史地位、转折意义、独立自主解决中国革命实际问题的意义展开。最后可以概括历史经验，但不能用泛泛启示替代史实评价。',
    avoid:'题目问历史意义，不要只背时间；也不要把任何历史题都收尾成“青年要努力奋斗”。'
  },
  {
    id:'focus-7', subject:'思修法治', theme:'个人价值与社会价值要按设问取舍',
    material:'一名基层医务工作者长期在偏远地区工作，改善当地居民的健康状况，也在工作中不断提升专业能力。报道同时提到他获得荣誉、收入有所提高，并带动更多年轻人参与基层服务。',
    prompt:'结合材料，说明怎样理解人生的自我价值与社会价值的辩证关系。',
    clue:'“辩证关系”要求两个方面及其关系，不能只谈奉献，也不能只谈个人成长或荣誉回报。',
    options:[
      {key:'A',text:'只写人生价值在于奉献社会，个人需要无条件牺牲自己的需要。',correct:false,reason:'把社会价值绝对化，忽略自我价值，也把二者关系写成单向牺牲。'},
      {key:'B',text:'说明人生自我价值和社会价值相互联系、相互促进；社会价值是实现自我价值的重要基础，个人也在服务社会中发展能力、实现自身价值。',correct:true,reason:'回应“辩证关系”，同时结合专业成长与服务居民两类材料信息。'},
      {key:'C',text:'主要论述荣誉和收入是衡量人生价值的唯一标准。',correct:false,reason:'荣誉和收入不是衡量人生价值的唯一标准，且忽略了社会贡献与人的全面发展。'}
    ],
    answerScope:'主线是自我价值与社会价值的辩证统一：个人通过劳动和社会实践满足自身合理需要、发展能力，同时创造社会价值；社会价值的实现与社会条件、社会贡献密切相关。结合材料分别落到专业成长和改善居民健康。',
    avoid:'不要把社会价值写成无条件自我牺牲；不要把收入、荣誉当作唯一尺度。'
  },
  {
    id:'focus-8', subject:'当代', theme:'全球倡议与共同体理念不能混成空话',
    material:'面对气候变化、地区冲突、发展不平衡等全球性挑战，中国提出加强对话协商、推进发展合作、促进文明交流，并参与多边机制。不同国家对具体议题存在分歧，但越来越多国家希望通过合作寻找共同利益。',
    prompt:'结合材料，说明推动构建人类命运共同体为什么需要坚持真正的多边主义。',
    clue:'“为什么需要”问必要性和作用；“真正的多边主义”是设问中心，全球挑战和合作实践是论据。',
    options:[
      {key:'A',text:'只罗列三大全球倡议的名称，不解释它们与多边主义的关系。',correct:false,reason:'倡议名称可能相关，但题目要求解释坚持多边主义的必要性，罗列名称不能形成论证。'},
      {key:'B',text:'从全球性挑战具有跨国性、单边行动难以有效应对、平等协商与合作有助于汇聚共识和维护共同利益等方面展开，并联系构建人类命运共同体。',correct:true,reason:'围绕“为什么需要多边主义”给出因果链，并把论证落回共同体目标。'},
      {key:'C',text:'主要介绍中国经济增长和科技创新成就。',correct:false,reason:'中国发展成就不是本题设问的中心，不能替代对多边主义的解释。'}
    ],
    answerScope:'主线：全球性问题相互关联、任何国家难以独善其身；单边主义不利于解决共同挑战；真正的多边主义强调平等协商、国际合作和共同利益，有助于完善全球治理、推动构建人类命运共同体。',
    avoid:'不要把“全球治理”题写成中国成就罗列；不要只写倡议名称而缺少“挑战—合作必要性—共同体目标”的解释链。'
  }
];

const ESSAY_SOURCE_PAGES = Array.from(
  essaySourcePagesText.matchAll(/={10} PAGE (\d+) ={10}\s*\n([\s\S]*?)(?=\n={10} PAGE \d+ ={10}|$)/g),
).map((match) => {
  const page = Number(match[1]);
  const subject = page <= 3 ? '34题 · 马原' : page <= 7 ? '35题 · 新思想' : page <= 11 ? '36题 · 史纲毛中特' : page <= 14 ? '37题 · 思修法治' : '38题 · 当代';
  return { page, subject, content: match[2].trim() };
});
import { 
  BookOpen, 
  Search, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Zap, 
  Layers,
  ArrowRight,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCw,
  FileText
} from 'lucide-react';

interface EssayDeconstructorViewProps {
  templates: EssayTemplate[];
}

export const EssayDeconstructorView: React.FC<EssayDeconstructorViewProps> = ({
  templates,
}) => {
  const [activeSubject, setActiveSubject] = useState<string>('马原');
  const [activeDrillIndex, setActiveDrillIndex] = useState<number>(0);
  const [activeMode, setActiveMode] = useState<'drill' | 'reference' | 'focus'>('drill');
  const [focusIndex, setFocusIndex] = useState(0);
  const [focusSelectedKey, setFocusSelectedKey] = useState<string | null>(null);
  const [focusSubmitted, setFocusSubmitted] = useState(false);
  const currentFocusCase = PROMPT_FOCUS_CASES[focusIndex];
  
  // Interactive Drill State
  const [step1SelectedKey, setStep1SelectedKey] = useState<string | null>(null);
  const [revealedBlanks, setRevealedBlanks] = useState<Record<string, boolean>>({});
  const [userBlankInputs, setUserBlankInputs] = useState<Record<string, string>>({});
  const [step3SelectedKey, setStep3SelectedKey] = useState<string | null>(null);
  const [isDrillSubmitted, setIsDrillSubmitted] = useState<boolean>(false);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  const buildTemplateScenario = (tpl: EssayTemplate): string => {
    const theme = tpl.theme;
    if (/感性认识与理性认识|调查研究|认识运动/.test(theme)) return '某县推进乡村振兴时，工作人员先走访农户，记录不同村庄的产业条件、就业需求和公共服务短板；随后把访谈记录与统计数据分类比较，发现各村的主要问题并不相同，最终形成分村施策的方案。';
    if (/矛盾的普遍性与特殊性|共性与个性|因地制宜|试点/.test(theme)) return '三个县都在发展乡村产业：山区县发展生态种植，历史文化资源丰富的县开发传统工艺，交通便利的县建设农产品加工基地。上级部门先总结试点经验，再根据各县条件调整方案，而不是要求所有地方照搬同一种做法。';
    if (/问题导向|矛盾的普遍性|矛盾的客观性/.test(theme)) return '某市老旧小区改造中，居民反映停车、消防通道、加装电梯和公共空间使用等问题。工作组逐项调查、听取不同群体意见，区分轻重缓急，协调相关部门先解决影响安全和基本生活的突出矛盾。';
    if (/真理的绝对性与相对性|守正创新|理论创新/.test(theme)) return '某研究团队坚持经过实践检验的基本原理，同时根据新数据和新实验结果修正原有模型，并在后续实践中继续检验。团队既没有把已有结论当作永远不能调整的教条，也没有因为出现新情况就全盘否定过去的认识。';
    if (/实践与认识的辩证关系/.test(theme)) return '某医院试行新的分诊流程，先收集患者等候时间和医护人员反馈，再分析数据、调整流程；试运行效果得到验证后，医院把方案推广到其他科室，并继续根据实践效果改进。';
    if (/人民群众|群众路线|人民立场/.test(theme)) return '某社区准备改造公共空间，工作人员先征求居民对老人休息、儿童活动和停车的意见，再组织居民代表讨论方案，并邀请群众参与监督。项目完成后，社区根据居民反馈继续调整设施布局。';
    if (/主观能动性与客观规律性|尊重规律/.test(theme)) return '某地发展农业时，既没有因旱情就放弃生产，也没有不顾水资源条件盲目扩大种植面积，而是依据降水、土壤和灌溉能力调整作物结构，并组织农技人员指导农户。';
    if (/科学技术|人工智能|大数据|科技/.test(theme)) return '某制造企业引入人工智能质检系统，提高了缺陷识别效率，同时制定数据安全、岗位培训和人工复核制度，避免把技术准确率当作唯一目标，并确保技术应用服务于劳动者和社会需要。';
    if (/生态|人与自然|绿色发展/.test(theme)) return '某地过去依赖高耗能产业带动增长，随后出现水体污染和能源消耗过高的问题。当地逐步淘汰落后设备、修复生态环境、发展循环利用产业，并建立持续监测和问责机制。';
    if (/两个结合|中华优秀传统文化|文化自信|文化主体性/.test(theme)) return '某地保护传统村落时，既修缮历史建筑、整理地方文献，也邀请青年设计师和非遗传承人开发当代展览与体验活动，让传统文化进入现代生活，而不是简单复刻旧形式。';
    if (/高质量发展|中国式现代化/.test(theme)) return '某省不再只以经济增速评价发展，而是同时考察产业创新、就业质量、公共服务、资源消耗和生态保护，并通过技术改造、扩大就业和改善民生提升发展质量。';
    if (/历史意义|遵义会议|革命/.test(theme)) return '在革命遭遇严重挫折、军事行动陷入危急的情况下，党内召开重要会议，纠正此前军事和组织路线上的错误，重新形成正确领导，革命局势由此发生关键转折。';
    if (/旧民主主义革命|历史任务|失败原因/.test(theme)) return '近代中国一场革命运动动员了社会力量并冲击旧制度，但最终未能改变半殖民地半封建社会性质，也没有完成民族独立、人民解放的历史任务。研究者进一步从领导力量、指导思想和革命纲领等方面分析其局限。';
    if (/人生价值|自我价值|社会价值/.test(theme)) return '一名基层医务工作者长期在偏远地区服务，帮助当地居民改善健康状况，同时在工作中提升专业能力。当地基层医疗条件逐步改善，也有更多年轻人加入服务队伍。';
    if (/多边主义|人类命运共同体|全球治理|一带一路|全球倡议/.test(theme)) return '面对气候变化、公共卫生和地区冲突等跨国挑战，多国代表在国际会议上存在分歧，但仍通过平等协商、共享信息和协调行动寻找共同方案，并开展发展合作。';
    if (/职业选择|职业道德/.test(theme)) return '一名毕业生在选择工作时，综合考虑自己的专业能力、个人发展和社会需求，了解到基层公共服务岗位急需人才后，主动参加相关岗位招聘，并持续提升职业技能。';
    return '某地或某单位在推进相关工作时，发现既有做法无法完全解决当前问题。工作人员先调查实际情况、收集不同方面的反馈，再比较原因和条件，调整实施方案，并根据后续效果继续改进。材料中的具体做法和结果需要结合题目所考查的“' + theme + '”进行解释。';
  };

  const buildTemplatePrompt = (tpl: EssayTemplate): string => {
    if (/为什么|原因|依据|基础/.test(tpl.triggerConditions)) return '结合材料，运用“' + tpl.theme + '”相关原理，分析材料中的做法为什么成立或必要。';
    if (/意义|作用|价值/.test(tpl.triggerConditions + tpl.theme)) return '结合材料，运用“' + tpl.theme + '”相关知识，分析这一做法的意义和作用。';
    if (/如何|怎样|怎么做|要求|启示/.test(tpl.triggerConditions)) return '结合材料，运用“' + tpl.theme + '”相关原理，说明应当怎样认识和处理材料中的问题。';
    return '结合材料，运用“' + tpl.theme + '”相关原理，分析材料体现的理论依据，并说明材料事实与原理之间的联系。';
  };

  // Keep the five high-quality sample drills, and generate a complete template-based practice
  // for every remaining template. Generated items are explicitly labelled as training scenarios,
  // never presented as verbatim official exam materials.
  const buildTemplateDrill = (tpl: EssayTemplate): EssayDrillQuestion => {
    const points = tpl.step2CoreMaterial.points;
    const clozeDrills = points.map((point, index) => {
      const word = point.highlightWords.find((w) => w.trim() && point.content.includes(w)) || '';
      const maskedText = word ? point.content.replace(word, '【________】') : point.content;
      return {
        subtitle: point.subtitle,
        maskedText,
        blanks: word ? [{ index: 1, answer: word, hint: `本采分点关键词：${point.subtitle}` }] : [],
        fullAnswer: point.content,
      };
    });
    return {
      id: `template-practice-${tpl.id}`,
      templateId: tpl.id,
      questionNumber: tpl.questionNumber,
      subject: tpl.subject,
      theme: tpl.theme,
      materialBackground: `【材料情境｜模板迁移训练，非原卷逐字材料】\n${buildTemplateScenario(tpl)}`,
      questionPrompt: buildTemplatePrompt(tpl),
      step1Options: [
        {
          key: 'A',
          text: tpl.step1Qualitative.sampleText,
          isBest: true,
          scoreRationale: `【对应采分点】${tpl.step1Qualitative.description}`,
        },
        {
          key: 'B',
          text: '只复述材料中的现象，不指出题目要求的理论原理，也不解释材料与原理的关系。',
          isBest: false,
          scoreRationale: '【失分原因】缺少理论定性，只有材料复述，无法形成有效的原理得分点。',
        },
      ],
      step2ClozeDrills: clozeDrills,
      step3Options: [
        {
          key: 'A',
          text: tpl.step3Sublimation.sampleClosing,
          isBest: true,
          rationale: '【方法论收束】将核心原理落实到题干对应的实践要求，完成论证闭环。',
        },
        {
          key: 'B',
          text: '因此，我们只要重视这个问题，就一定能够自动取得成功。',
          isBest: false,
          rationale: '【失分原因】表述绝对化，没有体现具体方法、实践条件与理论依据。',
        },
      ],
      fullScoringGuide: {
        standardPoints: [
          `【定性点题】${tpl.step1Qualitative.sampleText}`,
          ...points.map((point) => `【核心采分点】${point.subtitle}：${point.content}`),
          `【升华收尾】${tpl.step3Sublimation.sampleClosing}`,
        ],
        trapAvoidance: tpl.step2CoreMaterial.trapWarning || '避免只写结论不解释原理；按设问逐层作答，并使用本题对应的学科术语。',
      },
    };
  };

  const allDrills = React.useMemo(() => {
    const existingTemplateIds = new Set(ESSAY_DRILLS.map((drill) => drill.templateId));
    const generated = templates
      .filter((tpl) => !existingTemplateIds.has(tpl.id))
      .map(buildTemplateDrill);
    // Order by subject and by the source template order, so each subject's first/second/third
    // questions remain together. Preserve unmatched high-quality sample drills at the end of
    // their own subject group.
    const templateOrder = new Map(templates.map((tpl, index) => [tpl.id, index]));
    return [...ESSAY_DRILLS, ...ESSAY_SOURCE_KNOWLEDGE_DRILLS, ...generated].sort((a, b) => {
      const subjectOrder = ['马原', '新思想', '史纲', '思修法治', '当代'];
      const subjectDiff = subjectOrder.indexOf(a.subject) - subjectOrder.indexOf(b.subject);
      if (subjectDiff !== 0) return subjectDiff;
      const ai = templateOrder.get(a.templateId);
      const bi = templateOrder.get(b.templateId);
      if (ai !== undefined && bi !== undefined) return ai - bi;
      if (ai !== undefined) return -1;
      if (bi !== undefined) return 1;
      return a.id.localeCompare(b.id);
    });
  }, [templates]);

  const subjectDrills = React.useMemo(
    () => allDrills.filter((drill) => drill.subject === activeSubject),
    [allDrills, activeSubject],
  );
  const currentDrill = subjectDrills[activeDrillIndex] || subjectDrills[0] || allDrills[0];

  const handleNextDrill = () => {
    setStep1SelectedKey(null);
    setRevealedBlanks({});
    setUserBlankInputs({});
    setStep3SelectedKey(null);
    setIsDrillSubmitted(false);
    setActiveDrillIndex((prev) => (prev + 1) % subjectDrills.length);
  };

  const handleResetDrill = () => {
    setStep1SelectedKey(null);
    setRevealedBlanks({});
    setUserBlankInputs({});
    setStep3SelectedKey(null);
    setIsDrillSubmitted(false);
  };

  const toggleBlank = (key: string) => {
    setRevealedBlanks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCopyFramework = () => {
    const fullText = `【${currentDrill.questionNumber} ${currentDrill.subject}大题实战答案框架】
主题：${currentDrill.theme}

【设问】：${currentDrill.questionPrompt}

第一步：点题定性
${currentDrill.step1Options.find((o) => o.isBest)?.text}

第二步：硬核核心踩分点
${currentDrill.step2ClozeDrills.map((d) => `${d.subtitle}\n${d.fullAnswer}`).join('\n\n')}

第三步：万能升华大局观
${currentDrill.step3Options.find((o) => o.isBest)?.text}

【考场防坑红线】
${currentDrill.fullScoringGuide.trapAvoidance}
`;

    navigator.clipboard.writeText(fullText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  // Calculate score
  const isStep1Correct = step1SelectedKey && currentDrill.step1Options.find((o) => o.key === step1SelectedKey)?.isBest;
  const isStep3Correct = step3SelectedKey && currentDrill.step3Options.find((o) => o.key === step3SelectedKey)?.isBest;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                17页万能答题模板 · 实战考试场
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                涵盖 34题(马原) · 35题(新思想) · 36题(史纲) · 37题(思修) · 38题(当代)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              万能大题三步法·真题样板与模板迁移实战考场
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              按科目连续练习：定性点题 ➡️ 核心采分点填空 ➡️ 大局观升华 ➡️ 10分制阅卷报告。样板题保留原有材料；补全题明确标注为模板迁移训练。
            </p>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
            <button
              onClick={() => setActiveMode('drill')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMode === 'drill'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>历年真题主题训练</span>
            </button>

            <button
              onClick={() => setActiveMode('focus')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMode === 'focus'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>题眼提取训练</span>
            </button>

            <button
              onClick={() => setActiveMode('reference')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMode === 'reference'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>高分答题框架速查</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <a href={`${import.meta.env.BASE_URL}essay-coverage-audit.html`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40">
            <FileText className="w-3.5 h-3.5" />
            查看历年真题覆盖核验报告
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {activeMode === 'drill' && (
          <>
            {/* First choose the subject; question tabs below are scoped to that subject. */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs text-stone-400 shrink-0">先选科目：</span>
              {['马原', '新思想', '史纲', '思修法治', '当代'].map((subject) => (
                <button key={subject} onClick={() => { setActiveSubject(subject); setActiveDrillIndex(0); handleResetDrill(); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSubject === subject ? 'bg-amber-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'}`}>
                  {subject} <span className="opacity-75">{allDrills.filter((d) => d.subject === subject).length}题</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs text-stone-400 shrink-0">本学科题目：</span>
              {subjectDrills.map((drill, idx) => (
                <button
                  key={drill.id}
                  onClick={() => { setActiveDrillIndex(idx); handleResetDrill(); }}
                  className={`max-w-[260px] truncate px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeDrillIndex === idx
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {idx + 1}. {drill.questionNumber} · {drill.theme}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODE 1: INTERACTIVE DRILL EXAM */}
      {activeMode === 'drill' && (
        <div className="space-y-6">
          {/* Authentic Exam Material Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-black bg-amber-600 text-white">
                  {currentDrill.questionNumber} · {currentDrill.subject} · 本学科第{activeDrillIndex + 1}题
                </span>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  主题：{currentDrill.theme}
                </span>
              </div>

              <button
                onClick={handleCopyFramework}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopied ? '已复制框架' : '复制标准答案'}</span>
              </button>
            </div>

            {/* Material Background text */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-serif whitespace-pre-line">
              {currentDrill.materialBackground.replace(/\\+n/g, '\n').replace(/【原资料知识点整合练习[^】]*】/g, '').replace(/来源：考研政治万能答题模板[^\n]*(?:\n|$)/g, '').replace(/(?:\n\s*){3,}/g, '\n\n').trim()}
            </div>

            {/* Prompt */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
              🎯 【试题设问】：{currentDrill.questionPrompt}
            </div>
          </div>

          {/* STEP 1: 定性点题选择题 (2分) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  【题一·定性点题】将上述白话材料翻译为考研政治原理，最佳点题首句是？（2分）
                </h3>
              </div>
              <span className="text-xs text-blue-600 font-semibold">首句定乾坤</span>
            </div>

            <div className="space-y-2.5">
              {currentDrill.step1Options.map((opt) => {
                const isSelected = step1SelectedKey === opt.key;
                const showFeedback = isDrillSubmitted;
                const isBest = opt.isBest;

                return (
                  <div
                    key={opt.key}
                    onClick={() => !isDrillSubmitted && setStep1SelectedKey(opt.key)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      showFeedback && isBest
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-300'
                        : showFeedback && isSelected && !isBest
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 ring-2 ring-rose-300'
                        : isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400'
                        : 'bg-stone-50 dark:bg-stone-850 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-white dark:bg-stone-700 border text-stone-700 dark:text-stone-200'
                      }`}>
                        {opt.key}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 leading-relaxed">
                          {opt.text}
                        </p>
                        {showFeedback && (
                          <div className={`mt-2 text-xs font-semibold ${isBest ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                            {opt.scoreRationale}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: 硬核踩分点默写/填空闯关 (6分) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-600 text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  【题二·踩分素材填空闯关】完整背诵出材料中必须踩中的哲学/政治核心踩分点（6分）
                </h3>
              </div>
              <span className="text-xs text-amber-600 font-semibold">采分核心点</span>
            </div>

            <div className="space-y-4">
              {currentDrill.step2ClozeDrills.map((drill, dIdx) => (
                <div
                  key={dIdx}
                  className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3"
                >
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    {drill.subtitle}
                  </h4>

                  <div className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-mono">
                    {drill.maskedText.split(/【(.*?)】/).map((part, pIdx) => {
                      if (pIdx % 2 === 1) {
                        const blankKey = `${dIdx}-${pIdx}`;
                        const isRevealed = !!revealedBlanks[blankKey] || isDrillSubmitted;
                        return (
                          <span
                            key={pIdx}
                            onClick={() => toggleBlank(blankKey)}
                            className={`inline-block mx-1 px-2 py-0.5 rounded text-xs font-bold cursor-pointer transition-all ${
                              isRevealed
                                ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100'
                                : 'bg-stone-300 dark:bg-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-400'
                            }`}
                            title="点击揭晓/遮挡此空"
                          >
                            {isRevealed ? part : `[ 空格：点击揭晓 ]`}
                          </span>
                        );
                      }
                      return <span key={pIdx}>{part}</span>;
                    })}
                  </div>

                  {isDrillSubmitted && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-900 dark:text-emerald-300">
                      <strong>【阅卷采分标准】：</strong>{drill.fullAnswer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: 大局观升华测评 (2分) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  【题三·大局观升华收尾】选出最契合时代背景的万能方法论收尾句（2分）
                </h3>
              </div>
              <span className="text-xs text-emerald-600 font-semibold">收官升华点</span>
            </div>

            <div className="space-y-2.5">
              {currentDrill.step3Options.map((opt) => {
                const isSelected = step3SelectedKey === opt.key;
                const showFeedback = isDrillSubmitted;
                const isBest = opt.isBest;

                return (
                  <div
                    key={opt.key}
                    onClick={() => !isDrillSubmitted && setStep3SelectedKey(opt.key)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      showFeedback && isBest
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-300'
                        : isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400'
                        : 'bg-stone-50 dark:bg-stone-850 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-stone-700 border text-stone-700'
                      }`}>
                        {opt.key}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 leading-relaxed">
                          {opt.text}
                        </p>
                        {showFeedback && (
                          <div className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {opt.rationale}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SUBMIT BUTTON OR SCORING RESULT */}
          {!isDrillSubmitted ? (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setIsDrillSubmitted(true)}
                disabled={!step1SelectedKey || !step3SelectedKey}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                提交大题答案 · 生成考场评分报告
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-850 dark:to-stone-900 border border-amber-300 dark:border-amber-800 shadow-sm space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-600" />
                  <h3 className="text-base font-black text-amber-950 dark:text-amber-100">
                    考场阅卷评估报告（满分 10 分制）
                  </h3>
                </div>

                <div className="text-lg font-black text-amber-800 dark:text-amber-300 tabular-nums">
                  得分估算：{isStep1Correct && isStep3Correct ? '9 - 10 分（高分档）' : isStep1Correct ? '7 - 8 分（良好档）' : '5 - 6 分'}
                </div>
              </div>

              {/* Rubric Breakdown */}
              <div className="space-y-2 text-xs text-stone-800 dark:text-stone-200">
                <span className="font-bold block text-stone-900 dark:text-stone-100">
                  📋 考场官方分项采分细则对照：
                </span>
                {currentDrill.fullScoringGuide.standardPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              {/* Trap warning */}
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong>考场易漏分陷阱警示：</strong>
                  <span>{currentDrill.fullScoringGuide.trapAvoidance}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleResetDrill}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 border text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>重新演练此题</span>
                </button>

                <button
                  onClick={handleNextDrill}
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold"
                >
                  {activeDrillIndex + 1 < subjectDrills.length ? '本学科下一题 ↗' : '本学科已完成 · 返回第一题 ↗'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE: PROMPT-FOCUS TRAINING */}
      {activeMode === 'focus' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-md bg-amber-600 px-2.5 py-1 text-xs font-black text-white">{currentFocusCase.subject} · 题眼训练 {focusIndex + 1}/{PROMPT_FOCUS_CASES.length}</span>
              <span className="text-xs text-stone-500">{currentFocusCase.theme}</span>
            </div>
            <h3 className="text-base font-black text-stone-900 dark:text-stone-100">先读材料，不急着套模板</h3>
            <p className="text-sm leading-7 text-stone-800 dark:text-stone-200">{currentFocusCase.material}</p>
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
              <strong className="text-sm text-amber-950 dark:text-amber-200">试题设问：</strong>
              <p className="mt-1 text-sm font-bold leading-7 text-amber-950 dark:text-amber-100">{currentFocusCase.prompt}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm space-y-3">
            <h3 className="font-black text-stone-900 dark:text-stone-100">你认为答案主线应该是什么？</h3>
            <p className="text-xs text-stone-500">先判断设问到底要你解释什么，再选最贴题的答题方向。提交后才会显示解析。</p>
            <div className="space-y-2">
              {currentFocusCase.options.map((option) => {
                const selected = focusSelectedKey === option.key;
                const show = focusSubmitted;
                return (
                  <button key={option.key} type="button" onClick={() => !focusSubmitted && setFocusSelectedKey(option.key)} className={`w-full rounded-xl border p-4 text-left transition-colors ${show && option.correct ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : show && selected ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30' : selected ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850'}`}>
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg border text-xs font-black">{option.key}</span>
                    <span className="text-sm leading-6 text-stone-800 dark:text-stone-200">{option.text}</span>
                    {show && <p className="mt-2 text-xs leading-5 text-stone-700 dark:text-stone-300">{option.reason}</p>}
                  </button>
                );
              })}
            </div>
            {!focusSubmitted ? (
              <button type="button" disabled={!focusSelectedKey} onClick={() => setFocusSubmitted(true)} className="w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40">提交判断，查看题眼拆解</button>
            ) : (
              <div className="space-y-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 p-4">
                <div><strong className="text-sm">题眼拆解</strong><p className="mt-1 text-sm leading-6">{currentFocusCase.clue}</p></div>
                <div><strong className="text-sm">答案应覆盖的范围</strong><p className="mt-1 text-sm leading-6">{currentFocusCase.answerScope}</p></div>
                <div><strong className="text-sm">本题最容易跑题的地方</strong><p className="mt-1 text-sm leading-6">{currentFocusCase.avoid}</p></div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => { setFocusSelectedKey(null); setFocusSubmitted(false); }} className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2 text-xs font-bold">重新判断</button>
                  <button type="button" onClick={() => { setFocusIndex((prev) => (prev + 1) % PROMPT_FOCUS_CASES.length); setFocusSelectedKey(null); setFocusSubmitted(false); }} className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-bold text-white dark:bg-stone-100 dark:text-stone-900">下一题 →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: QUICK REFERENCE MODE (Templates view) */}
      {activeMode === 'reference' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">
                    {tpl.questionNumber} · {tpl.subject}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {tpl.keywords.slice(0, 3).join('、')}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {tpl.theme}
                </h4>
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-xs text-blue-900 dark:text-blue-200">
                  <strong>点题公式：</strong>{tpl.step1Qualitative.formula}
                </div>
                <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                  <strong className="block text-amber-800 dark:text-amber-300">核心采分踩分点：</strong>
                  {tpl.step2CoreMaterial.points.map((p, i) => (
                    <p key={i} className="leading-relaxed">
                      <strong>{p.subtitle}：</strong>{p.content}
                    </p>
                  ))}
                  {tpl.step2CoreMaterial.trapWarning && (
                    <p className="rounded-lg bg-rose-50 dark:bg-rose-950/30 p-2 text-rose-800 dark:text-rose-200">
                      <strong>易漏分提醒：</strong>{tpl.step2CoreMaterial.trapWarning}
                    </p>
                  )}
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-[11px] text-emerald-800 dark:text-emerald-300">
                  <strong>升华结尾公式：</strong>{tpl.step3Sublimation.closingFormula}
                  <p className="mt-1"><strong>示范句：</strong>{tpl.step3Sublimation.sampleClosing}</p>
                </div>
              </div>
            ))}
          </div>

          <section className="space-y-3">
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-4">
              <h3 className="text-base font-black text-stone-900 dark:text-stone-100">原 PDF 17 页完整逐页资料</h3>
              <p className="mt-1 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                下面按原 PDF 页序逐页展开，保留原有核心板块、设问/题干触发条件、编号得分点和答题思路；不是摘要，也不以现有模板卡片代替原文。原文中的每一页均可直接展开阅读与检索。
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                {['34题·马原（第1—3页）', '35题·新思想（第4—7页）', '36题·史纲毛中特（第8—11页）', '37题·思修法治（第12—14页）', '38题·当代（第15—17页）'].map((label) => (
                  <span key={label} className="rounded-lg border border-amber-200 dark:border-amber-800 px-2 py-1 text-amber-900 dark:text-amber-200">{label}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {ESSAY_SOURCE_PAGES.map((page) => (
                <article key={page.page} className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 px-4 py-3">
                    <div className="font-bold text-sm text-stone-900 dark:text-stone-100">原资料第 {page.page} / 17 页</div>
                    <span className="rounded-md bg-amber-600 px-2 py-1 text-[10px] font-bold text-white">{page.subject}</span>
                  </div>
                  <div className="px-4 py-4 sm:px-5 text-xs sm:text-sm leading-7 text-stone-800 dark:text-stone-200 whitespace-pre-wrap break-words">
                    {page.content}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
