import { HatQuestion, HatQuestionOption } from '../types';

const KEYS: HatQuestionOption['key'][] = ['A', 'B', 'C', 'D'];
const normalize = (value: string) => value.replace(/[\s，。；：、（）()“”‘’]/g, '').toLocaleLowerCase();

/**
 * Builds one-answer, four-option practice from the existing source-backed hat-question bank.
 * Distractors are selected in order: same confusion group, same subject, then a distinct
 * cross-subject answer. The generator never repeats the correct answer or duplicates an option.
 */
export function buildHatQuestionOptions(
  question: HatQuestion,
  allQuestions: HatQuestion[]
): HatQuestionOption[] {
  const correctAnswer = question.answer.trim();
  const explicit = question.options?.filter(option => option.text.trim()) ?? [];
  const explicitCorrect = explicit.filter(option => option.isCorrect && normalize(option.text) === normalize(correctAnswer));
  const explicitWrong = explicit.filter(option => !option.isCorrect && normalize(option.text) !== normalize(correctAnswer));

  // Preserve authored options only when they are genuinely four distinct options with one correct answer.
  const authored = [...explicitCorrect.slice(0, 1), ...explicitWrong]
    .filter((option, index, arr) => arr.findIndex(other => normalize(other.text) === normalize(option.text)) === index)
    .slice(0, 4);
  if (authored.length === 4 && authored.filter(option => option.isCorrect).length === 1) {
    return authored.map((option, index) => ({ ...option, key: KEYS[index] }));
  }

  const otherAnswers = allQuestions
    .filter(item => item.id !== question.id && item.answer.trim())
    .filter(item => normalize(item.answer) !== normalize(correctAnswer))
    .map(item => ({
      answer: item.answer.trim(),
      subject: item.subject,
      confusionGroup: item.confusionGroup,
      hatKeyword: item.hatKeyword,
      stem: item.stem,
    }));

  const seen = new Set<string>([normalize(correctAnswer)]);
  const distractors: { text: string; source: typeof otherAnswers[number] | null }[] = [];
  const add = (text: string, source: typeof otherAnswers[number] | null) => {
    const value = text.trim();
    const key = normalize(value);
    if (!value || seen.has(key) || distractors.length >= 3) return;
    seen.add(key);
    distractors.push({ text: value, source });
  };

  // Carefully prioritize plausible, source-backed confusions over generic filler.
  const ranked = [
    ...otherAnswers.filter(item => item.confusionGroup && item.confusionGroup === question.confusionGroup),
    ...otherAnswers.filter(item => item.subject === question.subject && item.confusionGroup !== question.confusionGroup),
    ...otherAnswers.filter(item => item.subject !== question.subject),
  ];
  for (const item of ranked) add(item.answer, item);
  const fallbackTraps = [
    '坚持党的全面领导', '坚持以人民为中心', '解放和发展社会生产力',
    '高质量发展', '实事求是', '群众路线', '独立自主',
    '建设社会主义现代化强国', '全体人民共同富裕',
    '马克思主义基本原理同中国具体实际相结合',
    '公有制为主体、多种所有制经济共同发展', '人民代表大会制度',
  ];
  for (const answer of fallbackTraps) add(answer, null);

  const options = [
    { text: correctAnswer, isCorrect: true, source: null as typeof otherAnswers[number] | null },
    ...distractors.map(item => ({ ...item, isCorrect: false })),
  ];
  // A very small/degenerate data subset still gets four unique choices, never duplicate choices.
  const lastResort = ['以经济建设为中心', '坚持四项基本原则', '全面深化改革开放', '依法治国'];
  for (const answer of lastResort) add(answer, null);
  while (options.length < 4 && distractors.length > options.length - 1) {
    const item = distractors[options.length - 1];
    options.push({ text: item.text, isCorrect: false, source: item.source });
  }
  for (const answer of lastResort) {
    if (options.length >= 4) break;
    if (!seen.has(normalize(answer))) options.push({ text: answer, isCorrect: false, source: null });
    seen.add(normalize(answer));
  }

  let seed = question.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const shuffled = [...options.slice(0, 4)];
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.map((item, index) => ({
    key: KEYS[index],
    text: item.text,
    isCorrect: item.isCorrect,
    trapExplanation: item.isCorrect
      ? `【正确项】${question.trapAnalysis}`
      : item.source
        ? `【易混辨析】“${item.text}”对应的考点是“${item.source.hatKeyword}”；本题问的是“${question.hatKeyword}”。`
        : `【干扰项】“${item.text}”是相近政治概念，需回到题干限定词“${question.hatKeyword}”判断；不要只凭熟悉感作答。`,
  }));
}
