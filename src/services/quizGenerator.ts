import { HatQuestion, HatQuestionOption } from '../types';

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

  const candidates = allQuestions.filter(item =>
    item.id !== question.id &&
    !item.needsReview &&
    Boolean(item.answer.trim()) &&
    item.examType === question.examType &&
    normalize(item.answer) !== correctKey &&
    isOptionShaped(item.answer, correctAnswer) &&
    (question.examType !== '多选' || answerParts(item) === answerParts(question))
  );

  // Prioritize near-miss distinctions grounded in the original bank, then widen the pool.
  const ranked = [
    ...candidates.filter(item => item.confusionGroup && item.confusionGroup === question.confusionGroup),
    ...candidates.filter(item => item.chapter === question.chapter && item.subject === question.subject),
    ...candidates.filter(item => item.subject === question.subject && item.hatType === question.hatType),
    ...candidates.filter(item => item.subject === question.subject),
    ...candidates.filter(item => item.subject !== question.subject),
  ].sort((a, b) => {
    const priority = (item: HatQuestion) =>
      (item.confusionGroup && item.confusionGroup === question.confusionGroup ? 100 : 0) +
      (item.chapter === question.chapter && item.subject === question.subject ? 50 : 0) +
      (item.subject === question.subject && item.hatType === question.hatType ? 25 : 0) +
      (item.subject === question.subject ? 10 : 0);
    const priorityDifference = priority(b) - priority(a);
    if (priorityDifference !== 0) return priorityDifference;
    return Math.abs(a.answer.trim().length - correctAnswer.length) -
      Math.abs(b.answer.trim().length - correctAnswer.length);
  });

  const seen = new Set<string>([correctKey]);
  const distractors: HatQuestion[] = [];
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
      trapExplanation: question.examType === '多选'
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
