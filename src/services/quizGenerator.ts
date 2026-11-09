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
  const matrixCandidates = question.examType === '多选' ? [] : CONFUSION_DATA
    .flatMap(group => {
      const anchors = group.items.filter(item => {
        const termAliases = item.term.split(/[／/；;，,]/).map(alias => normalize(alias)).filter(alias => alias.length >= 3);
        const termMatch = termAliases.some(alias => normalizedStem.includes(alias));
        const hatMatch = normalize(item.hatType).length >= 4 &&
          (normalizedQuestionHat === normalize(item.hatType) ||
            normalizedQuestionType === normalize(item.hatType)) &&
          normalizedStem.includes(normalize(item.hatType));
        return termMatch || hatMatch;
      });
      if (!anchors.length) return [];
      // Only sibling entries from the same curated group are eligible. A broad subject
      // match alone is never enough to inject an option.
      return group.items
        .filter(item => !anchors.includes(item))
        .filter(item => subjectMatches(item.subject))
        .map(item => ({
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
        }));
    })
    .filter(item =>
      normalize(item.answer) !== correctKey &&
      isOptionShaped(item.answer, correctAnswer) &&
      item.answer.length >= Math.max(2, Math.floor(correctAnswer.length * 0.35))
    );

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

  type Candidate = (typeof candidates)[number] | (typeof matrixCandidates)[number];

  // Prefer matrix entries tied to the precise concept, then source answers with explicit overlap.
  const combinedCandidates: Candidate[] = [...matrixCandidates, ...candidates];
  const ranked = [
    ...combinedCandidates.filter(item => item.source === 'matrix' && item.subject === question.subject),
    ...combinedCandidates.filter(item => item.confusionGroup && item.confusionGroup === question.confusionGroup),
    ...combinedCandidates.filter(item => normalize(question.hatKeyword).length >= 4 && item.hatKeyword === question.hatKeyword),
    ...combinedCandidates.filter(item => normalize(question.hatType).length >= 4 && item.hatType === question.hatType),
  ].filter((item, index, items) => items.findIndex(other => other.id === item.id) === index)
  .sort((a, b) => {
    const priority = (item: Candidate) =>
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
