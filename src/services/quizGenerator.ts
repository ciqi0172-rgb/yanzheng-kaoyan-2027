import { HatQuestion, HatQuestionOption } from '../types';
import { CONFUSION_DATA } from '../data/confusionMatrix';

const KEYS: HatQuestionOption['key'][] = ['A', 'B', 'C', 'D'];
const normalize = (value: string) => value.replace(/[\s，。；;：:、（）()“”‘’]/g, '').toLocaleLowerCase();
const answerParts = (question: HatQuestion) =>
  question.examType === '多选'
    ? question.answer.split(/[；;]/).map(part => normalize(part)).filter(Boolean).length
    : 1;

// A distractor should look like an exam option, not a copied explanation paragraph.
// Keep answers concise and reasonably close in length to the keyed answer.
const isOptionShaped = (answer: string, correctAnswer: string) => {
  const text = answer.trim();
  if (!text || /[。！？!?]/.test(text)) return false;
  const limit = Math.max(24, correctAnswer.trim().length * 1.8);
  return text.length <= limit;
};

/**
 * Builds a four-option, one-answer question from the source-backed bank.
 * Multi-select source answers are presented as complete answer combinations; distractors are
 * complete combinations from other source questions with the same number of statements.
 * Unverified source records are never used as answer keys or distractors.
 */
