/**
 * Source coverage ledger for the answer-template PDF.
 * Entry counts are not proof of completeness; page-by-page source verification is tracked separately.
 */
export const TEMPLATE_SOURCE_COVERAGE = {
  sourceFile: '考研政治万能答题模板（17页，可以打印）.pdf',
  totalPages: 17,
  structuredTemplateCount: 12,
  verifiedPages: 0,
  pendingManualVerificationPages: Array.from({ length: 17 }, (_, index) => index + 1),
  status: 'needs-page-by-page-verification',
  note: 'Templates are searchable drafts. Match each template to the original PDF before treating the collection as complete.'
} as const;