export function buildHatQuestionOptions(
  question: HatQuestion,
  allQuestions: HatQuestion[]
): HatQuestionOption[] {
  if (question.needsReview || !question.answer.trim()) return [];

  const correctAnswer = question.answer.trim();
  const correctKey = normalize(correctAnswer);
  const authored = (question.options ?? [])
    .filter(option => option.text.trim())
    .filter((option, index, options) =>
      options.findIndex(other => normalize(other.text) === normalize(option.text)) === index
    );
  const authoredCorrect = authored.filter(option => option.isCorrect && normalize(option.text) === correctKey);
  const authoredWrong = authored.filter(option =>
    !option.isCorrect &&
    normalize(option.text) !== correctKey &&
    isOptionShaped(option.text, correctAnswer)
  );
  if (authoredCorrect.length === 1 && authoredWrong.length >= 3) {
    const selected = [authoredCorrect[0], ...authoredWrong.slice(0, 3)];
    return shuffleOptions(selected.map((option, index) => ({ ...option, key: KEYS[index] })), question.id);
  }

  // For single-answer questions, first identify the matching concept inside a reviewed group,
  // then use its sibling concepts as possible distractors. The previous implementation
  // incorrectly required every distractor's own term to appear in the stem, which meant
  // the generator mostly found the correct answer again and missed the group's useful contrasts.
  const normalizedStem = normalize(question.stem);
  const normalizedQuestionHat = normalize(question.hatKeyword);
  const normalizedQuestionType = normalize(question.hatType);
  const subjectMatches = (subject: string) =>
    subject.split('/').some(part => part.trim() === question.subject) ||
    subject.includes(question.subject) || question.subject.includes(subject);
  const conceptFamilies: Array<{ id: string; terms: string[] }> = [
    { id: 'root', terms: ['根本', '最根本'] },
    { id: 'priority', terms: ['首要', '第一'] },
    { id: 'core', terms: ['核心', '本质', '实质和核心'] },
    { id: 'history', terms: ['标志', '转折', '开端', '萌芽'] },
    { id: 'guarantee', terms: ['保证', '保障'] },
    { id: 'purpose', terms: ['目的', '归宿', '出发点', '落脚点'] },
  ];
  const matrixRows = CONFUSION_DATA.flatMap(group => group.items.map(item => ({
    id: `matrix-${group.id}-${item.hatType}-${item.term}`,
    answer: item.targetAnswer.trim(),
    subject: item.subject,
    hatKeyword: item.hatType,
    chapter: group.title,
    confusionGroup: group.category,
    hatType: item.hatType,
    matrixTerm: item.term,
    matrixTrap: item.trapWarning,
    source: 'matrix' as const,
    groupId: group.id,
  })));
  const matrixAnchors = question.examType === '多选' ? [] : matrixRows.filter(item => {
    const groupItem = CONFUSION_DATA
      .find(group => group.id === item.groupId)?.items
      .find(candidate => candidate.term === item.matrixTerm && candidate.hatType === item.hatType);
    if (!groupItem) return false;
    const aliases = groupItem.term.split(/[／/；;，,]/).map(alias => normalize(alias)).filter(alias => alias.length >= 3);
    const termMatch = aliases.some(alias => normalizedStem.includes(alias));
    const hatMatch = normalize(groupItem.hatType).length >= 4 &&
      (normalizedQuestionHat === normalize(groupItem.hatType) ||
        normalizedQuestionType === normalize(groupItem.hatType)) &&
      normalizedStem.includes(normalize(groupItem.hatType));
    return termMatch || hatMatch;
  });
  const anchorFamilies = new Set(matrixAnchors.flatMap(anchor => {
    const normalizedHat = normalize(anchor.hatType);
    return conceptFamilies
      .filter(family => family.terms.some(term => normalizedHat.includes(normalize(term))))
      .map(family => family.id);
  }));
  const matrixCandidates = matrixAnchors.length === 0 ? [] : matrixRows
    .filter(item => !matrixAnchors.some(anchor => anchor.id === item.id))
    .filter(item => subjectMatches(item.subject))
    .filter(item => {
      const normalizedHat = normalize(item.hatType);
      const candidateFamilies = conceptFamilies
        .filter(family => family.terms.some(term => normalizedHat.includes(normalize(term))))
        .map(family => family.id);
      // Across-group retrieval is allowed only for a shared, explicit exam-concept family
      // (e.g. 根本动力 vs 根本力量), never for subject overlap alone.
      return candidateFamilies.some(family => anchorFamilies.has(family));
    })
    .filter(item =>
      normalize(item.answer) !== correctKey &&
      isOptionShaped(item.answer, correctAnswer) &&
      item.answer.length >= Math.max(2, Math.floor(correctAnswer.length * 0.35))
    );

  // Reuse concepts explicitly named in the original question's own trap explanation.
  // These are higher-value candidates than arbitrary answers because the source material
  // already identifies them as likely confusions or mistaken substitutions.
  const trapCandidates = question.examType === '多选' ||
    !/(误选|错选|混淆|切勿|不要与|不要把|不能与|不可偷换|混成|张冠李戴|误认为|容易误选|不能替换|不应选|不等于)/.test(question.trapAnalysis)
    ? []
    : Array.from(question.trapAnalysis.matchAll(/[“「『"]([^”」』"]{2,24})[”」』"]/g))
      .map(match => match[1].trim())
      .filter((term, index, terms) =>
        terms.findIndex(other => normalize(other) === normalize(term)) === index &&
        normalize(term) !== correctKey &&
        !/[。！？!?；;]/.test(term) &&
        isOptionShaped(term, correctAnswer) &&
        term.length >= Math.max(2, Math.floor(correctAnswer.length * 0.35))
      )
      .map(term => ({
        id: `trap-${question.id}-${normalize(term)}`,
        answer: term,
        subject: question.subject,
        hatKeyword: question.hatKeyword,
        chapter: question.chapter,
        confusionGroup: question.confusionGroup,
        hatType: question.hatType,
        matrixTerm: '原题解析明确提及的易混表述',
        matrixTrap: question.trapAnalysis,
        source: 'trap' as const,
      }));

  const candidates = allQuestions.filter(item =>
    item.id !== question.id &&
    !item.needsReview &&
    Boolean(item.answer.trim()) &&
    item.examType === question.examType &&
    normalize(item.answer) !== correctKey &&
    isOptionShaped(item.answer, correctAnswer) &&
    // Reuse source answers only when the records share an explicit confusion group
    // or precise hat keyword/type. Subject-only matches are not valid distractors.
    ((Boolean(question.confusionGroup) && item.confusionGroup === question.confusionGroup) ||
      (normalize(question.hatKeyword).length >= 4 && item.hatKeyword === question.hatKeyword) ||
      (normalize(question.hatType).length >= 4 && item.hatType === question.hatType)) &&
    (question.examType !== '多选' || answerParts(item) === answerParts(question))
  ).map(item => ({ ...item, source: 'source' as const, matrixTerm: '', matrixTrap: '' }));

  type Candidate = (typeof candidates)[number] | (typeof matrixCandidates)[number] | (typeof trapCandidates)[number];

  // Prefer source-authored trap phrases, then curated matrix entries, then related source answers.
  const combinedCandidates: Candidate[] = [...trapCandidates, ...matrixCandidates, ...candidates];
  const ranked = [
    ...combinedCandidates.filter(item => item.source === 'trap'),
    ...combinedCandidates.filter(item => item.source === 'matrix' && item.subject === question.subject),
    ...combinedCandidates.filter(item => item.confusionGroup && item.confusionGroup === question.confusionGroup),
    ...combinedCandidates.filter(item => normalize(question.hatKeyword).length >= 4 && item.hatKeyword === question.hatKeyword),
    ...combinedCandidates.filter(item => normalize(question.hatType).length >= 4 && item.hatType === question.hatType),
  ].filter((item, index, items) => items.findIndex(other => other.id === item.id) === index)
  .sort((a, b) => {
    const priority = (item: Candidate) =>
      (item.source === 'trap' ? 140 : 0) +
      (item.source === 'matrix' && item.subject === question.subject ? 120 : 0) +
      (item.confusionGroup && item.confusionGroup === question.confusionGroup ? 100 : 0) +
      (normalize(question.hatKeyword).length >= 4 && item.hatKeyword === question.hatKeyword ? 50 : 0) +
      (normalize(question.hatType).length >= 4 && item.hatType === question.hatType ? 25 : 0);
    const priorityDifference = priority(b) - priority(a);
    if (priorityDifference !== 0) return priorityDifference;
    return Math.abs(a.answer.trim().length - correctAnswer.length) -
      Math.abs(b.answer.trim().length - correctAnswer.length);
  });

  const seen = new Set<string>([correctKey]);
  const distractors: Candidate[] = [];
  for (const candidate of ranked) {
    const key = normalize(candidate.answer);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    distractors.push(candidate);
    if (distractors.length === 3) break;
  }

  // Do not invent filler options. If the source bank cannot supply three valid distractors,
  // keep the question out of four-choice mode until it can be reviewed.
  if (distractors.length < 3) return [];

  const options: HatQuestionOption[] = [
    { key: 'A', text: correctAnswer, isCorrect: true, trapExplanation: `【正确项】${question.trapAnalysis}` },
    ...distractors.map(item => ({
      key: 'A' as const,
      text: item.answer,
      isCorrect: false,
      trapExplanation: item.source === 'matrix'
        ? `【混淆矩阵】“${item.matrixTerm}”对应“${item.hatKeyword}”。${item.matrixTrap}`
        : item.source === 'trap'
          ? `【原题陷阱语料】该表述来自本题原始解析中明确提及的易混表述。请结合题干限定词判断，原解析：${item.matrixTrap}`
          : question.examType === '多选'
          ? `【组合辨析】这组表述来自原文另一道多选题（${item.chapter || item.subject}；考点：${item.hatKeyword}）。本题应逐项核对，不能把不同考点的正确表述拼成正确答案。`
          : `【易混辨析】该答案对应原文另一考点“${item.hatKeyword}”（${item.chapter || item.subject}）；本题考查的是“${question.hatKeyword}”。`,
    })),
  ];
  return shuffleOptions(options, question.id);
}

function shuffleOptions(options: HatQuestionOption[], id: string): HatQuestionOption[] {
  let seed = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.map((option, index) => ({
    ...option,
    key: KEYS[index],
  }));
}
